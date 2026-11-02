# Security notes — Subscription X-Ray V3

## Secrets
- `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET` are server-only.
- Never add a `NEXT_PUBLIC_` prefix to a secret.
- `.env.local` is ignored by Git. Rotate any key that was ever committed or shared.

## Payments
- The browser requests an order using a Supabase access token.
- The server validates that token with Supabase Auth and creates a fixed ₹69 INR order with user ID and pack-size notes.
- The webhook verifies the HMAC signature against the exact raw request body.
- The webhook retrieves the order from Razorpay's API and checks the exact amount, currency, pack size, and user metadata.
- `process_payment()` records the unique payment ID and increments credits in one database transaction. Duplicate webhook deliveries do not grant duplicate credits.
- The checkout success callback only polls for credits; it never grants them.

## Database
- RLS is enabled for profiles, scans, detected subscriptions, and payments.
- Users can read only their own rows.
- The browser cannot update profile credits or insert payment records.
- `process_payment()` is executable only by `service_role`.
- `consume_scan_credit()` atomically spends one credit for the authenticated user.

## Data
- CSV files are read in the browser and are not posted to the server.
- Saved scan summaries and detected subscription rows are stored in Supabase.
- Account deletion uses a server-authenticated Supabase Admin operation; profile and scan rows cascade via foreign keys. Payment records retain their payment row with a null user reference for accounting/audit purposes.

## Remaining operational controls
This project still needs deployment-specific monitoring, backups, durable rate limiting, legal review, and a documented incident-response process. A successful local build is not a security certification.
