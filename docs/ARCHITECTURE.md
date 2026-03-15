# Flipr Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js PWA)            │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Card     │  │ Trade    │  │ Onboarding       │  │
│  │ Stack    │  │ Panel    │  │ (Wordless Tutorial)│ │
│  │ (Swipe)  │  │ (Bottom  │  │                  │  │
│  │          │  │  Sheet)  │  │                  │  │
│  └────┬─────┘  └────┬─────┘  └──────────────────┘  │
│       │              │                               │
│  ┌────┴──────────────┴───────────────────────────┐  │
│  │         API Client (polls every 3s)           │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │                               │
│  ┌───────────────────┴───────────────────────────┐  │
│  │         Privy SDK (Invisible Wallet)          │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ REST API
┌──────────────────────┴──────────────────────────────┐
│                   BACKEND (FastAPI)                   │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ /markets    │  │ /trade       │  │ /auth      │  │
│  │ GET curated │  │ POST execute │  │ Privy verify│ │
│  │ card feed   │  │ FOK order    │  │            │  │
│  └──────┬──────┘  └──────┬───────┘  └────────────┘  │
│         │                │                           │
│  ┌──────┴────────────────┴───────────────────────┐   │
│  │            Service Layer                      │   │
│  │  ┌─────────────────┐  ┌────────────────────┐  │   │
│  │  │ AI Curation     │  │ Trade Execution    │  │   │
│  │  │ (Claude API)    │  │ (Fee + Route)      │  │   │
│  │  │ cron: 5min      │  │                    │  │   │
│  │  └────────┬────────┘  └────────┬───────────┘  │   │
│  └───────────┼────────────────────┼──────────────┘   │
│              │                    │                   │
│  ┌───────────┴────────────────────┴──────────────┐   │
│  │         Adapter Layer (BaseMarketAdapter)      │   │
│  │  ┌──────────────────┐  ┌───────────────────┐  │   │
│  │  │ HyperliquidAdapter│ │ Future Adapters   │  │   │
│  │  │ (MVP)            │  │                   │  │   │
│  │  └──────────────────┘  └───────────────────┘  │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │  Core: Config | Rate Limiter | Auth Middleware │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

## Frontend Component Hierarchy

```
App (Layout)
├── AuthProvider (Privy)
├── ThemeProvider (Design tokens)
│
├── Pages
│   ├── / (Home - Card Stack)
│   │   ├── CardStack
│   │   │   ├── MarketCard (swipeable, Framer Motion)
│   │   │   │   ├── MarketQuestion (Playfair Display)
│   │   │   │   ├── OddsDisplay (JetBrains Mono, polls 3s)
│   │   │   │   ├── CategoryBadge
│   │   │   │   └── SwipeIndicator (YES/NO overlay)
│   │   │   └── EmptyState
│   │   └── TradePanel (bottom sheet)
│   │       ├── IntentDisplay ("Betting YES on...")
│   │       ├── OddsLock (with slippage warning)
│   │       ├── BetSizeSlider (default $10)
│   │       └── HoldToConfirm (1.5s press, progress bar)
│   │
│   ├── /onboarding
│   │   ├── BackgroundVideo (looping swipe demo)
│   │   ├── PrivyLoginButton
│   │   └── DummySwipeTutorial (1 Test USDC)
│   │
│   └── /portfolio (future)
│
└── Shared
    ├── BalanceDisplay (USDC, monospaced)
    ├── HapticFeedback (hook)
    └── SlippageWarning
```

## Backend Module Map

```
backend/app/
├── main.py                    # FastAPI app, middleware, startup
├── api/
│   ├── markets.py             # GET /markets/feed (curated cards)
│   ├── trade.py               # POST /trade/execute
│   └── auth.py                # POST /auth/verify (Privy token)
├── adapters/
│   ├── base.py                # BaseMarketAdapter (ABC)
│   └── hyperliquid.py         # HyperliquidAdapter (MVP)
├── ai/
│   ├── curator.py             # Claude curation pipeline
│   └── prompts.py             # Prompt templates
├── services/
│   ├── market_service.py      # Market feed logic
│   ├── trade_service.py       # Fee calculation, order routing
│   └── curation_service.py    # Cron job orchestration
├── models/
│   ├── market.py              # CuratedMarket, RawMarket
│   ├── trade.py               # TradeRequest, TradeResult
│   └── user.py                # User, PrivySession
├── core/
│   ├── config.py              # Settings (pydantic-settings)
│   ├── security.py            # Privy JWT verification
│   ├── rate_limiter.py        # Per-user rate limiting
│   └── dependencies.py        # FastAPI Depends
└── tests/
    ├── test_markets.py
    ├── test_trade.py
    └── test_adapters.py
```

## API Endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/markets/feed` | Returns curated market card stack (AI-processed) | Yes |
| `GET` | `/markets/{id}/odds` | Real-time odds for a specific market (polling target) | Yes |
| `POST` | `/trade/execute` | Execute a trade (FOK order via adapter) | Yes |
| `POST` | `/auth/verify` | Verify Privy JWT, create/retrieve user session | No |
| `GET` | `/health` | Health check | No |

## Data Flow: Two-Stage Swipe

```
1. User sees card → Frontend polls GET /markets/{id}/odds every 3s
2. User swipes right (YES) → Trade Panel opens with locked odds
3. User adjusts bet size → $10 default on slider
4. Slippage check → If odds shifted >5%, warning shown, user must acknowledge
5. User holds "Confirm" 1.5s → POST /trade/execute
6. Backend:
   a. Verify Privy JWT
   b. Calculate fee ($10 bet → $10.50 deducted)
   c. Route $10 to HyperliquidAdapter.place_order(FOK)
   d. Route $0.50 to Flipr treasury
   e. If slippage during hold → fail cleanly, return error
7. Frontend receives result → Heavy Impact haptic → success/error UI
```

## Key Technical Decisions

- **PWA over Native**: Faster iteration, single codebase, instant updates. Haptics via Web Vibration API.
- **Adapter Pattern**: Frontend is protocol-agnostic. Adding Polymarket later = new adapter, zero frontend changes.
- **AI Curation as Cache**: Claude processes markets on a 5-min cron, results cached. Frontend never calls Claude directly.
- **FOK Orders Only**: No partial fills. Trade succeeds completely or fails completely. User trust > fill rate.
- **Privy for Auth**: Invisible wallet creation. User signs in with Apple/Google, never sees seed phrases or gas fees.
