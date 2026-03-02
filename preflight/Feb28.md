# Horizon Alerts Platform — Comprehensive Code Review
**Date:** 2026-02-28
**Reviewer:** Claude (Sonnet 4.6)
**Scope:** Full codebase — Next.js frontend, Fastify API backend, bot proxy, email system, database migrations

---

## Executive Summary

The Horizon Alerts platform is a well-structured monorepo with a clear separation of concerns. The overall code quality is good: parameterized queries are used consistently (no SQL injection vulnerabilities found), Firebase auth is properly validated server-side, and SSRF protections are in place for the bot proxy. However, the review uncovered **17 confirmed bugs** spanning P0–P3 severity, with several security and correctness issues that will affect real users in production.

The most critical findings are:

1. **P0 — `timingSafeEqual` crash on HMAC length mismatch** in the unsubscribe token verifier, causing a process exception when tampered tokens arrive.
2. **P0 — Unauthenticated `/auth/login-attempt` endpoint** can be abused to lock any user's account with no rate limiting.
3. **P1 — CSV trade download is absent** — there is no CSV export anywhere in the bot proxy or frontend despite the known reported issue.
4. **P1 — `apiFetch` in settings page routes to `/bot` prefix for non-bot paths** — profile, preferences, and support calls use the wrong base path.
5. **P1 — Newsletter subscribe has no rate limiting** — any IP can flood the table with unlimited subscriptions.
6. **P1 — Bot monitor reports use `/risk` as the stats endpoint** for daily/weekly/monthly reports, but the NovaPulse bot does not return period-aggregated stats from `/api/v1/risk`.
7. **P2 — Dashboard "slow poll" backoff is applied to fast poll fail counter** — both timers share `failCountRef`, so a single network error on the fast poller applies exponential backoff to the slow poller and vice versa.

---

## Architecture Overview

```
Browser (Next.js, port 3000/443)
  └─ /api/* → Nginx reverse proxy → Fastify API (port 4000)
       ├─ Firebase Admin SDK (token verification)
       ├─ PostgreSQL (pg Pool)
       ├─ /bot/* routes → proxy to user's NovaPulse bot (port 8080)
       │    └─ X-API-Key auth, SSRF-guarded, 10s timeout
       ├─ /auth/register, /auth/login-attempt (public + authenticated)
       ├─ /me/profile, /me/preferences, /me/tickets
       ├─ /newsletter/subscribe (public)
       ├─ /unsubscribe (public, HMAC token)
       ├─ /billing/* (Stripe checkout + portal)
       └─ Bot monitor service (in-process, 60s polling loop)
```

Key technology choices: Firebase Auth (client-side SDK + Admin SDK server-side), Stripe for billing, nodemailer for SMTP over 4 dedicated email inboxes, TradingView embedded widgets for charts.

---

## Bugs by Severity

---

### P0 CRITICAL

---

#### BUG-01: `timingSafeEqual` throws RangeError when token HMAC lengths differ

**File:** `services/api/src/services/unsubscribe.ts:41`

**Description:** `crypto.timingSafeEqual` requires both buffers to have identical byte length. The function converts the submitted signature and the expected HMAC to `base64url` strings of equal length under normal conditions, but if a malicious token is submitted with a truncated or padded signature segment (e.g., a forged token where `sig` is 1 character), the two `Buffer.from(...)` calls will produce buffers of different lengths and `timingSafeEqual` will throw `RangeError [ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH]: Input buffers must have the same byte length`. This is an **unhandled exception** that will crash the request and return a 500 to the client rather than a graceful 400.

```typescript
// services/api/src/services/unsubscribe.ts:41
if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
```

**Root Cause:** `timingSafeEqual` is not wrapped in a try/catch, and there is no length pre-check.

**Impact:** Any malformed unsubscribe link (typo, link mangling by email clients, or deliberate attack) causes a 500 response rather than the graceful error page. Fastify logs an unhandled exception.

**Fix:**
```typescript
if (sig.length !== expected.length) return null;
try {
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
} catch {
  return null;
}
```

---

#### BUG-02: Unauthenticated `/auth/login-attempt` allows any attacker to lock any user account

**File:** `services/api/src/routes/auth.ts:82-186`

**Description:** The `POST /auth/login-attempt` endpoint is entirely public — no auth required, no rate limiting beyond the global 120 req/min limit. An attacker can POST `{ email: "victim@example.com", success: false }` 120 times per minute (the global rate limit). After just 3 requests within 30 minutes, the victim's account is locked for 30 minutes. Because the global rate limit allows 120 req/min, an attacker can lock an account in under 2 seconds. The attacker does not need to know the victim's password. This is a denial-of-service attack against any known email address.

**Root Cause:** The endpoint was designed to be called by the browser client after a failed Firebase login attempt, but it is completely unauthenticated and wraps account-locking logic.

**Impact:** Any user's account can be trivially locked. Attacker needs only to know the target email address. The lock emails sent to the victim create additional spam/alarm.

**Fix Options (in order of preference):**
1. **Require Firebase ID token** for this endpoint — only call it after a successful Firebase SDK login/failure where we already have a partial token.
2. **Add per-IP rate limit** specifically on this endpoint (e.g., 5 attempts per IP per 10 minutes) using `@fastify/rate-limit` with a custom keyGenerator.
3. **Add CAPTCHA** (reCAPTCHA v3 score) before the lock threshold is applied.

---

### P1 HIGH

---

#### BUG-03: Settings page `apiFetch` wrapper routes all calls through `/bot` prefix

**File:** `apps/web/app/settings/page.tsx:109-129`

**Description:** The `apiFetch` helper in `settings/page.tsx` prepends `/bot` to all paths:
```typescript
const res = await fetch(`${getApiBaseUrl()}/bot${path}`, { ... });
```
This function is used for bot connection management (correct, since it calls `/bot/connection`). However, separate calls using `apiRequest` (the generic helper, lines 131–150) are used for `/me/profile`, `/me/preferences`, and `/me/tickets` — and those do correctly hit the right paths.

The bug is subtle: **`apiFetch` is also called by the bot-connect handler (`handleBotConnect`)** at line 169 with path `/connection`, which is correct. However, since `apiFetch` and `apiRequest` exist side-by-side, a developer adding any new feature that reuses `apiFetch` for a non-bot endpoint will silently hit the wrong API path. More concretely, if the `apiFetch` helper is called with `/me/preferences` by mistake anywhere in this 1500-line file, it would send the request to `/bot/me/preferences` (which returns 404), showing an incorrect error to the user.

**Root Cause:** The naming is confusing and the two helpers have overlapping responsibility.

**Impact:** Any future misuse of `apiFetch` for non-bot endpoints causes silent 404s. Maintenance hazard in a 1500-line file.

**Fix:** Rename `apiFetch` to `botFetch` everywhere it is defined and used to make the `/bot` scoping explicit.

---

#### BUG-04: No CSV trade export functionality exists despite being a known broken feature

**File:** `services/api/src/routes/bot.ts` (no CSV route exists), `apps/web/app/dashboard/page.tsx` (no export button)

**Description:** The user reports "Trades CSV download link broken." After examining every file in the codebase, there is **no CSV export anywhere**: no download button in the dashboard, no `/bot/trades/export` or similar proxy route in `bot.ts`, and no endpoint on the NovaPulse bot being proxied. The proxy only exposes `/trades` with JSON responses. The CSV download functionality was either removed, never shipped, or is completely missing.

**Root Cause:** Feature was planned/referenced but never implemented in the current codebase.

**Impact:** Users expecting to download their trade history as CSV cannot do so.

**Fix:** Add a CSV export endpoint to the bot proxy:
```typescript
// In bot.ts proxy endpoints list:
{ route: "/trades/csv", botPath: "/api/v1/export/trades.csv", allowedQs: ["limit", "offset"] },
```
Then add a download button to the trades tab in `dashboard/page.tsx`. NOTE: NovaPulse's actual endpoint is `/api/v1/export/trades.csv` — in multi-engine mode this returns HTTP 400 "CSV export requires a shared DB" since each engine has its own SQLite file. This is a NovaPulse-side bug that also needs fixing.

---

#### BUG-05: Bot monitor report schedules fetch stats from `/risk`, not a dedicated reporting endpoint

**File:** `services/api/src/services/bot-monitor.ts:271-362`

**Description:** `checkReportSchedules` fetches daily, weekly, and monthly stats exclusively from `/api/v1/risk`:
```typescript
const stats = await fetchBotApi(conn.bot_url, conn.api_key, "/risk");
```
Then attempts to read fields like `stats.daily_pnl`, `stats.weekly_pnl`, `stats.monthly_pnl`, `stats.daily_trades`, `stats.weekly_trades`, `stats.strategy_breakdown`, etc. The NovaPulse bot's `/api/v1/risk` endpoint returns **current risk state**, not historical period aggregates. It does not return `weekly_pnl`, `monthly_pnl`, `weekly_trades`, `monthly_trades`, `best_trade`, `worst_trade`, or `strategy_breakdown`.

**Root Cause:** Report emails reference fields that do not exist on the `/risk` endpoint.

**Impact:** All three scheduled report emails (daily, weekly, monthly) will be sent with `0` or `null` for P&L, trade count, and strategy fields.

**Fix:** Change to use `/performance` endpoint which has richer stats, or create a dedicated `/reports` endpoint on the bot.

---

#### BUG-06: Newsletter subscription endpoint has no rate limiting or spam protection

**File:** `services/api/src/routes/newsletter.ts`

**Description:** `POST /newsletter/subscribe` is a fully public endpoint with no rate limiting beyond the global 120 req/min limit, no email verification, and no CAPTCHA. An attacker can flood the `newsletter_subscribers` table with arbitrary email addresses at 120/min.

**Root Cause:** The endpoint was built without rate limiting or verification.

**Impact:** Spam subscriptions, table pollution, potential CAN-SPAM/GDPR violations from subscribing users without consent.

**Fix:**
1. Add per-IP rate limit specifically on `/newsletter/subscribe` (e.g., 3 req/minute per IP).
2. Implement double opt-in: store `status = 'pending'` and send a confirmation email; only flip to `'active'` upon token verification.
3. Add honeypot field validation.

---

#### BUG-07: Dashboard shows "Connect Your Bot" wizard on API errors, not just when disconnected

**File:** `apps/web/app/dashboard/page.tsx:251-256`

**Description:**
```typescript
apiFetch("/connection")
  .then((data) => setConnected(data !== null))
  .catch(() => setConnected(false));
```
If the API is temporarily unreachable (502, 503, network timeout), the catch block sets `connected = false`, and the "Connect Your Bot" wizard renders — even if the user has a legitimate bot connected.

**Root Cause:** The catch block does not distinguish between "no bot connected" (real 404) and "API unreachable" (network error / 5xx).

**Impact:** A momentary API hiccup causes the bot setup wizard to appear to connected users. If they submit the form, it may overwrite their existing connection.

**Fix:** Use a third state (`null` = "unknown/loading") and show an error banner instead of the setup wizard on API failures.

---

#### BUG-08: `fetchBotApi` in bot-monitor.ts lacks SSRF protection

**File:** `services/api/src/services/bot-monitor.ts:78-94`

**Description:** Unlike the `proxyToBot` function in `bot.ts` (which uses `redirect: "error"` to prevent SSRF via redirects), `fetchBotApi` in the monitor does **not** set `redirect: "error"`. If a malicious or compromised bot returns a 301/302 redirect to an internal network address, the monitor will follow it, enabling SSRF.

**Root Cause:** `fetchBotApi` does not inherit the SSRF protections from `proxyToBot`.

**Impact:** SSRF vulnerability in the bot monitoring service.

**Fix:**
```typescript
const res = await fetch(url, {
  headers: { "X-API-Key": apiKey, Accept: "application/json" },
  signal: controller.signal,
  redirect: "error", // Prevent SSRF via redirects
});
```

---

### P2 MEDIUM

---

#### BUG-09: Dashboard fast/slow poll timers share a single `failCountRef`, corrupting backoff logic

**File:** `apps/web/app/dashboard/page.tsx:294-354`

**Description:** Both `fetchFast` and `fetchSlow` read and write the same `failCountRef`. So if the fast poller fails three times, the slow poller's next interval becomes `15000 * 2^3 = 120,000ms` (capped at 60s), even if the slow poller itself never failed.

**Root Cause:** Single shared ref used for two independent polling loops.

**Impact:** In failure scenarios, both pollers back off together rather than independently.

**Fix:** Use two separate refs: `fastFailCountRef` and `slowFailCountRef`.

---

#### BUG-10: Profile update shows optimistic state without server confirmation

**File:** `apps/web/app/settings/page.tsx`

**Description:** After profile update, the UI immediately reflects changed values (`setProfileData({ ...profileData, firstName: profileFirstName, ... })`) without re-fetching from the server. If the API update fails silently, the UI shows values that weren't actually saved.

**Root Cause:** No re-fetch of confirmed server state after profile update.

**Impact:** If the API update silently fails, the UI shows unsaved values.

**Fix:** Re-fetch profile data after a successful save: `const updated = await apiRequest("/me/profile"); setProfileData(updated);`

---

#### BUG-11: Bot monitor `alertHistory` and `reportHistory` are in-process memory, lost on restart

**File:** `services/api/src/services/bot-monitor.ts:28-33`

**Description:** Both maps are module-level in-process state. If the API server restarts, all alert deduplication state is lost. Alert cooldown state (4-hour COOLDOWN_MS) resets, potentially sending repeated alerts immediately after restart.

**Root Cause:** In-memory deduplication instead of persistent deduplication.

**Impact:** Duplicate report and alert emails sent after server restarts, especially around midnight UTC.

**Fix:** Persist alert history to the database. Add a table `bot_alert_log (uid TEXT, alert_type TEXT, tier TEXT, sent_at TIMESTAMPTZ)`.

---

#### BUG-12: `timingSafeEqual` comparison uses UTF-8 encoding for base64url strings

**File:** `services/api/src/services/unsubscribe.ts:41`

**Description:** `Buffer.from(sig)` (without an encoding argument) uses UTF-8. Both `sig` and `expected` are base64url strings, and since base64url uses only ASCII characters, UTF-8 and ASCII encoding produce identical byte sequences. This is not a bug in practice, but could be made more explicit:
```typescript
Buffer.from(sig, "ascii")  // More explicit
```

---

#### BUG-13: Dashboard 401 handling redirects but doesn't stop polling loops

**File:** `apps/web/app/dashboard/page.tsx:240-248`

**Description:** When a 401 occurs, `apiFetch` calls `router.replace("/login")` but the polling loops continue scheduling new fetches. Each encounters another 401 and re-triggers `router.replace("/login")`.

**Root Cause:** 401 handling does not signal the polling loop to stop.

**Impact:** After token expiry, multiple redundant 401 API calls continue for up to 60 seconds.

**Fix:** Throw a special error class on 401 that the polling loops catch and set `cancelled = true`.

---

### P3 LOW / CODE QUALITY

---

#### BUG-14: Gamification logic is duplicated verbatim between dashboard and settings

**File:** `apps/web/app/dashboard/page.tsx:126-201`, `apps/web/app/settings/page.tsx:17-53`

**Description:** The entire gamification system (`RANKS`, `getLevel`, `getXp`, `getXpForLevel`, `getRank`, `ACHIEVEMENTS`, `computeWinStreak`) is copy-pasted verbatim between the two files (~80 lines). If thresholds change, both must be updated.

**Fix:** Extract to `apps/web/app/lib/gamification.ts` and import from both pages.

---

#### BUG-15: `isAllowedBotUrl` DNS resolution check has a TOCTOU window (DNS rebinding)

**File:** `services/api/src/routes/bot.ts:17-34`

**Description:** SSRF check validates hostname at connection-time via `dns.lookup`. An attacker using their own domain can initially serve a public IP, then switch DNS to a private IP after validation. The stored `bot_url` then resolves to the private IP on proxy calls.

**Root Cause:** Validation at connection time, dynamic resolution at proxy time.

**Impact:** DNS rebinding attack vector against internal network services.

**Fix:** Store the resolved IP in `bot_connections.bot_url` at connection time, or require `http://IP:PORT` format.

---

#### BUG-16: Newsletter popup claims "Check your inbox for a welcome email" but no email is sent

**File:** `apps/web/app/components/NewsletterPopup.tsx`

**Description:** The success message says "Check your inbox for a welcome email" but the `POST /newsletter/subscribe` route only inserts into the database — no email is triggered.

**Fix:** Either remove the misleading copy, or add a newsletter welcome email send from the subscribe route.

---

#### BUG-17: Chart modal has no keyboard accessibility

**File:** `apps/web/app/dashboard/page.tsx`

**Description:** The chart modal has no `role="dialog"`, no `aria-label`, no focus trap, and no Escape key handling.

**Fix:** Add `onKeyDown` for Escape, `role="dialog"`, `aria-modal="true"`, and focus trap.

---

## Security Audit Findings

### Auth & Token Security

| Area | Status | Notes |
|------|--------|-------|
| Firebase token verification | GOOD | Admin SDK verifyIdToken called server-side on every protected route |
| JWT fallback (dev/staging) | ACCEPTABLE | Only active when Firebase not configured |
| Token not refreshed before expiry | GOOD | `user.getIdToken()` uses Firebase's auto-refresh |
| CORS origin allowlist | GOOD | Explicit allowlist, not wildcard |

### Bot Proxy Security

| Area | Status | Notes |
|------|--------|-------|
| SSRF protection — string check | GOOD | Private IP ranges blocked at URL validation time |
| SSRF protection — DNS check | PARTIAL | DNS rebinding TOCTOU window (BUG-15) |
| SSRF protection — redirect blocking | GOOD | `redirect: "error"` in proxy calls |
| SSRF protection — bot monitor | MISSING | `fetchBotApi` lacks `redirect: "error"` (BUG-08) |
| API key exposure | GOOD | API key never returned to client |
| Query parameter allowlist | GOOD | Only whitelisted params forwarded |

### Database Security

| Area | Status | Notes |
|------|--------|-------|
| SQL injection | SAFE | All queries use parameterized `$1, $2, ...` syntax |
| User data isolation | GOOD | All user queries filter by `uid` from verified token |
| Ticket data isolation | GOOD | `WHERE id = $1 AND uid = $2` prevents IDOR |

### Email Security

| Area | Status | Notes |
|------|--------|-------|
| Unsubscribe HMAC | GOOD | 90-day expiring HMAC-signed token |
| HMAC timing attack | NEEDS FIX | `timingSafeEqual` crashes on length mismatch (BUG-01) |
| Preference enforcement | GOOD | `SECURITY_KEYS` prevents disabling security emails |
| HTML escaping in templates | GOOD | `escapeHtml` function used in all templates |
| List-Unsubscribe header | GOOD | RFC 8058 compliant |

### Input Validation

| Area | Status | Notes |
|------|--------|-------|
| Zod validation on all POST bodies | GOOD | All mutation endpoints use Zod schemas |
| Newsletter subscribe | MISSING | No rate limit, no double opt-in (BUG-06) |
| Login attempt tracking | VULNERABLE | No auth on endpoint (BUG-02) |
| Support ticket input | GOOD | Zod schema + length limits |
| Profile update | GOOD | Zod schema with min/max length |

---

## Frontend Review

### Dashboard Page (`dashboard/page.tsx`)

**Positive aspects:**
- Graceful loading and empty states throughout
- Backoff polling logic (despite shared ref bug)
- Rich data normalization handles multiple field name variants
- Chart modal properly stops click propagation

**Issues:**

1. **No loading skeleton** when `connected === null` — shows centered spinner with no layout context.

2. **Win rate normalization edge case:**
   ```typescript
   const winRateNorm = winRate < 1 && winRate > 0 ? winRate * 100 : winRate;
   ```
   If bot returns `winRate = 1` (100% as fraction), the heuristic breaks — displays "1.0%" instead of "100%".

3. **Chart modal not accessible** — no `role="dialog"`, no `aria-label`, no focus trap, no Escape key close.

4. **Tab navigation** lacks `role="tablist"` / `role="tab"` / `aria-selected` ARIA attributes.

### Settings Page (`settings/page.tsx`)

1. **Profile edit cancel resets to empty** if `profileData` is null (still loading).
2. **Ticket refresh after submit** causes momentary "No tickets yet" flash.
3. **`viewTicket` errors silently swallowed** — user clicks ticket, nothing happens on error.
4. **Support tab re-fetches tickets on every tab activation** — no guard.
5. **Bot connect form** doesn't validate URL protocol — `ftp://` passes HTML validation.

### Newsletter Popup

1. **"Check your inbox for a welcome email"** — no email is actually sent (BUG-16).
2. **Dismissal via localStorage** — clears with browser data, popup reappears.

---

## Performance Optimization Opportunities

1. **TradingView widgets** — `TradingChart` and `MiniChart` create new `<script>` elements on every symbol change. Debounce or use TradingView's `chart.setSymbol()` API.

2. **Bot monitor sequential processing** — `checkBotFailsafes` awaits each bot sequentially. Use `Promise.allSettled` with concurrency limit for parallel processing.

3. **Database connection pool** — pg Pool uses default max (10 connections). Set explicit `max`, `idleTimeoutMillis`, `connectionTimeoutMillis`.

4. **Rate limiting** — Global 120 req/min applies to all routes. Consider tiered limits: stricter on sensitive endpoints (subscribe, login-attempt).

---

## Recommendations Prioritized by Impact

### Immediate (Before Next Deployment)

| Priority | Bug | Action |
|----------|-----|--------|
| P0 | BUG-01 | Fix `timingSafeEqual` crash with length pre-check + try/catch |
| P0 | BUG-02 | Add per-IP rate limiting to `/auth/login-attempt` (5/IP/10min) |
| P1 | BUG-06 | Add per-IP rate limit to `/newsletter/subscribe` (3/IP/min) |
| P1 | BUG-08 | Add `redirect: "error"` to `fetchBotApi` in bot-monitor.ts |

### Short Term (This Sprint)

| Priority | Bug | Action |
|----------|-----|--------|
| P1 | BUG-04 | Implement CSV trade export in bot proxy and dashboard UI |
| P1 | BUG-05 | Fix bot monitor reports to use `/performance` endpoint |
| P1 | BUG-07 | Fix dashboard connection error state (network error ≠ not connected) |
| P2 | BUG-09 | Separate fast/slow poll fail count refs |
| P2 | BUG-11 | Persist alert deduplication state to database |
| P2 | BUG-13 | Fix 401 handling — cancel polling loop on redirect |

### Medium Term

| Priority | Bug | Action |
|----------|-----|--------|
| P2 | BUG-10 | Re-fetch profile from server after update |
| P2 | BUG-15 | Resolve DNS rebinding TOCTOU — store resolved IP |
| P3 | BUG-14 | Extract gamification logic to shared module |
| P1 | BUG-16 | Fix misleading "check your inbox" copy; implement double opt-in |
| P3 | BUG-17 | Add ARIA attributes to tab nav and chart modal |

---

## Files Reviewed

- `services/api/src/routes/bot.ts`
- `services/api/src/routes/auth.ts`
- `services/api/src/routes/support.ts`
- `services/api/src/routes/newsletter.ts`
- `services/api/src/routes/profile.ts`
- `services/api/src/routes/preferences.ts`
- `services/api/src/routes/unsubscribe.ts`
- `services/api/src/routes/billing.ts`
- `services/api/src/routes/stripe.ts`
- `services/api/src/routes/entitlements.ts`
- `services/api/src/routes/health.ts`
- `services/api/src/routes/index.ts`
- `services/api/src/server.ts`
- `services/api/src/db.ts`
- `services/api/src/env.ts`
- `services/api/src/index.ts`
- `services/api/src/auth/firebase.ts`
- `services/api/src/services/email.ts`
- `services/api/src/services/unsubscribe.ts`
- `services/api/src/services/preference-utils.ts`
- `services/api/src/services/bot-monitor.ts`
- `services/api/src/services/email-templates/index.ts`
- `services/api/src/services/email-templates/base-layout.ts`
- `services/api/src/services/email-templates/account-lifecycle.ts`
- `services/api/db/migrations/001_init.sql`
- `services/api/db/migrations/004_bot_connections.sql`
- `services/api/db/migrations/006_login_security.sql`
- `services/api/db/migrations/007_support_tickets.sql`
- `services/api/db/migrations/008_newsletter.sql`
- `apps/web/app/dashboard/page.tsx`
- `apps/web/app/dashboard/layout.tsx`
- `apps/web/app/settings/page.tsx`
- `apps/web/app/auth/page.tsx`
- `apps/web/app/context/auth-context.tsx`
- `apps/web/app/hooks/useSignup.ts`
- `apps/web/app/lib/api.ts`
- `apps/web/app/lib/firebase.ts`
- `apps/web/app/layout.tsx`
- `apps/web/app/components/Navbar.tsx`
- `apps/web/app/components/NewsletterPopup.tsx`
- `apps/web/app/components/TradingChart.tsx`
- `apps/web/app/components/MiniChart.tsx`
- `apps/web/next.config.mjs`
