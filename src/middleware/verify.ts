import type { Context, Next } from "hono";
import type { Env } from "../types";

export async function verifyWebhookSignature(
  c: Context<{ Bindings: Env }>,
  next: Next,
): Promise<Response> {
  const signature = c.req.header("x-hub-signature-256");
  if (!signature) {
    return c.text("Missing signature", 401);
  }

  const body = await c.req.raw.clone().arrayBuffer();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(c.env.WHATSAPP_APP_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signed = await crypto.subtle.sign("HMAC", key, body);
  const expected =
    "sha256=" +
    Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  if (!timingSafeEqual(signature, expected)) {
    return c.text("Invalid signature", 401);
  }

  await next();
  return c.res;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  return result === 0;
}
