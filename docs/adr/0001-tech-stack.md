# ADR 0001: Tech stack selection

## Status
Accepted

## Context
We need a production-ready, cross-platform system with rapid iteration and strong
observability. The stack must support web + mobile + backend services with a
clean developer experience and minimal friction.

## Decision
- Web: Next.js 15 (App Router), TypeScript, Tailwind.
- Mobile: React Native (Expo), TypeScript.
- API: Fastify, TypeScript.
- Data: Postgres + Redis.
- Auth: Firebase Auth (email + Google).
- Billing: Stripe.
- Analytics: PostHog.

## Consequences
- Faster iteration using TypeScript across services.
- Easy auth for web/mobile via Firebase SDKs.
- Stripe webhook handling integrated with API.
