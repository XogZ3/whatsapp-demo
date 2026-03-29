import type { Tool } from "@anthropic-ai/sdk/resources/messages";
import type { Env, Conversation } from "../types";
import { scrapeWebsite } from "./scraper";
import { updateConversation } from "./conversation";
import { supabaseQuery } from "./supabase";
import { sendLeadNotification } from "./email";

/** Tool definitions for Claude */
export const TOOLS: Tool[] = [
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
          description:
            "The full URL to scrape (must start with http:// or https://)",
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
          description:
            "Platform recommendation (web, mobile, WhatsApp bot, etc.)",
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

/**
 * Execute a tool call and return the result string.
 */
export async function executeToolCall(
  env: Env,
  name: string,
  input: Record<string, unknown>,
  conversation: Conversation,
): Promise<string> {
  switch (name) {
    case "scrape_website": {
      const url = input.url as string;

      if (conversation.scraped_url) {
        return `Already scraped ${conversation.scraped_url} for this conversation. Use the existing scraped content to help the prospect.`;
      }

      const result = await scrapeWebsite(env, url);
      if (!result.success) {
        return result.error ?? "Failed to scrape the website.";
      }

      await updateConversation(env, conversation.id, {
        scraped_url: url,
        scraped_content: result.content,
        path: "cold",
      });
      conversation.scraped_url = url;
      conversation.scraped_content = result.content;

      return `Successfully scraped "${result.title}" (${url}).\n\nHere is the website content:\n\n${result.content}`;
    }

    case "generate_scope_summary": {
      const summary = formatScopeSummary(input);
      await updateConversation(env, conversation.id, {
        scope_summary: summary,
      });
      return `Scope summary generated. Present this to the prospect and ask for their email:\n\n${summary}`;
    }

    case "capture_lead": {
      const email = input.email as string;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return `Invalid email format: "${email}". Ask the prospect to provide a valid email address.`;
      }

      await updateConversation(env, conversation.id, {
        email,
        state: "converted",
      });
      conversation.state = "converted";

      await supabaseQuery(env, "wa_leads", {
        method: "POST",
        body: {
          conversation_id: conversation.id,
          email,
          phone: conversation.phone,
          company_url: conversation.scraped_url,
          scope_summary: conversation.scope_summary ?? "Discovery in progress",
        },
      });

      sendLeadNotification(env, {
        phone: conversation.phone,
        email,
        companyUrl: conversation.scraped_url,
        scopeSummary: conversation.scope_summary,
        messages: conversation.messages,
      }).catch((err) => console.error("Lead notification failed:", err));

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
