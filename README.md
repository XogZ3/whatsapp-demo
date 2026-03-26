# Bookd

WhatsApp-native salon booking bot by [Savi](https://savi.agency).

Bookd handles the full booking lifecycle inside WhatsApp: service selection, stylist choice, date/time booking, automated reminders, rescheduling, and cancellation. No app downloads. No commission. Just conversations.

## Architecture

| Surface | Tech | Deploy |
|---------|------|--------|
| **Bot** (`apps/bot`) | Hono + XState v5 | Cloudflare Workers |
| **Marketing site** (`apps/web`) | Astro + React + Tailwind v4 | Cloudflare Pages |
| **Shared types** (`packages/shared`) | Zod schemas | npm workspace |
| **Database** | Supabase (Postgres) | Supabase Cloud |
| **Cache** | Upstash Redis | Upstash |

## Quick start

```bash
# Install dependencies
pnpm install

# Build everything
pnpm turbo build

# Start dev servers
pnpm turbo dev

# Run tests
pnpm turbo test
```

## Bot conversation flow

```
Customer messages on WhatsApp
  → Bookd greets and asks for service
  → Customer picks from service list
  → Bookd asks for stylist preference
  → Customer picks stylist or "any available"
  → Bookd asks for date/time
  → Customer picks a slot
  → Bookd shows booking summary
  → Customer confirms
  → Booking created, reminders scheduled (48h + 2h)
```

Returning customers get a shortcut: "Same as last time" rebooks their previous service + stylist.

## Environment variables

### Bot (`apps/bot/.dev.vars`)

```
VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_TOKEN=your_whatsapp_cloud_api_token
WHATSAPP_APP_SECRET=your_app_secret_for_hmac
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
UPSTASH_REDIS_URL=https://your-redis.upstash.io
UPSTASH_REDIS_TOKEN=your_upstash_token
```

## Database

Run the migration against your Supabase project:

```bash
psql $DATABASE_URL < apps/bot/supabase/migrations/001_initial_schema.sql
```

## License

Proprietary. Copyright Savi Agency.
