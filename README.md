# Horizon Alerts

**Institutional Trade Intelligence for Retail Traders.**

Horizon Alerts is a real-time signal platform powered by proprietary algorithms (`Institutional Vice`, `Velocity Vault`, `Delta Divergence`) scanning equities and crypto markets.

## Features

- **Real-Time Scanner:** 5-minute interval scanning using live Alpaca Market Data.
- **Institutional Algos:** Detects order flow imbalances, hidden absorption, and momentum breakouts.
- **Pro Dashboard:** "Cyberpunk" terminal interface with interactive scanning, mini-charts, and advanced TradingView integration.
- **Education:** 20+ deep-dive lessons in the Horizon Academy.
- **Secure:** Firebase Auth + Custom Backend Sync, Stripe Payments, and SMTP Email Notifications.

## Tech Stack

- **Frontend:** Next.js 15, Tailwind CSS, Framer Motion.
- **Backend:** Fastify, Node.js, TypeScript.
- **Database:** PostgreSQL (User data, Signals, Entitlements).
- **Data Feed:** Alpaca Markets API (`getBarsV2`).
- **Infrastructure:** Docker Compose, Nginx, VPS (Ubuntu).

## Getting Started

1. **Clone:** `git clone ...`
2. **Env:** Copy `.env.example` to `.env` and populate keys (Alpaca, Stripe, Firebase).
3. **Run:** `docker compose up -d --build`.

## Architecture

- **`apps/web`**: Next.js frontend.
- **`services/api`**: Core backend API.
- **`services/signal-engine`**: Polls Alpaca, runs detectors, writes signals to DB.
- **`services/automation`**: Daily tasks (OpenAI candidate scanning, Content generation).

## License

Proprietary.