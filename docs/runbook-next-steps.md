# Runbook: Next steps

## Required configuration
- Populate `NEXT_PUBLIC_FIREBASE_*` and `EXPO_PUBLIC_FIREBASE_*` in `.env`.
- Add Firebase auth authorized domains for `horizonsvc.com`.
- Add Stripe webhook secrets and `STRIPE_PRICE_ID_PRO`.
- Add SendGrid sender email + API key.

## Immediate priorities
1. Validate Firebase login flow on web and mobile.
2. Run Stripe checkout flow end-to-end.
3. Verify PostHog events for signup → onboarding → checkout.

## Short-term roadmap
- Add pattern detector implementations in signal engine.
- Add public feed charts and alert provenance cards.
- Add mobile screens: Dashboard, Alerts, Scanner, Portfolio, Settings.
- Add account entitlement gating across app/web.

## Quality gates
- Smoke tests for auth, billing, and public feed.
- Load test /api endpoints for p95 latency.
- Verify no repainting in audit ledger.
