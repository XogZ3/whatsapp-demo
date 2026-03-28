import type { Context, Next } from "hono";

import type { AppEnv } from "../types";

export async function deduplicateMessage(c: Context<AppEnv>, next: Next) {
  const body = await c.req.json();
  const message = body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message) {
    // Status update or other non-message event, pass through
    await next();
    return;
  }

  const messageId = message.id;
  const redisUrl = c.env.UPSTASH_REDIS_REST_URL;
  const redisToken = c.env.UPSTASH_REDIS_REST_TOKEN;

  // Try to SET NX with 24h TTL
  const setResponse = await fetch(
    `${redisUrl}/set/${encodeURIComponent(messageId)}/1/EX/86400/NX`,
    {
      headers: { Authorization: `Bearer ${redisToken}` },
    }
  );

  const result = (await setResponse.json()) as { result: string | null };

  if (result.result === null) {
    // Key already existed = duplicate message
    return c.text("OK", 200);
  }

  await next();
}
