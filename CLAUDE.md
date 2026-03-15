# Flipr - Project Guidelines

## What is Flipr?
A mobile-first, gamified prediction market aggregator with a "Two-Stage Swipe" mechanic. See [PRD.md](PRD.md) for full product spec.

## Project Structure
```
Flipr/
├── frontend/          # Next.js PWA (React, TailwindCSS, Framer Motion)
│   ├── src/
│   │   ├── app/       # Next.js App Router pages
│   │   ├── components/# React components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utilities, API client, constants
│   │   ├── providers/ # Context providers (Privy, theme, etc.)
│   │   └── styles/    # Global styles, Tailwind config
│   └── public/        # Static assets
├── backend/           # Python FastAPI
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── adapters/  # Market protocol adapters (BaseMarketAdapter pattern)
│   │   ├── ai/        # Claude AI curation pipeline
│   │   ├── models/    # Pydantic models / DB schemas
│   │   ├── services/  # Business logic
│   │   └── core/      # Config, security, rate limiting
│   └── tests/
├── docs/              # Architecture, sprint plan, design specs
└── PRD.md             # Product Requirements Document (source of truth)
```

## Commands
```bash
# Frontend
cd frontend && npm run dev      # Start Next.js dev server
cd frontend && npm run build    # Production build
cd frontend && npm run lint     # ESLint
cd frontend && npm run test     # Jest/Vitest tests

# Backend
cd backend && uvicorn app.main:app --reload   # Start FastAPI dev server
cd backend && pytest                           # Run tests
cd backend && ruff check .                     # Lint
cd backend && ruff format .                    # Format
```

## Workflow Rules
- **Sprint discipline**: All work is organized into numbered sprints (Sprint 1, Sprint 2, etc.)
- **Sprint cycle**: Build → Audit (using /audit skill) → Fix → Commit & Push
- **Commit alignment**: Sprint N = Audit N = Commit N (e.g., Sprint 1 commit message starts with "Sprint 1:")
- **Commit messages**: Format as `Sprint N: <description>` (e.g., "Sprint 1: Project scaffolding and design system")
- **Audit before push**: Every sprint must pass /audit before committing
- **Branch strategy**: Work on `main` for MVP sprints

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, TailwindCSS, Framer Motion
- **Backend**: Python 3.11+, FastAPI, Pydantic v2
- **Wallet**: Privy SDK
- **AI**: Anthropic API (Claude)
- **Protocol**: Hyperliquid Python SDK (HIP-4 markets)

## Design System (Mandatory)
| Token | Hex | Tailwind Custom |
|---|---|---|
| Background | `#1A1A1A` | `bg-flipr-dark` |
| Card Surface | `#FFFEFD` | `bg-flipr-card` |
| YES/Profit | `#025656` | `text-flipr-yes` / `bg-flipr-yes` |
| NO/Loss | `#D45847` | `text-flipr-no` / `bg-flipr-no` |
| Text/Ink | `#2D3748` | `text-flipr-ink` |

**Fonts**: Playfair Display (headings), JetBrains Mono (numbers/odds), Inter (body)

## Key Conventions
- Frontend components use PascalCase filenames (e.g., `MarketCard.tsx`)
- Backend modules use snake_case (e.g., `market_adapter.py`)
- All API responses follow a consistent envelope: `{ data, error, meta }`
- Environment variables in `.env.local` (frontend) and `.env` (backend) — NEVER commit these
- TypeScript strict mode enabled
- Pydantic models for all API request/response schemas
