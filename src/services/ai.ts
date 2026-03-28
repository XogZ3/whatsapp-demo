import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  ContentBlockParam,
  ToolUseBlock,
  ToolResultBlockParam,
} from "@anthropic-ai/sdk/resources/messages";
import type { Env, Conversation, ConversationMessage } from "../types";
import { buildSystemPrompt } from "../config/prompts";
import { MAX_RESPONSE_TOKENS, MAX_TOOL_ITERATIONS } from "../config/constants";
import { TOOLS, executeToolCall } from "./tools";

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

    currentMessages = [
      ...currentMessages,
      { role: "assistant", content: result.content as ContentBlockParam[] },
      { role: "user", content: toolResults },
    ];
  }

  return { response: finalResponse, toolCalls: allToolCalls };
}

/**
 * Ensure messages alternate between user and assistant roles.
 * Merges consecutive same-role messages.
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
