import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import type { Env, ConversationMessage } from "../types";
import { buildSystemPrompt } from "../config/prompts";
import { MAX_RESPONSE_TOKENS, MAX_TOOL_ITERATIONS } from "../config/constants";

/**
 * Call Claude Haiku 4.5 with conversation history.
 * Returns the assistant's text response and any tool calls.
 * Phase 2: text-only responses. Tool calling added in Phase 4+.
 */
export async function callClaude(
  env: Env,
  conversationMessages: ConversationMessage[],
  extraContext?: string,
): Promise<{ response: string; toolCalls: ToolCall[] }> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  const messages: MessageParam[] = conversationMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Add extra context (e.g., timeout resume note) as a system-injected user context
  if (extraContext) {
    messages.unshift({
      role: "user",
      content: extraContext,
    });
    // Claude needs alternating roles; add a brief assistant ack if first msg was user
    if (messages.length > 1 && messages[1].role === "user") {
      messages.splice(1, 0, {
        role: "assistant",
        content: "Understood, continuing the conversation.",
      });
    }
  }

  // Ensure messages alternate properly — Claude requires user/assistant alternation
  const cleaned = ensureAlternatingRoles(messages);

  const result = await client.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: MAX_RESPONSE_TOKENS,
    system: buildSystemPrompt(),
    messages: cleaned,
  });

  // Extract text response
  const textBlocks = result.content.filter((b) => b.type === "text");
  const response = textBlocks.map((b) => b.text).join("\n");

  return { response, toolCalls: [] };
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
      // Merge content
      const prevText =
        typeof prev.content === "string"
          ? prev.content
          : prev.content
              .filter((b): b is { type: "text"; text: string } => b.type === "text")
              .map((b) => b.text)
              .join("\n");
      const currText =
        typeof curr.content === "string"
          ? curr.content
          : curr.content
              .filter((b): b is { type: "text"; text: string } => b.type === "text")
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

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  id: string;
}
