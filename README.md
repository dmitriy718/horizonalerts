# Horizon Services Trade Alerts

Production-grade, cross-platform trade alert ecosystem for iOS, Android, and Web.
This repo ships deployable code, infra-as-code, and launch-ready content.

## Monorepo layout
- `apps/web`: Next.js 15 marketing + member web experience.
- `services/api`: Fastify API gateway, entitlements, public feed, tickets.
- `services/signal-engine`: non-repainting signal engine skeleton.
- `infra/terraform`: cloud/VPS infra definitions.
- `infra/ansible`: VPS hardening and NGINX provisioning.
- `docs`: architecture, OpenAPI, runbooks, legal templates.
- `content`: email templates, academy drills, blog seeds.

## Non-negotiables
- No trade execution or broker actions.
- No repainting: closed-bar signals only, immutable records.
- Email verification required, free/pro entitlements enforced server-side.
- Persistent disclaimers and recorded acknowledgments.

## Quick start (local)
1. Copy `.env.example` to `.env` and set keys.
2. Run Docker services:
   - `docker compose up -d`
3. Run database migration inside Postgres container:
   - `docker compose exec postgres psql -U postgres -d horizonalerts -f /db/001_init.sql`
4. Start API + Web (already running in compose).

Compose mounts the migration at `/db/001_init.sql`.

## Environments
All secrets must be provided via environment variables or a secret store.
See `.env.example` for the required keys.

## Compliance
Disclaimers are always visible in product and public pages. User acknowledgments
are stored server-side in `users` and `settings` documents.

