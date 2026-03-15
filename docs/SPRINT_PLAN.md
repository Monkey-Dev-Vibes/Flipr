# Flipr Sprint Plan

## Sprint Workflow

Each sprint follows: **Build -> Audit -> Fix -> Commit & Push**

- Sprint N = Audit N = Commit N
- Commit message format: `Sprint N: <description>`

---

## Sprint 1: Project Scaffolding & Design System

**Goal**: Runnable frontend and backend skeletons with the Flipr design system baked in.

- [x] Initialize Next.js project with TypeScript, TailwindCSS, Framer Motion
- [x] Configure Tailwind with Flipr color palette and custom tokens
- [x] Set up font loading (Playfair Display, JetBrains Mono, Inter)
- [x] Create base layout component (dark background, mobile-first viewport)
- [x] Initialize FastAPI project with folder structure
- [x] Create health check endpoint
- [x] Add `.env.example` files for both frontend and backend
- [x] Add `.gitignore` for both projects

---

## Sprint 2: Market Card UI & Swipe Mechanics

**Goal**: The core swipe experience with placeholder data.

- [x] Build `MarketCard` component (question, odds, category badge)
- [x] Build `CardStack` component with Framer Motion swipe physics
- [x] Implement swipe directions (right=YES, left=NO, up=skip)
- [x] Add swipe indicators (color overlays on drag)
- [x] Add haptic feedback hooks (Web Vibration API)
- [x] Create mock market data for development
- [x] Mobile-responsive styling and touch optimization

---

## Sprint 3: Trade Panel & Hold-to-Confirm

**Goal**: Stage 2 of the Two-Stage Swipe -- the execution guardrail.

- [x] Build `TradePanel` bottom sheet (slides up on swipe)
- [x] Display intent, locked odds, bet size slider
- [x] Build `HoldToConfirm` button (1.5s press, progress bar, ramping haptics)
- [x] Wire swipe -> panel transition animation
- [x] Add slippage warning UI (>5% shift detection placeholder)

---

## Sprint 4: Backend Adapter Pattern & Market Feed

**Goal**: FastAPI serves real market data through the adapter pattern.

- [x] Define `BaseMarketAdapter` abstract class
- [x] Implement `HyperliquidAdapter` (connect to Hyperliquid SDK, fetch HIP-4 markets)
- [x] Create Pydantic models (`RawMarket`, `CuratedMarket`, `TradeRequest`, `TradeResult`)
- [x] Build `GET /markets/feed` endpoint
- [x] Build `GET /markets/{id}/odds` endpoint
- [x] Add rate limiting middleware (per-user)
- [x] Write adapter tests

---

## Sprint 5: AI Curation Pipeline

**Goal**: Claude processes raw markets into curated, user-friendly card content.

- [x] Set up Anthropic API client in backend
- [x] Build curation prompt template (market_id, headline, description)
- [x] Implement curation service with 5-minute cron job
- [x] Cache curated results (in-memory or Redis)
- [x] Wire curated feed to `/markets/feed` endpoint
- [x] Write curation pipeline tests

---

## Sprint 6: Authentication & Privy Integration

**Goal**: Users can sign in and have invisible wallets.

- [x] Integrate Privy SDK in frontend (Apple/Google auth buttons)
- [x] Build `AuthProvider` context
- [x] Implement `POST /auth/verify` (Privy JWT verification) in backend
- [x] Add auth middleware to protected endpoints
- [x] Create user session model
- [x] Wire auth state to UI (balance display, protected routes)

---

## Sprint 7: Trade Execution & Fee Routing

**Goal**: Real trades execute through the backend to Hyperliquid.

- [x] Implement `POST /trade/execute` endpoint
- [x] Build trade service (fee calculation, order routing)
- [x] Implement FOK order execution via `HyperliquidAdapter`
- [x] Fee splitting logic ($0.50 to treasury)
- [x] Wire frontend Trade Panel to execute endpoint
- [x] Handle trade success/failure states in UI
- [x] Write trade execution tests

---

## Sprint 8: Real-Time Odds Polling & Slippage Protection

**Goal**: Live odds updates and slippage safety.

- [x] Implement 3-second polling in frontend for active card odds
- [x] Animate odds changes with monospaced font (no layout shift)
- [x] Detect >5% probability shift
- [x] Build slippage warning modal (acknowledge before unlock)
- [x] Disable "Hold to Confirm" during slippage warning
- [x] Handle stale odds on Trade Panel

---

## Sprint 9: Onboarding Flow

**Goal**: The wordless tutorial and first-time user experience.

- [x] Build onboarding page with looping background video placeholder
- [x] Integrate Privy login screen
- [x] Implement "1 Test USDC" grant on account creation
- [x] Build dummy swipe tutorial (forced zero-risk trade)
- [x] Route new users through onboarding before main feed
- [x] Persist onboarding completion state

---

## Sprint 10: Polish, PWA & Production Readiness

**Goal**: App feels production-ready with PWA capabilities.

- [ ] PWA manifest and service worker setup
- [ ] Offline fallback page
- [ ] Loading states and skeleton screens
- [ ] Error boundaries and error UI
- [ ] Responsive edge cases (tablets, small phones)
- [ ] Performance audit (Lighthouse)
- [ ] Final haptic tuning
- [ ] Environment configuration for production deployment

---

## Progress Tracker

| Sprint                          | Status       | Commit    | Audit                                          |
| ------------------------------- | ------------ | --------- | ---------------------------------------------- |
| 1 - Scaffolding & Design System | **Complete** | `4362ac8` | Audit 1: 12 issues reviewed, 10 fixes applied  |
| 2 - Card UI & Swipe             | **Complete** | `ecde3fd` | Audit 2: 16 issues reviewed, 12 fixes applied  |
| 3 - Trade Panel & Confirm       | **Complete** | `76f2ad0` | Audit 3: 16 issues reviewed, 13 fixes applied  |
| 4 - Backend Adapters & Feed     | **Complete** | `14e6175` | Audit 4: 4 issues reviewed, 4 fixes applied    |
| 5 - AI Curation                 | **Complete** | --        | Audit 5: 4 issues reviewed, 3 fixes applied    |
| 6 - Auth & Privy                | **Complete** | `82b6d7c` | Audit 6: 4 issues reviewed, 4 fixes applied    |
| 7 - Trade Execution             | **Complete** | --        | Audit 7: 3 issues reviewed, 3 fixes applied    |
| 8 - Odds Polling & Slippage     | **Complete** | --        | Audit 8: 4 issues reviewed, 4 fixes applied    |
| 9 - Onboarding                  | **Complete** | --        | Audit 9: 4 issues reviewed, 3 fixes applied    |
| 10 - Polish & PWA               | Pending      | --        | --                                             |
