import type { Env, WhatsAppMessage } from "../types";
import { sendTextMessage } from "../services/whatsapp";

/**
 * Main message handler — orchestrates the pipeline.
 * Phase 1: just echoes back. Full pipeline added in Phase 2+.
 */
export async function handleMessage(
  env: Env,
  message: WhatsAppMessage,
  senderPhone: string,
): Promise<void> {
  const text = extractText(message);
  if (!text) return;

  // Phase 1: acknowledge receipt with a placeholder
  await sendTextMessage(
    env,
    senderPhone,
    "Thanks for your message! The Savi AI advisor is being set up. Stay tuned.",
  );
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
