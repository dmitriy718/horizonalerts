# Ecosystem Review #2 — Deep Security & Correctness Audit

**Date**: 2026-02-27
**Scope**: Full stack — horizonalerts monorepo + NovaPulse bot integration
**Tests**: 167 passing (7 test files)

## Summary

Second review pass — deeper focus on auth flow, data integrity, error handling, type safety, and production hardening. Found 5 CRITICAL, 10 HIGH, 11 MEDIUM, and 6 LOW issues.

## Issues Found & Fixed

### CRITICAL

| # | Issue | File | Status |
|---|-------|------|--------|
| CRIT-1 | Firebase keys + VPS password on disk in repo root | *.json, vpspass.txt | NOTED — operational: rotate keys, scrub history |
| CRIT-2 | Auth bypass: Firebase null result falls through to JWT | server.ts:59-69 | FIXED — null Firebase result returns 401 |
| CRIT-3 | Stripe webhook silently passes when webhookSecret is empty | stripe.ts:6 | FIXED — explicit guard added |
| CRIT-4 | SSRF DNS rebinding bypasses string-only IP check | bot.ts:5-16 | FIXED — added dns.lookup validation |
| CRIT-5 | Unhandled email errors in help.ts cause 500s | help.ts:50-66 | FIXED — wrapped in try/catch |

### HIGH

| # | Issue | File | Status |
|---|-------|------|--------|
| HIGH-1 | Admin notification email contains unescaped user input | help.ts:58-64 | FIXED — escapeHtml applied |
| HIGH-2 | requireAuth typed as `any`, request.user cast as `any` | types.d.ts:33, server.ts:63 | FIXED — proper types |
| HIGH-3 | portfolio decidedAt accepts any string (not datetime) | portfolio.ts:10 | FIXED — z.string().datetime() |
| HIGH-4 | In-memory rate limiter has memory leak (no cleanup) | help.ts:21-31 | FIXED — cleanup interval added |
| HIGH-5 | Stripe customer lookup by email not uid (account takeover) | billing.ts:47-57 | NOTED — requires schema change |
| HIGH-6 | Ticket route uses .parse() not .safeParse() → 500 on invalid | help.ts:72 | FIXED — safeParse with proper 400 |
| HIGH-7 | /auth/register leaks ZodError object in 400 response | auth.ts:27-29 | FIXED — only sends field errors |
| HIGH-8 | Dashboard layout interval fires after logout/verify | dashboard/layout.tsx | FIXED — stable deps, getFirebaseAuth() |
| HIGH-9 | Bot proxy forwards arbitrary query params to bot | bot.ts:89-99 | FIXED — allowlisted per endpoint |
| HIGH-10 | Next.js public-feed route crashes on network error | api/public-feed/route.ts | FIXED — try/catch added |

### MEDIUM

| # | Issue | File | Status |
|---|-------|------|--------|
| MED-1 | `users` table not in 001_init.sql | migrations | FALSE POSITIVE — exists in 002_users.sql |
| MED-2 | `bot_connections` table not in 001_init.sql | migrations | FALSE POSITIVE — exists in 004_bot_connections.sql |
| MED-3 | publicFeed.ts readCandidates has latent path traversal | publicFeed.ts:8-22 | FIXED — allowlist added |
| MED-4 | BillingButtons no error handling on getIdToken/fetch | BillingButtons.tsx:38-58 | FIXED — try/catch added |
| MED-5 | Env validation silently passes in non-production | env.ts:16-23 | NOTED — low priority |
| MED-6 | useSignup Firebase user rollback is best-effort | useSignup.ts:46-70 | NOTED — ON CONFLICT handles re-register |
| MED-7 | CSP too permissive (allows any https: source) | nginx.conf.j2 | NOTED — requires infra deploy |
| MED-8 | ScanCarousel onMatchFound in deps causes re-renders | ScanCarousel.tsx:60 | FIXED — useRef pattern |
| MED-9 | Dashboard apiFetch doesn't handle 401 (expired token) | dashboard/page.tsx:223-235 | FIXED — 401 → redirect to /login |
| MED-10 | signal_votes FK missing ON DELETE CASCADE | 001_init.sql | FIXED — new migration 005_fk_cascade.sql |
| MED-11 | Admin email hardcoded in source | help.ts:60 | FIXED — uses env var with fallback |

### LOW

| # | Issue | File | Status |
|---|-------|------|--------|
| LOW-1 | Firebase client initializeApp runs before config check | firebase.ts:14 | FIXED — conditional init |
| LOW-2 | Postgres exposed on 5432 with default password | docker-compose.yml | NOTED — infra hardening |
| LOW-3 | Settings apiFetch sends Content-Type for DELETE | settings/page.tsx:41 | FIXED — conditional header |
| LOW-4 | verifyEmailTemplate escapes URL (correct for HTML attr) | email-templates.ts | NO FIX NEEDED |
| LOW-5 | Navbar dropdown not keyboard-accessible | Navbar.tsx | NOTED — future a11y pass |
| LOW-6 | Dead smtp.ts duplicates email service | notifications/smtp.ts | FIXED — deleted |

## Files Modified

- `services/api/src/server.ts` — Auth fallthrough fix, proper typing
- `services/api/src/types.d.ts` — requireAuth proper function type
- `services/api/src/routes/stripe.ts` — Webhook secret guard + uid warning
- `services/api/src/routes/bot.ts` — DNS SSRF check, QS allowlist
- `services/api/src/routes/help.ts` — safeParse, email try/catch, escapeHtml, rate limit cleanup, env admin email
- `services/api/src/routes/auth.ts` — ZodError field-only response
- `services/api/src/routes/portfolio.ts` — datetime validation
- `services/api/src/routes/publicFeed.ts` — filename allowlist
- `services/api/db/migrations/005_fk_cascade.sql` — FK cascade (new)
- `apps/web/app/lib/firebase.ts` — conditional initialization
- `apps/web/app/dashboard/page.tsx` — 401 redirect, useRouter import
- `apps/web/app/dashboard/layout.tsx` — stable interval deps, getFirebaseAuth
- `apps/web/app/dashboard/components/ScanCarousel.tsx` — onMatchFound ref
- `apps/web/app/settings/page.tsx` — conditional Content-Type
- `apps/web/app/ui/BillingButtons.tsx` — error handling
- `apps/web/app/api/public-feed/route.ts` — fetch error handling
- Deleted: `services/api/src/notifications/smtp.ts`

## Remaining Notes

- **CRIT-1**: Private keys on disk — user must rotate Firebase service account keys + VPS password manually
- **HIGH-5**: Stripe customer lookup by email — requires adding `stripe_customer_id` to DB schema (deferred)
- **MED-7**: CSP needs nginx config deploy (infra change, not code)
- **LOW-2**: Postgres port exposure — needs docker-compose production override
- **LOW-5**: Navbar accessibility — future sprint
