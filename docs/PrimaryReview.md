# Primary Code Review & Audit

## Authentication System
**Status:** 🔴 BROKEN / LEGACY

### Findings
1.  **User Interface:** The current `apps/web/app/login/page.tsx` is a debugging artifact, not a product feature. It exposes "Sign In", "Create Account", and "Sign Out" simultaneously in a confusing clutter. It lacks essential fields (Name, Age, Zip).
2.  **Email Delivery:**
    *   The system relies on client-side `sendEmailVerification` from Firebase, which sends generic templates (often hitting spam) instead of the custom SaaS-style HTML templates defined in `services/api/src/services/email-templates.ts`.
    *   There is no connection between the Frontend Signup event and the Backend Email Service.
3.  **Persistence:**
    *   Firebase defaults to `localPersistence` (forever).
    *   Requirement: `browserSessionPersistence` (logout on tab close).
4.  **Data Integrity:**
    *   User metadata (Name, Address, Zip) is not currently stored. Firebase Auth only stores Email/UID/Photo. We need a `users` table in Postgres to store this profile data linked to the Firebase UID.

## Plan of Action
1.  **Database:** Create `users` table in Postgres (Schema: uid, email, first_name, last_name, age, zip, is_premium, etc.).
2.  **API:** Implement `POST /auth/sync` (or `/register`) to save metadata and trigger the Custom Verification Email.
3.  **Frontend:** Rebuild `AuthPage` with Framer Motion (Slide transitions, glassmorphism). Implement `browserSessionPersistence`.
4.  **Testing:** Update Playwright to handle the new flow.

## Legacy Code Removal
*   `apps/web/app/login/page.tsx` -> Delete/Replace.
*   `apps/web/app/signup/page.tsx` -> Delete/Replace.
