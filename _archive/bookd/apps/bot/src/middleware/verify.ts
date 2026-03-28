import type { Context, Next } from "hono";

import type { AppEnv } from "../types";

export async function verifyWebhook(c: Context<AppEnv>, next: Next) {
  const signature = c.req.header("x-hub-signature-256");
  if (!signature) {
    return c.text("Missing signature", 401);
  }

  const body = await c.req.text();
  const expectedSig = await computeHmac(body, c.env.WHATSAPP_APP_SECRET);
  const expected = `sha256=${expectedSig}`;

  if (!timingSafeEqual(signature, expected)) {
    return c.text("Invalid signature", 401);
  }

  // Store raw body so downstream handlers can parse it
  c.set("rawBody", body);
  await next();
}

async function computeHmac(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
