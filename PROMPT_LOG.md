# Prompt Log — Sessions Marketplace Assignment

This document logs the AI-assisted workflow used to build this project. Two AI tools were used in combination:

- **Claude** — used for planning, breaking the assignment down into an execution plan, drafting prompts, and debugging/decision support throughout the build.
- **Antigravity** — used as the execution agent that actually wrote code, scaffolded the project, and ran builds based on prompts derived from the Claude-assisted plan.

The process was: assignment PDF → Claude (plan + first prompt) → Antigravity (execution) → Claude (review/debug/next prompt) → Antigravity (execution) → repeat.

---

## 1. Initial Planning (Claude)

**Input:** The assignment PDF (Full-Stack Developer Intern Assignment — Sessions Marketplace) was given to Claude with the goal of producing an execution plan and a single detailed prompt for Antigravity to build the whole system.

**Claude's output:** A 6-step build plan prioritized by point value and risk:
1. Docker skeleton (frontend, backend, db, nginx) — verified to boot first, before any feature work.
2. Django models + DRF CRUD for Sessions/Bookings/Profile.
3. Google OAuth + JWT issuance + role-based permission enforcement.
4. Next.js frontend pages (Catalog, Session Detail, User Dashboard, Creator Studio).
5. README + `.env.example`, written incrementally rather than at the end.
6. Bonus: Stripe test-mode checkout, DRF rate throttling (MinIO/S3 deprioritized as lowest point value relative to setup time).

A single comprehensive prompt was generated for Antigravity covering all 6 steps with explicit tech stack constraints (Next.js, Django + DRF, PostgreSQL, Docker Compose, Nginx reverse proxy, Google OAuth → backend-issued JWT).

---

## 2. Execution Prompt #1 — Full Build (Antigravity)

The full 6-step prompt from planning was handed to Antigravity in one pass, instructing it to:
- Build the Docker skeleton first and confirm `docker-compose up --build` works before continuing.
- Implement Django models (User/role, Session, Booking) and DRF ViewSets with custom permission classes (`IsCreator`, `IsOwnerOrReadOnly`) and throttling.
- Implement Google OAuth verification on the backend, issuing a custom JWT.
- Build the 4 required frontend pages wired to the API.
- Write the README and `.env.example` alongside the code, not after.

**Result reported by Antigravity:** All 4 Docker services running and verified (Postgres healthy, Django responding on `/api/sessions/`, Next.js serving, Nginx proxying). Core CRUD, auth flow, role permissions, rate throttling, and all 4 pages implemented.

---

## 3. Verification Pass (Claude)

Claude reviewed the "complete" report and flagged that curl checks only proved the server boots, not that the app actually works end-to-end. Follow-up verification steps were specified:
- Test real Google OAuth login, not just API health checks.
- Test that a non-creator user gets a `403` when hitting creator-only endpoints directly (not just that the UI hides the button).
- Confirm a booking actually persists and appears in both the User Dashboard and the Creator's booking overview.
- Confirm `.env.example` (not `.env`) is what's tracked for commit, and `.env` is gitignored.
- Run `docker-compose down -v && docker-compose up --build` from a cold state to confirm true one-command reproducibility (not just a warm/cached run).

---

## 4. Visual Design Pass (Antigravity)

**Issue flagged:** the UI looked like a default AI-generated scaffold.

**Prompt given to Antigravity** (styling-only, explicitly scoped to not touch backend/API/auth logic):
1. Apply a distinctive Google Font pairing (Playfair Display for headings, Inter for body) site-wide.
2. Establish one accent color (Violet `#7C3AED`) used only for primary CTAs/active states, against a dark charcoal background.
3. Build a real hero section on the Home page (headline, subhead, CTA, radial gradient background) instead of jumping straight into a card grid.
4. Increase whitespace/padding throughout.
5. Add subtle hover/transition micro-interactions (200ms ease) on cards and buttons.
6. Introduce a "Featured" larger card for the first session, with the rest in a uniform grid below it.

**Result:** Reported complete — typography, color system, hero section, featured card layout, spacing, and hover/transition states all implemented.

---

## 5. Content & Consistency Fix Pass (Antigravity)

**Issue flagged:** Even after the visual pass, the app still felt "generic" while interacting with it — this was traced to two separate problems: (a) sparse/placeholder dummy content with no real images, and (b) inconsistent application of the new design system across inner pages (Dashboard/Creator Studio still reading as default-styled).

**Prompt given to Antigravity:**
1. Seed 6–8 realistic dummy sessions (real-sounding titles, varied prices/dates/descriptions) via a Django management command or fixture, using Unsplash/Picsum image URLs to eliminate broken image placeholders.
2. Audit that the Playfair Display/Inter fonts and violet accent color are actually rendering (via computed styles) on every page, not just the home page.
3. Add designed empty states (icon + message + CTA) for "no bookings yet" / "no sessions yet" scenarios instead of blank/raw-text states.
4. Ensure Dashboard and Creator Studio use the same design system as the Home page (font, color, card style, spacing).
5. Fix any 404'ing images.

**Result:** Reported complete.

---

## 6. Git History & GitHub Setup (Claude, manual execution by developer)

Rather than padding commit count artificially (an approach Claude explicitly declined to help with when first requested), the existing single-commit working tree was restructured into ~10 commits reflecting the actual logical build stages already completed:

1. Initial project setup: env config and gitignore
2. Add docker-compose with frontend, backend, db, nginx services
3. Add Dockerfiles and nginx reverse proxy config
4. Define Django models: User roles, Session, Booking
5. Add Sessions CRUD API with DRF viewsets
6. Add Bookings API and user booking history
7. Add role-based permissions and rate throttling
8. Add Django project config (urls, wsgi) and requirements
9. Add Next.js project config and dependencies
10. Build frontend pages: catalog, session detail, dashboards, OAuth, and visual design
11. Add README with setup, OAuth instructions, demo flow, API reference
12. Add seed data, fix images, and polish visual consistency across pages

Repository created and pushed to: `https://github.com/Himanshugulhane27/Sessions-Marketplace`

---

## 7. Bonus: Stripe Test-Mode Checkout (Antigravity)

With additional time available beyond the original estimate, the Stripe bonus feature (deprioritized earlier in favor of core requirements) was implemented.

**Prompt given to Antigravity** (additive only, no changes to existing auth/permissions/features):
1. Backend: install `stripe`, add `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY` to env config, extend the `Booking` model with `payment_status` and `stripe_session_id` fields, add a `POST /api/bookings/checkout/` endpoint to create a Stripe Checkout Session and a `GET /api/bookings/confirm/` endpoint to verify payment and mark the booking paid.
2. Frontend: "Book Now" redirects to the Stripe-hosted checkout URL; new `/booking/success` and `/booking/cancel` routes handle the return flow; Dashboard displays a payment status badge per booking.
3. README updated with a "Payments (Bonus)" section documenting test mode and the Stripe test card number.

**Result reported by Antigravity:** Implementation completed and wired end-to-end. However, the verification walkthrough could not be completed because the `.env` file still contained placeholder Stripe keys (`sk_test_placeholder`), which Stripe's API correctly rejected with an authentication error. Antigravity flagged this rather than silently treating the integration as fully verified — real test-mode keys were generated and added to `.env`, the backend container was restarted, and the full flow (Book Now → Stripe-hosted checkout → test card payment → redirect to `/booking/success` → "Paid" badge appearing on the Dashboard) was then manually verified before committing.

Note: a $0-price session bypasses Stripe entirely and confirms immediately (a dev convenience for testing the non-payment path) — confirmed none of the seeded demo sessions are priced at $0, so the real Stripe flow is exercised by default in the demo data.

---

## Notes on AI-assisted decisions

- **Stripe over Razorpay** for the bonus payment integration — chosen for faster test-mode key setup under time pressure.
- **MinIO/S3 deprioritized** relative to Stripe and rate limiting — lowest bonus point value relative to setup complexity in the available time.
- **Role switching via profile** rather than a separate creator-application flow — a deliberate scope-reduction noted in the README as a shortcut for demo purposes, not hidden from evaluators.
- Declined to artificially backdate or pad commit history when asked, in favor of an honest commit history that reflects the real build order.