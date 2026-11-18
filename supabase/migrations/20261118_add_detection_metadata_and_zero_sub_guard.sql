-- Additive, backward-compatible migration for confidence scoring, payment rail
-- metadata, zero-subscription scan history, RLS direct-write hardening, and
-- atomic server-side validation.
-- Safe to run once or multiple times against an existing Supabase database.

-- 1. Ensure expected scan & detection metadata columns exist on existing tables
alter table public.scans
  add column if not exists statement_name text,
  add column if not exists file_name text;

alter table public.detected_subscriptions
  add column if not exists confidence text,
  add column if not exists payment_rail text,
  add column if not exists detection_reason text;

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

-- 2. Harden RLS & table privileges so scans and detected_subscriptions can only
--    be created via save_scan_and_spend_credit(), and users can only update
--    statement_name on their own scans (never totals, counts, or credits).
drop policy if exists "insert own scans" on public.scans;
drop policy if exists "insert own detected subscriptions" on public.detected_subscriptions;

revoke insert on table public.scans from anon, authenticated;
revoke insert on table public.detected_subscriptions from anon, authenticated;
revoke update on table public.scans from anon, authenticated;
grant update (statement_name) on table public.scans to authenticated;

revoke insert, update, delete on table public.profiles from anon, authenticated;
revoke insert, update, delete on table public.payments from anon, authenticated;

-- 3. Replace save_scan_and_spend_credit() preserving exact 6-parameter signature,
--    SECURITY DEFINER behavior, and authenticated execute grants.
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

  -- Validate every entry strictly before reading/updating credits or inserting rows.
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

  -- Valid zero-subscription scan: requires an unlocked account (credits > 0),
  -- records scan history with zero totals, and spends 0 credits.
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

  -- One or more recurring charges detected: atomically deduct 1 credit.
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
