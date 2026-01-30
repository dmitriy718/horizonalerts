# Preliminary Code Review & Optimization Plan

## 1. Issues & Bottlenecks

### Performance
*   **Dashboard Polling:** `DashboardPage` polls `/api/scanner` every 5 seconds. This causes unnecessary server load and network traffic for idle users.
    *   *Fix:* Implement SWR (Stale-While-Revalidate) with smart revalidation or switch to Server-Sent Events (SSE) / WebSockets for real-time push.
*   **TradingView Widgets:** Rendering 50 `MiniChart` widgets in the signal feed will drastically impact browser performance (memory & CPU).
    *   *Fix:* Implement `IntersectionObserver` to only render charts when they scroll into view (Lazy Loading).
*   **Bundle Size:** `framer-motion` is heavy. Ensure tree-shaking is effective.

### Code Quality & Dead Code
*   **Legacy Auth Pages:** `apps/web/app/login` and `signup` just re-export `AuthPage`. We should canonicalize to `/auth` and add redirects in `next.config.mjs` to clean up the source.
*   **Type Safety:** `signal-engine/src/index.ts` uses `any` casting for Alpaca bars (`const b = bObj as any`). We should define a proper `AlpacaBarV2` interface for type safety.

### SEO & Metadata
*   **Missing Metadata:** Most pages (`/dashboard`, `/auth`, `/onboarding`) lack specific `export const metadata` titles and descriptions.
*   **Sitemap:** `sitemap.ts` exists but might need updating to include dynamic blog posts effectively.
*   **UTM Tracking:** No logic to capture or persist UTM parameters from landing -> signup -> dashboard.

## 2. Refactoring Plan

### Immediate Fixes
1.  **Lazy Load MiniCharts:** Wrap `MiniChart` in a component that detects visibility.
2.  **Type Definitions:** Add `AlpacaBar` interface.
3.  **SEO:** Add metadata to all public pages.
4.  **UTM:** Create a `useUTM` hook to store params in `localStorage` on first load and attach to `POST /auth/register`.

### Future Optimizations
1.  **WebSockets:** Replace polling with Pusher or a custom WS server.
