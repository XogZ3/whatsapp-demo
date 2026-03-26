# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is FotoLabs AI

FotoLabs AI is a WhatsApp-based AI photo generation service. Users interact via WhatsApp to upload selfies, train a personalized AI model (LoRA), and generate AI photos of themselves in various scenes. The product also has a Next.js marketing website with use case landing pages, pricing, and a dashboard.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Lint fix + Prettier
npm run check-types  # TypeScript type checking (tsc --noEmit)
npm run commit       # Interactive conventional commit via Commitizen

# Tests (Jest, node environment, colocated with source)
npx jest                           # Run all tests
npx jest src/path/to/file.test.ts  # Run a single test file
npx jest --testPathPattern="pattern"  # Run tests matching pattern
```

## Architecture

### WhatsApp conversation engine (core business logic)

The WhatsApp bot is the primary product interface. Messages flow through:

1. **Webhook** (`src/app/api/waba/webhook/route.ts`) - receives and verifies WhatsApp messages via HMAC signature, saves to Firestore, calls `replyToUser`
2. **Reply orchestrator** (`src/utils/ReplyHelper/index.ts`) - determines message intent based on current state + message type (image vs text), handles image uploads to Firebase, routes to the state machine
3. **XState state machine** (`src/modules/xstate/whatsappMachine/`) - manages the conversation lifecycle:
   - `machine.ts` - state machine definition with states: `onBoarding` → `imagesIncomplete` → `paywall` → `generatingModel` → `photoPrompting` → `cancelSubscription`
   - `messageHandler.ts` - maps user text/actions to XState events per state
   - `actions.ts` / `actionsHelper.ts` - side effects (send WhatsApp messages, trigger training, manage billing)
   - `guards.ts` - transition conditions
   - `types.ts` - context and config types

State is persisted as serialized JSON in Firestore per client (`state` field on the client document).

### External service modules (`src/modules/`)

- `firebase/` - Firestore (user data, messages, state) + Cloud Storage (training images, generated images)
- `whatsapp/` - WhatsApp Business API message sending
- `openai/` - Vision API for deriving prompts from user images, content moderation
- `groq/` - Vision model for image analysis
- `replicate/` - AI model training and inference
- `runpod/` - Alternative inference provider
- `xstate/` - WhatsApp conversation state machine (described above)

### API routes (`src/app/api/`)

- `waba/webhook/` - WhatsApp webhook (main entry point for messages)
- `stripe/webhook/`, `stripe/createPaymentLink/`, `stripe/cancelSubscription/` - payment flow
- `fal/starttraining/`, `fal/webhook/` - model training via fal.ai
- `starttraining/`, `training/`, `checktraining/` - training orchestration
- `cronDailyImage/`, `cronHourDiscount/` - scheduled jobs
- `facecrop/` - face detection/cropping for training images

### Marketing website (`src/app/[locale]/(unauth)/`)

Next.js App Router with `next-intl` for i18n (locales: `en`, `pt`, `ms`; configured in `src/utils/appConfig.ts`). Locale prefix is `as-needed` (English has no prefix).

- Landing page components in `src/components/landingPage/`
- Use case pages at `/uses/[usecase]` (allowed use cases defined in both `next.config.mjs` and `src/utils/appConfig.ts` - keep them in sync)
- Dashboard at `src/app/[locale]/(auth)/dashboard/`

### Environment variables

Validated via `@t3-oss/env-nextjs` with Zod schemas in `src/libs/Env.ts`. Server-side vars loaded at build time via jiti in `next.config.mjs`.

## Key conventions

- **Path aliases**: `@/` maps to `./src/`, `@/public/` maps to `./public/`
- **Commits**: Conventional Commits enforced by commitlint + husky
- **Imports**: `eslint-plugin-simple-import-sort` enforces sorted imports; use `import type` for type-only imports
- **Tests**: Colocated with source files (e.g., `foo.test.ts` next to `foo.ts`), Jest with node test environment
- **Firestore data model**: `apps/{wabaId}/clients/{phoneNumber}` is the primary client document path
- **User identification**: WhatsApp phone number (string) is used as `clientid` throughout the codebase
- **State serialization**: XState machine state is stored as a JSON string in Firestore and rehydrated on each webhook call
