# Product Requirements Document (PRD): Flipr (v2 - Gamified Trading Model)

**Document Purpose:** This PRD serves as the architectural and design source of truth for Flipr. It outlines the product's vision, market strategy, gamified UX/UI philosophy, and technical requirements for the MVP build, heavily inspired by the interaction models of Robinhood, FanDuel, and modern social discovery apps.

---

## 1. Executive Summary & Product Vision

Flipr is a mobile-first, gamified prediction market aggregator (initially powered by Hyperliquid HIP-4). It bridges the gap between social discovery and professional trading. By utilizing "Variable Reward Schedules" and "delightful" micro-interactions, Flipr makes financial forecasting highly engaging, while employing strict "safety friction" (like vertical swipe-to-trade and hold-to-confirm mechanics) to protect users from accidental capital loss.

---

## 2. Market Analysis & Strategy

### 2.1 Target Market & Audience Personas

- **The "Robinhood" Retail Speculator:** Users accustomed to gamified stock/crypto trading who want to speculate on event-driven outcomes (pop culture, politics, sports) with a sleek, mobile-native interface.

- **The Crypto-Curious Casual:** Users who want to engage in prediction markets but are alienated by order books and raw fractional token pricing.

### 2.2 Business Opportunity & Monetization

Prediction markets are seeing explosive volume, but UI remains desktop-centric and intimidating. Flipr acts as the aggregator and router.

**Revenue Model:** A "Platform Convenience Fee." When a user places a $10 bet, the smart wallet deducts $10.50. $10 routes to the underlying protocol, and $0.50 routes instantly to the Flipr treasury.

---

## 3. Design System & Gamified UX Philosophy

Flipr's design language balances "Trust" (clean, muted backgrounds) with "Energy" (vibrant accents and animations), drawing from FanDuel's professionalism and Robinhood's momentum.

### 3.1 Color Palette & Chromatic Strategy

| Token | Hex | Usage |
|---|---|---|
| **Background (Cod Gray)** | `#1A1A1A` | Sophisticated, modern backdrop that reduces eye strain |
| **Market Cards (Clean White)** | `#FFFFFF` | Provides extreme contrast for readability and an "institutional" feel |
| **Growth & Execution (FanDuel Green)** | `#84B500` | Used for "YES" outcomes, profit indicators, and the final execution swipe. Signals trust and momentum |
| **Alert & Decline (Coral)** | `#D45847` | Used for "NO" outcomes and destructive actions |
| **Premium Accents (Acorns Gradients)** | — | Subtle two-tone gradients on high-level UI elements (like the user's portfolio balance) to make the app feel like a premium lifestyle product |

### 3.2 Haptic Hierarchy (The Mechanical Metaphor)

Haptics provide the physicality of the transaction, building user confidence.

| Event | Haptic Pattern |
|---|---|
| Scrolling through markets / sliding bet-size adjuster | **Tick** (Low Energy) |
| Tapping to select YES/NO outcome on a card | **Click** (Medium Energy) |
| "Swipe-Up-to-Trade" gesture | **Ramp-Up** (Attentional) — smoothly accelerating vibration |
| Smart contract transaction confirms | **Heavy Impact** (High Energy) — deep, satisfying thud |

### 3.3 Variable Reward Schedule (VRS) & Reinforcement

- **The Anticipation Phase:** Finding a market with highly volatile odds provides the "Slot Machine Logic" of discovery.
- **The "Delightful" Transaction:** Successful executions are met with a brief, celebratory animation (e.g., a subtle neon pulse or a rising rocket icon), instantly rewarding the action of trading before the market even resolves.

---

## 4. Core Mechanics: The Discovery-to-Execution Funnel

To prevent accidental bets while maintaining speed, Flipr completely separates horizontal browsing from vertical execution.

### Stage 1: The Discovery Feed (Horizontal)

- Users scroll horizontally through a carousel of Market Cards.
- Tapping a bold "YES" or "NO" button on the card does **not** execute a trade. It highlights the selection and triggers Stage 2.

### Stage 2: The Safety Friction Execution (Vertical)

1. A **"Trade Launcher"** bottom-sheet slides up.
2. **The Bet Slider:** A horizontal slider with "Tick" haptics allows the user to set their USDC wager.
3. **The Gesture of Intent:** At the bottom is a **"Swipe Up to Trade"** pill (Robinhood style). The user must drag the pill vertically to the top of the sheet.
4. **Biometric Step-Up:** If the wager exceeds $100, the app triggers FaceID/TouchID before the swipe completes, providing "imperceptible authorization."

---

## 5. The Market Card: Information Architecture

The Market Card must instantly quantify the "wisdom of the crowd."

- **Price as Probability:** Do not display raw token prices (e.g., "$0.65"). The UI must automatically translate this to implied probability: "65% Chance".
- **Dynamic Visuals:** Include a minimal sparkline (line chart) directly on the card showing the probability trend over the last 24 hours.
- **Live Data Streams:** Odds must update dynamically without page reloads (via WebSockets). If odds change, the percentage text should briefly flash green (up) or red (down).
- **Social Signals:** Display a badge such as "🔥 12,400 Swipes Today" or "Copied by Top Traders" to leverage community validation.

---

## 6. Technical Architecture (The Aggregator Pattern)

### 6.1 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js (React), TailwindCSS, Framer Motion (for the Swipe-Up execution physics and animations). Deployed as a Progressive Web App (PWA) |
| **Backend** | Python (FastAPI) with WebSockets for real-time price streaming |
| **Wallet Integration** | Privy (Invisible Web3 wallets via Apple/Google auth) |
| **AI Engine** | Anthropic API (Claude 3.5 Sonnet) for rewriting market titles |

### 6.2 The Backend Aggregator Protocol

- **Adapter Pattern:** A `BaseMarketAdapter` class in Python handles abstract methods.
- **MVP Implementation:** `HyperliquidAdapter` utilizing the Hyperliquid Python SDK to fetch HIP-4 outcome markets and route signed L1 transactions.

### 6.3 Real-Time Infrastructure

The backend establishes a WebSocket connection to the Hyperliquid L1. As tick data arrives, the FastAPI server pushes the updated probabilities to the Next.js frontend, ensuring the Market Cards always display live odds.

---

## 7. Security & Guardrails

- **Wordless Tutorial:** The PWA login screen features a looping video demonstrating the "Swipe Up to Trade" vertical gesture so users intuitively understand the mechanics before connecting their wallet.
- **Slippage Previews:** If real-time odds shift by >5% while the Trade Launcher is open, the "Swipe Up" pill locks, flashes orange, and requires the user to tap "Accept New Odds" before unlocking.
- **Cooling-Off Prompts:** To mitigate addictive VRS loops, if a user loses 5 consecutive predictions, a calm-state modal appears suggesting a break, maintaining ethical UX standards.
