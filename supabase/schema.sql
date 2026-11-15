-- Subscription X-Ray — pay-per-pack schema (safe to re-run on an existing project)
-- Model: no free tier. One successful ₹69 payment grants a pack of 12 scan credits.
-- The scanner spends one credit per scan through an atomic database function.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  scan_credits integer not null default 0 check (scan_credits >= 0),
  created_at timestamptz not null default now()
);

create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  statement_name text,
  file_name text,
  subscription_count integer not null default 0,
  monthly_total numeric(12,2) not null default 0,
  annual_total numeric(12,2) not null default 0
);

create table if not exists detected_subscriptions (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references scans(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  merchant text not null,
  amount numeric(12,2) not null,
  frequency text not null,
  occurrences integer not null,
  monthly_equivalent numeric(12,2) not null
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete set null,
  cashfree_payment_id text unique,   -- unique: makes webhook/verify retries idempotent
  cashfree_order_id text,
  amount numeric(12,2),
  status text,
  created_at timestamptz not null default now()
);

-- Migrate legacy Razorpay column names to Cashfree while keeping the unique constraint.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'razorpay_payment_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'cashfree_payment_id'
  ) then
    alter table public.payments rename column razorpay_payment_id to cashfree_payment_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'razorpay_order_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'payments'
      and column_name = 'cashfree_order_id'
  ) then
    alter table public.payments rename column razorpay_order_id to cashfree_order_id;
  end if;

  alter table public.payments add column if not exists cashfree_payment_id text;
  alter table public.payments add column if not exists cashfree_order_id text;

  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    join pg_attribute a on a.attrelid = t.oid and a.attnum = any(c.conkey)
    where n.nspname = 'public'
      and t.relname = 'payments'
      and c.contype = 'u'
      and array_length(c.conkey, 1) = 1
      and a.attname = 'cashfree_payment_id'
  ) then
    alter table public.payments
      add constraint payments_cashfree_payment_id_key unique (cashfree_payment_id);
  end if;
end;
$$;

-- Older installs may be missing these; harmless if already present.
alter table profiles add column if not exists full_name text;
alter table scans add column if not exists statement_name text;
alter table scans add column if not exists file_name text;
alter table profiles drop constraint if exists profiles_scan_credits_check;
alter table profiles add constraint profiles_scan_credits_check check (scan_credits >= 0);

create index if not exists scans_user_idx on scans(user_id, scanned_at desc);
create index if not exists profiles_email_idx on profiles(lower(email));

-- ---------------------------------------------------------------------------
-- Row Level Security: users can READ their own rows. Credits and payments can
-- never be written from the browser — only through the functions below.
-- ---------------------------------------------------------------------------

alter table profiles enable row level security;
alter table scans enable row level security;
alter table detected_subscriptions enable row level security;
alter table payments enable row level security;

drop policy if exists "read own profile" on profiles;
drop policy if exists "read own scans" on scans;
drop policy if exists "read own detected subscriptions" on detected_subscriptions;
drop policy if exists "read own payments" on payments;
drop policy if exists "insert own scans" on scans;
drop policy if exists "insert own detected subscriptions" on detected_subscriptions;
-- REMOVED: "insert own profile". It let a user insert a profile row with any
-- scan_credits value if the signup trigger ever failed. The trigger below is
-- the only thing that creates profiles now.
drop policy if exists "insert own profile" on profiles;

create policy "read own profile" on profiles for select using (auth.uid() = id);
create policy "read own scans" on scans for select using (auth.uid() = user_id);
create policy "read own detected subscriptions" on detected_subscriptions for select using (auth.uid() = user_id);
create policy "read own payments" on payments for select using (auth.uid() = user_id);

-- A signed-in user may save, rename, or delete their OWN scan results.
drop policy if exists "update own scans" on scans;
drop policy if exists "delete own scans" on scans;
create policy "insert own scans" on scans for insert with check (auth.uid() = user_id);
create policy "update own scans" on scans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own scans" on scans for delete using (auth.uid() = user_id);
create policy "insert own detected subscriptions" on detected_subscriptions
  for insert with check (
    auth.uid() = user_id
    and exists (select 1 from scans s where s.id = scan_id and s.user_id = auth.uid())
  );

-- Creates the profile row when someone signs up. Without it the webhook has
-- nobody to credit.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, scan_credits)
  values (
    new.id,
    lower(new.email),
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    0
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for anyone who signed up before the trigger existed.
insert into public.profiles (id, email, full_name, scan_credits)
select
  u.id,
  lower(u.email),
  nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', '')), ''),
  0
from auth.users u
on conflict (id) do nothing;

-- Lets a signed-in user update only their display name without touching scan_credits.
create or replace function public.update_profile_name(p_full_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  cleaned text;
begin
  cleaned := nullif(left(trim(coalesce(p_full_name, '')), 80), '');
  update profiles
  set full_name = cleaned
  where id = auth.uid();
  return cleaned;
end;
$$;

revoke all on function public.update_profile_name(text) from public, anon;
grant execute on function public.update_profile_name(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Credit functions
-- ---------------------------------------------------------------------------

-- Records a verified payment AND grants credits in ONE transaction.
-- If anything fails, nothing is recorded, so Cashfree's webhook/verify retry
-- can safely try again. If the payment id was already processed, returns null
-- and grants nothing (duplicate webhook or verification call). Callable by the
-- service role only.
create or replace function public.process_payment(
  p_user uuid,
  p_payment_id text,
  p_order_id text,
  p_amount numeric,
  p_credits integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
  remaining integer;
begin
  insert into payments (user_id, cashfree_payment_id, cashfree_order_id, amount, status)
  values (p_user, p_payment_id, p_order_id, p_amount, 'captured')
  on conflict (cashfree_payment_id) do nothing
  returning id into inserted_id;

  if inserted_id is null then
    return null; -- already processed
  end if;

  update profiles
  set scan_credits = scan_credits + p_credits
  where id = p_user
  returning scan_credits into remaining;

  if remaining is null then
    raise exception 'No profile for user %', p_user; -- rolls the insert back too
  end if;

  return remaining;
end;
$$;

-- IMPORTANT: Supabase grants EXECUTE on new functions to anon and
-- authenticated by default, and "revoke from public" does NOT remove those.
-- They must be revoked by name, or any logged-in user could call this
-- function from the browser console and give themselves unlimited scans.
revoke all on function public.process_payment(uuid, text, text, numeric, integer) from public, anon, authenticated;
grant execute on function public.process_payment(uuid, text, text, numeric, integer) to service_role;

-- Old function from the previous version: remove it so it cannot be abused.
drop function if exists public.grant_scan_credit(uuid, integer);

-- Spends exactly one credit, atomically. The WHERE scan_credits > 0 makes it a
-- single row update, so two tabs or a double-click cannot spend one credit twice.
create or replace function public.consume_scan_credit()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  update profiles
  set scan_credits = scan_credits - 1
  where id = auth.uid() and scan_credits > 0
  returning scan_credits into remaining;

  if remaining is null then
    raise exception 'No scan credits remaining';
  end if;

  return remaining;
end;
$$;

revoke all on function public.consume_scan_credit() from public, anon;
grant execute on function public.consume_scan_credit() to authenticated;
