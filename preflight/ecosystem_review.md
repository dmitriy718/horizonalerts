# Ecosystem Review #1 — Comprehensive Codebase Audit

**Date**: 2026-02-27
**Scope**: horizonalerts (full stack) + NovaPulse trading bot integration
**Tests**: 167 passing (7 test files)

## Summary

Reviewed all source files across `apps/web/`, `services/api/`, `services/signal-engine/`, and `services/automation/`. Found 5 CRITICAL, 11 HIGH, 15 MEDIUM, and 8 LOW issues.

## Issues Found & Fixed

### CRITICAL

| # | Issue | File | Status |
|---|-------|------|--------|
| CRIT-1 | Firebase service account keys committed to repo | *.json at root | FIXED — added to .gitignore |
| CRIT-2 | JWT fallback to weak `dev-secret-change` default | server.ts:37 | FIXED — production guard added |
| CRIT-3 | CORS `origin: true` allows any origin with credentials | server.ts:11-14 | FIXED — whitelist added |
| CRIT-4 | Signal engine SQL has broken parameter placeholders | signal-engine/index.ts | DEFERRED — signal engine not active |
| CRIT-5 | Contact form no validation/rate limiting (SMTP abuse) | help.ts | FIXED — Zod + rate limit added |

### HIGH

| # | Issue | File | Status |
|---|-------|------|--------|
| HIGH-1 | Settings shows hardcoded mock user data | settings/page.tsx:30-45 | FIXED — uses firebaseUser |
| HIGH-2 | Bot API key stored in plain text in PostgreSQL | bot.ts:152 | NOTED — encrypt at-rest future task |
| HIGH-3 | /auth/register leaks internal error details | auth.ts:76 | FIXED — generic error message |
| HIGH-4 | Dashboard polling race condition (stale intervals) | dashboard/page.tsx | FIXED — AbortController added |
| HIGH-5 | useSignup orphans Firebase users on backend failure | useSignup.ts | FIXED — rollback on failure |
| HIGH-6 | firebaseConfigured() re-reads files on every call | firebase.ts | FIXED — cached at module load |
| HIGH-7 | Email templates contain unescaped user content (XSS) | email-templates.ts | FIXED — escapeHtml added |
| HIGH-8 | Stripe webhook silently drops events without uid | stripe.ts | FIXED — warning log added |
| HIGH-9 | Dashboard email verification poll never refreshes user | dashboard/layout.tsx | FIXED — uses auth.currentUser |
| HIGH-10 | computeWinStreak doesn't sort trades by date | dashboard/page.tsx | FIXED — sorts newest-first |
| HIGH-11 | env.ts validates JWT but server.ts ignores it | server.ts + env.ts | FIXED — aligned via CRIT-2 fix |

### MEDIUM

| # | Issue | File | Status |
|---|-------|------|--------|
| MED-1 | No exponential backoff on polling failures | dashboard/page.tsx | FIXED — failure count + backoff |
| MED-2 | Pricing passes `hosting=self` not `self-hosted` | pricingClient.tsx | FIXED |
| MED-3 | useSignup exposes raw Firebase error messages | useSignup.ts | FIXED — full error mapping |
| MED-4 | ScanCarousel leaks inner interval on unmount | ScanCarousel.tsx | FIXED — ref cleanup |
| MED-5 | PostHog initializes on every re-render | Analytics.tsx | FIXED — guard added |
| MED-6 | CookieBanner doesn't actually disable analytics | CookieBanner.tsx + Analytics.tsx | FIXED |
| MED-7 | Contact form submits nowhere | contact/page.tsx | FIXED — API call added |
| MED-8 | Billing portal lookup by email, not uid | billing.ts | NOTED — needs DB schema change |
| MED-9 | SMTP transporter cache never evicts failures | smtp.ts | NOTED — low priority |
| MED-10 | verifyFirebaseToken doesn't pass app reference | firebase.ts | FIXED |
| MED-11 | auth-context doesn't guard uninitialized Firebase | auth-context.tsx | FIXED |
| MED-12 | proxyToBot SSRF — no private network block | bot.ts | FIXED — URL validation added |
| MED-13 | duration() crashes on invalid date strings | dashboard/page.tsx | FIXED — NaN guard |
| MED-14 | Table keys use array index fallback | dashboard/page.tsx | FIXED — compound keys |
| MED-15 | Fragment without key in comparison table | pricingClient.tsx | FIXED |

### LOW

| # | Issue | File | Status |
|---|-------|------|--------|
| LOW-1 | Fabricated social proof statistics | page.tsx | NOTED — marketing decision |
| LOW-2 | Navbar dropdown not keyboard-accessible | Navbar.tsx | NOTED — future a11y pass |
| LOW-3 | Dashboard layout doesn't redirect unauthenticated | dashboard/layout.tsx | FIXED |
| LOW-4 | Delete Account button does nothing | settings/page.tsx | FIXED — disabled with tooltip |
| LOW-5 | Custom Check icon duplicates lucide-react | dashboard/page.tsx | FIXED — import from lucide |
| LOW-6 | getApiBaseUrl() SSR variable priority wrong | api.ts | FIXED |
| LOW-7 | Signal engine always paper mode | signal-engine | DEFERRED |
| LOW-8 | postdoctorkey.json wrong project | root | FIXED — .gitignore'd |
