# Flipr v2 Sprint Plan

## Sprint Workflow

Each sprint follows: **Build -> Audit -> Fix -> Commit & Push**

- Sprint N = Audit N = Commit N
- Commit message format: `v2 Sprint N: <description>`

---

## Sprint 1: Project Scaffolding & v2 Design System

**Goal**: Runnable `frontend-v2/` skeleton with v2 design tokens (FanDuel green, clean white cards).

- [x] Initialize Next.js project with TypeScript, TailwindCSS, Framer Motion
- [x] Configure Tailwind v4 with v2 color palette (`#84B500` YES, `#FFFFFF` cards)
- [x] Add gradient tokens and updated flash-green keyframes
- [x] Set up font loading (Playfair Display, JetBrains Mono, Inter)
- [x] Copy and adapt providers (Privy, Auth, ServiceWorker)
- [x] Create lib files (types with sparkline/social types, constants, format, api, mock-markets)
- [x] Create stub pages (home, onboarding)
- [x] PWA manifest, service worker, icons
- [x] Vitest and ESLint config
- [x] `.env.example` with WS_URL addition

---

## Sprint 2: Market Card v2 & Horizontal Carousel

**Goal**: The new discovery UX — horizontal carousel of cards with YES/NO tap buttons, sparklines, social signals.

- [ ] Build `MarketCard.tsx` (white card, category badge, question, probability pills, YES/NO tap buttons)
- [ ] Build `SparklineChart.tsx` (inline SVG line chart, 24h probability trend)
- [ ] Build `SocialBadge.tsx` (fire emoji + swipe count pill)
- [ ] Build `MarketCarousel.tsx` (horizontal scroll-snap, pagination dots)
- [ ] Copy `useHaptics.ts` and `AnimatedOdds.tsx` (update green)
- [ ] Build `FeedSkeleton.tsx` (horizontal shimmer version)
- [ ] Write tests for MarketCard and MarketCarousel

---

## Sprint 3: Trade Panel v2 & Swipe-Up-to-Trade Pill

**Goal**: Stage 2 execution — bottom sheet with the draggable "Swipe Up to Trade" pill.

- [ ] Build `TradePanel.tsx` (bottom sheet, intent badge, locked/live odds, fee disclosure)
- [ ] Build `SwipeUpToTrade.tsx` (Framer Motion `drag="y"`, ramp haptics, spring-back)
- [ ] Copy `BetSizeSlider.tsx` from v1
- [ ] Write tests for SwipeUpToTrade and TradePanel

---

## Sprint 4: Main Feed Page & Auth Integration

**Goal**: Wire carousel + trade panel on `page.tsx` with auth and mock trade flow.

- [ ] Build `app/page.tsx` with auth gate, carousel, trade panel integration
- [ ] Build `TradeResultToast.tsx` + `SuccessConfetti.tsx` (celebratory animation)
- [ ] Copy `UserMenu.tsx`, `LoginButton.tsx`, `useOnboarding.ts`
- [ ] Stub odds polling for now

---

## Sprint 5: Onboarding Flow v2

**Goal**: Updated onboarding teaching horizontal carousel + swipe-up mechanic.

- [ ] Build `app/onboarding/page.tsx` (welcome + tutorial phases)
- [ ] Build `OnboardingTutorial.tsx` (3-step: browse → tap → swipe-up demo)
- [ ] Wire `claimOnboardingGrant` API call

---

## Sprint 6: Biometric Step-Up & Cooling-Off Guardrails

**Goal**: New safety guardrails unique to v2.

- [ ] Build `BiometricGate.tsx` (WebAuthn for >$100 wagers, graceful degradation)
- [ ] Build `CoolingOffModal.tsx` (full-screen modal at 5 consecutive losses)
- [ ] Build `useCoolingOff.ts` hook (local tracking, backend-wired in Sprint 8)
- [ ] Wire into TradePanel/page.tsx

---

## Sprint 7: Backend WebSocket & User State Service

**Goal**: Add real-time WebSocket odds streaming and user loss tracking to shared backend.

- [ ] Build `backend/app/api/ws.py` (WebSocket endpoint with JWT auth, 2s push)
- [ ] Build `backend/app/services/ws_service.py` (ConnectionManager)
- [ ] Build `backend/app/api/users.py` (`GET /users/me/state`)
- [ ] Build `backend/app/services/user_state_service.py` (in-memory loss tracking)
- [ ] Update `trades.py` to record results
- [ ] Register new routers in `main.py`
- [ ] Write backend tests

---

## Sprint 8: WebSocket Integration & Slippage v2

**Goal**: Frontend WebSocket integration replacing polling. Wire real user state.

- [ ] Build `useOddsWebSocket.ts` (WS connection, reconnect, polling fallback)
- [ ] Replace polling in TradePanel with WebSocket
- [ ] Build `useUserState.ts` (fetch `GET /users/me/state`)
- [ ] Wire `useCoolingOff` to real backend state
- [ ] Copy and adapt `SlippageWarning.tsx` for swipe-up pill

---

## Sprint 9: Real Backend Integration & Trade Execution

**Goal**: Wire to real backend endpoints, remove mock-markets dependency.

- [ ] Build `useMarketFeed.ts` (`GET /markets/feed` with auth)
- [ ] Wire `executeTrade()` in page.tsx
- [ ] Error boundary, not-found, offline pages
- [ ] Refetch user state after each trade

---

## Sprint 10: Polish, Premium Animations & PWA

**Goal**: Premium visual layer — gradients, animations, production readiness.

- [ ] Premium gradients (portfolio balance, YES button, header accent)
- [ ] SuccessConfetti polish (particles, colors, trajectory)
- [ ] SwipeUpToTrade polish (proportional haptic ramp, glow ring)
- [ ] Carousel polish (inactive card opacity/scale, peek next card)
- [ ] PWA manifest, service worker, Lighthouse audit
- [ ] Responsive edge cases

---

## Progress Tracker

| Sprint                                | Status       | Commit    | Audit |
| ------------------------------------- | ------------ | --------- | ----- |
| 1 - Scaffolding & v2 Design System   | **Complete** | `3f9c771` | 3 fixes |
| 2 - Card v2 & Carousel               | **Complete** | `ad67ca3` | 3 fixes |
| 3 - Trade Panel & SwipeUp Pill        | **Complete** | `316bae0` | -- |
| 4 - Feed Page & Auth                  | **Complete** | `0cef2e0` | 3 fixes |
| 5 - Onboarding v2                     | **Complete** | `b927754` | -- |
| 6 - Biometric & Cooling-Off          | **Complete** | `73c7989` | -- |
| 7 - Backend WebSocket & User State    | **Complete** | `99d5111` | -- |
| 8 - WebSocket Integration & Slippage  | **Complete** | `9fcad5e` | -- |
| 9 - Backend Integration & Trade       | **Complete** | `5fa273d` | -- |
| 10 - Polish & PWA                     | **Complete** | --        | -- |
