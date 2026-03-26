import { Hono } from "hono";

type Bindings = {
  VERIFY_TOKEN: string;
  WHATSAPP_TOKEN: string;
  WHATSAPP_APP_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  UPSTASH_REDIS_URL: string;
  UPSTASH_REDIS_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.json({ name: "Bookd Bot", status: "ok" }));

app.get("/webhook", (c) => {
  const mode = c.req.query("hub.mode");
  const token = c.req.query("hub.verify_token");
  const challenge = c.req.query("hub.challenge");
  if (mode === "subscribe" && token === c.env.VERIFY_TOKEN) {
    return c.text(challenge ?? "", 200);
  }
  return c.text("Forbidden", 403);
});

app.post("/webhook", async (c) => {
  return c.text("OK", 200);
});

export default app;
