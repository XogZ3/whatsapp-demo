# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Bookd

Bookd is a WhatsApp-native salon booking bot built by Savi agency. It handles the full booking lifecycle inside WhatsApp: service selection, stylist choice, date/time booking, reminders, rescheduling, and cancellation. The product has two surfaces: a WhatsApp bot (Hono on Cloudflare Workers) and a marketing site (Astro).

## Monorepo structure

```
bookd/
  apps/
    web/                  # Astro marketing site + interactive demo
    bot/                  # Hono WhatsApp bot backend
  packages/
    shared/               # Zod schemas, types
    config-ts/            # Shared tsconfig base
    config-eslint/        # Shared ESLint config
  turbo.json
  pnpm-workspace.yaml
```

## Commands

```bash
# Root (runs across all packages via Turborepo)
pnpm turbo build         # Build all packages
pnpm turbo dev           # Start all dev servers
pnpm turbo lint          # Lint all packages
pnpm turbo check-types   # TypeScript type checking
pnpm turbo test          # Run all tests

# Bot-specific
cd apps/bot
pnpm vitest run          # Run bot tests
pnpm wrangler dev        # Local dev server

# Web-specific
cd apps/web
pnpm astro dev           # Local dev server (localhost:4321)
pnpm astro build         # Production build
```

## Architecture

### WhatsApp bot (`apps/bot/`)

Hono app deployed to Cloudflare Workers. Messages flow through:

1. **Webhook** (`src/index.ts`) - GET for Meta verification, POST for messages
2. **Middleware** - HMAC-SHA256 signature verification (`middleware/verify.ts`) + Upstash Redis deduplication (`middleware/dedup.ts`)
3. **Message handler** (`handlers/message.ts`) - parses incoming WhatsApp messages, rehydrates XState machine, sends events, builds response messages
4. **XState state machine** (`machine/machine.ts`) - states: idle → onboarding → serviceSelection → stylistSelection → dateTimeSelection → confirmation → booked → rescheduling/cancellation
5. **WhatsApp sender** (`whatsapp/sender.ts`) - sends text, buttons, list, location messages and templates via Cloud API
6. **Supabase service** (`services/supabase.ts`) - client state persistence, booking CRUD, reminder queries
7. **Reminders** (`handlers/reminders.ts`) - 48h + 2h booking reminders via Cloudflare Cron Triggers

State is persisted as serialized JSON in Supabase per client (`state_snapshot` field).

### Marketing site (`apps/web/`)

Astro with Tailwind CSS v4, React islands, Cloudflare adapter.

- **Landing page** (`/`) - hero with auto-play WhatsApp phone mockup, value props, ROI calculator, pricing, FAQ
- **Pricing** (`/pricing`) - 3-tier plans with competitor comparison
- **Demo** (`/demo`) - interactive WhatsApp booking simulator
- **i18n** - en (default, no prefix), ar (RTL), de

### Shared package (`packages/shared/`)

Zod schemas for: salon, service, stylist, client, booking, waitlist, message_log. TypeScript types inferred via `z.infer`.

### Database

Supabase (Postgres) with migration at `apps/bot/supabase/migrations/001_initial_schema.sql`. RLS policies for multi-tenant salon isolation.

## Key conventions

- **Package manager**: pnpm with workspaces
- **Build orchestration**: Turborepo
- **TypeScript**: strict mode everywhere
- **Imports**: `eslint-plugin-simple-import-sort` enforces sorted imports; use `import type` for type-only imports
- **Tests**: Colocated with source (e.g., `machine.test.ts` next to `machine.ts`), Vitest
- **Commits**: Conventional Commits
- **Deploy target**: Cloudflare Workers (both apps)
- **State serialization**: XState machine state is stored as JSON in Supabase and rehydrated on each webhook call
