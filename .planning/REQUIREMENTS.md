# Requirements: Savi AI Product Advisor Bot

**Defined:** 2026-03-28
**Core Value:** Every completed conversation captures a qualified lead with enough context for Gokul to write a real proposal within 24 hours.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Webhook Infrastructure

- [x] **HOOK-01**: Cloudflare Worker receives WhatsApp Cloud API webhook POST requests
- [x] **HOOK-02**: Worker responds to GET verification challenges from Meta
- [x] **HOOK-03**: HMAC-SHA256 signature verification rejects unsigned/tampered requests
- [x] **HOOK-04**: Message deduplication via wamid prevents duplicate processing
- [x] **HOOK-05**: Worker responds with 200 within 5 seconds (WhatsApp timeout requirement)

### Conversation Engine

- [x] **CONV-01**: Bot greets first-time users with 3 interactive reply buttons (warm/cold/browsing)
- [x] **CONV-02**: Conversation history stored per phone number in Supabase (wa_conversations)
- [x] **CONV-03**: Claude Haiku 4.5 (claude-haiku-4-5-20251001) generates responses using conversation history + system prompt
- [x] **CONV-04**: System prompt defines bot personality, discovery flow, and behavioral rules
- [x] **CONV-05**: Bot sends WhatsApp interactive messages (reply buttons, text)
- [x] **CONV-06**: Conversation timeout resets context after 24 hours of inactivity (cap preserved)

### Warm Path (Product Discovery)

- [x] **WARM-01**: Bot asks structured discovery questions (idea, audience, MVP, platform, assets, timeline/budget)
- [x] **WARM-02**: Bot adapts questions based on previous answers (not rigid form)
- [x] **WARM-03**: After 5-8 exchanges, bot generates formatted scope summary (idea, platform, features, approach, price range, timeline)
- [x] **WARM-04**: Scope summary triggers email capture CTA

### Cold Path (Website Scraping)

- [x] **COLD-01**: Bot detects URLs in messages and offers to scrape
- [x] **COLD-02**: Firecrawl API scrapes URL and returns markdown
- [x] **COLD-03**: Scraped content cached in Supabase (one URL per user, wa_conversations)
- [x] **COLD-04**: Bot generates 2-3 product suggestions based on scraped business data
- [x] **COLD-05**: User can pick a suggestion and transition to warm path discovery

### Browsing Path

- [x] **BROW-01**: Bot shows Savi portfolio summary (case studies, starting price)
- [x] **BROW-02**: Minimal AI budget consumed (static response, no Claude call needed)
- [x] **BROW-03**: Offers "human" escalation and invitation to return

### Lead Capture

- [x] **LEAD-01**: Bot captures email address when prospect is ready for proposal
- [x] **LEAD-02**: Email validated with basic regex before saving
- [x] **LEAD-03**: Lead record created in Supabase (wa_leads) with conversation_id, email, phone, scope_summary
- [x] **LEAD-04**: Resend sends notification email to Gokul with full conversation transcript + scope summary
- [x] **LEAD-05**: Bot confirms to prospect: proposal within 24 hours
- [x] **LEAD-06**: Bot sends meta-close message ("this conversation you had? We build bots like this")

### Budget Controls

- [x] **BUDG-01**: Per-phone-number lifetime message cap of 20 user messages
- [x] **BUDG-02**: Atomic cap enforcement via SQL UPDATE...RETURNING (no race conditions)
- [x] **BUDG-03**: Soft warning at 15 messages ("5 messages left")
- [x] **BUDG-04**: Hard cap at 20 messages with email capture CTA + human escalation option
- [x] **BUDG-05**: One Firecrawl scrape per conversation (subsequent URLs declined)

### Security

- [x] **SEC-01**: System prompt includes explicit refusal instructions for prompt extraction attempts
- [x] **SEC-02**: Haiku 4.5 input pre-screen classifies messages as SAFE/BLOCKED before main LLM call
- [x] **SEC-03**: XML tag separation in Claude API calls (system instructions vs user data vs external content)
- [x] **SEC-04**: Output validation checks for system prompt leakage patterns before sending to WhatsApp
- [x] **SEC-05**: Scraped website content wrapped in explicit data-framing tags
- [x] **SEC-06**: No sensitive data (API keys, internal URLs) in system prompt

### Human Escalation

- [x] **HUMN-01**: "human" keyword triggers escalation at any point, regardless of message cap or state
- [x] **HUMN-02**: Escalation sends notification to Gokul with full conversation context
- [x] **HUMN-03**: Bot confirms human handoff to prospect

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Multimodal Input

- **MULT-01**: Voice note transcription via Whisper
- **MULT-02**: Image analysis via Claude vision
- **MULT-03**: PDF/document parsing and summarization

### Multilingual

- **LANG-01**: Auto-detect message language and respond in kind
- **LANG-02**: Support 50+ languages

### Rich Forms

- **FLOW-01**: WhatsApp Flows for structured booking/intake forms

### Follow-up

- **FOLL-01**: Automated follow-up sequences (24h, 48h, 7d)
- **FOLL-02**: Click-to-WhatsApp Ads integration

## Out of Scope

| Feature | Reason |
|---------|--------|
| Marketing site | savibm.com already exists as separate project |
| AI voice agent / phone calls | v3 feature, high complexity |
| Multi-tenant white-labeling | v3 feature, not needed for single agency demo |
| Prototype/mockup generation | v3 feature, high complexity |
| RAG/embeddings pipeline | Overkill for one URL per user; direct context injection is simpler |
| State machine (XState) | LLM-driven flow is more adaptive for conversational discovery |
| Vercel AI SDK | Only using Claude; Anthropic SDK is lighter with no abstraction overhead |
| Redis/KV for dedup | Supabase handles dedup; one fewer infrastructure dependency |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| HOOK-01 | Phase 1 | Complete |
| HOOK-02 | Phase 1 | Complete |
| HOOK-03 | Phase 1 | Complete |
| HOOK-04 | Phase 1 | Complete |
| HOOK-05 | Phase 1 | Complete |
| CONV-01 | Phase 2 | Complete |
| CONV-02 | Phase 2 | Complete |
| CONV-03 | Phase 2 | Complete |
| CONV-04 | Phase 2 | Complete |
| CONV-05 | Phase 2 | Complete |
| CONV-06 | Phase 2 | Complete |
| WARM-01 | Phase 5 | Complete |
| WARM-02 | Phase 5 | Complete |
| WARM-03 | Phase 5 | Complete |
| WARM-04 | Phase 5 | Complete |
| COLD-01 | Phase 4 | Complete |
| COLD-02 | Phase 4 | Complete |
| COLD-03 | Phase 4 | Complete |
| COLD-04 | Phase 4 | Complete |
| COLD-05 | Phase 4 | Complete |
| BROW-01 | Phase 5 | Complete |
| BROW-02 | Phase 5 | Complete |
| BROW-03 | Phase 5 | Complete |
| LEAD-01 | Phase 5 | Complete |
| LEAD-02 | Phase 5 | Complete |
| LEAD-03 | Phase 5 | Complete |
| LEAD-04 | Phase 5 | Complete |
| LEAD-05 | Phase 5 | Complete |
| LEAD-06 | Phase 5 | Complete |
| BUDG-01 | Phase 2 | Complete |
| BUDG-02 | Phase 2 | Complete |
| BUDG-03 | Phase 6 | Complete |
| BUDG-04 | Phase 6 | Complete |
| BUDG-05 | Phase 4 | Complete |
| SEC-01 | Phase 3 | Complete |
| SEC-02 | Phase 3 | Complete |
| SEC-03 | Phase 3 | Complete |
| SEC-04 | Phase 3 | Complete |
| SEC-05 | Phase 3 | Complete |
| SEC-06 | Phase 3 | Complete |
| HUMN-01 | Phase 5 | Complete |
| HUMN-02 | Phase 5 | Complete |
| HUMN-03 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 43 total
- Mapped to phases: 43
- Complete: 43
- Unmapped: 0

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after v1 deployment*
