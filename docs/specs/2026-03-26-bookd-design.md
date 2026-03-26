# Bookd - WhatsApp salon booking bot

*Design spec by Savi agency | March 2026*

## Product overview

Bookd is a WhatsApp-native salon booking bot that Savi uses as its flagship demo to sell WhatsApp automation services to SMBs in UAE and Germany. It handles the full booking lifecycle inside WhatsApp: discovery, availability check, confirmation, reminders, rescheduling, and cancellation.

The product has two surfaces:
1. **WhatsApp bot** - the actual booking engine clients interact with
2. **Marketing site** - Astro 6 site with an interactive phone mockup demo, pricing, and use cases

## Target market

- Salons and beauty businesses in UAE (4,000+ in Dubai alone; $10B market)
- Salons in Germany (80,500+ salons; Treatwell charges up to 35% commission)
- Price point: EUR 49-99/month (Germany sweet spot) / AED 150-300/month (UAE)
- Zero commission on bookings (unlike Treatwell)

## Competitive positioning

The only real competitor doing WhatsApp-native booking is Happoin ($13/mo), which lacks POS, staff scheduling, loyalty, and multi-language support. Every major platform (Fresha, Treatwell, Booksy, Shore, Planity) does booking through apps or websites; none do conversational booking inside WhatsApp.

Bookd's angle: "Your customers already message you on WhatsApp. Bookd turns those messages into confirmed appointments."

---

## Architecture

### Monorepo structure

```
bookd/
  apps/
    web/                  # Astro 6 marketing site + interactive demo
    bot/                  # Hono WhatsApp bot backend
  packages/
    shared/               # Zod schemas, types, constants
    config-ts/            # Shared tsconfig base
    config-eslint/        # Shared ESLint config
  turbo.json
  pnpm-workspace.yaml
  package.json
```

### Tech stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Marketing site | Astro 6 + Starwind UI + Tailwind v4 | Cloudflare owns Astro. 90% less JS than Next.js. Built-in font API. |
| Bot backend | Hono | 3x Express performance. 7.6KB. Runs on Workers and Node. |
| WhatsApp API | Official Cloud API | Only supported option since Oct 2025. Supports Flows. |
| State machine | XState v5 | Actor model. Serialize state per client. Proven pattern. |
| Database | Supabase (Postgres) | SQL for structured booking data. Row-level security. Real-time. |
| Cache | Upstash Redis | Message deduplication. Session cache. Serverless-compatible. |
| Deploy | Cloudflare Workers | Both Astro and Hono deploy natively. Queues for async. |
| CI/CD | GitHub Actions + Turborepo | Affected-only runs. Remote cache. |
| Package manager | pnpm | Correctness over speed. Turborepo default. |
| i18n | Astro built-in + Paraglide | en, ar (RTL), de |
| Fonts | Astro 6 font API (`astro:font`) | Built-in optimization, no external dependencies |

### System diagram

```
Customer (WhatsApp)
    |
    v
Meta Cloud API --webhook--> Cloudflare Worker (Hono)
    |                              |
    |                              v
    |                        XState machine
    |                              |
    |                    +---------+---------+
    |                    |         |         |
    |                    v         v         v
    |               Supabase   Upstash   WhatsApp
    |              (bookings)  (dedup)   Flows API
    |                    |
    |                    v
    |              Salon dashboard
    |              (future phase)
    |
    v
Meta Cloud API <--reply--- Cloudflare Worker
```

---

## Conversation flows

### Flow 1: New customer booking

```
Customer: Hi
Bot: Hey! Welcome to [Salon Name]. I can help you book an appointment.
     What service are you looking for?
     [List message: Haircut | Color | Styling | Nails | Facial | Other]

Customer: [selects Haircut]
Bot: Got it, haircut! Do you have a preferred stylist?
     [List message: Any available | Sarah | Noor | Marco]

Customer: [selects Any available]
Bot: When works for you?
     [WhatsApp Flow: date picker + time slot grid showing real-time availability]

Customer: [selects Thursday 3pm via Flow]
Bot: Here's your booking:
     Haircut
     Thursday, March 28 at 3:00 PM
     Stylist: Noor (first available)
     Duration: ~45 min
     Price: AED 120

     [Button: Confirm] [Button: Change]

Customer: [taps Confirm]
Bot: You're all set! I'll send you a reminder the day before.
     To reschedule or cancel, just message me anytime.
     [vCard with salon address + Google Maps link]
```

### Flow 2: Returning customer

```
Customer: I need to book again
Bot: Welcome back! Last time you had a haircut with Noor.
     Want to book the same?
     [Button: Same as last time] [Button: Something different]

Customer: [taps Same as last time]
Bot: When works for you?
     [WhatsApp Flow: date/time picker - pre-filtered to Noor's availability]
```

### Flow 3: Rescheduling

```
Customer: Can I move my appointment?
Bot: You have a haircut booked for Thursday March 28 at 3:00 PM.
     When would you like to move it to?
     [WhatsApp Flow: date/time picker]

Customer: [selects Friday 2pm]
Bot: Moved to Friday March 29 at 2:00 PM with Noor.
     Updated reminder will come the day before.
```

### Flow 4: Cancellation

```
Customer: I need to cancel
Bot: You have a haircut booked for Thursday March 28 at 3:00 PM.
     Are you sure you want to cancel?
     [Button: Yes, cancel] [Button: Keep it]

Customer: [taps Yes, cancel]
Bot: Cancelled. Hope to see you soon!
     [If waitlist exists: next person is auto-notified]
```

### Flow 5: Automated reminders

```
[48 hours before]
Bot: Reminder: You have a haircut at [Salon Name] on Thursday at 3:00 PM.
     [Button: Confirm] [Button: Reschedule] [Button: Cancel]

[2 hours before]
Bot: See you in 2 hours! [Salon Name], [address].
     [Location message with pin]
```

### Flow 6: After-hours inquiry

```
Customer: [messages at 11pm] Do you do balayage?
Bot: Hi! [Salon Name] is closed right now (hours: 9am-8pm).
     Yes, we offer balayage! Prices start at AED 350.
     Want me to book you in?
     [Button: Book balayage] [Button: See all services]
```

### Flow 7: Walk-in availability

```
Customer: Are you free right now?
Bot: Let me check... [Salon Name] has 2 slots available right now:
     - Haircut with Marco (available now)
     - Nails with Sara (available in 15 min)
     [Button: Book Marco now] [Button: Book Sara] [Button: Browse more]
```

---

## XState machine design

### States

```
idle
  -> onboarding (new customer: collect name, save contact)
  -> serviceSelection (returning customer: skip onboarding)

onboarding
  -> serviceSelection

serviceSelection
  -> stylistSelection

stylistSelection
  -> dateTimeSelection

dateTimeSelection
  -> confirmation

confirmation
  -> booked (on confirm)
  -> serviceSelection (on change)

booked
  -> rescheduling (on reschedule request)
  -> cancellation (on cancel request)
  -> idle (after appointment completed)

rescheduling
  -> dateTimeSelection
  -> booked (on confirm new time)

cancellation
  -> idle (on confirm cancel)
  -> booked (on keep)
```

### Context (per client)

```typescript
interface BookingContext {
  clientPhone: string
  clientName: string | null
  salonId: string
  locale: 'en' | 'ar' | 'de'
  selectedService: Service | null
  selectedStylist: Stylist | null
  selectedDateTime: Date | null
  currentBookingId: string | null
  previousBookings: BookingSummary[]
  messageCount: number
}
```

---

## Data model (Supabase)

### Tables

```sql
-- Multi-tenant: each salon is a tenant
create table salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_number text unique not null,
  timezone text not null default 'Asia/Dubai',
  locale text not null default 'en',
  address text,
  latitude numeric,
  longitude numeric,
  opening_hours jsonb not null,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  name text not null,
  name_ar text,
  name_de text,
  duration_minutes int not null,
  price_amount numeric not null,
  price_currency text not null default 'AED',
  active boolean default true
);

create table stylists (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id) on delete cascade,
  name text not null,
  working_hours jsonb not null,
  services uuid[] -- array of service IDs this stylist can do
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  name text,
  locale text default 'en',
  salon_id uuid references salons(id),
  state_snapshot jsonb, -- serialized XState state
  created_at timestamptz default now(),
  last_interaction timestamptz default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id),
  client_id uuid references clients(id),
  stylist_id uuid references stylists(id),
  service_id uuid references services(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed',
  -- status: confirmed | completed | cancelled | no_show
  reminder_48h_sent boolean default false,
  reminder_2h_sent boolean default false,
  created_at timestamptz default now(),
  cancelled_at timestamptz
);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid references salons(id),
  client_id uuid references clients(id),
  service_id uuid references services(id),
  preferred_stylist_id uuid references stylists(id),
  preferred_date date,
  created_at timestamptz default now()
);

create table message_log (
  id uuid primary key default gen_random_uuid(),
  whatsapp_message_id text unique not null, -- for deduplication
  salon_id uuid references salons(id),
  client_id uuid references clients(id),
  direction text not null, -- 'inbound' | 'outbound'
  message_type text not null, -- 'text' | 'interactive' | 'flow' | 'template'
  content jsonb,
  created_at timestamptz default now()
);
```

### Row-level security

```sql
-- Salon owners can only see their own data
alter table bookings enable row level security;
create policy "salon_isolation" on bookings
  for all using (salon_id = auth.jwt() ->> 'salon_id');
```

---

## Marketing site (Astro 6)

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Hero with interactive phone demo + value props + CTA |
| `/pricing` | Plans comparison (Starter/Growth/Scale) |
| `/demo` | Full-page interactive WhatsApp simulator |
| `/use-cases/salon` | Salon-specific landing page with ROI calculator |
| `/use-cases/barbershop` | Barbershop variant |
| `/use-cases/spa` | Spa/wellness variant |
| `/ar/` | Arabic versions (RTL) |
| `/de/` | German versions |

### Interactive demo component

An Astro island (React, `client:visible`) that renders inside a Flowbite phone mockup:

```
+---------------------------+
|  iPhone frame (Flowbite)  |
|  +---------------------+  |
|  | WhatsApp header bar  |  |
|  |   Bookd | online     |  |
|  +---------------------+  |
|  |                     |  |
|  | Bot: Welcome!       |  |
|  | What service?       |  |
|  |   [Haircut]         |  |
|  |   [Color]           |  |
|  |   [Nails]           |  |
|  |                     |  |
|  | User: Haircut       |  |
|  |                     |  |
|  | Bot: When works?    |  |
|  |   [Thu 3pm]         |  |
|  |   [Fri 2pm]         |  |
|  |                     |  |
|  +---------------------+  |
|  | Type a message...   |  |
+---------------------------+
```

Two modes:
1. **Auto-play** (default on landing page): scripted conversation plays with typing indicators
2. **Interactive** (on `/demo` page): visitor clicks through the flow, making real choices

Built with:
- Flowbite device mockup (pure Tailwind, no JS dependency)
- Custom chat bubbles with Tailwind (referencing daisyUI/Flowbite patterns)
- `setTimeout`-based message sequencing with typing indicator
- `useRef` + `scrollIntoView` for auto-scroll

### Astro 6 specifics

**Font API (stable in Astro 6, released March 10, 2026):**

Config (`astro.config.mjs`):
```js
import { defineConfig, fontProviders } from 'astro/config'

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-inter',
    },
    {
      provider: fontProviders.google(),
      name: 'Noto Sans Arabic',
      cssVariable: '--font-arabic',
    },
  ],
})
```

Usage in layout:
```astro
---
import { Font } from 'astro:assets'
---
<html>
  <head>
    <Font cssVariable="--font-inter" preload />
    <Font cssVariable="--font-arabic" preload />
  </head>
  <body style="font-family: var(--font-inter)">
    <slot />
  </body>
</html>
```

Replaces Fontsource packages, `astro-font`, and manual Google Fonts `<link>` tags. Auto self-hosts fonts, generates optimized fallbacks, and injects preload hints.

**i18n routing:**
```js
// astro.config.mjs
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'ar', 'de'],
  routing: { prefixDefaultLocale: false }
}
```

**RTL for Arabic:** Conditional `dir="rtl"` on `<html>` + Tailwind `rtl:` variant for layout mirroring.

**UI components:** Starwind UI (Astro-native shadcn equivalent, 45+ components, Tailwind v4, zero React runtime for static parts).

---

## Webhook architecture (Hono)

```typescript
// apps/bot/src/index.ts
import { Hono } from 'hono'
import { verifyWebhook } from './middleware/verify'
import { deduplicateMessage } from './middleware/dedup'
import { handleMessage } from './handlers/message'

const app = new Hono()

// Meta webhook verification (GET)
app.get('/webhook', (c) => {
  const mode = c.req.query('hub.mode')
  const token = c.req.query('hub.verify_token')
  const challenge = c.req.query('hub.challenge')
  if (mode === 'subscribe' && token === c.env.VERIFY_TOKEN) {
    return c.text(challenge!)
  }
  return c.text('Forbidden', 403)
})

// Message handler (POST)
app.post('/webhook', verifyWebhook, deduplicateMessage, async (c) => {
  // Return 200 immediately (Meta requires < 5 seconds)
  c.executionCtx.waitUntil(handleMessage(c))
  return c.text('OK', 200)
})

export default app
```

### Message handler flow

```
1. Parse incoming message (text, interactive reply, flow response)
2. Look up client in Supabase by phone number
3. Rehydrate XState machine from client.state_snapshot
4. Send event to machine based on message content
5. Machine transitions, triggers actions (send WhatsApp messages)
6. Serialize new machine state back to Supabase
7. Log message to message_log table
```

---

## WhatsApp Flows integration

Used for the date/time selection step (structured form inside WhatsApp):

```json
{
  "version": "6.2",
  "screens": [
    {
      "id": "SELECT_DATETIME",
      "title": "Pick a time",
      "data": {},
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "DatePicker",
            "name": "date",
            "label": "Date",
            "min-date": "${today}",
            "max-date": "${today_plus_30}"
          },
          {
            "type": "RadioButtonsGroup",
            "name": "time_slot",
            "label": "Available times",
            "data-source": "${available_slots}"
          },
          {
            "type": "Footer",
            "label": "Book this slot",
            "on-click-action": {
              "name": "complete",
              "payload": { "date": "${form.date}", "time": "${form.time_slot}" }
            }
          }
        ]
      }
    }
  ]
}
```

The backend endpoint dynamically populates `available_slots` based on the selected service, stylist, and date.

---

## Reminder system

Cloudflare Cron Triggers (or Supabase pg_cron) run every 15 minutes:

1. Query bookings where `starts_at` is 48 hours away and `reminder_48h_sent = false`
2. Send template message with confirm/reschedule/cancel buttons
3. Mark `reminder_48h_sent = true`
4. Repeat for 2-hour reminders

Template messages require pre-approval from Meta. Templates needed:
- `booking_confirmation` - sent after booking
- `reminder_48h` - 48-hour reminder with action buttons
- `reminder_2h` - 2-hour reminder with location
- `booking_rescheduled` - confirmation of new time
- `booking_cancelled` - cancellation confirmation
- `waitlist_available` - slot opened up notification

---

## MVP scope (Phase 1)

**In scope:**
- Single-salon setup (not multi-tenant yet)
- Core booking flow: service -> stylist -> date/time -> confirm
- Automated 48h + 2h reminders with confirm/reschedule/cancel
- Rescheduling and cancellation flows
- Returning customer memory (last service + stylist)
- English language (add Arabic + German in phase 2)
- Marketing site with interactive demo (auto-play mode)
- Click-to-WhatsApp CTA on marketing site
- Message deduplication via Upstash Redis

**Out of scope (phase 2+):**
- Multi-tenant dashboard for salon owners
- Arabic and German language support
- Waitlist with auto-notification
- Walk-in availability check
- Payment/deposit collection
- Loyalty program
- Review collection post-appointment
- Analytics dashboard (no-show rates, booking volume)
- Google Calendar two-way sync
- Multi-salon support

---

## Success criteria

The demo is successful if:
1. A prospect can watch the auto-play demo on the marketing site and understand the product in under 30 seconds
2. A prospect can try the interactive demo and complete a fake booking in under 60 seconds
3. A prospect can scan a QR code, open WhatsApp, and complete a real booking with the live bot
4. The live bot handles edge cases gracefully (invalid dates, unavailable slots, gibberish input)
5. Reminder messages arrive on time and action buttons work
