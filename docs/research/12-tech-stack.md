# Tech Stack Research (March 2026)

## Marketing site: Astro 6

**Why Astro over Next.js for marketing pages:**
- Ships 90% less JavaScript (8KB vs 85KB)
- 40% faster load times
- Lighthouse scores: 95+ (vs ~75 for Next.js on slow 4G)
- Build time: ~18s for 1000 pages (vs ~52s for Next.js)
- Perfect for content/SEO-focused pages

**Key Astro facts (2026):**
- Cloudflare acquired The Astro Technology Company in January 2026
- Astro 5.x stable; Astro 6 in beta
- Islands Architecture: hydrate only interactive components
- Built-in i18n routing (en, ar, de) with `as-needed` prefix strategy
- Tailwind CSS v4 via Vite plugin
- Starwind UI = shadcn equivalent for Astro (45+ components, zero React runtime)
- Deploy to Cloudflare Workers natively

**i18n for English, Arabic, German:**
- Built-in file-based routing: `/[locale]/`
- RTL for Arabic: manual `dir="rtl"` + Tailwind `rtl:` variant
- Translation files: JSON/TS per locale

## WhatsApp bot backend: Hono

**Why Hono over Express/Fastify:**
| Metric | Hono | Fastify | Express |
|--------|------|---------|---------|
| Requests/sec | 3x Express | 2.3x Express | baseline |
| Memory | 40% less | 30% less | baseline |
| Bundle | 7.6 KB | 178 KB | larger |

- Built on Web Standards (Fetch API)
- Runs on Node.js, Bun, Deno, Cloudflare Workers without code changes
- Type-safe RPC client for shared types
- WhatsApp webhooks must respond within 5 seconds; Hono's low overhead helps

## WhatsApp chat UI for demos

**Industry standard approach:** Animated phone mockup with scripted conversation on landing page

**Components:**
- Device frame: Flowbite Tailwind device mockup (pure CSS) or react-device-frameset (iPhone X)
- Chat bubbles: daisyUI chat component or Flowbite chat bubble (both Tailwind)
- Animation: setTimeout-based sequencing + typing indicator
- Auto-scroll: useRef + scrollIntoView
- Data: JSON array of scripted messages

**Also supported:**
- Interactive mode: visitor types messages, gets pre-programmed bot responses
- Click-to-WhatsApp CTA: opens wa.me/<number> for live demo

## Monorepo: Turborepo + pnpm

**Structure:**
```
fotolabs/
  apps/
    marketing/          # Astro 6
    bot/                # Hono WhatsApp bot backend
  packages/
    shared/             # Zod schemas, types, constants
    config-ts/          # Shared tsconfig
    config-eslint/      # Shared ESLint
  turbo.json
  pnpm-workspace.yaml
```

**Why Turborepo:** Simple config, free remote cache (Vercel), affected-only CI runs
**Why pnpm:** "Bun is fast, pnpm is correct." Mature workspace support, Turborepo default

## Database: Supabase (Postgres)

**Why over Firebase (used in old project):**
- Open source, SQL-based (Postgres)
- Row-level security for multi-tenant data
- Real-time subscriptions
- Edge functions for serverless
- Better for structured data (appointments, salons, clients)
- Self-hostable (no vendor lock-in)

## Deployment: Cloudflare Workers

**Both apps deploy to Cloudflare Workers:**
- Astro 6: native Cloudflare support (Cloudflare owns Astro now)
- Hono: born for Workers, first-class support
- Monorepo-aware deploys via Workers Builds
- Cloudflare Queues for async job processing
- Durable Objects for stateful conversations (if needed)
- D1 (SQLite at edge) or connect to external Supabase

## CI/CD: GitHub Actions + Turborepo

- Affected-only execution: `turbo run build test --filter='...[origin/main]'`
- pnpm store cache
- Turborepo remote cache
- Separate deploy workflows per app

## WhatsApp Bot Backend Details

**API choice: Official Cloud API (mandatory in 2026)**
- On-Premises API deprecated October 2025
- Cloud API is the only supported architecture
- Free inbound replies within 24-hour service window
- Per-template-message billing (changed July 2025)
- Official Node.js SDK: @WhatsApp/WhatsApp-Nodejs-SDK
- Alternative: whatsapp-api-js (server-agnostic, works with Hono)

**State management: XState v5**
- Actor model with strong TypeScript typing
- Serialize machine state to database per client
- Split actions, guards, services into separate files
- Hybrid approach: XState for structured flows + LLM for open-ended portions

**Booking flow: Hybrid WhatsApp Flows + State Machine**
- WhatsApp Flows: native in-chat forms (date pickers, dropdowns)
- Meta provides "Book an Appointment" example with Node.js backend
- Dynamic Flows connect to backend for real-time availability
- Limitations: no payments in Flows, immutable once published, max 50 components/screen
- Use XState for the conversational wrapper around Flows

**Message deduplication**
- WhatsApp delivers at-least-once; duplicates are normal
- Use message ID as dedup key in Redis with TTL

**Meta's AI policy (Jan 2026)**
- General-purpose AI chatbots are banned
- Business-specific bots (booking, support, ordering) are allowed
- Must include human escalation paths
- Salon booking bot is fully compliant

**Testing**
- Meta provides test phone number automatically
- Mock webhook payloads for integration testing
- github.com/Tanzania-AI-Community/mock-whatsapp for mock WhatsApp UI
- Ngrok/Cloudflare Tunnel for local webhook testing

Sources: See individual research agent outputs for full source lists.
