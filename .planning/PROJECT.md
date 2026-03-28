# Savi AI Product Advisor Bot

## What This Is

A WhatsApp bot that prospects text to experience Savi's AI capabilities firsthand. The bot runs a product discovery conversation: it learns about the prospect's business (optionally scraping their website), helps them scope a product idea, generates a summary with pricing range, and funnels them toward a proposal from Savi. The bot itself is the portfolio piece — the medium is the message.

## Core Value

Every completed conversation captures a qualified lead with enough context for Gokul to write a real proposal within 24 hours.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] WhatsApp webhook receives and responds to messages
- [ ] Bot greets prospects with 3-path entry (warm/cold/browsing)
- [ ] Warm path: structured discovery conversation (idea, audience, MVP, platform, timeline, budget)
- [ ] Cold path: scrape prospect's website via Firecrawl, suggest product ideas
- [ ] Browsing path: show Savi portfolio, minimal AI budget
- [ ] AI generates scope summaries with pricing ranges
- [ ] Email capture and lead creation in Supabase
- [ ] Lead notification emails to Gokul via Resend
- [ ] Per-user message cap (20 messages lifetime, atomic enforcement)
- [ ] "human" keyword escalation at any point (Meta compliance)
- [ ] 5-layer prompt protection (hardening, pre-screen, structured separation, output validation, scraped content sandboxing)
- [ ] Message deduplication via wamid
- [ ] HMAC-SHA256 webhook signature verification
- [ ] Conversation timeout with graceful resume after 24 hours

### Out of Scope

- Voice note transcription — v2 feature, not needed for product discovery
- Image/document analysis — v2 feature
- Multilingual auto-detection — v2 feature
- WhatsApp Flows for rich forms — v2 feature
- Automated follow-up sequences — v2 feature
- Click-to-WhatsApp Ads integration — v2 feature
- AI voice agent / phone calls — v3 feature
- Multi-tenant white-labeling — v3 feature
- Prototype/mockup generation — v3 feature
- Marketing site — separate project (savibm.com already exists)

## Context

Savi is a 3-person AI-accelerated product engineering studio (Gokul, Gopi, Jahnavi). They build web apps, mobile apps, SaaS platforms, and AI products. Starting price $4K. Case studies: ZestAMC ($12M+ AUM crypto platform), Frootex (ecommerce), DropTaxi (multi-tenant SaaS), Fenado AI (50K+ users).

The bot will be shared on savibm.com, LinkedIn posts, and click-to-WhatsApp ads. Medium volume, mixed intent — needs budget controls.

Meta banned general-purpose AI assistants from WhatsApp Business API in January 2026. This bot must be framed as a business-specific tool (lead qualification + product advisory), not a general-purpose assistant. Every AI bot must have a "talk to a human" escalation path.

Previous implementation (Bookd salon booking bot) has been archived. Starting fresh with a new architecture.

## Constraints

- **Runtime**: Cloudflare Workers + Hono (TypeScript) — edge deployment, free tier
- **LLM**: Claude Haiku 4.5 via @anthropic-ai/sdk — $1/$5 per 1M tokens, fast enough for conversation
- **Database**: Supabase (Postgres via PostgREST) — conversations, leads, dedup
- **Scraping**: Firecrawl /v2/scrape API — 500 free lifetime credits, then $16/mo
- **Email**: Resend — edge-native, 3K free/month
- **WhatsApp**: WhatsApp Cloud API (direct fetch)
- **Budget**: ~$0.05 per conversation, ~$5/month at 100 prospects
- **Security**: System prompt must never be extractable. 5-layer defense-in-depth per OWASP LLM07:2025.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No state machine, LLM-driven flow | Conversation paths are adaptive, not fixed. System prompt guides the flow. Simpler to iterate. | — Pending |
| Claude Haiku 4.5 over Sonnet | ~$0.045/conversation vs ~$0.20. Haiku is strong enough for conversational sales. | — Pending |
| Anthropic SDK directly, no Vercel AI SDK | Only using Claude. No benefit to abstraction layer. Smaller bundle, fewer deps. | — Pending |
| Atomic message cap via SQL | Prevents race conditions from concurrent webhooks without external locking. | — Pending |
| Resend over SendGrid/Postmark | Only email service with native Cloudflare Workers support. | — Pending |
| No RAG/embeddings for scraped content | One URL per user, straight into context. Claude's 200K window handles this. Simpler than vector pipeline. | — Pending |
| 5-layer prompt protection | OWASP-recommended defense-in-depth. Haiku pre-screen is the strongest layer (~$0.001/msg). | — Pending |

---
*Last updated: 2026-03-28 after initialization*
