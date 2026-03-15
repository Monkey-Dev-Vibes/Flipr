# Flipr Sprint Plan

## Sprint Workflow
Each sprint follows: **Build → Audit → Fix → Commit & Push**
- Sprint N = Audit N = Commit N
- Commit message format: `Sprint N: <description>`

---

## Sprint 1: Project Scaffolding & Design System
**Goal**: Runnable frontend and backend skeletons with the Flipr design system baked in.

- [ ] Initialize Next.js project with TypeScript, TailwindCSS, Framer Motion
- [ ] Configure Tailwind with Flipr color palette and custom tokens
- [ ] Set up font loading (Playfair Display, JetBrains Mono, Inter)
- [ ] Create base layout component (dark background, mobile-first viewport)
- [ ] Initialize FastAPI project with folder structure
- [ ] Create health check endpoint
- [ ] Add `.env.example` files for both frontend and backend
- [ ] Add `.gitignore` for both projects

---

## Sprint 2: Market Card UI & Swipe Mechanics
**Goal**: The core swipe experience with placeholder data.

- [ ] Build `MarketCard` component (question, odds, category badge)
- [ ] Build `CardStack` component with Framer Motion swipe physics
- [ ] Implement swipe directions (right=YES, left=NO, up=skip)
- [ ] Add swipe indicators (color overlays on drag)
- [ ] Add haptic feedback hooks (Web Vibration API)
- [ ] Create mock market data for development
- [ ] Mobile-responsive styling and touch optimization

---

## Sprint 3: Trade Panel & Hold-to-Confirm
**Goal**: Stage 2 of the Two-Stage Swipe — the execution guardrail.

- [ ] Build `TradePanel` bottom sheet (slides up on swipe)
- [ ] Display intent, locked odds, bet size slider
- [ ] Build `HoldToConfirm` button (1.5s press, progress bar, ramping haptics)
- [ ] Wire swipe → panel transition animation
- [ ] Add slippage warning UI (>5% shift detection placeholder)

---

## Sprint 4: Backend Adapter Pattern & Market Feed
**Goal**: FastAPI serves real market data through the adapter pattern.

- [ ] Define `BaseMarketAdapter` abstract class
- [ ] Implement `HyperliquidAdapter` (connect to Hyperliquid SDK, fetch HIP-4 markets)
- [ ] Create Pydantic models (`RawMarket`, `CuratedMarket`, `TradeRequest`, `TradeResult`)
- [ ] Build `GET /markets/feed` endpoint
- [ ] Build `GET /markets/{id}/odds` endpoint
- [ ] Add rate limiting middleware (per-user)
- [ ] Write adapter tests

---

## Sprint 5: AI Curation Pipeline
**Goal**: Claude processes raw markets into curated, user-friendly card content.

- [ ] Set up Anthropic API client in backend
- [ ] Build curation prompt template (market_id, headline, description)
- [ ] Implement curation service with 5-minute cron job
- [ ] Cache curated results (in-memory or Redis)
- [ ] Wire curated feed to `/markets/feed` endpoint
- [ ] Write curation pipeline tests

---

## Sprint 6: Authentication & Privy Integration
**Goal**: Users can sign in and have invisible wallets.

- [ ] Integrate Privy SDK in frontend (Apple/Google auth buttons)
- [ ] Build `AuthProvider` context
- [ ] Implement `POST /auth/verify` (Privy JWT verification) in backend
- [ ] Add auth middleware to protected endpoints
- [ ] Create user session model
- [ ] Wire auth state to UI (balance display, protected routes)

---

## Sprint 7: Trade Execution & Fee Routing
**Goal**: Real trades execute through the backend to Hyperliquid.

- [ ] Implement `POST /trade/execute` endpoint
- [ ] Build trade service (fee calculation, order routing)
- [ ] Implement FOK order execution via `HyperliquidAdapter`
- [ ] Fee splitting logic ($0.50 to treasury)
- [ ] Wire frontend Trade Panel to execute endpoint
- [ ] Handle trade success/failure states in UI
- [ ] Write trade execution tests

---

## Sprint 8: Real-Time Odds Polling & Slippage Protection
**Goal**: Live odds updates and slippage safety.

- [ ] Implement 3-second polling in frontend for active card odds
- [ ] Animate odds changes with monospaced font (no layout shift)
- [ ] Detect >5% probability shift
- [ ] Build slippage warning modal (acknowledge before unlock)
- [ ] Disable "Hold to Confirm" during slippage warning
- [ ] Handle stale odds on Trade Panel

---

## Sprint 9: Onboarding Flow
**Goal**: The wordless tutorial and first-time user experience.

- [ ] Build onboarding page with looping background video placeholder
- [ ] Integrate Privy login screen
- [ ] Implement "1 Test USDC" grant on account creation
- [ ] Build dummy swipe tutorial (forced zero-risk trade)
- [ ] Route new users through onboarding before main feed
- [ ] Persist onboarding completion state

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

| Sprint | Status | Commit | Audit |
|---|---|---|---|
| 1 - Scaffolding & Design System | **Complete** | `4362ac8` | Audit 1: 12 issues reviewed, 10 fixes applied |
| 2 - Card UI & Swipe | **Complete** | `ecde3fd` | Audit 2: 16 issues reviewed, 12 fixes applied |
| 3 - Trade Panel & Confirm | **Complete** | `76f2ad0` | Audit 3: 16 issues reviewed, 13 fixes applied |
| 4 - Backend Adapters & Feed | **Complete** | `14e6175` | Audit 4: 4 issues reviewed, 4 fixes applied |
| 5 - AI Curation | **Complete** | — | Audit 5: 4 issues reviewed, 3 fixes applied |
| 6 - Auth & Privy | Pending | — | — |
| 7 - Trade Execution | Pending | — | — |
| 8 - Odds Polling & Slippage | Pending | — | — |
| 9 - Onboarding | Pending | — | — |
| 10 - Polish & PWA | Pending | — | — |
