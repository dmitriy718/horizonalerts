# Work log

This document summarizes delivered work in this repo to date.

## Platform and deployment
- VPS deployment via Docker Compose (web, api, postgres, redis).
- Hardened NGINX with TLS, HSTS, CSP, and reverse proxy for `/` and `/api/`.
- Docker build args for public env variables to support Next.js runtime config.
- Health checks for web, api, postgres, and redis.

## Backend (services/api)
- Fastify service with rate limiting, JWT auth, Firebase token verification.
- Stripe webhook handler for subscription lifecycle.
- Billing endpoints for checkout and portal sessions.
- Health/ready endpoints with database checks.
- Help tickets route with SendGrid email notifications and email logging.
- Env validation for production, firebase service account support with fallbacks.

## Frontend (apps/web)
- Next.js 15 app with pricing, login, onboarding, settings, privacy, terms, trust.
- Stripe checkout and portal UI flows with gating by email verification and onboarding completion.
- Firebase Auth login/registration with verification and password reset.
- PostHog client analytics events for funnel tracking.
- SEO: robots.txt, sitemap.xml, OpenGraph-ready layout metadata.
- Premium UI redesign: gradients, grid texture, stats, ticker, testimonials, and CTAs.

## Mobile (apps/mobile)
- Expo app with premium-styled landing and auth UI.
- Firebase Auth sign-in/sign-up with verification prompts.
- Compliance messaging and risk-aware positioning.

## Data and infra
- Postgres schema for signals, entitlements, email logs, help tickets, portfolio events.
- Signal engine scaffold for closed-bar processing (non-repaint principle).
- Infra documentation and runbooks.

## Known configuration requirements
- `.env` must include `NEXT_PUBLIC_FIREBASE_*` for web auth and `EXPO_PUBLIC_FIREBASE_*` for mobile.
- Stripe requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_PRO`.
- Alpaca requires `ALPACA_KEY_ID`, `ALPACA_SECRET_KEY` (Trading API keys).

## Notes
- Secrets and service account files are ignored via `.gitignore`.
- Web build requires public envs at build time via Docker build args.
