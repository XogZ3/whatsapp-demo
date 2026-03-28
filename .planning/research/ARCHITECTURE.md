# Architecture Research

**Domain:** WhatsApp AI advisor bot (Cloudflare Workers + Claude + Supabase)
**Researched:** 2026-03-28
**Confidence:** HIGH — design spec is already detailed; findings verified against official Anthropic docs, Hono docs, and Cloudflare Workers docs.

## Standard Architecture

### System Overview

```
Prospect's WhatsApp
       |
  WhatsApp Cloud API (POST /webhook)
       |
  ┌────────────────────────────────────────────────────────┐
  │  Cloudflare Worker (Hono)                               │
  │                                                         │
  │  ┌──────────────────────────────────────────────┐       │
  │  │  Middleware pipeline                          │       │
  │  │  1. HMAC-SHA256 signature verify              │       │
  │  │  2. wamid deduplication (Supabase)            │       │
  │  └────────────────────┬─────────────────────────┘       │
  │                       |                                 │
  │  ┌────────────────────▼─────────────────────────┐       │
  │  │  Message Handler                              │       │
  │  │  1. Load / create conversation (Supabase)     │       │
  │  │  2. Atomic message cap check (SQL UPDATE)     │       │
  │  │  3. Human-keyword short-circuit               │       │
  │  │  4. Input pre-screen (Haiku — SAFE/BLOCKED)   │       │
  │  │  5. Build system prompt + messages array      │       │
  │  │  6. Claude API call with 3 tools              │       │
  │  │  7. Agentic loop: execute tools, re-call      │       │
  │  │  8. Output validation (leak detection)        │       │
  │  │  9. Send WhatsApp reply                       │       │
  │  │  10. Persist updated conversation (Supabase)  │       │
  │  └────────────────────┬─────────────────────────┘       │
  │                       |                                 │
  └───────────────────────┼─────────────────────────────────┘
                          |
          ┌───────────────┼───────────────┬────────────┐
          ▼               ▼               ▼            ▼
    Claude Haiku      Firecrawl       Supabase       Resend
    (Anthropic SDK)   /v2/scrape     (Postgres)    (email)
```

The Cloudflare Cron Trigger runs a separate scheduled handler for reminders — outside the webhook flow entirely:

```
Cloudflare Cron Trigger (every 30 min)
       |
  scheduled() handler
       |
  Supabase: query upcoming bookings
       |
  WhatsApp Cloud API: send reminder messages
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Hono webhook router | Receive GET (Meta verification) and POST (messages). Return 200 fast. | `src/index.ts` — two routes, exported with scheduled handler |
| Verify middleware | Validate X-Hub-Signature-256 header via HMAC-SHA256. Reject invalid requests 401. | `src/middleware/verify.ts` — runs before every POST |
| Dedup middleware | Check wamid against `message_log` table. Skip if already seen. | `src/middleware/dedup.ts` — inserts with ON CONFLICT DO NOTHING, checks rows returned |
| Message handler | Orchestrate the full conversation cycle: load, check cap, pre-screen, build prompt, call Claude, execute tools, send reply, save. | `src/handlers/message.ts` |
| Conversation service | Load conversation by phone, create if new, persist after reply. Handle 24h timeout (truncate history to last 3 messages). | `src/services/conversation.ts` |
| AI service | Build system prompt with XML-tagged sections. Manage messages array. Call Anthropic SDK. Run agentic loop until stop_reason === "end_turn". | `src/services/ai.ts` |
| Security service | Pre-screen input with lightweight Haiku call. Validate output for system prompt fragments. | `src/services/security.ts` |
| Scraper service | Call Firecrawl /v2/scrape, wrap result in `<external_data>` XML tag, cache in Supabase. | `src/services/scraper.ts` |
| WhatsApp service | Send text, interactive buttons, and list messages via Cloud API fetch calls. | `src/services/whatsapp.ts` |
| Email service | Send lead notification to Gokul via Resend HTTP API. | `src/services/email.ts` |
| Supabase service | Raw fetch calls to PostgREST. No @supabase/supabase-js — reduces bundle size. | `src/services/supabase.ts` |
| Prompts config | System prompt (XML-tagged), refusal templates, scope summary template. | `src/config/prompts.ts` |

## Recommended Project Structure

```
apps/bot/src/
├── index.ts                # Hono app + export { fetch, scheduled }
├── middleware/
│   ├── verify.ts           # HMAC-SHA256 webhook signature check
│   └── dedup.ts            # wamid dedup — Supabase ON CONFLICT pattern
├── handlers/
│   ├── message.ts          # Main orchestration: load → cap → screen → call → send → save
│   └── reminders.ts        # Cron handler: query Supabase, send WhatsApp reminders
├── services/
│   ├── ai.ts               # System prompt builder, Claude API, agentic loop
│   ├── conversation.ts     # Load/save conversation, cap enforcement, timeout logic
│   ├── security.ts         # Pre-screen call, output validator
│   ├── scraper.ts          # Firecrawl integration, XML sandboxing
│   ├── whatsapp.ts         # Send messages via Cloud API
│   ├── email.ts            # Resend lead notifications
│   └── supabase.ts         # Raw fetch PostgREST client
├── config/
│   ├── prompts.ts          # System prompt, refusal strings, scope summary template
│   └── constants.ts        # MESSAGE_CAP=20, TIMEOUT_HOURS=24, etc.
└── types.ts                # Shared TypeScript types (ConversationRow, LeadRow, etc.)
```

### Structure rationale

- *`services/` vs `handlers/`*: handlers orchestrate; services are single-responsibility units with no knowledge of each other. This keeps `message.ts` as the only place that wires them together.
- *`config/prompts.ts` separate from `services/ai.ts`*: prompts change often during iteration. Keeping them in config means you can tune the system prompt without touching business logic.
- *No XState machine*: the previous Bookd bot used XState for fixed booking flows. This bot uses LLM-driven adaptive flow — no state machine needed. Simpler, less code.

## Architectural Patterns

### Pattern 1: Synchronous webhook with immediate 200 response

**What:** The Cloudflare Worker responds 200 to Meta's webhook call while the Claude API call happens within the same synchronous request handler. Workers have a 30-second CPU time limit, which is enough for a Claude Haiku response (~2-5 seconds).

**When to use:** Single-tenant, medium volume (<100K requests/day on free tier). No queue infra needed.

**Trade-offs:** Simple to reason about. If Claude takes >10 seconds (rare for Haiku), Meta may retry. For this scale, this is the right call — asynchronous queue adds operational complexity that isn't justified.

```typescript
// src/index.ts
const app = new Hono<{ Bindings: Env }>()

app.get('/webhook', verifyWebhookToken)
app.post('/webhook', hmacVerify, dedupMiddleware, messageHandler)

export default {
  fetch: app.fetch,
  scheduled: async (event: ScheduledEvent, env: Env) => {
    await remindersHandler(env)
  },
}
```

### Pattern 2: Agentic loop for tool use

**What:** Claude responds with `stop_reason: "tool_use"`, you execute the tool, send the result back as a `tool_result` user message, and call Claude again. Loop until `stop_reason: "end_turn"`. This is the official Anthropic pattern for multi-tool conversations.

**When to use:** Any time Claude needs to call `scrape_website`, `generate_scope_summary`, or `capture_lead` before giving its final reply.

**Trade-offs:** Each tool round-trip adds ~1-2 seconds latency. For this bot, tools are called at most once per turn (scrape once, summarize once, capture once), so max 2 round trips per message.

```typescript
// src/services/ai.ts — agentic loop
async function runAgenticLoop(messages: MessageParam[], tools: Tool[], env: Env) {
  let response = await anthropic.messages.create({ model: HAIKU_MODEL, system: SYSTEM_PROMPT, messages, tools })

  while (response.stop_reason === 'tool_use') {
    const toolUse = response.content.find(b => b.type === 'tool_use')
    const toolResult = await executeTool(toolUse.name, toolUse.input, env)

    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: toolResult }] },
    ]

    response = await anthropic.messages.create({ model: HAIKU_MODEL, system: SYSTEM_PROMPT, messages, tools })
  }

  return { response, messages }
}
```

### Pattern 3: Atomic message cap via single SQL UPDATE

**What:** Increment the counter and check the cap in a single atomic query. If the UPDATE returns no rows, the cap was already hit — no separate SELECT needed, no race conditions from concurrent webhooks.

**When to use:** Any per-user rate limiting where concurrent requests are possible (WhatsApp can deliver duplicate webhooks).

**Trade-offs:** Requires Supabase service role key (full access). Works without external locking.

```sql
UPDATE conversations
SET message_count = message_count + 1, updated_at = now()
WHERE phone = $1 AND message_count < 20
RETURNING *
```

### Pattern 4: Conversation history as JSON array in Postgres

**What:** Store the full `messages` array (role + content blocks) as a `jsonb` column in Supabase. Load it, append new messages, save it back after each turn.

**When to use:** When you need full conversation history for Claude's context. Simpler than a separate messages table for this scale. Claude's 200K context window handles even long conversations.

**Trade-offs:** Row-level locking on the conversation row for concurrent access. Not suitable for group chats. Fine for 1:1 WhatsApp conversations at this scale.

## Data Flow

### Incoming message flow

```
WhatsApp Cloud API POST /webhook
    ↓
hmacVerify middleware       → rejects if signature invalid (401)
    ↓
dedupMiddleware             → reads wamid from body, inserts into message_log
                              ON CONFLICT DO NOTHING; if 0 rows, skip (200)
    ↓
messageHandler
    ↓
conversation.load(phone)    → SELECT * FROM conversations WHERE phone = $1
                              creates row if not found
    ↓
conversation.incrementCap() → atomic UPDATE returning row; if null → send cap message, return
    ↓
human keyword check         → if text === "human" → notify Gokul, send escalation message, return
    ↓
security.preScreen(text)    → Haiku call: "SAFE" or "BLOCKED"
                              if BLOCKED → send refusal, return
    ↓
ai.buildMessages()          → [existing history] + [new user message]
                              if scraped_content cached → inject as <external_data> in first user turn
    ↓
ai.runAgenticLoop()         → Claude Haiku API call with 3 tools
                              if tool_use → executeTool → append tool_result → re-call Claude
                              until stop_reason === "end_turn"
    ↓
security.validateOutput()   → regex check for prompt leakage; replace if detected
    ↓
whatsapp.send()             → POST to Cloud API /messages
    ↓
conversation.save()         → UPDATE conversations SET messages = $1, updated_at = now()
    ↓
200 OK to Meta
```

### Tool call data flows

**scrape_website(url)**
```
Claude requests tool
    ↓
services/scraper.ts
    ↓
check Supabase: scraped_url already cached?
    → yes: return cached scraped_content
    → no: POST https://api.firecrawl.dev/v2/scrape { url, formats: ['markdown'] }
           receive { markdown: "..." }
           wrap in <external_data source="firecrawl" url="...">...</external_data>
           UPDATE conversations SET scraped_url, scraped_content
    ↓
return markdown to Claude as tool_result
```

**generate_scope_summary(idea, audience, mvp_features, platform, timeline, budget)**
```
Claude requests tool
    ↓
services/ai.ts — formatScopeSummary()
    ↓
builds structured text block (no external call needed)
    ↓
UPDATE conversations SET scope_summary
    ↓
return formatted summary string to Claude
Claude includes summary in next reply + requests email
```

**capture_lead(email)**
```
Claude requests tool
    ↓
services/email.ts + services/supabase.ts
    ↓
validate email format
INSERT INTO leads (conversation_id, email, phone, scope_summary, ...)
POST https://api.resend.com/emails — lead notification to Gokul
    ↓
return "Lead captured, email sent to Gokul" to Claude
Claude sends confirmation + meta-close message to prospect
```

### Conversation state model

```
phone: string (unique)
    ↓
conversations row
  state: active | capped | converted
  path: warm | cold | browsing | null
  message_count: 0..20 (user messages only)
  messages: jsonb [{role, content, timestamp}]
  scope_summary: text | null
  scraped_url: text | null
  scraped_content: text | null
  email: text | null
  updated_at: timestamptz (24h timeout based on this)
```

Conversation timeout logic:

```
if (now - updated_at > 24h):
  truncate messages to last 3 (keep context, save tokens)
  send "we chatted before about X, continue or start fresh?"
  message_count does NOT reset (lifetime cap still applies)
```

## Integration Points

### External services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| WhatsApp Cloud API | Direct `fetch` calls to `https://graph.facebook.com/v21.0/{phone_number_id}/messages` | Auth via Bearer token in header. Receive via POST webhook. Verify via GET webhook on first setup. |
| Anthropic Claude API | `@anthropic-ai/sdk` — `client.messages.create()` | Bundle-safe for Workers. Two calls per turn max: pre-screen (Haiku) + main (Haiku with tools). |
| Firecrawl | Direct `fetch` to `https://api.firecrawl.dev/v2/scrape` | POST with `{ url, formats: ['markdown'] }`. One call per conversation max. |
| Supabase | Raw `fetch` to PostgREST REST API | No `@supabase/supabase-js` — reduces Worker bundle size. Service role key in env. |
| Resend | `fetch` to `https://api.resend.com/emails` | POST with JSON body. Edge-native HTTP API, no SMTP. |

### Internal boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| middleware → handler | Hono `c.set()` / `c.get()` for parsed body | Middleware parses and validates; handler reads clean data |
| handler → services | Direct function calls | Services are stateless; handler owns all orchestration logic |
| services → Supabase | Raw HTTP fetch with service_role key | Never expose anon key; all DB access server-side only |
| ai.ts → security.ts | security called before and after ai call | Pre-screen blocks call entirely; output validation runs on result |
| scheduledHandler → services | Direct import of conversation.ts + whatsapp.ts | Cron handler is a thin orchestrator, same services as message handler |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1K conversations/month | Current synchronous pattern is fine. Free tier covers everything. |
| 1K-10K conversations/month | Still fine. Watch Firecrawl credits (500 free). Budget ~$50/month at this volume. |
| 10K-100K conversations/month | Move to Cloudflare Queues to decouple webhook receipt from Claude API call. Add Durable Objects for per-user conversation state to avoid Supabase contention. |
| 100K+ conversations/month | Full async pipeline. Durable Objects for state. Consider Claude Batch API for non-real-time paths. Supabase read replicas. |

### Scaling priorities

1. *First bottleneck*: Supabase connection limits — fix by using connection pooling via Supavisor (built into Supabase) or move conversation state to Durable Objects.
2. *Second bottleneck*: Firecrawl rate limits — fix by caching aggressively at the conversation level (already done) and adding domain-level dedup.
3. *Third bottleneck*: Anthropic API rate limits — fix by implementing exponential backoff with jitter and queuing with Cloudflare Queues.

## Anti-Patterns

### Anti-pattern 1: Using @supabase/supabase-js in Cloudflare Workers

**What people do:** Import the full Supabase client SDK to interact with Postgres.

**Why it's wrong:** The Supabase JS SDK adds ~200KB to the Worker bundle and uses a realtime WebSocket subscription model that doesn't fit the request/response lifecycle of Workers. PostgREST is just HTTP REST — raw fetch calls work perfectly and keep bundle size small.

**Do this instead:** Call PostgREST endpoints directly with `fetch`. The pattern is `fetch(`${SUPABASE_URL}/rest/v1/conversations?phone=eq.${phone}`, { headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY } })`.

### Anti-pattern 2: Storing conversation history in a separate messages table

**What people do:** Create a `messages` table with one row per message, joined to conversations.

**Why it's wrong:** For Claude API calls, you need the full messages array in memory anyway. A separate table means N+1 queries to reconstruct it. Claude's 200K context window can handle years of conversation history in a single JSONB column.

**Do this instead:** Store `messages` as a `jsonb` array in the `conversations` row. One read to get everything, one write to persist. Only move to a separate table if you need full-text search or analytics across messages.

### Anti-pattern 3: Skipping the pre-screen on every call to save cost

**What people do:** Remove the Haiku pre-screen call to reduce latency and token cost.

**Why it's wrong:** The pre-screen costs ~$0.001 per message and is the highest-ROI security layer. Without it, a single well-crafted jailbreak can extract the system prompt, impersonate Savi, or burn the entire AI budget in one conversation. The cost of one abuse incident far exceeds months of pre-screen costs.

**Do this instead:** Keep the pre-screen. If latency is a concern, run the pre-screen and conversation load in parallel using `Promise.all`.

### Anti-pattern 4: Resetting message_count on conversation timeout

**What people do:** Treat the 24-hour timeout as a fresh start, resetting the counter to 0.

**Why it's wrong:** Users will discover they can restart conversations to bypass the cap. The cap is a lifetime budget per phone number.

**Do this instead:** On timeout, truncate the messages array for context management, but never reset `message_count`. The counter is lifetime.

### Anti-pattern 5: Processing tool_use without a loop

**What people do:** Check `stop_reason === "tool_use"` once, execute the tool, append the result, and assume Claude will respond with text in the next call.

**Why it's wrong:** Claude may call multiple tools in a single turn. Without a loop, the second tool call never gets executed and the conversation breaks.

**Do this instead:** Loop `while (response.stop_reason === 'tool_use')`. The loop terminates when `stop_reason === 'end_turn'` or a max-iterations guard (e.g., 5 iterations) trips.

## Build Order Implications

The dependencies between components determine the right build sequence:

1. *Supabase schema + raw fetch client* — every other component depends on DB access. Set up the `conversations`, `leads`, and `message_log` tables first.
2. *Webhook skeleton (Hono + verify + dedup)* — get a working endpoint that Meta can call. Without this, nothing else can be tested end-to-end.
3. *Conversation service* — load/save/timeout logic. AI service depends on this.
4. *WhatsApp sender* — needed to send any reply. Can stub responses until AI is wired.
5. *AI service (no tools)* — get a basic Claude conversation working before adding tools.
6. *Security service* — pre-screen + output validation. Wrap the AI call once it works.
7. *Tool: scrape_website (Firecrawl)* — adds the cold path capability.
8. *Tool: generate_scope_summary* — adds the warm path conversion moment.
9. *Tool: capture_lead (Resend)* — completes the lead pipeline.
10. *Budget controls (cap + soft warning)* — wire after the happy path is complete.
11. *Prompts hardening (Layer 1, 3, 4, 5)* — final pass before going live.

## Sources

- [Anthropic tool use — implement tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use) — HIGH confidence, official docs
- [Anthropic tool use — handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls) — HIGH confidence, official docs; confirms tool_result formatting requirements, agentic loop pattern
- [Hono on Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers) — HIGH confidence, official Hono docs; confirms module worker pattern with fetch + scheduled export
- [Cloudflare Workers + Hono framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/) — HIGH confidence
- [WhatsApp webhook best practices — Hookdeck](https://hookdeck.com/webhooks/platforms/guide-to-whatsapp-webhooks-features-and-best-practices) — MEDIUM confidence; confirms 5-10 second response window and idempotency requirement
- [Resend + Cloudflare Workers](https://resend.com/docs/send-with-cloudflare-workers) — HIGH confidence, official Resend docs
- [Firecrawl /v2/scrape](https://docs.firecrawl.dev/features/scrape) — HIGH confidence, official Firecrawl docs
- [WhatsApp Cloud API echo template (GitHub)](https://github.com/depombo/whatsapp-api-cf-worker) — MEDIUM confidence; real-world Cloudflare Workers + WhatsApp webhook implementation
- [Design spec](../docs/superpowers/specs/2026-03-28-whatsapp-ai-advisor-design.md) — HIGH confidence; primary source for all project-specific architecture decisions

---
*Architecture research for: WhatsApp AI product advisor bot*
*Researched: 2026-03-28*
