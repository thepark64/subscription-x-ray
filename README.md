# Subscription X-Ray V3

A privacy-first recurring-charge finder built with Next.js 15, React 19, Supabase Auth/Postgres, and Cashfree.

## Product behaviour

- One-time pack: **₹69 for 12 scans** (fixed on the server).
- A customer signs up or signs in before scanning or purchasing.
- CSV parsing happens in the browser. The raw statement is not sent to the application server.
- A successful scan saves its summary and spends one credit atomically through the `save_scan_and_spend_credit()` database function (so a failed save never costs a credit).
- Scan summaries and detected merchant/amount/frequency results are saved to the signed-in user's account for history.
- Recognised merchants can show a direct account-management/help link. The app does **not** cancel subscriptions automatically.
- Payment credits are added either by the signed Cashfree webhook (`/api/webhooks/cashfree`) or by `/api/cashfree/verify`, both of which re-check the order directly with Cashfree's API before crediting. The browser never grants credits on its own.
- Each Cashfree payment ID can be processed once. Payment insertion and credit grant happen in one Postgres transaction.
- Users can request account deletion from the scanner screen; the API deletes the Supabase Auth user, and database foreign keys cascade the account's scan history/results.

## Local development

Requirements: Node.js 20+, npm, a Supabase project, and Cashfree sandbox keys (only needed to test checkout).

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Environment variables

Set these in `.env.local` locally and in your Vercel project settings:

| Variable | Where it comes from | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API | Public |
| `NEXT_PUBLIC_SITE_URL` | Your canonical HTTPS domain | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API | **Server only** |
| `CASHFREE_APP_ID` | Cashfree → Developers → API Keys | **Server only** |
| `CASHFREE_SECRET_KEY` | Cashfree → Developers → API Keys | **Server only** |
| `CASHFREE_ENV` | `sandbox` or `production` | **Server only** |

Never commit `.env.local`, production keys, or screenshots containing secrets.

## Supabase setup

1. Create/open your Supabase project.
2. Open **SQL Editor**.
3. Review and run `supabase/schema.sql` against the project.
4. In Authentication → URL Configuration, set the Site URL to your production URL and add:
   - `http://localhost:3000/**`
   - `https://subscription-x-ray.vercel.app/**`
   - your Vercel preview URL pattern if you use preview deployments.
5. Enable email confirmation if desired and configure Supabase email delivery.
6. Confirm the `profiles` row is created on signup by the `on_auth_user_created` trigger.

The SQL is designed to be re-runnable and includes a backfill for existing auth users. It migrates legacy `payments.razorpay_payment_id` / `payments.razorpay_order_id` columns to `cashfree_payment_id` / `cashfree_order_id`, preserves the unique constraint, and updates RLS policies and credit functions. Back up your database before applying it to an existing production project.

## Cashfree setup

1. Use **Sandbox** keys first (`TEST*` App ID and `cfsk_ma_test_*` secret key with `CASHFREE_ENV=sandbox`).
2. Configure `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, and `CASHFREE_ENV` in environment variables.
3. In Cashfree Dashboard → Developers → Webhooks, create a webhook pointing to:

   `https://YOUR_DOMAIN/api/webhooks/cashfree`

4. Cashfree signs webhooks with your `CASHFREE_SECRET_KEY` (`x-webhook-signature` and `x-webhook-timestamp`).
5. Subscribe to the `PAYMENT_SUCCESS_WEBHOOK` event.
6. Deploy and make a test purchase. Verify that the payment appears in `payments` and that exactly 12 credits are added.
7. Only after end-to-end test success, switch to Production keys (`CASHFREE_ENV=production`).

Both the webhook and `/api/cashfree/verify` fetch the order directly from Cashfree's API and verify its order ID, exact amount, INR currency, user ID tag, and pack-size tag before invoking the atomic database function.

## Deploy to Vercel

1. Push this project to a new GitHub repository (keep the old live repo/deployment unchanged during testing).
2. Import the new repository into Vercel.
3. Add every environment variable above to Preview and Production as appropriate.
4. Set `NEXT_PUBLIC_SITE_URL` to your canonical domain.
5. Deploy a Preview first.
6. Run signup, email confirmation, login, reset password, test payment, webhook retry, scan, history, sign-out, and account deletion checks.
7. Attach the production domain only after those checks pass.

## Commands

```bash
npm run dev       # local development
npm run typecheck # TypeScript check
npm test          # CSV parser/detection tests
npm run build     # production build
```

## CSV input

The parser accepts comma, semicolon, tab, or pipe delimiters; quoted cells (including multiline values); headers located within the first 40 rows; common Indian and ISO date formats; amount/debit columns; and credit/debit markers. A 5 MB file-size limit and 100,000-row parser limit help keep browser work bounded.

Detection is heuristic. It looks for repeating intervals and similar amounts. It can miss subscriptions or flag other recurring payments. Always verify the transaction and manage/cancel directly with the merchant.

## Important production checklist

- Have the Terms, Privacy Policy, and Refund Policy reviewed for your actual business and applicable Indian law. The included pages are editable starter copy, not legal advice.
- Confirm the final refund window, business identity, GST/invoice obligations if applicable, and Cashfree merchant onboarding requirements.
- Configure Supabase backups, email delivery, and monitoring.
- Add a durable rate limiter/WAF rule for order creation and account endpoints before significant public traffic.
- Test webhook retries, `/api/cashfree/verify` polling, and unmatched payments using Cashfree sandbox mode.
- The scan credit protects the app workflow; browser-only analysis cannot prevent a technically skilled user from running local parsing outside the app. Do not claim that the client-side parser itself is tamper-proof.
- The app stores scan summaries/results for history. If you later want a strict zero-retention product, disable result persistence and update the privacy notice.

## Project layout

- `app/` — landing page, auth, legal pages, scanner and API routes
- `components/` — scanner, checkout, account actions
- `lib/detection.ts` — browser-side CSV parsing and recurring-charge detection
- `lib/services.ts` — known service management/help links
- `lib/supabaseAdmin.ts` — server-only Supabase service-role client
- `supabase/schema.sql` — RLS, profile trigger, atomic credit functions
- `tests/` — CSV detection tests
