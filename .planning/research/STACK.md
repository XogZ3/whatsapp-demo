# Stack Research

**Domain:** WhatsApp AI chatbot — lead generation / product advisory
**Researched:** 2026-03-28
**Confidence:** HIGH (all versions verified against live npm registry and official documentation)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Hono | ^4.12.9 | HTTP framework on Cloudflare Workers | Built on Web Standards (Request/Response), zero overhead on Workers runtime. First-class Workers support. Tiny bundle — stays well under the 3 MB free-tier script limit. Includes middleware primitives for raw body access needed for HMAC verification. |
| @anthropic-ai/sdk | ^0.80.0 | Claude API client — tool calling, message creation | Direct SDK, no abstraction layer. Claude Haiku 4.5 tool calling is first-class. Vercel AI SDK adds 186 kB bundle overhead for no benefit when you're Claude-only. Peer-dep on Zod 3 or 4. |
| @supabase/supabase-js | ^2.100.1 | Database client — conversations, leads, message dedup | Isomorphic — uses fetch internally, no Node.js APIs. PostgREST transport means no persistent DB connections (critical for Workers). Official Cloudflare integration and custom fetch support confirmed. |
| @mendable/firecrawl-js | ^4.18.0 | Website scraping — cold path / business context | Single endpoint scrape to markdown. 500 free lifetime credits. The SDK wraps `/v2/scrape` with typed responses. The SDK is used only as a thin wrapper — you could also call the REST API directly to avoid the npm dep. |
| resend | ^6.9.4 | Transactional email — lead notifications to Gokul | The only transactional email SDK with an official Cloudflare Workers integration guide and example repo. No Node.js APIs. 3K emails/month free. Official Hono integration guide exists. |
| zod | ^4.3.6 | Schema validation — tool call parameters, config, types | Zod 4 is now stable (as of mid-2025) and is the `latest` dist-tag on npm. Anthropic SDK 0.80.0 accepts both `^3.25.0 || ^4.0.0`. Use Zod 4 directly — it has 100x faster parse speed and smaller bundle. Note: Zod 4 string validators moved to top-level (`z.email()` not `z.string().email()`). |

### Runtime & Deployment

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Wrangler | ^4.78.0 | Cloudflare Workers CLI — dev, deploy, secrets | Required deploy toolchain. v4+ supports `wrangler.jsonc`, smarter bundle analysis. Use `wrangler secret put` for all API keys — never commit them. |
| @cloudflare/workers-types | ^4.20260317.1 | TypeScript types for Workers runtime | Provides `ExecutionContext`, `Request`, `Env` typings. Pin to a date close to your deploy date for stability. |
| TypeScript | ^6.0.2 | Static types across the project | TS 6.x is now latest. Strict mode required. `type: module` in package.json. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @hono/zod-validator | ^0.7.6 | Zod validation middleware for Hono routes | Use on any Hono route that accepts a JSON body (not the webhook route — that requires raw body for HMAC). |
| vitest | ^4.1.2 | Unit testing | Co-located tests (`message.test.ts` next to `message.ts`). vitest 4.x works in the Cloudflare pool via `@vitest/pool-workers`. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm | Package manager (workspace) | Already in place. `pnpm-workspace.yaml` at root. |
| Turborepo ^2.8.0 | Monorepo task orchestration | `turbo.json` at root. Tasks: `build`, `dev`, `lint`, `check-types`, `test`. |
| eslint-plugin-simple-import-sort | Import ordering | Enforced via `@bookd/config-eslint` shared package. Use `import type` for type-only imports. |

---

## Installation

```bash
# Core runtime + framework
pnpm add hono @anthropic-ai/sdk @supabase/supabase-js @mendable/firecrawl-js resend zod

# Supporting
pnpm add @hono/zod-validator

# Dev dependencies
pnpm add -D wrangler @cloudflare/workers-types typescript vitest
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @anthropic-ai/sdk (direct) | Vercel AI SDK (@ai-sdk/anthropic) | Use Vercel AI SDK only if you need multi-provider abstraction (OpenAI + Claude + Gemini). For Claude-only, the abstraction adds 186 kB+ and zero value. |
| @supabase/supabase-js | Raw `fetch` to PostgREST | Use raw fetch if bundle size becomes critical (the SDK is isomorphic and safe, but it does pull in all sub-packages including realtime). For this project, SDK is fine — it simplifies RLS and typed queries. |
| @mendable/firecrawl-js | Direct `fetch` to Firecrawl `/v2/scrape` | Use direct fetch if you want to eliminate the npm dep entirely. The API is a single POST with `{url, formats: ['markdown']}`. Either approach is valid; the SDK just gives typed responses. |
| Resend | Cloudflare Email Workers (native) | Use Cloudflare Email Workers once it exits private beta for zero-API-key email from Workers. As of March 2026 it's still in private beta — Resend is the production-ready choice. |
| Zod 4 (`zod@^4.3.6`) | Zod 3 (`zod@^3.25.0`) | Use Zod 3 only if a critical dependency pins to it. The Anthropic SDK accepts both. Zod 4 is faster, smaller, and the `npm latest` tag. |
| Hono | itty-router, Elysia | Hono has the best TypeScript DX, largest Workers adoption, and official Cloudflare documentation. Elysia is Bun-first. itty-router has no typed middleware. |
| Wrangler | Miniflare (direct) | Wrangler now bundles Miniflare internally for `wrangler dev`. No reason to use Miniflare directly. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `xstate` | Previous Bookd implementation used XState for booking flows. Product advisor has no fixed state transitions — LLM-driven conversation flow with tool calling is simpler and more flexible. XState adds ~50 KB bundle for zero benefit here. | Plain conversation history array in Supabase |
| Vercel AI SDK | 186 kB bundle overhead. Claude-only use case gets zero multi-provider benefit. Adds an abstraction layer between you and Claude's native tool calling format. | @anthropic-ai/sdk directly |
| `@upstash/redis` | Previous Bookd implementation used Redis for dedup. For this project, `wamid` dedup is done via `ON CONFLICT DO NOTHING` in Supabase — no separate Redis instance needed. Simpler and one less service. | Supabase `message_log` table with unique constraint on `wamid` |
| `node-fetch` or `axios` | Cloudflare Workers has native `fetch` (Web Standards). Node-specific HTTP clients won't work in the Workers runtime. | Native `fetch` |
| `dotenv` | Cloudflare Workers reads env vars from `wrangler.toml` bindings and `wrangler secret`. `dotenv` is a Node.js pattern — it doesn't run in the Workers runtime. | `wrangler secret put KEY` for secrets; `vars` in `wrangler.toml` for non-secrets |
| Claude Haiku 3 (`claude-3-haiku-20240307`) | Deprecated. Retiring April 19, 2026. Worse than Haiku 4.5 on every metric. | `claude-haiku-4-5-20251001` (alias: `claude-haiku-4-5`) |

---

## Stack Patterns by Variant

**If bundle size approaches the 3 MB free-tier limit:**
- Replace `@supabase/supabase-js` with raw `fetch` calls to PostgREST and Auth REST endpoints directly
- Replace `@mendable/firecrawl-js` with direct `fetch` to `/v2/scrape`
- Both are straightforward because the underlying transport is just HTTP

**If you upgrade to Cloudflare Workers Paid plan ($5/month):**
- Bundle limit increases from 3 MB to 10 MB — removes pressure entirely
- Daily request limit (100K/day) also disappears — important if LinkedIn campaigns drive burst traffic

**If the pre-screen Haiku call becomes too slow (rare):**
- Move the pre-screen to a Cloudflare Worker's `ctx.waitUntil()` on a subsequent message
- Or cache the classification for 60 seconds per phone number in Supabase

---

## Claude Model Reference

| Model | API ID | Context | Pricing | Use For |
|-------|--------|---------|---------|---------|
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | 200K tokens | $1/$5 per MTok | Main conversation + pre-screen classifier |
| Claude Haiku 4.5 (alias) | `claude-haiku-4-5` | 200K tokens | $1/$5 per MTok | Same — alias resolves to snapshot above |

Use the snapshot ID (`claude-haiku-4-5-20251001`) in production for stable, reproducible behavior. The alias `claude-haiku-4-5` always points to the latest Haiku 4.5 snapshot — safe for development.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @anthropic-ai/sdk ^0.80.0 | zod ^3.25.0 or ^4.0.0 | Peer dep accepts both. Use zod 4. |
| @hono/zod-validator ^0.7.6 | hono ^4, zod ^3 or ^4 | Verified against Hono 4.x. |
| wrangler ^4.78.0 | @cloudflare/workers-types ^4.20260317.1 | Keep workers-types date close to wrangler release for accurate type coverage. |
| vitest ^4.1.2 | @vitest/pool-workers for Cloudflare environment | For testing Workers-specific APIs use `@cloudflare/vitest-pool-workers` — not verified in this research, flag for phase-specific research. |

---

## Zod 4 Key Changes from v3

If migrating from the Bookd codebase or following v3 docs, watch for these Zod 4 breaking changes:

- `z.string().email()` → `z.email()`
- `z.string().uuid()` → `z.uuid()`
- `.strict()` on objects → `z.strictObject()`
- `error.errors` → `error.issues`
- `invalid_type_error` / `required_error` params → unified `error` param
- `._def` → `._zod.def` (internal, avoid touching directly)

---

## Sources

- [Anthropic Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview) — Haiku 4.5 API ID, pricing, context window (HIGH confidence, official Anthropic docs, fetched 2026-03-28)
- [npm registry: hono@4.12.9](https://registry.npmjs.org/hono/4.12.9) — version confirmed (HIGH confidence, live registry)
- [npm registry: @anthropic-ai/sdk@0.80.0](https://registry.npmjs.org/@anthropic-ai/sdk/0.80.0) — version, Zod peer dep confirmed (HIGH confidence, live registry)
- [npm registry: @supabase/supabase-js@2.100.1](https://registry.npmjs.org/@supabase/supabase-js/2.100.1) — isomorphic architecture confirmed (HIGH confidence, live registry)
- [npm registry: resend@6.9.4](https://registry.npmjs.org/resend/6.9.4) — version confirmed (HIGH confidence, live registry)
- [npm registry: @mendable/firecrawl-js@4.18.0](https://registry.npmjs.org/@mendable/firecrawl-js/4.18.0) — version confirmed (HIGH confidence, live registry)
- [npm registry: zod@4.3.6](https://registry.npmjs.org/zod) — v4 is latest dist-tag confirmed (HIGH confidence, live registry)
- [Cloudflare Workers Limits](https://developers.cloudflare.com/workers/platform/limits/) — 3 MB free / 10 MB paid bundle limit, 100K req/day free (HIGH confidence, official Cloudflare docs)
- [Supabase × Cloudflare Workers](https://developers.cloudflare.com/workers/databases/third-party-integrations/supabase/) — official integration confirmed (HIGH confidence, official Cloudflare docs)
- [Resend × Cloudflare Workers](https://resend.com/docs/send-with-cloudflare-workers) — official integration guide (HIGH confidence, official Resend docs)
- [Zod v4 Migration Guide](https://zod.dev/v4/changelog) — breaking changes (MEDIUM confidence, official Zod docs via WebSearch)
- [Vercel AI SDK bundle size analysis](https://blog.hyperknot.com/p/til-vercel-ai-sdk-the-bloat-king) — 186 kB overhead figure (MEDIUM confidence, single source, but consistent with package size analysis)

---
*Stack research for: WhatsApp AI product advisor bot (Savi agency)*
*Researched: 2026-03-28*
