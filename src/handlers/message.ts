import type { Env, WhatsAppMessage, ConversationMessage } from "../types";
import { sendTextMessage, sendButtonMessage } from "../services/whatsapp";
import {
  loadConversation,
  createConversation,
  incrementAndLoad,
  appendMessage,
  updateConversation,
  checkTimeout,
  truncateMessages,
} from "../services/conversation";
import { callClaude } from "../services/ai";
import { preScreenMessage, validateOutput } from "../services/security";
import { sendHumanEscalation } from "../services/email";
import {
  GREETING_TEXT,
  GREETING_BUTTONS,
  CAP_REACHED_MESSAGE,
  SOFT_WARNING_MESSAGE,
  REFUSAL_RESPONSE,
  HUMAN_ESCALATION_MESSAGE,
  BROWSING_RESPONSE,
  TIMEOUT_RESUME_PREFIX,
} from "../config/prompts";
import { SOFT_WARNING_AT } from "../config/constants";

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

  // 2. Human escalation — works at ANY point, regardless of cap or state
  if (text.toLowerCase().trim() === "human") {
    await sendTextMessage(env, senderPhone, HUMAN_ESCALATION_MESSAGE);
    // Fire notification to Gokul
    sendHumanEscalation(env, {
      phone: senderPhone,
      messages: conversation.messages,
    }).catch((err) => console.error("Human escalation email failed:", err));

    const userMsg: ConversationMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    await appendMessage(env, conversation.id, userMsg);

    const assistantMsg: ConversationMessage = {
      role: "assistant",
      content: HUMAN_ESCALATION_MESSAGE,
      timestamp: new Date().toISOString(),
    };
    await appendMessage(env, conversation.id, assistantMsg);
    return;
  }

  // 3. First-time greeting with 3-path buttons
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

  // 4. Browsing path — static response, minimal AI budget
  const buttonId = message.interactive?.button_reply?.id;
  if (buttonId === "path_browsing") {
    await sendTextMessage(env, senderPhone, BROWSING_RESPONSE);
    await updateConversation(env, conversation.id, { path: "browsing" });

    const userMsg: ConversationMessage = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    await appendMessage(env, conversation.id, userMsg);

    const assistantMsg: ConversationMessage = {
      role: "assistant",
      content: BROWSING_RESPONSE,
      timestamp: new Date().toISOString(),
    };
    await appendMessage(env, conversation.id, assistantMsg);
    return;
  }

  // Set path from button selection if applicable
  if (buttonId === "path_warm" && !conversation.path) {
    await updateConversation(env, conversation.id, { path: "warm" });
    conversation.path = "warm";
  } else if (buttonId === "path_cold" && !conversation.path) {
    await updateConversation(env, conversation.id, { path: "cold" });
    conversation.path = "cold";
  }

  // 5. Atomic cap check + increment
  const updated = await incrementAndLoad(env, senderPhone);
  if (!updated) {
    await sendTextMessage(env, senderPhone, CAP_REACHED_MESSAGE);
    return;
  }
  conversation = updated;

  // 6. Check 24h timeout
  let extraContext: string | undefined;
  const { isTimedOut, previousTopic } = checkTimeout(conversation);
  if (isTimedOut) {
    const truncated = await truncateMessages(
      env,
      conversation.id,
      conversation.messages,
      3,
    );
    conversation.messages = truncated;
    extraContext = TIMEOUT_RESUME_PREFIX(previousTopic);
  }

  // 7. Security Layer 2: Pre-screen input
  const { safe } = await preScreenMessage(env, text);
  if (!safe) {
    await sendTextMessage(env, senderPhone, REFUSAL_RESPONSE);
    return;
  }

  // 8. Add user message to history
  const userMsg: ConversationMessage = {
    role: "user",
    content: text,
    timestamp: new Date().toISOString(),
  };
  await appendMessage(env, conversation.id, userMsg);

  const messagesForClaude = [...conversation.messages, userMsg];

  // 9. Call Claude with tools
  const { response } = await callClaude(
    env,
    messagesForClaude,
    extraContext,
    conversation,
  );

  // 10. Security Layer 4: Output validation
  const { sanitized } = validateOutput(response);

  // 11. Send response to WhatsApp
  await sendTextMessage(env, senderPhone, sanitized);

  // 12. Soft warning at 15 messages
  if (conversation.message_count === SOFT_WARNING_AT) {
    await sendTextMessage(env, senderPhone, SOFT_WARNING_MESSAGE);
  }

  // 13. Save assistant message
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
