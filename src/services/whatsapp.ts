import type { Env } from "../types";

const WHATSAPP_API = "https://graph.facebook.com/v21.0";

export async function sendTextMessage(
  env: Env,
  to: string,
  text: string,
): Promise<void> {
  const url = `${WHATSAPP_API}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("WhatsApp send failed:", err);
  }
}

export async function sendButtonMessage(
  env: Env,
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>,
): Promise<void> {
  const url = `${WHATSAPP_API}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title },
          })),
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("WhatsApp button send failed:", err);
  }
}
