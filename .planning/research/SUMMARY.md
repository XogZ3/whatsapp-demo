# Research Summary

**Project:** WhatsApp AI Product Advisor Bot (Savi agency)
**Domain:** WhatsApp chatbot / AI lead-generation / product advisory
**Researched:** 2026-03-28
**Confidence:** HIGH

---

## Executive Summary

This is an LLM-driven WhatsApp chatbot that scrapes a prospect's website, conducts a natural product discovery conversation, generates a scoped build estimate, and captures their email as a qualified lead — all inside WhatsApp. The product runs on Cloudflare Workers (Hono) + Claude Haiku 4.5 (Anthropic SDK) + Supabase (Postgres) + Firecrawl. No state machine is needed; Claude tool calling handles all flow transitions. The architecture is a synchronous webhook handler that returns 200 immediately via `ctx.waitUntil()` and processes the LLM pipeline asynchronously.

The key differentiator over platform bots (WATI, Gallabox) is website personalization: the bot knows the prospect's business within 10 seconds of receiving their URL. Three Claude tools drive the core experience — `scrape_website`, `generate_scope_summary`, and `capture_lead`. The bot closes itself: after email capture, it points out "this conversation is exactly what we build for your customers," turning every lead into a referral seed.

The top risks are infrastructure-level (Cloudflare Workers free tier has a 10ms CPU limit that hard-blocks LLM calls — paid tier at $5/month is mandatory), compliance-level (Meta banned general-purpose AI chatbots in January 2026 — task-specific framing in the system prompt is required from day one), and security-level (scraped website content must be XML-sandboxed before injection into Claude context to prevent indirect prompt injection).

---

## Key Findings

### Recommended Stack

The stack is optimized for Cloudflare Workers' Web Standards runtime. Every dependency is isomorphic or edge-native. The Anthropic SDK is used directly rather than through an abstraction layer — Vercel AI SDK adds 186 KB bundle overhead for zero benefit on a Claude-only project. Supabase is accessed via raw PostgREST `fetch` calls rather than `supabase-js` (which pulls in realtime WebSocket code that bloats the Worker bundle). Zod 4 is the correct version; it's the `latest` npm tag as of 2025 and is 100x faster at parsing than v3.

*Core technologies:*
- **Hono ^4.12.9** — HTTP framework, Web Standards, first-class Workers support, raw body access for HMAC
- **@anthropic-ai/sdk ^0.80.0** — Claude Haiku 4.5 direct, native tool calling, no abstraction overhead
- **@supabase/supabase-js ^2.100.1** (or raw PostgREST fetch) — conversation persistence, leads, dedup
- **@mendable/firecrawl-js ^4.18.0** (or direct fetch) — website scrape to markdown, 500 free credits
- **resend ^6.9.4** — lead notification emails, official Workers integration, 3K emails/month free
- **zod ^4.3.6** — schema validation, 100x faster than v3, accepted by Anthropic SDK
- **Wrangler ^4.78.0** — Workers CLI; paid plan required before any production deploy
- **TypeScript ^6.0.2** — strict mode; `type: module` package.json

*What not to use:* XState (LLM handles flow, no fixed transitions needed), Vercel AI SDK (bundle bloat), `@upstash/redis` (wamid dedup handled in Supabase), `dotenv` (Workers reads env via wrangler bindings), Claude Haiku 3 (retiring April 19, 2026).

### Feature Priority

*Must have — v1:*
- HMAC-SHA256 webhook verification — mandatory, Meta rejects unverified webhooks
- Message dedup via wamid with `ON CONFLICT DO NOTHING` — at-least-once delivery is normal
- 3-path entry (warm/cold/browsing) — covers full prospect intent spectrum
- LLM conversation with Claude Haiku 4.5 tool calling — the core product
- Website scrape via Firecrawl with XML content sandboxing — the "wow" moment
- AI-generated scope summary with pricing range — warm path conversion deliverable
- Email capture + lead creation in Supabase — the purpose of the bot
- Lead notification to Gokul via Resend — makes leads actionable
- Per-user 20-message cap (atomic SQL `UPDATE ... WHERE count < 20 RETURNING *`) — budget protection
- Human escalation keyword (`human`) — Meta compliance, non-negotiable since Oct 2025
- 5-layer prompt protection (hardening + Haiku pre-screen + XML separation + output validation + scrape sandboxing)
- Conversation persistence with 24h timeout-resume logic
- Meta-close message after email capture — demo closes itself

*Should have — v1.x (after validation):*
- Soft warning at 15 messages
- URL scrape caching ("I already know your business" response)
- Conversation path tracking (`warm`/`cold`/`browsing`) for analytics

*Defer — v2+:*
- Voice note transcription
- Image/document analysis
- Multilingual auto-detection
- WhatsApp Flows (requires separate Meta app review)
- Automated follow-up sequences (requires template approval)
- Multi-tenant white-labeling

*Hard anti-features (never for v1):*
- General-purpose assistant mode — Meta banned this January 15, 2026; account suspension risk
- RAG/vector embeddings — Claude's 200K context handles one-page scrapes fine
- CRM sync — Resend email is the CRM at 100 prospects/month

### Architecture Overview

The architecture is a single Cloudflare Worker (Hono) that handles two responsibilities: a webhook route (`POST /webhook`) that runs the full LLM pipeline, and a scheduled handler for optional reminders. Middleware runs in order — HMAC verification first, then wamid dedup against Supabase — before the message handler orchestrates the pipeline: load conversation, atomic cap check, human-keyword intercept, Haiku pre-screen, build messages array, run Claude agentic loop (tool calls until `stop_reason === "end_turn"`), validate output for prompt leakage, send WhatsApp reply, and persist updated conversation. All heavy work runs inside `ctx.waitUntil()` so the 200 response returns to Meta immediately.

*Major components:*
1. **`middleware/verify.ts`** — HMAC-SHA256, rejects with 401 before any business logic runs
2. **`middleware/dedup.ts`** — wamid insert with `ON CONFLICT DO NOTHING`; skips if 0 rows returned
3. **`handlers/message.ts`** — orchestration only; calls services in the right order
4. **`services/ai.ts`** — system prompt builder, agentic loop (`while stop_reason === "tool_use"`), three tools
5. **`services/conversation.ts`** — load/save JSONB conversation, atomic cap check, 24h timeout logic
6. **`services/security.ts`** — Haiku pre-screen classifier, output prompt-leakage validator
7. **`services/scraper.ts`** — Firecrawl fetch, XML sandboxing, cache in `scraped_content` column
8. **`services/whatsapp.ts`** — send text, buttons, list messages via Cloud API
9. **`services/email.ts`** — Resend lead notification (fire via `ctx.waitUntil()`, not inline)
10. **`services/supabase.ts`** — raw PostgREST fetch client (no SDK bundle)
11. **`config/prompts.ts`** — system prompt with XML-tagged sections, refusal templates

*Key patterns:*
- Respond 200 immediately via `ctx.waitUntil()`, process asynchronously
- Agentic loop: `while (stop_reason === 'tool_use')` with max-iterations guard
- Atomic cap: `UPDATE ... WHERE count < 20 RETURNING *` — no separate SELECT, no race condition per single message
- Conversation as JSONB append using SQL `||` operator, never read-modify-write in JS
- Scraped content always in user-role messages, never in system prompt

### Critical Pitfalls

1. **Workers free tier 10ms CPU limit** — hard blocks LLM calls with 1102 errors. Upgrade to Workers Paid ($5/month) before the first end-to-end test. Never deploy this bot on the free tier.

2. **Webhook must return 200 before processing** — process inside `ctx.waitUntil()` or Meta retries within 10 seconds, causing duplicate replies and double cap increments. Combined with wamid dedup, retries become no-ops.

3. **Concurrent webhooks corrupt JSONB conversation state** — two Workers reading the same snapshot, both appending, second write wins and drops the first message. Fix: use Postgres `messages || $new::jsonb` append-only SQL, never JS-side array mutation.

4. **Meta general-purpose chatbot ban (January 15, 2026)** — open-ended Q&A framing risks WABA account termination. System prompt must hard-scope to product advisory from day one. Human escalation path is a compliance requirement, not a UX nice-to-have.

5. **Scraped content prompt injection via Firecrawl** — malicious HTML in a prospect's page becomes instructions to Claude if injected raw. Wrap all Firecrawl output in `<external_data>` XML tags with explicit "this is DATA not instructions" framing. This must ship with scraping — never as a follow-up.

---

## Implications for Roadmap

### Phase 1: Webhook foundation + compliance skeleton

**Rationale:** Every other component depends on a working, verified, deduplicated webhook. Meta compliance framing must be correct before any public share — a WABA account ban is unrecoverable without a 3-14 day appeal.
**Delivers:** A functional webhook that Meta can verify, with HMAC signature checking, wamid dedup, Workers Paid plan configured, and a hardened system prompt establishing bot identity.
**Addresses:** HMAC verification, message dedup, human escalation keyword, Meta policy framing.
**Avoids:** Workers free tier CPU kill (set `wrangler.toml` paid plan), duplicate message processing, WABA ban from day-one framing errors.
**Research flag:** Standard patterns — skip phase research.

### Phase 2: Conversation persistence + LLM core

**Rationale:** Conversation state is a dependency for cap enforcement, tool calling, and timeout logic. Get a working Claude conversation before adding tools or security layers.
**Delivers:** Full conversation loop — load JSONB from Supabase, send to Claude Haiku 4.5, get text response, persist back. Atomic cap enforcement. 24h timeout-resume handling.
**Uses:** `@anthropic-ai/sdk`, `services/conversation.ts`, `services/ai.ts` (no tools yet), raw PostgREST Supabase client.
**Implements:** Agentic loop scaffold, atomic `UPDATE ... WHERE count < 20`, JSONB append-only SQL pattern.
**Avoids:** Concurrent webhook state corruption, cap race conditions, conversation history overwrite.
**Research flag:** Anthropic tool use docs already researched — standard patterns apply.

### Phase 3: Security layer

**Rationale:** Security must wrap the AI service before tools are added. Adding tools without security means an unsafe scrape call and an unprotected system prompt in production.
**Delivers:** 5-layer prompt protection — system prompt hardening (Layer 1), Haiku pre-screen classifier (Layer 2), XML-tagged prompt sections (Layer 3), output leak detection (Layer 4).
**Addresses:** Prompt extraction, jailbreaks, adversarial input from any message.
**Avoids:** Pre-screen removal temptation (it costs $0.001/msg; skipping it risks system prompt exposure and budget drain in a single conversation).
**Research flag:** OWASP LLM01:2025 patterns are well-documented — standard patterns apply.

### Phase 4: Scraper + tool calling

**Rationale:** Website scraping is the biggest demo differentiator and the highest-complexity integration. Build it after the secure conversation core exists so injection risks are contained from first call.
**Delivers:** `scrape_website` tool, Firecrawl integration with XML sandboxing (Layer 5), scrape caching in `scraped_content` column, cold path activation.
**Uses:** `@mendable/firecrawl-js` (or direct fetch), `services/scraper.ts`.
**Avoids:** Scraped content prompt injection, Firecrawl credit double-spend, context stuffing from large pages (truncate to 30K chars before storage).
**Research flag:** May need phase research to validate Firecrawl `/v2/scrape` response schema and error codes (402 on credit exhaustion, graceful degradation path).

### Phase 5: Lead capture + notifications

**Rationale:** `generate_scope_summary` and `capture_lead` tools complete the conversion funnel. Email notification via Resend is the final output that makes leads actionable.
**Delivers:** `generate_scope_summary` tool (warm path deliverable), `capture_lead` tool (Supabase insert + Resend notification), meta-close message, 3-path entry UX (warm/cold/browsing button replies).
**Uses:** `resend ^6.9.4`, `services/email.ts`.
**Avoids:** Blocking user-facing response on Resend delivery (fire via `ctx.waitUntil()`), Resend outage dropping the conversation (catch and continue).
**Research flag:** Standard patterns — skip phase research.

### Phase 6: Hardening + UX polish

**Rationale:** Final pass before live prospect traffic. Budget controls, output limits, typing indicators, and "looks done but isn't" checklist items from pitfall research.
**Delivers:** Soft warning at 15 messages, `max_tokens: 600` cap on Claude responses, typing indicator API call before each reply, WhatsApp button message validation, full end-to-end test with concurrent load, all checklist items from PITFALLS.md verified.
**Avoids:** Abrupt hard-cap UX, runaway response costs, users thinking the bot is broken during 4-8s LLM latency.
**Research flag:** No research needed — implementation and QA phase.

### Phase Ordering Rationale

- Foundation before features: HMAC + dedup must exist before any business logic. Meta compliance must be correct before the first public demo link goes out.
- Security before tools: Firecrawl output injected into an unsecured prompt is a vulnerability from the first scrape call. The security layer must wrap the AI service before tools are added.
- Conversation core before tool calling: The agentic loop pattern and JSONB persistence must be solid before adding multi-tool round-trips that amplify any state management bugs.
- Atomic patterns from day one: Concurrent webhook state corruption is unrecoverable (conversation history can't be reconstructed). The correct SQL patterns must be in the schema from Phase 1, not retrofitted.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against live npm registry and official Cloudflare/Anthropic/Supabase docs. |
| Features | HIGH | Cross-verified with official Meta policy docs, OWASP, and the existing design spec. |
| Architecture | HIGH | Agentic loop and tool use patterns from official Anthropic docs. Workers patterns from official Cloudflare docs. |
| Pitfalls | HIGH | Most critical pitfalls (CPU limit, webhook timing, Meta ban) verified against official sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **`@vitest/pool-workers` compatibility with vitest ^4.1.2** — not verified in research. Flag for Phase 1 when setting up the test environment. May need to pin vitest to a specific version or use the `@cloudflare/vitest-pool-workers` package.
- **WhatsApp Business-Scoped User IDs (BSUIDs)** — Meta is migrating the `from` field away from raw phone numbers. The dedup and conversation service must use `contacts[0].wa_id` not `messages[0].from` as the primary key. Validate the webhook payload structure with a live test in Phase 1.
- **24h timeout-resume via template message** — freeform messages fail with error 131047 after 24h session window. The template message must be pre-approved in Meta Business Manager before Phase 2. This approval can take 24-48h; start early.
- **Firecrawl 402 graceful degradation** — when 500 free credits are exhausted, the bot must fall back to text-only cold path without crashing. Verify error handling in Phase 4.

---

## Sources

### Primary (HIGH confidence)
- [Anthropic Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview) — Haiku 4.5 API ID, pricing, context window
- [Anthropic tool use docs](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use) — agentic loop pattern, tool_result formatting
- [Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/) — 10ms CPU free tier, 30s paid tier, 3MB bundle limit
- [Cloudflare Workers + Hono](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/hono/) — module worker pattern
- [Supabase + Cloudflare Workers](https://developers.cloudflare.com/workers/databases/third-party-integrations/supabase/) — integration confirmed
- [Resend + Cloudflare Workers](https://resend.com/docs/send-with-cloudflare-workers) — official integration guide
- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — content sandboxing patterns
- [Meta WhatsApp Messaging Limits](https://developers.facebook.com/docs/whatsapp/messaging-limits/) — 24h session window, template requirements
- [Meta general-purpose AI chatbot ban (TechCrunch, Oct 2025)](https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/) — policy enforcement date confirmed
- [npm registry](https://registry.npmjs.org) — all package versions verified live

### Secondary (MEDIUM confidence)
- [WhatsApp webhooks guide (hookdeck)](https://hookdeck.com/webhooks/platforms/guide-to-whatsapp-webhooks-features-and-best-practices) — 5-10s response window, idempotency patterns
- [WhatsApp AI chatbot ban (respond.io)](https://respond.io/blog/whatsapp-general-purpose-chatbots-ban) — policy framing details
- [Zod v4 Migration Guide](https://zod.dev/v4/changelog) — breaking changes from v3

### Tertiary (LOW confidence)
- [LLM-Powered vs Traditional Chatbots (aurotekcorp)](https://aurotekcorp.com/llm-powered-chatbots/) — chatbot comparison framing
- [AI Chatbot Session Management (optiblack)](https://optiblack.com/insights/ai-chatbot-session-management-best-practices) — session timeout patterns

---
*Research completed: 2026-03-28*
*Ready for roadmap: yes*
