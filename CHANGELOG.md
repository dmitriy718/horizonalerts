# Changelog

All notable changes to HorizonAlerts are documented in this file.

---

## v1.1.0 (2026-03-01) — Security, SEO & Performance Sweep

Three-round deep review covering security hardening, GDPR compliance, SEO improvements, and performance optimizations across the full stack (Next.js frontend, Fastify API, PostgreSQL, Firebase Auth, Stripe billing).

### Security — Critical

- **SSRF scheme restriction in bot proxy** — `isAllowedBotUrl()` now only allows `http:` and `https:` schemes; previously accepted `file://`, `ftp://`, `data:`, and `javascript:` URLs from authenticated users
- **Checkout session requires email verification** — `POST /billing/checkout-session` and `/portal-session` now check `email_verified` before creating Stripe sessions; unverified accounts could previously initiate checkout via direct API calls
- **Stripe subscription metadata fixed** — added `subscription_data: { metadata: { uid } }` to checkout session creation; Stripe does not copy session metadata to subscriptions, so the webhook handler was silently dropping subscriptions without uid; added fallback to resolve uid via customer email lookup
- **GDPR: PostHog analytics gated on explicit consent** — analytics only initializes after the user explicitly opts in (`consent === "true"`); previously initialized when consent was `null` (first-time visitors), capturing page views before any consent interaction
- **XSS pattern fixed in TradingView widgets** — `script.innerHTML` changed to `script.textContent` in `TradingChart.tsx` and `MiniChart.tsx`; added `useEffect` cleanup to prevent widget and event listener leaks on unmount
- **CSP granular domain allowlist** — replaced blanket `https:` source in Content-Security-Policy with explicit allowlist of trusted domains (Firebase, Stripe, PostHog)

### Security — High

- **Scanner Pro feed entitlement check** — `GET /scanner/` now verifies active Pro subscription via `stripe_entitlements` query before returning live signals; previously returned data to any verified-email user
- **Global unsubscribe no longer bypasses security emails** — `isPreferenceEnabled()` now checks `SECURITY_KEYS` (account_locked, failed_login) before evaluating `global_unsubscribe`, ensuring mandatory security notifications are always delivered
- **HMAC buffer encoding fixed** — unsubscribe token verification now uses `Buffer.from(sig, "base64url")` instead of implicit UTF-8 interpretation for correct constant-time comparison
- **Dashboard non-null assertion safety** — `user!.getIdToken()` changed to `user?.getIdToken()` (optional chaining) to prevent runtime crashes when user signs out in another tab
- **Consistent auth redirects** — unified all authentication redirects to `/auth`; previously logout went to `/auth` but unauthenticated dashboard access went to `/login`
- **Duplicate subscription prevention** — billing routes now check for existing active subscriptions before creating new checkout sessions

### Performance

- **Bot monitor batched concurrent checks** — failsafe HTTP calls changed from sequential to concurrent batches of 10 using `Promise.allSettled()`; monitoring N users no longer takes N * 10s
- **Profile update single round-trip** — `PUT /me/profile` reduced from 3 sequential DB queries to a single `UPDATE ... RETURNING first_name, last_name, email`
- **Database index on bot_connections.status** — added index for the `WHERE status = 'active'` query executed every 60 seconds by the bot monitor
- **DB pool error handler and timeouts** — added explicit error handling and timeout configuration to the database connection pool
- **SMTP transporter caching** — email service now caches the SMTP transporter instead of creating a new connection per email

### SEO

- **Root layout metadata** — added full Open Graph, Twitter Card, keywords, `metadataBase`, `robots`, and `title.template` to the root layout for proper social media sharing
- **Dashboard excluded from indexing** — added dynamic `<meta name="robots" content="noindex, nofollow">` via `useEffect` to dashboard layout; updated `robots.ts` to disallow `/dashboard`, `/settings`, `/auth`, `/onboarding`, `/login`
- **Sitemap improvements** — added missing pages (`/about`, `/cookies`, `/dmarc`) with proper `priority` and `changeFrequency` values
- **JSON-LD structured data** — added SoftwareApplication schema to homepage and Product schema to pricing page for rich search results
- **Academy and blog metadata** — added proper `Metadata` exports with titles, descriptions, and OpenGraph tags for social sharing

### Infrastructure

- **Contact and ticket email templates** — added proper email templates for contact form submissions and support ticket notifications

### Files Modified (21)

| File | Changes |
|------|---------|
| `services/api/src/routes/bot.ts` | SSRF scheme restriction |
| `services/api/src/routes/billing.ts` | Email verification, subscription_data metadata, duplicate prevention |
| `services/api/src/routes/scanner.ts` | Pro entitlement check |
| `services/api/src/routes/stripe.ts` | Webhook uid fallback via customer email |
| `services/api/src/routes/profile.ts` | RETURNING optimization (3 to 1 DB queries) |
| `services/api/src/services/preference-utils.ts` | Security keys bypass global_unsubscribe |
| `services/api/src/services/unsubscribe.ts` | Buffer encoding fix |
| `services/api/src/services/bot-monitor.ts` | Concurrent batch failsafe checks |
| `services/api/db/migrations/004_bot_connections.sql` | Status index |
| `apps/web/app/layout.tsx` | Full OG/Twitter/SEO metadata with keywords |
| `apps/web/app/dashboard/layout.tsx` | noindex meta tag, unified auth redirect |
| `apps/web/app/dashboard/page.tsx` | Optional chaining null safety |
| `apps/web/app/robots.ts` | Disallow private routes |
| `apps/web/app/sitemap.ts` | Priority, changeFrequency, missing pages |
| `apps/web/app/page.tsx` | JSON-LD structured data |
| `apps/web/app/pricing/page.tsx` | Typed metadata, JSON-LD, OG tags |
| `apps/web/app/academy/page.tsx` | Page metadata, OG tags |
| `apps/web/app/blog/page.tsx` | Page metadata, OG tags |
| `apps/web/app/ui/Analytics.tsx` | GDPR consent gating |
| `apps/web/app/components/TradingChart.tsx` | textContent, cleanup on unmount |
| `apps/web/app/components/MiniChart.tsx` | textContent, cleanup on unmount |

### Known Issues (Not Addressed — Require Architectural Changes)

1. **Committed secrets in git history** — Firebase service account keys and VPS password need manual rotation + `git filter-repo` purge
2. **Login-attempt lockout DoS** — client-reported `success: boolean` allows account locking; needs server-side lockout logic
3. **Bot API keys in plaintext** — needs AES-256-GCM encryption at rest
4. **Bot monitor DNS rebinding** — stored `bot_url` fetched without re-validation
5. **User enumeration** — proactive lock-status check on email input

---

*Generated 2026-03-01. See `preflight/Mar01.md` for the detailed code review report.*
