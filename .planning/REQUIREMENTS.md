# Requirements: Savi AI Product Advisor Bot

**Defined:** 2026-03-28
**Core Value:** Every completed conversation captures a qualified lead with enough context for Gokul to write a real proposal within 24 hours.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Webhook Infrastructure

- [ ] **HOOK-01**: Cloudflare Worker receives WhatsApp Cloud API webhook POST requests
- [ ] **HOOK-02**: Worker responds to GET verification challenges from Meta
- [ ] **HOOK-03**: HMAC-SHA256 signature verification rejects unsigned/tampered requests
- [ ] **HOOK-04**: Message deduplication via wamid prevents duplicate processing
- [ ] **HOOK-05**: Worker responds with 200 within 5 seconds (WhatsApp timeout requirement)

### Conversation Engine

- [ ] **CONV-01**: Bot greets first-time users with 3 interactive reply buttons (warm/cold/browsing)
- [ ] **CONV-02**: Conversation history stored per phone number in Supabase
- [ ] **CONV-03**: Claude Haiku 4.5 generates responses using conversation history + system prompt
- [ ] **CONV-04**: System prompt defines bot personality, discovery flow, and behavioral rules
- [ ] **CONV-05**: Bot sends WhatsApp interactive messages (reply buttons, text)
- [ ] **CONV-06**: Conversation timeout resets context after 24 hours of inactivity (cap preserved)

### Warm Path (Product Discovery)

- [ ] **WARM-01**: Bot asks structured discovery questions (idea, audience, MVP, platform, assets, timeline/budget)
- [ ] **WARM-02**: Bot adapts questions based on previous answers (not rigid form)
- [ ] **WARM-03**: After 5-8 exchanges, bot generates formatted scope summary (idea, platform, features, approach, price range, timeline)
- [ ] **WARM-04**: Scope summary triggers email capture CTA

### Cold Path (Website Scraping)

- [ ] **COLD-01**: Bot detects URLs in messages and offers to scrape
- [ ] **COLD-02**: Firecrawl API scrapes URL and returns markdown
- [ ] **COLD-03**: Scraped content cached in Supabase (one URL per user)
- [ ] **COLD-04**: Bot generates 2-3 product suggestions based on scraped business data
- [ ] **COLD-05**: User can pick a suggestion and transition to warm path discovery

### Browsing Path

- [ ] **BROW-01**: Bot shows Savi portfolio summary (case studies, starting price)
- [ ] **BROW-02**: Minimal AI budget consumed (static response, no Claude call needed)
- [ ] **BROW-03**: Offers "human" escalation and invitation to return

### Lead Capture

- [ ] **LEAD-01**: Bot captures email address when prospect is ready for proposal
- [ ] **LEAD-02**: Email validated with basic regex before saving
- [ ] **LEAD-03**: Lead record created in Supabase with conversation_id, email, phone, scope_summary
- [ ] **LEAD-04**: Resend sends notification email to Gokul with full conversation transcript + scope summary
- [ ] **LEAD-05**: Bot confirms to prospect: proposal within 24 hours
- [ ] **LEAD-06**: Bot sends meta-close message ("this conversation you had? We build bots like this")

### Budget Controls

- [ ] **BUDG-01**: Per-phone-number lifetime message cap of 20 user messages
- [ ] **BUDG-02**: Atomic cap enforcement via SQL UPDATE...RETURNING (no race conditions)
- [ ] **BUDG-03**: Soft warning at 15 messages ("5 messages left")
- [ ] **BUDG-04**: Hard cap at 20 messages with email capture CTA + human escalation option
- [ ] **BUDG-05**: One Firecrawl scrape per conversation (subsequent URLs declined)

### Security

- [ ] **SEC-01**: System prompt includes explicit refusal instructions for prompt extraction attempts
- [ ] **SEC-02**: Haiku 4.5 input pre-screen classifies messages as SAFE/BLOCKED before main LLM call
- [ ] **SEC-03**: XML tag separation in Claude API calls (system instructions vs user data vs external content)
- [ ] **SEC-04**: Output validation checks for system prompt leakage patterns before sending to WhatsApp
- [ ] **SEC-05**: Scraped website content wrapped in explicit data-framing tags
- [ ] **SEC-06**: No sensitive data (API keys, internal URLs) in system prompt

### Human Escalation

- [ ] **HUMN-01**: "human" keyword triggers escalation at any point, regardless of message cap or state
- [ ] **HUMN-02**: Escalation sends notification to Gokul with full conversation context
- [ ] **HUMN-03**: Bot confirms human handoff to prospect

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
| HOOK-01 | — | Pending |
| HOOK-02 | — | Pending |
| HOOK-03 | — | Pending |
| HOOK-04 | — | Pending |
| HOOK-05 | — | Pending |
| CONV-01 | — | Pending |
| CONV-02 | — | Pending |
| CONV-03 | — | Pending |
| CONV-04 | — | Pending |
| CONV-05 | — | Pending |
| CONV-06 | — | Pending |
| WARM-01 | — | Pending |
| WARM-02 | — | Pending |
| WARM-03 | — | Pending |
| WARM-04 | — | Pending |
| COLD-01 | — | Pending |
| COLD-02 | — | Pending |
| COLD-03 | — | Pending |
| COLD-04 | — | Pending |
| COLD-05 | — | Pending |
| BROW-01 | — | Pending |
| BROW-02 | — | Pending |
| BROW-03 | — | Pending |
| LEAD-01 | — | Pending |
| LEAD-02 | — | Pending |
| LEAD-03 | — | Pending |
| LEAD-04 | — | Pending |
| LEAD-05 | — | Pending |
| LEAD-06 | — | Pending |
| BUDG-01 | — | Pending |
| BUDG-02 | — | Pending |
| BUDG-03 | — | Pending |
| BUDG-04 | — | Pending |
| BUDG-05 | — | Pending |
| SEC-01 | — | Pending |
| SEC-02 | — | Pending |
| SEC-03 | — | Pending |
| SEC-04 | — | Pending |
| SEC-05 | — | Pending |
| SEC-06 | — | Pending |
| HUMN-01 | — | Pending |
| HUMN-02 | — | Pending |
| HUMN-03 | — | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 0
- Unmapped: 42

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after initial definition*
