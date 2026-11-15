# Security notes — Subscription X-Ray V3

## Secrets
- `SUPABASE_SERVICE_ROLE_KEY`, `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, and `CASHFREE_ENV` are server-only.
- Never add a `NEXT_PUBLIC_` prefix to a secret.
- `.env.local` is ignored by Git. Rotate any key that was ever committed or shared.

## Payments
- The browser requests an order using a Supabase access token.
- The server validates that token with Supabase Auth and creates a fixed ₹69 INR order with user ID and pack-size tags.
- The webhook at `/api/webhooks/cashfree` verifies Cashfree's HMAC-SHA256 signature (`x-webhook-signature` and `x-webhook-timestamp`) with `CASHFREE_SECRET_KEY` against the exact raw request body and processes `PAYMENT_SUCCESS_WEBHOOK` events.
- Both the webhook and `/api/cashfree/verify` retrieve the order directly from Cashfree's API and check the exact amount, currency, pack size, and user metadata before crediting.
- `process_payment()` records the unique Cashfree payment ID and increments credits in one database transaction. Duplicate webhook deliveries or verification retries do not grant duplicate credits.
- Credits are never trusted from the browser callback alone; `/api/cashfree/verify` re-checks the order status with Cashfree server-side before invoking `process_payment()`.

## Database
- RLS is enabled for profiles, scans, detected subscriptions, and payments.
- Users can read only their own rows.
- The browser cannot update profile credits or insert payment records.
- `process_payment()` is executable only by `service_role`.
- `save_scan_and_spend_credit()` (and legacy `consume_scan_credit()`) atomically spends one credit for the authenticated user without risking lost credits on failed scan saves.

## Data
- CSV files are read in the browser and are not posted to the server.
- Saved scan summaries and detected subscription rows are stored in Supabase.
- Account deletion uses a server-authenticated Supabase Admin operation; profile and scan rows cascade via foreign keys. Payment records retain their payment row with a null user reference for accounting/audit purposes.

## Remaining operational controls
This project still needs deployment-specific monitoring, backups, durable rate limiting, legal review, and a documented incident-response process. A successful local build is not a security certification.
