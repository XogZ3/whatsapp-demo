import { Hono } from "hono";

import { handleMessage } from "./handlers/message";
import { processReminders } from "./handlers/reminders";
import { deduplicateMessage } from "./middleware/dedup";
import { verifyWebhook } from "./middleware/verify";
import { SupabaseClient } from "./services/supabase";
import type { AppEnv, WebhookPayload } from "./types";
import { WhatsAppSender } from "./whatsapp/sender";

const app = new Hono<AppEnv>();

app.get("/", (c) => c.json({ name: "Bookd Bot", status: "ok" }));

// Meta webhook verification (GET)
app.get("/webhook", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");
  if (mode === "subscribe" && token === c.env.VERIFY_TOKEN) {
    return c.text(challenge ?? "", 200);
  }
  return c.text("Forbidden", 403);
});

// Message handler (POST)
app.post("/webhook", verifyWebhook, deduplicateMessage, async (c) => {
  const db = new SupabaseClient({
    url: c.env.SUPABASE_URL,
    serviceKey: c.env.SUPABASE_SERVICE_KEY,
  });
  const wa = new WhatsAppSender({
    token: c.env.WHATSAPP_TOKEN,
    phoneNumberId: c.env.WHATSAPP_PHONE_NUMBER_ID,
  });

  const payload = (await c.req.json()) as WebhookPayload;
  const displayPhone =
    payload.entry?.[0]?.changes?.[0]?.value?.metadata?.display_phone_number;

  // Look up salon by WhatsApp number
  const salon = displayPhone
    ? await db.getSalonByWhatsAppNumber(displayPhone)
    : null;
  const salonId = (salon?.id as string) ?? "default";

  c.executionCtx.waitUntil(handleMessage(payload, { db, wa, salonId }));
  return c.text("OK", 200);
});

// Cloudflare Cron Trigger for reminders
const scheduled: ExportedHandlerScheduledHandler<Record<string, string>> = async (
  _event,
  env
) => {
  const db = new SupabaseClient({
    url: env.SUPABASE_URL,
    serviceKey: env.SUPABASE_SERVICE_KEY,
  });
  const wa = new WhatsAppSender({
    token: env.WHATSAPP_TOKEN,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
  });
  await processReminders({ db, wa });
};

export default {
  fetch: app.fetch,
  scheduled,
};
