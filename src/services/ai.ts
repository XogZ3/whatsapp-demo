import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  ContentBlockParam,
  ToolUseBlock,
  ToolResultBlockParam,
} from "@anthropic-ai/sdk/resources/messages";
import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import type { Env, Conversation, ConversationMessage } from "../types";
import { buildSystemPrompt } from "../config/prompts";
import { MAX_RESPONSE_TOKENS, MAX_TOOL_ITERATIONS } from "../config/constants";
import { scrapeWebsite } from "./scraper";
import { updateConversation } from "./conversation";
import { supabaseQuery } from "./supabase";
import { sendLeadNotification } from "./email";
import { sendTextMessage } from "./whatsapp";
import { META_CLOSE_MESSAGE } from "../config/prompts";

/** Tool definitions for Claude */
const TOOLS: Tool[] = [
  {
    name: "scrape_website",
    description:
      "Scrape a prospect's website URL to learn about their business. " +
      "Use this when a prospect shares a URL. Limited to one scrape per conversation.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "The full URL to scrape (must start with http:// or https://)",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "generate_scope_summary",
    description:
      "Generate a formatted scope summary after discovering enough about the prospect's project. " +
      "Use after 5-8 discovery exchanges when you have enough info. " +
      "After generating, ask the prospect for their email to send a detailed proposal.",
    input_schema: {
      type: "object" as const,
      properties: {
        idea: { type: "string", description: "The product idea" },
        audience: { type: "string", description: "Target users/customers" },
        mvp_features: {
          type: "string",
          description: "Core features for v1, comma-separated",
        },
        platform: {
          type: "string",
          description: "Platform recommendation (web, mobile, WhatsApp bot, etc.)",
        },
        approach: {
          type: "string",
          description: "Suggested build approach and phasing",
        },
        price_range: {
          type: "string",
          description: "Estimated price range (e.g., '$6K-$12K')",
        },
        timeline: {
          type: "string",
          description: "Estimated timeline (e.g., '4-6 weeks for MVP')",
        },
      },
      required: [
        "idea",
        "audience",
        "mvp_features",
        "platform",
        "approach",
        "price_range",
        "timeline",
      ],
    },
  },
  {
    name: "capture_lead",
    description:
      "Capture a prospect's email address to create a lead record and notify the team. " +
      "Use when the prospect provides their email for a proposal. " +
      "Validates email format before saving.",
    input_schema: {
      type: "object" as const,
      properties: {
        email: {
          type: "string",
          description: "The prospect's email address",
        },
      },
      required: ["email"],
    },
  },
];

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  id: string;
}

/**
 * Call Claude Haiku 4.5 with conversation history and tool calling.
 * Runs an agentic loop: keeps calling Claude until stop_reason is "end_turn".
 */
export async function callClaude(
  env: Env,
  conversationMessages: ConversationMessage[],
  extraContext?: string,
  conversation?: Conversation,
): Promise<{ response: string; toolCalls: ToolCall[] }> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const messages: MessageParam[] = conversationMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (extraContext) {
    messages.unshift({ role: "user", content: extraContext });
    if (messages.length > 1 && messages[1].role === "user") {
      messages.splice(1, 0, {
        role: "assistant",
        content: "Understood, continuing the conversation.",
      });
    }
  }

  const cleaned = ensureAlternatingRoles(messages);
  const allToolCalls: ToolCall[] = [];
  let currentMessages = cleaned;
  let finalResponse = "";

  // Agentic loop: process tool calls until end_turn
  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const result = await client.messages.create({
      model: "claude-haiku-4-5-20241022",
      max_tokens: MAX_RESPONSE_TOKENS,
      system: buildSystemPrompt(),
      messages: currentMessages,
      tools: TOOLS,
    });

    // Collect text and tool use blocks
    const textParts: string[] = [];
    const toolUseBlocks: ToolUseBlock[] = [];

    for (const block of result.content) {
      if (block.type === "text") {
        textParts.push(block.text);
      } else if (block.type === "tool_use") {
        toolUseBlocks.push(block);
        allToolCalls.push({
          name: block.name,
          input: block.input as Record<string, unknown>,
          id: block.id,
        });
      }
    }

    if (textParts.length > 0) {
      finalResponse = textParts.join("\n");
    }

    // If no tool calls, we're done
    if (result.stop_reason !== "tool_use" || toolUseBlocks.length === 0) {
      break;
    }

    // Execute tool calls and build tool_result messages
    const toolResults: ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      const toolResult = await executeToolCall(
        env,
        toolUse.name,
        toolUse.input as Record<string, unknown>,
        conversation,
      );
      toolResults.push({
        type: "tool_result",
        tool_use_id: toolUse.id,
        content: toolResult,
      });
    }

    // Append assistant message (with tool_use blocks) and tool results
    currentMessages = [
      ...currentMessages,
      { role: "assistant", content: result.content as ContentBlockParam[] },
      { role: "user", content: toolResults },
    ];
  }

  return { response: finalResponse, toolCalls: allToolCalls };
}

/**
 * Execute a tool call and return the result string.
 */
async function executeToolCall(
  env: Env,
  name: string,
  input: Record<string, unknown>,
  conversation?: Conversation,
): Promise<string> {
  switch (name) {
    case "scrape_website": {
      const url = input.url as string;

      // Check if already scraped
      if (conversation?.scraped_url) {
        return `Already scraped ${conversation.scraped_url} for this conversation. Use the existing scraped content to help the prospect.`;
      }

      const result = await scrapeWebsite(env, url);
      if (!result.success) {
        return result.error ?? "Failed to scrape the website.";
      }

      // Cache in conversation
      if (conversation) {
        await updateConversation(env, conversation.id, {
          scraped_url: url,
          scraped_content: result.content,
          path: "cold",
        });
        conversation.scraped_url = url;
        conversation.scraped_content = result.content;
      }

      return `Successfully scraped "${result.title}" (${url}).\n\nHere is the website content:\n\n${result.content}`;
    }

    case "generate_scope_summary": {
      const summary = formatScopeSummary(input);
      if (conversation) {
        await updateConversation(env, conversation.id, {
          scope_summary: summary,
        });
      }
      return `Scope summary generated. Present this to the prospect and ask for their email:\n\n${summary}`;
    }

    case "capture_lead": {
      const email = input.email as string;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return `Invalid email format: "${email}". Ask the prospect to provide a valid email address.`;
      }

      if (!conversation) {
        return "No conversation context available for lead capture.";
      }

      // Save email to conversation
      await updateConversation(env, conversation.id, {
        email,
        state: "converted",
      });

      // Create lead record in Supabase
      await supabaseQuery(env, "leads", {
        method: "POST",
        body: {
          conversation_id: conversation.id,
          email,
          phone: conversation.phone,
          company_url: conversation.scraped_url,
          scope_summary: conversation.scope_summary ?? "Discovery in progress",
        },
      });

      // Send notification email to Gokul (fire and forget)
      sendLeadNotification(env, {
        phone: conversation.phone,
        email,
        companyUrl: conversation.scraped_url,
        scopeSummary: conversation.scope_summary,
        messages: conversation.messages,
      }).catch((err) => console.error("Lead notification failed:", err));

      // Send meta-close message after a brief delay
      sendTextMessage(env, conversation.phone, META_CLOSE_MESSAGE).catch(
        (err) => console.error("Meta-close send failed:", err),
      );

      return `Lead captured for ${email}. Confirm to the prospect that Gokul will send a proposal within 24 hours.`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

function formatScopeSummary(input: Record<string, unknown>): string {
  return [
    "**Your project at a glance**",
    "",
    `*Idea:* ${input.idea}`,
    `*Audience:* ${input.audience}`,
    `*Platform:* ${input.platform}`,
    `*Core features:* ${input.mvp_features}`,
    `*Suggested approach:* ${input.approach}`,
    `*Estimated range:* ${input.price_range}`,
    `*Timeline:* ${input.timeline}`,
    "",
    "Want a detailed proposal from our team? Drop your email and I'll send one within 24 hours.",
  ].join("\n");
}

/**
 * Ensure messages alternate between user and assistant roles.
 */
function ensureAlternatingRoles(messages: MessageParam[]): MessageParam[] {
  if (messages.length === 0) return [];

  const result: MessageParam[] = [messages[0]];

  for (let i = 1; i < messages.length; i++) {
    const prev = result[result.length - 1];
    const curr = messages[i];

    if (prev.role === curr.role) {
      const prevText =
        typeof prev.content === "string"
          ? prev.content
          : prev.content
              .filter(
                (b): b is { type: "text"; text: string } => b.type === "text",
              )
              .map((b) => b.text)
              .join("\n");
      const currText =
        typeof curr.content === "string"
          ? curr.content
          : curr.content
              .filter(
                (b): b is { type: "text"; text: string } => b.type === "text",
              )
              .map((b) => b.text)
              .join("\n");

      result[result.length - 1] = {
        role: prev.role,
        content: `${prevText}\n\n${currText}`,
      };
    } else {
      result.push(curr);
    }
  }

  return result;
}
