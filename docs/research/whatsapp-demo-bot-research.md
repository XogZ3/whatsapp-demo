# WhatsApp demo bot: research synthesis (generic, not vertical-specific)

*Research date: 2026-03-28*
*Updated: Refocused on generic agency demo bot, not salon-specific*

---

## Critical: Meta's January 2026 policy change

Meta banned general-purpose AI assistants (ChatGPT, Perplexity, etc.) from WhatsApp Business API effective January 15, 2026. This means:

- **Banned**: open-ended "ask me anything" bots
- **Allowed**: business-specific bots with clear purpose (support, sales, booking, lead qualification)
- Every AI agent must have a "talk to a human" escalation path

**This is Savi's pitch**: "You can't use ChatGPT on WhatsApp anymore. You need a custom AI agent built for your business. We build that."

Sources: TechCrunch, Respond.io, ChatBotBuilder.ai

---

## The concept

A single WhatsApp number that showcases Savi's AI capabilities to ANY prospect, regardless of their industry. The prospect texts the number and within 60 seconds thinks "I need to hire these people." The bot proves Savi can build AI-powered WhatsApp solutions, and the demo itself closes the deal.

The bot must be framed as a business-specific tool (lead qualification + demo), not a general-purpose assistant, to comply with Meta's policy.

---

## 1. How agencies are doing this today

### The "eat your own cooking" pattern

The strongest agency play: your own bot IS your portfolio piece. Prospects experience your capabilities firsthand instead of looking at slides or screenshots.

**Stammer.ai** - White-label AI agent platform built for agencies
- Agencies use Stammer to build a demo bot in minutes, show it to prospects in the first meeting, and deploy a branded version once the deal closes
- Supports chat + voice agents, multi-model (GPT, Claude, Gemini)
- White-label: prospects see the agency's brand, not Stammer's

**CloseBot** - The #1 AI appointment setter for agencies
- Agencies run CloseBot on their own website/WhatsApp to qualify leads automatically
- Then resell the same technology to clients
- Agency plan: unlimited sub-accounts, custom branding

**BotMockups** (botmockups.com) - Demo generator for agency sales calls
- Enter prospect's business name + brand colors; generates a clickable AI chatbot demo in under 5 minutes
- The prospect sees *their brand* having an intelligent conversation
- Created because agencies were losing deals when clients couldn't visualize what a chatbot would do

**Insighto.ai** - AI automation agency platform
- Dedicated demo page with interactive bots prospects can test
- Agencies use it to showcase trainable AI voice + chat agents
- Step-by-step guide for "how to start an AI automation agency"

**MindStudio** - "Prototype in the meeting" strategy
- A marketing agency uses MindStudio to build working AI agents *during the first client meeting*
- They ask the prospect to describe their biggest manual task, then build the agent live while talking
- Close rate jumped from 23% to 61% after adopting this approach
- MindStudio: "demo an agent in the first meeting and ship days later"

**CreatorUp** - AI CEO avatar
- Built a D-ID AI visual agent of their CEO; visitors have a face-to-face video conversation with "Digital Mike" who explains their services
- The product IS the proof of capability

**Qualified.com Piper** - AI SDR agent
- Greets website visitors, qualifies them, books meetings via text/voice/video
- 500+ companies use it; doubles leads and meetings booked
- Kandji booked 2 qualified meetings within 8 minutes of deployment

### Key insight

The agencies closing the most deals use a *two-phase approach*:
1. **Phase 1**: Let the prospect interact with a generic demo of AI capabilities
2. **Phase 2**: Generate a customized bot for the prospect's business during or right after the meeting

MindStudio's case study is the strongest data point: 23% -> 61% close rate by building a working prototype in the meeting instead of showing slides.

This is what Savi should build.

---

## 2. Wow-factor features (industry-agnostic)

### Tier 1: Show-stoppers (build these first)

**Instant business knowledge from a URL**
- Prospect gives their website URL
- Bot scrapes the site (via Firecrawl/Crawl4AI), builds a RAG knowledge base
- Within seconds, the bot can answer questions about the prospect's own business
- Tools: Firecrawl API, Crawl4AI (open source), Cloudflare Vectorize for embeddings
- This is the single most impressive demo moment: "Give me your website URL" -> bot starts answering as if it works for them

**Multimodal input (voice + image + document)**
- Send a voice note -> bot transcribes, understands, responds naturally
- Send a photo -> bot analyzes and responds (product photo, receipt, menu, floorplan)
- Send a PDF/document -> bot reads and summarizes or extracts data
- n8n has a popular template doing exactly this: "AI-powered WhatsApp chatbot for text, voice, images & PDFs with memory"
- Wassenger's open-source WhatsApp bot (github: wassengerhq/whatsapp-chatgpt-bot) ships multimodal GPT-4o support out of the box

**Multilingual auto-detection**
- No language menu. Bot detects language from the first message and responds in kind
- 50+ languages with current models
- Gallabox documents this as a key feature for WhatsApp bots

### Tier 2: Differentiation features

**AI-powered lead qualification**
- Bot asks smart questions, scores the lead, and books a meeting on Savi's calendar
- Qualified.com's "Piper" AI SDR agent does this: greets website visitors, qualifies them, books meetings
- Kandji case study: AI chatbot booked 8 meetings in first deployment

**Conversation memory across sessions**
- Bot remembers previous conversations with the same number
- "Last time we talked about building a WhatsApp bot for your restaurant chain. Want to continue?"
- Implemented via conversation history in Supabase, fed as context to the LLM

**Real-time web search**
- Ask the bot anything; it searches the web and responds with current information
- Shows the bot isn't limited to a fixed knowledge base

**WhatsApp Flows (native rich forms)**
- Meta's WhatsApp Flows API enables multi-step forms, date pickers, dropdowns, and text inputs inside WhatsApp
- Components: TextInput, DatePicker, RadioButtonsGroup, Dropdown, CheckboxGroup, OptIn
- Use for: appointment booking forms, lead capture, surveys, order forms
- Available via WhatsApp Business API, renders natively (no external links)

### Tier 3: Bonus wow moments

**AI voice agent (phone call)**
- Beyond WhatsApp: bot offers to call the prospect and demo a voice AI agent
- Platforms: Retell AI, Vapi, Bland.ai for voice agents
- The combo of "text me on WhatsApp AND call me with AI" is a strong differentiator

**Dynamic content generation**
- Bot generates a custom proposal/PDF based on the conversation
- Bot creates a mockup/wireframe description based on prospect's requirements
- Shows AI isn't just answering questions; it's producing deliverables

---

## 3. The recommended demo flow

```
Prospect messages Savi's WhatsApp number
        |
   "Hey, I'm Savi's AI assistant. I can show you
    what AI-powered WhatsApp looks like for YOUR
    business. Want to see?"
        |
   [Button: Show me] [Button: Tell me more]
        |
   "Drop your website URL and I'll learn
    about your business in 10 seconds."
        |
   Prospect sends: www.example.com
        |
   Bot scrapes site, builds knowledge base
   "Got it. I now know about [Business Name].
    You offer [services/products]. Try asking
    me anything a customer would ask."
        |
   Prospect tests: "What are your prices?"
   Bot answers accurately from scraped data
        |
   "Now try these:"
   - Send me a voice note (I understand speech)
   - Send me a photo (I can analyze images)
   - Send me a document (I can read PDFs)
   - Type in another language (I auto-detect)
        |
   After 3-4 interactions:
   "That's what your customers could experience
    24/7. Want to discuss building this for
    [Business Name]?"
        |
   [Button: Book a call] [Button: See pricing]
        |
   Books directly on Savi's calendar via
   WhatsApp Flows or Calendly deep link
```

### Why this flow converts

1. **Personalized in real-time** - The bot learns the prospect's actual business, not a generic demo
2. **Hands-on** - Prospect drives the experience; they're invested
3. **Multi-capability showcase** - Voice, image, document, multilingual; all in one flow
4. **Self-qualifying** - Only serious prospects go through the full demo
5. **Zero friction to close** - Meeting booked inside WhatsApp, no channel switching

---

## 4. Technical architecture

### Core stack

```
WhatsApp Cloud API (Meta)
        |
  Cloudflare Worker (Hono)
        |
  ┌─────┴────────────────────────────┐
  │  Middleware                       │
  │  HMAC verify + Upstash Redis     │
  │  dedup + rate limiting           │
  └─────┬────────────────────────────┘
        |
  ┌─────┴────────────────────────────┐
  │  AI Router                       │
  │  Determines message type:        │
  │  text / voice / image / document │
  │  Routes to appropriate handler   │
  └─────┬────────────────────────────┘
        |
  ┌─────┴──────┬──────────┬─────────┐
  │            │          │         │
  Text       Voice      Image    Document
  Handler    Handler    Handler  Handler
  │            │          │         │
  │         Whisper    GPT-4o    PDF parse
  │         (CF AI)   vision    + extract
  │            │          │         │
  └─────┬──────┴──────────┴─────────┘
        |
  ┌─────┴────────────────────────────┐
  │  LLM Orchestration               │
  │  Claude/GPT via AI Gateway       │
  │  + Tool calling:                 │
  │    - scrape_website()            │
  │    - search_web()                │
  │    - book_meeting()              │
  │    - generate_proposal()         │
  │    - query_knowledge_base()      │
  └─────┬────────────────────────────┘
        |
  ┌─────┴────────────────────────────┐
  │  Data Layer                      │
  │  Supabase: conversations, leads  │
  │  Cloudflare Vectorize: RAG       │
  │  Cloudflare KV: session cache    │
  └──────────────────────────────────┘
```

### Key technology choices

| Component | Tool | Why |
|---|---|---|
| LLM | Claude (via AI Gateway) | Tool use, long context for scraped websites |
| Voice transcription | Cloudflare Workers AI (Whisper) | Edge inference, <50ms, free tier |
| Image understanding | GPT-4o vision or Claude vision | Multimodal input |
| Website scraping | Firecrawl API or Crawl4AI | Markdown output, JS rendering |
| RAG / embeddings | Cloudflare Vectorize + Workers AI embeddings | Edge-native, low latency |
| Rich forms | WhatsApp Flows API | Native multi-step forms in WhatsApp |
| Calendar booking | Cal.com API or Calendly API | Direct WhatsApp integration |
| Conversation memory | Supabase (conversation_history table) | Persistent across sessions |
| Model routing | Cloudflare AI Gateway | Caching, fallback, analytics |

### Cloudflare AutoRAG (new, beta)

Cloudflare's AutoRAG eliminates the entire RAG pipeline. Upload docs to R2, it handles embeddings, indexing, retrieval, and generation automatically. Query from a Worker with `env.AI.autorag('my-rag').aiSearch({ query })`. Limit: 100k files per instance. During beta, you pay only for underlying R2/Vectorize/Workers AI usage.

This could simplify the prospect-personalization pipeline significantly.

### Firecrawl Firestarter

Firecrawl's open-source **Firestarter** project is a pre-built RAG chatbot pipeline: give it a URL, it crawls via Firecrawl, chunks and embeds via Upstash Vector, and serves a chatbot via Vercel AI SDK. Each crawl gets a unique namespace, so one bot instance serves many prospects safely.

### Open source reference implementations

- **wassengerhq/whatsapp-chatgpt-bot** (GitHub) - Multimodal ChatGPT WhatsApp bot. Supports GPT-4o with text + audio + image input, audio responses, RAG + MCP. Apache 2.0 license. Most feature-complete open source option.
- **Mastra** (mastra.ai) - TypeScript AI agent framework from the Gatsby team (YC-backed). Provides Agent, Memory, Tools, and Workflows primitives. Runs on Cloudflare Workers with Hono. Strong fit for the existing stack.
- **n8n template #4827** - Full RAG + multimodal WhatsApp chatbot with text, voice, images, PDF. Good architecture reference.
- **n8n template #3859** - "AI customer support assistant, WhatsApp ready, works for any business." Generic, not vertical-specific.

---

## 5. Viral campaign blueprints (proven WhatsApp campaigns)

These real campaigns prove the format works for any industry:

| Campaign | Mechanic | Results |
|---|---|---|
| **Absolut Vodka "The Doorman"** | Text a bot bouncer to convince him you deserve entry to a party | 1,000+ submissions in 3 days, 600 new contacts |
| **Unilever MadameBot** | Billboards with a WhatsApp number; bot gives garment care advice | 14x sales increase, 290K messages from 12K users |
| **Hellmann's WhatsCook** | Send photo of fridge contents, get a recipe from a chef bot | 99.5% satisfaction, 65 minutes average engagement |
| **Saffola "Beat the Crave"** | Bot distracts from cravings with puzzles, rap songs, tips | 483% sales increase |
| **Nivea Cocoa Shades** | Share a photo, receive a stylized image of your skin tone | 207% of reach target |

The pattern: give the bot a *personality and a mission*, not a FAQ.

---

## 6. Competitive differentiation for Savi

### What the platforms offer (WATI, Landbot, Gallabox, etc.)

- Drag-and-drop flow builders
- Template-based bots
- No real AI intelligence; just decision trees
- Monthly subscription per number
- Generic, same bot everyone else gets

### What Savi's custom bot does differently

| Platform bots | Savi's AI bot |
|---|---|
| Fixed decision trees | LLM-powered natural conversation |
| One-size-fits-all | Learns the prospect's business from their URL in seconds |
| Text only | Voice notes, images, documents, PDFs |
| English only (or manual setup) | Auto-detects language, responds in 50+ |
| Separate booking tool | WhatsApp Flows for native forms + calendar integration |
| No memory | Remembers past conversations |
| Basic keyword matching | Claude/GPT tool calling with real business logic |

### The pitch in one sentence

"Message our WhatsApp number, give us your website URL, and in 10 seconds our AI will know your business and start answering your customers' questions. That's what we build."

---

## 7. Agency pricing model (validated by market)

Across all research, a consistent agency monetization pattern:

| Component | Range |
|---|---|
| Setup fee | $1K-$5K one-time |
| Monthly subscription | $300-$500/month per bot |
| Usage markup | 3-5x the platform cost |
| Margins | 30-50% standard, 50-70% custom |

Stammer.ai agencies charge ~$499/month with ~$12/month actual cost. One web design agency increased average client value from $2K one-time to $5K + $399/month recurring by adding AI bots.

A UK agency on Botsify generated $40K ARR deploying bots to local businesses and football clubs.

---

## 8. Next steps (recommended)

### Phase 1: MVP demo bot (1-2 weeks)

Build a WhatsApp bot on the existing Hono + Cloudflare Workers stack that:

1. Greets prospects and asks for their website URL
2. Scrapes the URL with Firecrawl, builds a vector knowledge base
3. Answers questions about the prospect's business using RAG
4. Handles text messages with Claude tool calling
5. Qualifies the lead and offers to book a Savi discovery call
6. Stores conversation history in Supabase for follow-up

### Phase 2: Multimodal wow (week 3)

Add:
- Voice note transcription (Whisper via Cloudflare Workers AI)
- Image understanding (GPT-4o vision)
- PDF/document analysis
- Multilingual auto-detection

### Phase 3: Conversion optimization (week 4)

Add:
- WhatsApp Flows for rich booking forms
- Automated follow-up sequences (24h, 48h, 7d)
- Click-to-WhatsApp Ads integration
- Referral tracking + share prompts
- Lead scoring and CRM sync

### Phase 4: Scale

- White-label the bot for Savi clients (multi-tenant)
- Deploy per-client bots with custom knowledge bases
- Build a self-service onboarding flow ("enter your URL, get a bot")
- Add AI voice agent capability (Retell AI / Vapi) for phone call demos

### WhatsApp API costs (good news)

- Customer-initiated messages (within 24h window): **free**
- Click-to-WhatsApp ad conversations: **free for 72 hours**
- Marketing messages: $0.025-0.14 per message (varies by country)
- For a demo bot where prospects message first, most conversations are free

---

## Sources

- Stammer.ai - stammer.ai
- CloseBot - closebot.com
- BotMockups - botmockups.com
- Insighto.ai - insighto.ai/demos
- Qualified.com Piper AI SDR - qualified.com/ai-sdr
- Wassenger WhatsApp GPT bot - github.com/wassengerhq/whatsapp-chatgpt-bot
- n8n WhatsApp AI templates - n8n.io/workflows/3586, n8n.io/workflows/3859
- Firecrawl - firecrawl.dev
- Crawl4AI - github.com/unclecode/crawl4ai
- WhatsApp Flows API - developers.facebook.com/docs/whatsapp/flows
- Cloudflare Workers AI - developers.cloudflare.com/workers-ai
- Cloudflare Vectorize - developers.cloudflare.com/vectorize
- Cloudflare AI Gateway - developers.cloudflare.com/ai-gateway
- Warmly.ai Kandji case study - warmly.ai/p/case-studies/kandji
- WhatsApp Business Platform Pricing - business.whatsapp.com/products/platform-pricing
