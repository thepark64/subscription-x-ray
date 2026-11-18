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
  monthly_equivalent numeric(12,2) not null,
  confidence text,
  payment_rail text,
  detection_reason text
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
alter table detected_subscriptions add column if not exists confidence text;
alter table detected_subscriptions add column if not exists payment_rail text;
alter table detected_subscriptions add column if not exists detection_reason text;
alter table profiles drop constraint if exists profiles_scan_credits_check;
alter table profiles add constraint profiles_scan_credits_check check (scan_credits >= 0);

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'detected_subscriptions'
      and c.conname = 'detected_subscriptions_confidence_check'
  ) then
    alter table public.detected_subscriptions
      add constraint detected_subscriptions_confidence_check
      check (confidence is null or confidence in ('high', 'medium', 'possible'));
  end if;

  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'detected_subscriptions'
      and c.conname = 'detected_subscriptions_payment_rail_check'
  ) then
    alter table public.detected_subscriptions
      add constraint detected_subscriptions_payment_rail_check
      check (
        payment_rail is null
        or payment_rail in ('upi_autopay', 'nach_emandate', 'card_si', 'upi')
      );
  end if;
end;
$$;

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

-- A signed-in user may read, rename (statement_name only), or delete their OWN scan results.
-- Scan creation is restricted exclusively to save_scan_and_spend_credit() so
-- direct browser inserts cannot bypass validation or credit accounting.
drop policy if exists "update own scans" on scans;
drop policy if exists "delete own scans" on scans;
create policy "update own scans" on scans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own scans" on scans for delete using (auth.uid() = user_id);

revoke insert on table public.scans from anon, authenticated;
revoke insert on table public.detected_subscriptions from anon, authenticated;
revoke update on table public.scans from anon, authenticated;
grant update (statement_name) on table public.scans to authenticated;
revoke insert, update, delete on table public.profiles from anon, authenticated;
revoke insert, update, delete on table public.payments from anon, authenticated;

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

-- Saves a scan, inserts its detected subscriptions, and spends one credit in
-- a single atomic Postgres transaction so a failed save never costs a credit.
-- Valid zero-subscription scans (on unlocked accounts with >= 1 credit) save
-- scan history with zero totals and spend 0 credits.
create or replace function public.save_scan_and_spend_credit(
  p_statement_name text,
  p_file_name text,
  p_subscription_count integer,
  p_monthly_total numeric,
  p_annual_total numeric,
  p_subscriptions jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user uuid := auth.uid();
  v_remaining integer;
  v_actual_count integer := 0;
  v_item jsonb;
  v_merchant text;
  v_freq text;
  v_amount_str text;
  v_monthly_str text;
  v_occ_str text;
  v_conf text;
  v_rail text;
  v_scan public.scans%rowtype;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  if p_subscriptions is null or jsonb_typeof(p_subscriptions) <> 'array' then
    raise exception 'Invalid subscriptions payload: expected a JSON array';
  end if;

  v_actual_count := jsonb_array_length(p_subscriptions);

  if v_actual_count > 500 then
    raise exception 'Too many subscriptions in a single scan';
  end if;

  if p_subscription_count is null or p_subscription_count <> v_actual_count then
    raise exception 'Subscription count mismatch';
  end if;

  if p_monthly_total is null
     or p_monthly_total = 'NaN'::numeric
     or not (round(p_monthly_total, 2) >= 0 and round(p_monthly_total, 2) <= 9999999999.99) then
    raise exception 'Invalid monthly total';
  end if;

  if p_annual_total is null
     or p_annual_total = 'NaN'::numeric
     or not (round(p_annual_total, 2) >= 0 and round(p_annual_total, 2) <= 9999999999.99) then
    raise exception 'Invalid annual total';
  end if;

  if v_actual_count = 0 and (round(p_monthly_total, 2) <> 0 or round(p_annual_total, 2) <> 0) then
    raise exception 'Totals must be zero when subscription count is zero';
  end if;

  if v_actual_count > 0 and (round(p_monthly_total, 2) <= 0 or round(p_annual_total, 2) <= 0) then
    raise exception 'Totals must be positive when subscriptions are present';
  end if;

  for v_item in select value from jsonb_array_elements(p_subscriptions)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'Invalid subscription entry: expected JSON object';
    end if;

    if jsonb_typeof(v_item->'merchant') <> 'string' then
      raise exception 'Subscription merchant must be a string';
    end if;

    v_merchant := trim(coalesce(v_item->>'merchant', ''));
    if v_merchant = '' then
      raise exception 'Subscription merchant is required';
    end if;

    if jsonb_typeof(v_item->'frequency') <> 'string' then
      raise exception 'Subscription frequency must be a string';
    end if;

    v_freq := trim(coalesce(v_item->>'frequency', ''));
    if v_freq not in ('weekly', 'monthly', 'quarterly', 'annual') then
      raise exception 'Invalid subscription frequency: %', v_freq;
    end if;

    if jsonb_typeof(v_item->'amount') not in ('number', 'string') then
      raise exception 'Invalid subscription amount';
    end if;

    v_amount_str := trim(coalesce(v_item->>'amount', ''));
    if v_amount_str !~ '^[0-9]+(\.[0-9]+)?$'
       or length(v_amount_str) > 20
       or round(v_amount_str::numeric, 2) <= 0
       or round(v_amount_str::numeric, 2) > 9999999999.99 then
      raise exception 'Invalid subscription amount';
    end if;

    if jsonb_typeof(v_item->'monthly_equivalent') not in ('number', 'string') then
      raise exception 'Invalid subscription monthly equivalent';
    end if;

    v_monthly_str := trim(coalesce(v_item->>'monthly_equivalent', ''));
    if v_monthly_str !~ '^[0-9]+(\.[0-9]+)?$'
       or length(v_monthly_str) > 20
       or round(v_monthly_str::numeric, 2) <= 0
       or round(v_monthly_str::numeric, 2) > 9999999999.99 then
      raise exception 'Invalid subscription monthly equivalent';
    end if;

    if jsonb_typeof(v_item->'occurrences') not in ('number', 'string') then
      raise exception 'Invalid subscription occurrences';
    end if;

    v_occ_str := trim(coalesce(v_item->>'occurrences', ''));
    if v_occ_str !~ '^[0-9]+$'
       or length(v_occ_str) > 9
       or v_occ_str::integer < 1 then
      raise exception 'Invalid subscription occurrences';
    end if;

    if (v_item ? 'confidence') and jsonb_typeof(v_item->'confidence') not in ('string', 'null') then
      raise exception 'Invalid confidence level';
    end if;

    v_conf := nullif(trim(coalesce(v_item->>'confidence', '')), '');
    if v_conf is not null and v_conf not in ('high', 'medium', 'possible') then
      raise exception 'Invalid confidence level: %', v_conf;
    end if;

    if (v_item ? 'payment_rail') and jsonb_typeof(v_item->'payment_rail') not in ('string', 'null') then
      raise exception 'Invalid payment rail';
    end if;

    v_rail := nullif(nullif(trim(coalesce(v_item->>'payment_rail', '')), ''), 'unknown');
    if v_rail is not null and v_rail not in ('upi_autopay', 'nach_emandate', 'card_si', 'upi') then
      raise exception 'Invalid payment rail: %', v_rail;
    end if;

    if (v_item ? 'detection_reason') and jsonb_typeof(v_item->'detection_reason') not in ('string', 'null') then
      raise exception 'Invalid detection reason';
    end if;
  end loop;

  if v_actual_count = 0 then
    select scan_credits
      into v_remaining
      from public.profiles
     where id = v_user
     for update;

    if v_remaining is null then
      raise exception 'No profile for user %', v_user;
    end if;

    if v_remaining <= 0 then
      raise exception 'No scan credits remaining';
    end if;

    insert into public.scans (
      user_id,
      statement_name,
      file_name,
      subscription_count,
      monthly_total,
      annual_total
    )
    values (
      v_user,
      nullif(left(trim(coalesce(p_statement_name, '')), 80), ''),
      nullif(left(trim(coalesce(p_file_name, '')), 120), ''),
      0,
      0,
      0
    )
    returning * into v_scan;

    return jsonb_build_object(
      'remaining', v_remaining,
      'credit_used', false,
      'scan', to_jsonb(v_scan)
    );
  end if;

  update public.profiles
     set scan_credits = scan_credits - 1
   where id = v_user and scan_credits > 0
  returning scan_credits into v_remaining;

  if v_remaining is null then
    raise exception 'No scan credits remaining';
  end if;

  insert into public.scans (
    user_id,
    statement_name,
    file_name,
    subscription_count,
    monthly_total,
    annual_total
  )
  values (
    v_user,
    nullif(left(trim(coalesce(p_statement_name, '')), 80), ''),
    nullif(left(trim(coalesce(p_file_name, '')), 120), ''),
    v_actual_count,
    round(p_monthly_total, 2),
    round(p_annual_total, 2)
  )
  returning * into v_scan;

  insert into public.detected_subscriptions (
    scan_id,
    user_id,
    merchant,
    amount,
    frequency,
    occurrences,
    monthly_equivalent,
    confidence,
    payment_rail,
    detection_reason
  )
  select
    v_scan.id,
    v_user,
    left(trim(item->>'merchant'), 160),
    round((item->>'amount')::numeric, 2),
    trim(item->>'frequency'),
    (item->>'occurrences')::integer,
    round((item->>'monthly_equivalent')::numeric, 2),
    nullif(trim(coalesce(item->>'confidence', '')), ''),
    nullif(nullif(trim(coalesce(item->>'payment_rail', '')), ''), 'unknown'),
    nullif(left(trim(coalesce(item->>'detection_reason', '')), 160), '')
  from jsonb_array_elements(p_subscriptions) as item;

  return jsonb_build_object(
    'remaining', v_remaining,
    'credit_used', true,
    'scan', to_jsonb(v_scan)
  );
end;
$$;

revoke all on function public.save_scan_and_spend_credit(text, text, integer, numeric, numeric, jsonb) from public, anon;
grant execute on function public.save_scan_and_spend_credit(text, text, integer, numeric, numeric, jsonb) to authenticated;
