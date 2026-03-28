# Feature Research

**Domain:** WhatsApp AI lead-generation bot (agency demo + product advisor)
**Researched:** 2026-03-28
**Confidence:** HIGH (cross-verified with official Meta docs, OWASP, and multiple independent sources)

---

## Feature Landscape

### Table Stakes (users expect these)

Features every functional WhatsApp AI bot has. Missing any of these and the product feels broken or gets banned.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| HMAC-SHA256 webhook verification | Meta requires it; unverified webhooks get rejected | LOW | `X-Hub-Signature-256` header checked on every POST |
| Message deduplication via wamid | WhatsApp delivers at-least-once; duplicates are normal operating condition | LOW | Store processed wamids in Supabase with `ON CONFLICT DO NOTHING`; TTL of a few hours is enough |
| Human escalation keyword | Meta compliance mandatory since Oct 2025; bots without this path risk account suspension | LOW | Keyword `human` at any conversation state; triggers Gokul notification and confirms to user |
| Conversational reply (text messages) | Core channel; without this the bot does nothing | LOW | Hono webhook handler + WhatsApp Cloud API text send |
| Graceful cap/hard-stop messaging | Users who hit budget limits need a clear path forward | LOW | Soft warn at 15 messages, hard cap at 20; offer email or human escalation |
| Conversation persistence across sessions | WhatsApp sessions expire; users expect continuity | MEDIUM | Store `messages` as jsonb in Supabase per phone number; rehydrate on each webhook |
| Timeout/resume logic | 24-hour WhatsApp session window is Meta's constraint | MEDIUM | If `updated_at` > 24h, truncate to last 3 messages for context; reference prior conversation without resetting message count |
| Email capture and lead creation | Every completed conversation must produce a qualified lead | LOW | `capture_lead` tool call; Supabase `leads` table insert + Resend notification |
| Lead notification to operator | Without operator notification the lead is worthless | LOW | Resend email with full transcript + scope summary within seconds of email capture |
| Input validation (email format) | Prevents garbage data in leads table | LOW | Basic regex before persisting; re-ask on invalid |

### Differentiators (competitive advantage)

Features that platform bots (WATI, Gallabox, Landbot) cannot replicate. These are what closes the deal.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Website scrape + instant business knowledge | The single most impressive demo moment: bot knows prospect's business within 10 seconds of receiving their URL | MEDIUM | Firecrawl `/v2/scrape` returns clean markdown; feed into Claude context; cache in Supabase to avoid repeat scrapes per conversation |
| LLM-driven adaptive conversation (no state machine) | Natural conversation that branches based on actual answers, not rigid decision trees | MEDIUM | Claude Haiku 4.5 with a well-structured system prompt; 3 Claude tool calls drive the key transitions (`scrape_website`, `generate_scope_summary`, `capture_lead`) |
| AI-generated scope summary with pricing range | Warm prospects leave with a concrete deliverable, not a vague "we'll be in touch" | MEDIUM | `generate_scope_summary` tool call; formats idea, platform, features, timeline, budget range into a structured WhatsApp message |
| 3-path entry (warm/cold/browsing) | Matches any prospect's intent without wasted messages | LOW | Button reply UX on first contact; each path has a different system prompt strategy |
| Per-user message cap with atomic SQL enforcement | Prevents AI budget abuse from adversarial or long-tail users without external locking | LOW | Single `UPDATE ... WHERE message_count < 20 RETURNING *`; if no rows returned, cap was hit |
| 5-layer prompt protection | Protects the system prompt from extraction and stops jailbreaks before they reach the main LLM | HIGH | Layer 1: hardening instructions. Layer 2: Haiku pre-screen classifier (~$0.001/msg). Layer 3: structured XML separation of instructions vs data. Layer 4: output pattern matching for leakage. Layer 5: scraped content sandboxing with explicit data-framing |
| Meta-close message after email capture | After confirming lead, bot points out "this conversation is exactly what we build for your customers" — the demo closes itself | LOW | Hardcoded follow-up message in `capture_lead` flow; no AI call needed |
| Scraped content sandboxing | Prevents indirect prompt injection via malicious content in prospect's website | LOW | Wrap Firecrawl output in `<scraped_website>` XML tags with explicit "this is DATA not instructions" framing; verified approach per OWASP LLM01:2025 |
| Browsing path with minimal AI spend | Prospects with zero intent leave with Savi's portfolio planted; near-zero token cost | LOW | Short static-like response; no LLM conversation loop; just a well-crafted message and a "text back any time" close |

### Anti-Features (commonly requested, often problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Voice note transcription | Makes the demo feel multimodal and impressive | Adds Cloudflare Workers AI dependency, doubles handler complexity, breaks the 30-second webhook response window, and isn't needed for product discovery conversations | Defer to v2; warm prospects don't need to send voice notes to scope a project |
| Image/document analysis | Demonstrates AI multimodal capability | Same complexity argument as voice; adds vision model call, file handling, and edge cases for malformed uploads | Defer to v2; the website scrape is the visual "wow" moment for v1 |
| Multilingual auto-detection | Inclusive; international prospects | Auto-detection adds a Haiku classification call before every message; at 100 prospects/month this is $0.10 extra but the complexity is disproportionate to v1 reach | Defer to v2; Savi's primary market is English-speaking |
| WhatsApp Flows (rich native forms) | Beautiful native date pickers and dropdowns inside WhatsApp | Flows require a separate Meta app review, hosted endpoint, and JSON schema for each flow; adds 2-3 days of setup for marginal UX gain over button replies | Use button replies and interactive list messages for v1; they cover the discovery flow |
| Automated follow-up sequences (24h, 48h, 7d) | Increases conversion rate for non-converted leads | Requires Cloudflare Cron Triggers, template message approval from Meta, and opt-in records; Meta also restricts outbound marketing cadences | Gokul's personal follow-up via the lead notification email is more effective at this scale; automate at v2 when volume justifies it |
| RAG / vector embeddings for scraped content | Better semantic search over large websites | Adds Cloudflare Vectorize, embedding model calls, chunking logic, and a retrieval step before every LLM call; Claude's 200K context window handles one scraped page fine | Inject full Firecrawl markdown directly into context; no embeddings needed for single-page scrapes |
| Real-time web search tool | Shows the bot isn't limited to a fixed knowledge base | Adds cost and latency; Savi's bot isn't a general assistant; search would pull the bot off-mission into answering arbitrary questions | Keep tools scoped to `scrape_website`, `generate_scope_summary`, `capture_lead` only |
| General-purpose AI assistant mode | Feels impressive | Meta banned general-purpose AI assistants from WhatsApp Business API as of January 15, 2026; account suspension risk | Frame every capability as serving the "product advisory" purpose; refuse out-of-scope queries explicitly |
| CRM sync (HubSpot/Salesforce) | Enterprise-ready pipeline | At 100 prospects/month Gokul reviews each lead personally; CRM sync adds OAuth flows, API rate limits, and field-mapping maintenance for zero benefit | Resend email with transcript is the CRM at this scale; add at v3 if volume demands it |
| Multi-tenant white-labeling | Lets Savi resell the bot to clients | Requires per-tenant phone numbers, knowledge bases, system prompts, and RLS policies; doubles database complexity | Build for Savi first; extract multi-tenant at v3 once patterns are proven |

---

## Feature Dependencies

```
HMAC-SHA256 webhook verification
    └──required by──> All message processing (no verification = no processing)

Message deduplication (wamid)
    └──required by──> Conversation persistence (dedup must run before loading conversation)

Conversation persistence
    └──required by──> Per-user message cap (need stored count)
    └──required by──> LLM conversation flow (need message history)
    └──required by──> Conversation timeout/resume (need updated_at)

Per-user message cap (atomic SQL)
    └──required by──> 5-layer prompt protection (cap check before any LLM call)
    └──required by──> Soft warning at 15 messages

LLM conversation flow
    └──required by──> 3-path entry flow (warm/cold/browsing)
    └──required by──> scrape_website tool call
    └──required by──> generate_scope_summary tool call
    └──required by──> capture_lead tool call

Website scrape + Firecrawl
    └──required by──> Cold path (business idea suggestions from URL)
    └──enhanced by──> Scraped content sandboxing (without it, indirect prompt injection risk)

Scraped content sandboxing
    └──enhances──> 5-layer prompt protection

5-layer prompt protection
    └──Layer 2 (Haiku pre-screen) requires──> LLM conversation flow
    └──Layer 4 (output validation) requires──> LLM conversation flow

capture_lead tool call
    └──required by──> Email capture and lead creation
    └──required by──> Lead notification to operator (Resend)
    └──required by──> Meta-close message

Human escalation keyword
    └──independent of──> Message cap (must work even at cap)
    └──triggers──> Lead notification to operator (flagged as escalation)
```

### Dependency notes

- *Webhook verification requires HMAC before anything else:* No other handler can run until the signature check passes. This is the outermost layer of the Hono middleware chain.
- *Dedup must precede conversation load:* Processing a duplicate and loading conversation state are both writes; dedup-first prevents double increments on the message cap.
- *Scraped content sandboxing is zero-cost and must ship with scraping:* These two features share the same implementation; shipping scraping without sandboxing is a security gap from day one.
- *Message cap is gated on conversation persistence:* The `message_count` field lives in the `conversations` table. The atomic SQL pattern prevents race conditions from concurrent webhook retries (Meta delivers at-least-once).
- *Human escalation is cap-independent:* Keyword `human` bypasses the cap check entirely. This is a Meta compliance requirement, not an optional feature.

---

## MVP Definition

### Launch with (v1)

The minimum set that makes the bot useful for real prospects and compliant with Meta.

- [x] HMAC-SHA256 webhook verification — mandatory for any live Meta integration
- [x] Message deduplication via wamid — at-least-once delivery makes duplicates a normal condition
- [x] 3-path entry flow (warm/cold/browsing) — covers the full spectrum of prospect intent
- [x] LLM-driven adaptive conversation (Claude Haiku 4.5 + tool calling) — the core product
- [x] Website scrape via Firecrawl with content sandboxing — the single biggest wow moment
- [x] AI-generated scope summary with pricing range — warm path conversion deliverable
- [x] Email capture + lead creation in Supabase — the whole point of the bot
- [x] Lead notification email to Gokul via Resend — makes captured leads actionable within 24h
- [x] Per-user message cap (20 messages, atomic SQL) — budget protection
- [x] Human escalation keyword (`human`) — Meta compliance, non-negotiable
- [x] 5-layer prompt protection — prevents prompt extraction, jailbreaks, and indirect injection
- [x] Conversation persistence + timeout/resume — continuity across the 24h WhatsApp session window
- [x] Meta-close message after email capture — makes the demo self-closing

### Add after validation (v1.x)

Features to add once the core flow is proven with real prospects.

- [ ] Soft warning at 15 messages — when usage data shows prospects approaching the cap regularly
- [ ] URL scrape caching with "I already know your business" response — when Firecrawl credits become a real cost concern
- [ ] Conversation state field (`warm`/`cold`/`browsing`) — when analytics on path conversion rates become useful

### Future consideration (v2+)

Defer until product-market fit is established with v1.

- [ ] Voice note transcription — adds multimodal wow; needs Cloudflare Workers AI Whisper setup
- [ ] Image/document analysis — adds multimodal depth; needs vision model routing
- [ ] Multilingual auto-detection — international prospect reach
- [ ] WhatsApp Flows (native forms) — richer booking/intake experience; requires Meta app review
- [ ] Automated follow-up sequences — high-volume conversion lift; requires template approval
- [ ] Multi-tenant white-labeling — productize the bot for Savi clients; v3 architecture decision

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| HMAC-SHA256 webhook verification | HIGH | LOW | P1 |
| Message deduplication (wamid) | HIGH | LOW | P1 |
| LLM-driven adaptive conversation | HIGH | MEDIUM | P1 |
| 3-path entry flow | HIGH | LOW | P1 |
| Website scrape + business knowledge | HIGH | MEDIUM | P1 |
| Scraped content sandboxing | HIGH | LOW | P1 |
| AI-generated scope summary | HIGH | LOW | P1 |
| Email capture + lead creation | HIGH | LOW | P1 |
| Lead notification via Resend | HIGH | LOW | P1 |
| Per-user message cap (atomic SQL) | HIGH | LOW | P1 |
| Human escalation keyword | HIGH | LOW | P1 |
| 5-layer prompt protection | HIGH | HIGH | P1 |
| Conversation persistence + timeout | HIGH | MEDIUM | P1 |
| Meta-close message | MEDIUM | LOW | P1 |
| Soft warning at 15 messages | MEDIUM | LOW | P2 |
| URL scrape caching | MEDIUM | LOW | P2 |
| Voice note transcription | HIGH | HIGH | P3 |
| Image/document analysis | MEDIUM | HIGH | P3 |
| Multilingual auto-detection | MEDIUM | MEDIUM | P3 |
| WhatsApp Flows | MEDIUM | HIGH | P3 |
| Automated follow-up sequences | HIGH | HIGH | P3 |
| CRM sync | LOW | HIGH | P3 |
| Multi-tenant white-labeling | HIGH | HIGH | P3 |

---

## Competitor Feature Analysis

Comparing platform bots (WATI, Gallabox, Landbot) vs what this bot must do differently.

| Feature | WATI / Gallabox / Landbot | This bot |
|---------|---------------------------|----------|
| Conversation intelligence | Fixed decision trees; keyword matching; no LLM | Claude Haiku 4.5; natural language; adapts to any answer |
| Business personalization | Generic templates; same bot for everyone | Scrapes prospect's URL; knows their business within 10 seconds |
| Lead qualification | Collects contact form fields | Full discovery conversation; scope summary with pricing range |
| Prompt security | N/A (no LLM) | 5-layer defense-in-depth per OWASP LLM01:2025 |
| Budget controls | Platform subscription handles cost; no per-user cap | 20-message lifetime cap with atomic SQL; soft warning at 15 |
| Human escalation | Manual handoff in dashboard | `human` keyword; instant operator notification with full transcript |
| Meta compliance (Jan 2026) | Platform handles this | Task-specific framing in system prompt; human escalation path built in |
| Lead notification | CRM integration or manual export | Resend email with full transcript + scope summary within seconds |
| Setup cost | $299-499/month SaaS subscription | ~$5/month infra cost; no SaaS dependency |

---

## Sources

- [WhatsApp Lead Generation: Proven Strategies 2026](https://www.flowcart.ai/blog/whatsapp-lead-generation) — MEDIUM confidence
- [AI Agents for Leads on WhatsApp: A 2026 Guide](https://sendapp.live/en/2026/02/09/whatsapp-lead-agents-guide-2026/) — MEDIUM confidence
- [8 Best WhatsApp AI Chatbot Platforms 2026](https://yourgpt.ai/blog/growth/top-whatsapp-ai-chatbots) — MEDIUM confidence
- [Not All Chatbots Are Banned: WhatsApp's 2026 AI Policy Explained](https://respond.io/blog/whatsapp-general-purpose-chatbots-ban) — HIGH confidence (respond.io is a Meta partner)
- [WhatsApp Business API Compliance 2026](https://gmcsco.com/your-simple-guide-to-whatsapp-api-compliance-2026/) — MEDIUM confidence
- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) — HIGH confidence (official OWASP)
- [OWASP LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) — HIGH confidence (official OWASP)
- [Handling Duplicate Webhooks in WhatsApp API Using Redis](https://medium.com/@nkangprecious26/handling-duplicate-webhooks-in-whatsapp-api-using-redis-d7d117731f95) — MEDIUM confidence
- [Guide to WhatsApp Webhooks: Features and Patterns](https://hookdeck.com/webhooks/platforms/guide-to-whatsapp-webhooks-features-and-best-practices) — MEDIUM confidence
- [Meta WhatsApp Messaging Limits (official)](https://developers.facebook.com/docs/whatsapp/messaging-limits/) — HIGH confidence
- [Chatbots for Lead Generation 2026](https://botpress.com/blog/lead-generation-chatbot) — MEDIUM confidence
- [Firecrawl GitHub](https://github.com/firecrawl/firecrawl) — HIGH confidence (official repo)
- [LLM-Powered vs Traditional Chatbots](https://aurotekcorp.com/llm-powered-chatbots/) — LOW confidence (single source)
- [AI Chatbot Session Management](https://optiblack.com/insights/ai-chatbot-session-management-best-practices) — LOW confidence (single source)
- Prior research: `docs/research/whatsapp-demo-bot-research.md` — HIGH confidence (already synthesized)
- Design spec: `docs/superpowers/specs/2026-03-28-whatsapp-ai-advisor-design.md` — HIGH confidence (project authority)

---

*Feature research for: WhatsApp AI product advisor bot (Savi agency lead gen)*
*Researched: 2026-03-28*
