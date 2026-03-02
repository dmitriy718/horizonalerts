# Horizon Alerts — Second Review Pass (Feb 28, 2026)

**10 issues found. 2 P0, 3 P1, 3 P2, 2 P3.**

---

## P0-1 — `loadAlertHistoryFromDb()` queries columns that do not exist in `email_log` schema

**File:** `services/api/src/services/bot-monitor.ts:44-48`
**Confidence:** 100%

The `loadAlertHistoryFromDb()` function queries three columns that don't match the actual `email_log` table:
- `user_id` → actual column is `uid`
- `created_at` → actual column is `sent_at`
- `type = 'alerts'` → no `type` column exists

PostgreSQL throws, caught and swallowed by try/catch. Alert dedup persistence is completely non-functional.

**Fix:** Change query to match actual schema:
```sql
SELECT DISTINCT ON (uid, subject) uid, subject, sent_at
FROM email_log
WHERE template NOT LIKE '%:skipped' AND sent_at > now() - interval '4 hours'
ORDER BY uid, subject, sent_at DESC
```

---

## P0-2 — CSV proxy endpoint returns `null` — download broken end-to-end

**File:** `services/api/src/routes/bot.ts:74,79,94`
**Confidence:** 100%

The CSV endpoint reuses `proxyToBot()` which hardcodes `Accept: "application/json"` and parses response as `.json()`. CSV text can't be parsed as JSON → `.catch()` returns `null` → browser downloads a file containing only `null`.

**Fix:** Add a dedicated CSV handler that doesn't reuse `proxyToBot()`. Stream the response as `text/csv` with proper Content-Disposition header.

---

## P1-1 — `PUT /me/profile` returns `{success:true}` but Settings page expects profile fields

**File (backend):** `services/api/src/routes/profile.ts:99`
**File (frontend):** `apps/web/app/settings/page.tsx:255-259`
**Confidence:** 100%

Backend returns `{ success: true }`. The "optimistic update fix" now uses server response:
```typescript
setProfileData(result);                    // { success: true }
setProfileFirstName(result.firstName || ""); // undefined → ""
```

Name goes blank after save. Regression introduced by the fix.

**Fix:** Backend should return the updated profile fields, or frontend should re-fetch after save.

---

## P1-2 — Past macro events produce "Blackout Active" alerts

**File:** `services/api/src/services/bot-monitor.ts:263-270`
**Confidence:** 95%

Past events have negative `hoursUntil`. Check `hoursUntil <= 1` is true for negative values → stale "Blackout Active" emails sent.

**Fix:** Add `if (hoursUntil < 0) continue;` before tier checks.

---

## P1-3 — `GET /auth/lock-status` has no rate limiting

**File:** `services/api/src/routes/auth.ts:188-220`
**Confidence:** 90%

Public, unauthenticated endpoint with DB query per request. Global 120 req/min allows ~7,200 queries/hour per IP.

**Fix:** Add `server.rateLimit({ max: 10, timeWindow: '1 minute' })` preHandler.

---

## P2-1 — Login rate limit per-IP only; per-email keying needed

**File:** `services/api/src/routes/auth.ts:82`
**Confidence:** 88%

Attacker with multiple IPs can exceed 5 attempts per email. Add `keyGenerator` that keys by email.

---

## P2-2 — `URL.revokeObjectURL` called synchronously after `a.click()`

**File:** `apps/web/app/dashboard/page.tsx:1059-1064`
**Confidence:** 88%

Download silently fails on Firefox/some Chromium. Revoke should be deferred with `setTimeout`.

---

## P2-3 — Unsubscribe HMAC reuses `JWT_SIGNING_KEY`

**File:** `services/api/src/services/unsubscribe.ts:3`
**Confidence:** 88%

Two security contexts share one key. Rotating JWT key invalidates all unsubscribe links.

**Fix:** Add dedicated `UNSUBSCRIBE_HMAC_SECRET` env var.

---

## P3-1 — Win Rate KPI sub-text color driven by P&L, not win rate

**File:** `apps/web/app/dashboard/page.tsx:748`
**Confidence:** 90%

Trade count under Win Rate card turns red when P&L is negative, even with high win rate.

---

## P3-2 — ShareButton clipboard API errors unhandled

**File:** `apps/web/app/components/ShareButton.tsx:29-32`
**Confidence:** 85%

`navigator.clipboard.writeText()` throws in non-secure contexts. No try/catch → silent failure.
