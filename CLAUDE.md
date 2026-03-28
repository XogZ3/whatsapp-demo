# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this is

Savi AI Product Advisor Bot: a WhatsApp bot that prospects text to experience Savi agency's AI capabilities. The bot runs product discovery conversations, scrapes prospect websites, generates scope summaries with pricing, and captures leads for follow-up proposals. The bot itself is the portfolio piece.

Previous project (Bookd salon booking bot) is archived in `_archive/bookd/`.

## Project structure

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
    ai.ts               # System prompt, Claude API calls, tool definitions
    security.ts         # Input pre-screen, output validation
    scraper.ts          # Firecrawl integration, content sandboxing
    whatsapp.ts         # Send messages, format buttons/lists
    email.ts            # Resend integration for lead notifications
    supabase.ts         # Database client and queries
  config/
    prompts.ts          # System prompt, refusal templates
    constants.ts        # Message cap, timeout duration
  types.ts              # Shared types
supabase/
  migrations/           # Postgres schema
wrangler.toml
```

## Commands

```bash
pnpm install             # Install dependencies
pnpm dev                 # Local dev server (wrangler)
pnpm build               # Production build
pnpm test                # Run tests (Vitest)
pnpm typecheck           # TypeScript type checking
```

## Tech stack

- **Runtime**: Cloudflare Workers + Hono (TypeScript)
- **LLM**: Claude Haiku 4.5 via `@anthropic-ai/sdk`
- **Database**: Supabase (Postgres via PostgREST, raw fetch)
- **Scraping**: Firecrawl `/v2/scrape` API
- **Email**: Resend
- **WhatsApp**: Cloud API (direct fetch)
- **Package manager**: pnpm
- **Tests**: Vitest

## Architecture

Messages flow through:

1. **Webhook** (`src/index.ts`) - GET for Meta verification, POST for messages
2. **Middleware** - HMAC-SHA256 verify + wamid dedup
3. **Message handler** - loads conversation, checks cap, routes to AI
4. **AI service** - Claude Haiku 4.5 with tool calling (scrape_website, generate_scope_summary, capture_lead)
5. **Security** - 5-layer prompt protection (hardening, pre-screen, XML separation, output validation, content sandboxing)
6. **WhatsApp sender** - text + interactive button messages via Cloud API
7. **Lead pipeline** - email capture, Supabase storage, Resend notification to Gokul

No state machine. LLM-driven conversation flow via system prompt.

## Key conventions

- **TypeScript**: strict mode, `import type` for type-only imports
- **Validation**: Zod at system boundaries
- **Tests**: colocated with source, Vitest
- **Commits**: Conventional Commits
- **Deploy target**: Cloudflare Workers
- **No monorepo**: single app, no Turborepo

## Design spec

Full design spec at `docs/superpowers/specs/2026-03-28-whatsapp-ai-advisor-design.md`

## Planning

GSD planning docs at `.planning/` (PROJECT.md, ROADMAP.md, REQUIREMENTS.md, research/)
