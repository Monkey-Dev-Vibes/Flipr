# Product Requirements Document (PRD): Flipr

**Document Purpose:** This PRD serves as the architectural and design source of truth for Flipr. It outlines the product's vision, market strategy, UX/UI philosophy, and technical requirements for the MVP build.

---

## 1. Executive Summary & Product Vision

Flipr is a mobile-first, gamified prediction market aggregator. It strips away the intimidating order books and complex charts of traditional crypto trading platforms, replacing them with a sophisticated, intuitive "swipe" interface.

**The Philosophy:** Flipr sits at the intersection of social discovery (Tinder/Hinge) and financial speculation (Robinhood/Polymarket). The UI must feel like a premium, editorial consumer app, not a "degen" crypto casino. It prioritizes deliberate action over impulsive gambling through a **"Two-Stage Swipe"** mechanic and institutional-grade design language.

---

## 2. Market Analysis & Strategy

### 2.1 Target Market & Audience Personas

- **The "Crypto-Curious" Casual (Primary):** Millennials and Gen-Z users who follow pop culture, sports, and major financial news. They want to bet on outcomes (e.g., "Will the Fed cut rates?", "Will GTA VI be delayed?") but are intimidated by Web3 wallets, gas fees, and candlestick charts.

- **The "Degen" Momentum Trader (Secondary):** Existing crypto users who want a fun, frictionless mobile app to place quick directional bets while away from their desktop terminals.

### 2.2 Business Opportunity & Monetization

Prediction markets are seeing explosive, multi-billion-dollar volume growth, but the mobile UX is severely lagging. Flipr acts as an **aggregator router**, not an exchange.

**Revenue Model:** A "Platform Convenience Fee." When a user places a $10 bet, the smart wallet deducts $10.50. $10 routes to the underlying protocol (Hyperliquid), and $0.50 (or a set percentage) routes instantly to the Flipr treasury.

### 2.3 Competitor Landscape

| Competitor | Strengths | Weaknesses |
|---|---|---|
| **Polymarket** | Industry leader in prediction markets | Cluttered mobile web UI, complex wallet connections |
| **Kalshi** | Fiat-based, regulated | US only, focused on financial/economic data, lacks viral pop-culture moments |
| **Robinhood/Webull** | Masterful UX | Restricted to traditional equities and standard crypto, no event-based binary prediction markets |

**Flipr's Edge:** Aggregated liquidity, zero-friction onboarding, and a heavily gamified but safe UX.

---

## 3. Design System & UX Philosophy

Flipr rejects the neon, hyper-stimulating aesthetics of Web3 in favor of a mature, **"Intentional Fintech"** design inspired by Hinge and editorial publications.

### 3.1 Color Palette

| Token | Hex | Usage |
|---|---|---|
| **Background (Cod Gray)** | `#1A1A1A` | Reduces eye strain, signals modernity, provides a stark canvas for the cards |
| **Market Cards (Off-White)** | `#FFFEFD` | Physical, organic "paper" feel. Builds trust and readability |
| **YES / Profit (Forest Green)** | `#025656` | Replaces aggressive neon green. Signals stability, growth, and agreement |
| **NO / Loss (Coral)** | `#D45847` | Replaces alarming bright red. Used for 'No' bets and destructive actions |
| **Typography (Slate/Ink)** | `#2D3748` | Used on off-white cards for high readability without harsh contrast |

### 3.2 Typography

- **Headings / Market Questions:** Playfair Display (or similar elegant serif/geometric sans-serif) — adds prestige and editorial weight.
- **Numbers, Odds, USDC Balances:** JetBrains Mono or Roboto Mono — monospaced fonts are **mandatory** so digits do not jump horizontally when real-time odds update.

### 3.3 Haptic Architecture (The Mechanical Metaphor)

The app must feel like a physical machine using native OS haptics.

| Event | Haptic Pattern |
|---|---|
| Card Dragging | Continuous Light Tick (dial turning) |
| Swipe Threshold Reached | Medium Click (snapping sensation) |
| Hold-to-Trade Action | Ramp-Up Vibration (building tension) |
| Trade Confirmed | Heavy Impact (satisfying, deep thud) |

---

## 4. Core Mechanics: The "Two-Stage Swipe"

To mitigate the risk of accidental, high-stakes "fat-finger" trades, Flipr separates **discovery** from **execution**.

### Stage 1: Discovery (Expressing Intent)

The user views the Market Card stack:

- **Swipe Right** → Selects the **"YES"** outcome
- **Swipe Left** → Selects the **"NO"** outcome
- **Swipe Up** → Skips the market (discards the card)

> **Crucial Logic:** Swiping left or right does **not** execute the trade. Instead, the card flies off-screen, triggering Stage 2.

### Stage 2: Execution (The Ethical Guardrail)

1. A sleek **"Trade Panel"** bottom-sheet instantly slides up.
2. It displays:
   - The selected intent (e.g., "Betting YES on BTC > $100k")
   - The locked odds
   - A bet size slider (Default: $10)
3. At the bottom is a prominent **"Hold to Confirm"** button. The user must press and hold for **1.5 seconds** (accompanied by a filling progress bar and ramping haptics) to execute the smart contract transaction.

---

## 5. Technical Architecture (The Aggregator Pattern)

The codebase must be modular. The frontend must **never** know which underlying blockchain it is communicating with.

### 5.1 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (React), TailwindCSS, Framer Motion (swipe physics). Built as a mobile-responsive PWA. |
| **Backend** | Python (FastAPI) |
| **Wallet Integration** | Privy (Invisible Web3 wallets via Apple/Google auth) |
| **AI Engine** | Anthropic API (Claude 3.5 Sonnet) |

### 5.2 The Backend Aggregator Protocol

Build an abstract adapter pattern in Python: `BaseMarketAdapter`.

- **MVP Adapter:** `HyperliquidAdapter` — connects to the Hyperliquid Python SDK to fetch HIP-4 outcome markets and route signed L1 transactions.
- Future adapters (e.g., `PolymarketAdapter`) will be added to this pattern later.

```
BaseMarketAdapter (Abstract)
├── HyperliquidAdapter (MVP)
├── PolymarketAdapter (Future)
└── ...
```

### 5.3 The AI Curation Pipeline

1. The FastAPI backend runs a **cron job every 5 minutes**, fetching raw active markets from the protocol.
2. It passes high-volume markets to Claude via API.
3. **Prompt Directive:** Claude must return a JSON object containing:
   - `market_id`
   - `headline` (max 6 words, punchy)
   - `description` (max 2 sentences, accessible tone)
4. The frontend queries the FastAPI backend to populate the card stack with this curated JSON feed.

---

## 6. Security, Edge Cases & Ethical Guardrails

### 6.1 Slippage Protection (Polling)

Prediction market odds shift rapidly. The Next.js frontend must **poll the backend every 3 seconds** while a card is active. If the implied probability shifts by **>5%**, the UI must:
- Flash a warning color
- Require the user to acknowledge the new odds before the "Hold to Confirm" button unlocks

### 6.2 Execution Safety

All trades routed through the backend must use **Fill-Or-Kill (FOK)** or strict limit order parameters. If the price slips during the 1.5-second hold-to-confirm, the trade must **fail cleanly** rather than executing at a bad price.

### 6.3 Onboarding (The Wordless Tutorial)

- The login screen features a **looping background video** demonstrating the Two-Stage Swipe mechanic. No text-heavy tutorials.
- Upon account creation (via Privy), the user is granted **1 "Test USDC"** and forced to complete a zero-risk dummy swipe to learn the execution flow.

### 6.4 Rate Limiting

The FastAPI backend must implement **strict rate limiting per Privy user ID** to prevent spam attacks on the underlying protocol RPCs.
