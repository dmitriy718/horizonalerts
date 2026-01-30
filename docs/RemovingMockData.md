# Mock Data Removal & Real Data Integration

**Objective:** Replace all simulated trading data with real-time market data from Alpaca API.

## 1. Identified Mock Data Sources

| Component | File | Mock Logic | Replacement |
| :--- | :--- | :--- | :--- |
| **Signal Engine** | `services/signal-engine/src/index.ts` | `mockStream` generator creates random OHLCV bars. | Alpaca Data API (`getBarsV2`). |
| **Signal Engine** | `services/signal-engine/src/detectors/index.ts` | Detectors run on mock bars. | Detectors will run on real Alpaca bars. |
| **Frontend** | `apps/web/app/dashboard/page.tsx` | `handleMatch` generates random prices/TP/SL for visual effect. | Connect to `/api/scanner` only. Remove client-side generation. |
| **Frontend** | `apps/web/app/dashboard/components/ScanCarousel.tsx` | Simulates "scanning" progress. | Keep visual effect but decouple from data generation. |
| **Automation** | `services/automation/src/seed_candidates.ts` | Static fallback lists. | Keep as failsafe, but OpenAI generation is preferred. |

## 2. Implementation Plan

### Step A: Backend (Signal Engine)
1. Install `@alpacahq/alpaca-trade-api`.
2. Refactor `index.ts` to fetch real market data for the candidate watchlists.
3. Verify signals are generated only when real market conditions are met (or simply log "No Setup" if none found, but for "Operational Success" we might need to lower detector thresholds or scan more assets).

### Step B: Frontend (Dashboard)
1. Remove `Math.random()` price logic.
2. Ensure `ScanCarousel` is purely aesthetic.
3. Ensure Signal Feed only displays data from `useSWR` / `fetch('/api/scanner')`.

### Step C: Testing
1. Playwright E2E test must verify that the Dashboard loads and displays signals (which implies the backend is working).
2. Since real signals depend on market hours, we might need a "Replay Mode" or ensure we scan Crypto (24/7) to guarantee signals for testing. **Strategy: Ensure BTC-USD or ETH-USD is always in the watchlist.**

## 3. Removal Log
- [ ] `mockStream` in `signal-engine`.
- [ ] Random Price Logic in `DashboardPage`.
