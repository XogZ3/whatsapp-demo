import type { Env, Conversation, ConversationMessage } from "../types";
import { supabaseQuery, supabaseRpc } from "./supabase";
import { MESSAGE_CAP, CONVERSATION_TIMEOUT_MS } from "../config/constants";

/**
 * Load or create a conversation for a phone number.
 * Returns null if no conversation exists and create=false.
 */
export async function loadConversation(
  env: Env,
  phone: string,
): Promise<Conversation | null> {
  const { data } = await supabaseQuery<Conversation[]>(
    env,
    `conversations?phone=eq.${encodeURIComponent(phone)}&limit=1`,
  );

  if (data && data.length > 0) {
    const conversation = data[0];
    conversation.messages = conversation.messages ?? [];
    return conversation;
  }
  return null;
}

/**
 * Create a new conversation for a first-time user.
 */
export async function createConversation(
  env: Env,
  phone: string,
): Promise<Conversation | null> {
  const { data } = await supabaseQuery<Conversation[]>(env, "conversations", {
    method: "POST",
    body: { phone },
    headers: {
      Prefer: "return=representation,resolution=ignore-duplicates",
    },
  });

  if (data && data.length > 0) {
    return data[0];
  }

  // Race condition: another request created it first. Load it.
  return loadConversation(env, phone);
}

/**
 * Atomically increment message count and return updated conversation.
 * Returns null if the cap was already reached.
 */
export async function incrementAndLoad(
  env: Env,
  phone: string,
): Promise<Conversation | null> {
  const { data } = await supabaseRpc<Conversation[]>(
    env,
    "increment_message_count",
    { p_phone: phone, p_cap: MESSAGE_CAP },
  );

  if (data && Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  return null;
}

/**
 * Append a message to the conversation's JSONB messages array.
 * Uses SQL jsonb concatenation — never read-modify-write.
 */
export async function appendMessage(
  env: Env,
  conversationId: string,
  message: ConversationMessage,
): Promise<void> {
  // PostgREST doesn't support jsonb_concat directly,
  // so we use an RPC function or a raw PATCH with a computed value.
  // We'll use a simple RPC approach.
  await supabaseRpc(env, "append_conversation_message", {
    p_conversation_id: conversationId,
    p_message: message,
  });
}

/**
 * Update conversation fields (path, state, email, etc.)
 */
export async function updateConversation(
  env: Env,
  conversationId: string,
  fields: Partial<
    Pick<
      Conversation,
      | "state"
      | "path"
      | "email"
      | "scope_summary"
      | "scraped_url"
      | "scraped_content"
    >
  >,
): Promise<void> {
  await supabaseQuery(env, `conversations?id=eq.${conversationId}`, {
    method: "PATCH",
    body: { ...fields, updated_at: new Date().toISOString() },
  });
}

/**
 * Check if the conversation has timed out (24h since last update).
 * If so, truncate messages to last 3 for context continuity.
 */
export function checkTimeout(conversation: Conversation): {
  isTimedOut: boolean;
  previousTopic: string | null;
} {
  const lastUpdate = new Date(conversation.updated_at).getTime();
  const now = Date.now();

  if (now - lastUpdate < CONVERSATION_TIMEOUT_MS) {
    return { isTimedOut: false, previousTopic: null };
  }

  // Extract a topic hint from the last few messages
  const msgs = conversation.messages;
  const lastUserMsg = [...msgs].reverse().find((m) => m.role === "user");
  const previousTopic = lastUserMsg?.content.slice(0, 100) ?? null;

  return { isTimedOut: true, previousTopic };
}

/**
 * Truncate messages to last N for timeout-resume.
 */
export async function truncateMessages(
  env: Env,
  conversationId: string,
  messages: ConversationMessage[],
  keepLast: number,
): Promise<ConversationMessage[]> {
  const truncated = messages.slice(-keepLast);

  await supabaseQuery(env, `conversations?id=eq.${conversationId}`, {
    method: "PATCH",
    body: {
      messages: truncated,
      updated_at: new Date().toISOString(),
    },
  });

  return truncated;
}
