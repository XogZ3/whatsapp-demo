import type { Env, WhatsAppMessage, ConversationMessage } from "../types";
import { sendTextMessage, sendButtonMessage } from "../services/whatsapp";
import {
  loadConversation,
  createConversation,
  incrementAndLoad,
  appendMessage,
  checkTimeout,
  truncateMessages,
} from "../services/conversation";
import { callClaude } from "../services/ai";
import { preScreenMessage, validateOutput } from "../services/security";
import {
  GREETING_TEXT,
  GREETING_BUTTONS,
  CAP_REACHED_MESSAGE,
  REFUSAL_RESPONSE,
  TIMEOUT_RESUME_PREFIX,
} from "../config/prompts";

/**
 * Main message handler — orchestrates the full pipeline.
 */
export async function handleMessage(
  env: Env,
  message: WhatsAppMessage,
  senderPhone: string,
): Promise<void> {
  const text = extractText(message);
  if (!text) return;

  // 1. Load or create conversation
  let conversation = await loadConversation(env, senderPhone);
  const isFirstTime = !conversation;

  if (!conversation) {
    conversation = await createConversation(env, senderPhone);
    if (!conversation) {
      console.error("Failed to create conversation for", senderPhone);
      return;
    }
  }

  // 2. First-time greeting with 3-path buttons
  if (isFirstTime) {
    await sendButtonMessage(env, senderPhone, GREETING_TEXT, GREETING_BUTTONS);

    const greetingMsg: ConversationMessage = {
      role: "assistant",
      content: GREETING_TEXT,
      timestamp: new Date().toISOString(),
    };
    await appendMessage(env, conversation.id, greetingMsg);
    return;
  }

  // 3. Atomic cap check + increment
  const updated = await incrementAndLoad(env, senderPhone);
  if (!updated) {
    // Cap reached
    await sendTextMessage(env, senderPhone, CAP_REACHED_MESSAGE);
    return;
  }
  conversation = updated;

  // 4. Check 24h timeout
  let extraContext: string | undefined;
  const { isTimedOut, previousTopic } = checkTimeout(conversation);
  if (isTimedOut) {
    // Truncate to last 3 messages for context
    const truncated = await truncateMessages(
      env,
      conversation.id,
      conversation.messages,
      3,
    );
    conversation.messages = truncated;
    extraContext = TIMEOUT_RESUME_PREFIX(previousTopic);
  }

  // 5. Security Layer 2: Pre-screen input
  const { safe } = await preScreenMessage(env, text);
  if (!safe) {
    await sendTextMessage(env, senderPhone, REFUSAL_RESPONSE);
    return;
  }

  // 6. Add user message to history
  const userMsg: ConversationMessage = {
    role: "user",
    content: text,
    timestamp: new Date().toISOString(),
  };
  await appendMessage(env, conversation.id, userMsg);

  // Build messages for Claude (existing history + new user message)
  const messagesForClaude = [...conversation.messages, userMsg];

  // 7. Call Claude with tools
  const { response } = await callClaude(
    env,
    messagesForClaude,
    extraContext,
    conversation,
  );

  // 8. Security Layer 4: Output validation
  const { sanitized } = validateOutput(response);

  // 9. Send response to WhatsApp
  await sendTextMessage(env, senderPhone, sanitized);

  // 10. Save assistant message
  const assistantMsg: ConversationMessage = {
    role: "assistant",
    content: sanitized,
    timestamp: new Date().toISOString(),
  };
  await appendMessage(env, conversation.id, assistantMsg);
}

function extractText(message: WhatsAppMessage): string | null {
  if (message.type === "text" && message.text?.body) {
    return message.text.body;
  }
  if (message.type === "interactive") {
    if (message.interactive?.button_reply) {
      return message.interactive.button_reply.title;
    }
    if (message.interactive?.list_reply) {
      return message.interactive.list_reply.title;
    }
  }
  return null;
}
