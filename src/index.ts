import { Hono } from "hono";
import type { Env, WhatsAppWebhookBody } from "./types";
import { verifyWebhookSignature } from "./middleware/verify";
import { checkDedup } from "./middleware/dedup";
import { handleMessage } from "./handlers/message";

const app = new Hono<{ Bindings: Env }>();

// Health check
app.get("/", (c) => c.text("Savi AI Product Advisor Bot"));

// Meta webhook verification (GET)
app.get("/webhook", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");

  if (mode === "subscribe" && token === c.env.WHATSAPP_VERIFY_TOKEN) {
    return c.text(challenge ?? "", 200);
  }

  return c.text("Forbidden", 403);
});

// WhatsApp webhook (POST) — HMAC verified
app.post("/webhook", verifyWebhookSignature, async (c) => {
  const body = await c.req.json<WhatsAppWebhookBody>();

  // Return 200 immediately, process async
  c.executionCtx.waitUntil(processWebhook(c.env, body));

  return c.text("OK", 200);
});

async function processWebhook(
  env: Env,
  body: WhatsAppWebhookBody,
): Promise<void> {
  for (const entry of body.entry) {
    for (const change of entry.changes) {
      const value = change.value;

      // Skip status updates
      if (!value.messages || value.messages.length === 0) continue;

      for (const message of value.messages) {
        const senderPhone =
          value.contacts?.[0]?.wa_id ?? message.from;

        // Dedup check
        const isNew = await checkDedup(env, message.id, senderPhone);
        if (!isNew) {
          console.log(`Duplicate wamid ${message.id}, skipping`);
          continue;
        }

        try {
          await handleMessage(env, message, senderPhone);
        } catch (err) {
          console.error("Message handling error:", err);
        }
      }
    }
  }
}

export default app;
