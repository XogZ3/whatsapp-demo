# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this is

Savi AI Product Advisor Bot: a WhatsApp bot that prospects text to experience Savi agency's AI capabilities. The bot runs product discovery conversations, scrapes prospect websites, generates scope summaries with pricing, and captures leads for follow-up proposals. The bot itself is the portfolio piece.

Previous project (Bookd salon booking bot) is archived in `_archive/bookd/`.

## Deployment

- **Worker name**: `savi-whatsapp-bot`
- **Live URL**: https://savi-whatsapp-bot.saravanangokult.workers.dev
- **Cloudflare account**: `edb9abae1487e607d31cb63b05ec67d3`
- **Supabase project**: `scgeoxhmjhaaohdafasy`

## Project structure

Single flat app (no monorepo, no Turborepo, no pnpm workspaces).

```
src/
  index.ts              # Hono app, webhook routes
  middleware/
    verify.ts           # HMAC-SHA256 signature verification
    dedup.ts            # wamid deduplication via Supabase
  handlers/
    message.ts          # Main message handler orchestration
  services/
    conversation.ts     # Load, save, cap enforcement, timeout logic
    ai.ts               # System prompt, Claude API calls
    tools.ts            # Tool definitions (scrape_website, generate_scope_summary, capture_lead)
    security.ts         # Input pre-screen, output validation
    scraper.ts          # Firecrawl integration, content sandboxing
    whatsapp.ts         # Send messages, format buttons/lists
    email.ts            # Resend integration for lead notifications
    supabase.ts         # Database client and queries (wa_-prefixed tables)
  config/
    prompts.ts          # System prompt, refusal templates
    constants.ts        # Message cap, timeout duration
  types.ts              # Shared types
supabase/
  migrations/
    001_initial_schema.sql
    002_wa_prefix_schema.sql
wrangler.toml
```

## Commands

```bash
pnpm install             # Install dependencies
pnpm dev                 # Local dev server (wrangler dev)
pnpm build               # Build (wrangler deploy)
pnpm test                # Run tests (vitest)
pnpm typecheck           # TypeScript type checking
```

## Tech stack

- **Runtime**: Cloudflare Workers + Hono (TypeScript)
- **LLM**: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk`
- **Database**: Supabase (Postgres via PostgREST, raw fetch, all tables `wa_`-prefixed)
- **Scraping**: Firecrawl `/v2/scrape` API
- **Email**: Resend
- **WhatsApp**: Cloud API (direct fetch)
- **Package manager**: pnpm
- **Tests**: Vitest

## Database tables

All tables use the `wa_` prefix:

- `wa_conversations` - conversation state, message history, message count, path tracking
- `wa_leads` - captured leads with email, scope summary, proposal status
- `wa_message_log` - wamid deduplication

RLS policies enforce service-role-only access. No client-side queries.

## Architecture

Messages flow through:

1. **Webhook** (`src/index.ts`) - GET for Meta verification, POST for messages
2. **Middleware** - HMAC-SHA256 verify + wamid dedup (against `wa_message_log`)
3. **Message handler** - loads conversation from `wa_conversations`, checks cap atomically, routes to AI
4. **AI service** - Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) with tool calling (scrape_website, generate_scope_summary, capture_lead)
5. **Security** - 5-layer prompt protection (hardening, pre-screen, XML separation, output validation, content sandboxing)
6. **WhatsApp sender** - text + interactive button messages via Cloud API; META_CLOSE sent after email capture confirmation
7. **Lead pipeline** - email capture into `wa_leads`, Resend notification to Gokul
8. **Conversation persistence** - conversation path tracked, state saved back to `wa_conversations`

No state machine. LLM-driven conversation flow via system prompt.

## Key conventions

- **TypeScript**: strict mode, `import type` for type-only imports
- **Validation**: Zod at system boundaries
- **Tests**: colocated with source, Vitest
- **Commits**: Conventional Commits
- **Deploy target**: Cloudflare Workers
- **Single app**: no monorepo, no Turborepo, no pnpm workspaces
- **Atomic cap**: message count incremented via SQL `UPDATE...RETURNING` to prevent race conditions
- **Conversation path**: tracked in `wa_conversations.path` and passed to Claude for context

## Design spec

Full design spec at `docs/superpowers/specs/2026-03-28-whatsapp-ai-advisor-design.md`

## Planning

GSD planning docs at `.planning/` (PROJECT.md, ROADMAP.md, REQUIREMENTS.md, research/)
