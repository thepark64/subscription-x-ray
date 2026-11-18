import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SCHEMA_SQL = readFileSync(
  path.join(process.cwd(), "supabase/schema.sql"),
  "utf8"
);
const MIGRATION_SQL = readFileSync(
  path.join(
    process.cwd(),
    "supabase/migrations/20261118_add_detection_metadata_and_zero_sub_guard.sql"
  ),
  "utf8"
);
const SCANNER_TSX = readFileSync(
  path.join(process.cwd(), "components/Scanner.tsx"),
  "utf8"
);

describe("Supabase schema, additive migration, and frontend contract", () => {
  it("adds confidence, payment_rail, and detection_reason columns with constraints safely", () => {
    for (const sql of [SCHEMA_SQL, MIGRATION_SQL]) {
      expect(sql).toContain("add column if not exists confidence text");
      expect(sql).toContain("add column if not exists payment_rail text");
      expect(sql).toContain("add column if not exists detection_reason text");
      expect(sql).toContain("detected_subscriptions_confidence_check");
      expect(sql).toContain("detected_subscriptions_payment_rail_check");
    }
  });

  it("normalizes missing or unknown payment_rail values to NULL and allows only the 4 supported rails", () => {
    for (const sql of [SCHEMA_SQL, MIGRATION_SQL]) {
      expect(sql).toContain(
        "v_rail := nullif(nullif(trim(coalesce(v_item->>'payment_rail', '')), ''), 'unknown');"
      );
      expect(sql).toContain(
        "if v_rail is not null and v_rail not in ('upi_autopay', 'nach_emandate', 'card_si', 'upi') then"
      );
      expect(sql).toContain(
        "nullif(nullif(trim(coalesce(item->>'payment_rail', '')), ''), 'unknown')"
      );
    }
  });

  it("removes permissive direct-insert RLS policies on scans and detected_subscriptions", () => {
    expect(MIGRATION_SQL).toContain('drop policy if exists "insert own scans" on public.scans');
    expect(MIGRATION_SQL).toContain(
      'drop policy if exists "insert own detected subscriptions" on public.detected_subscriptions'
    );
    expect(SCHEMA_SQL).not.toContain('create policy "insert own scans"');
    expect(SCHEMA_SQL).not.toContain('create policy "insert own detected subscriptions"');

    for (const sql of [SCHEMA_SQL, MIGRATION_SQL]) {
      expect(sql).toContain("revoke insert on table public.scans from anon, authenticated");
      expect(sql).toContain(
        "revoke insert on table public.detected_subscriptions from anon, authenticated"
      );
      expect(sql).toContain("grant update (statement_name) on table public.scans to authenticated");
    }
  });

  it("preserves exact 6-parameter signature, permissions, and zero-sub/atomic credit behavior", () => {
    for (const sql of [SCHEMA_SQL, MIGRATION_SQL]) {
      expect(sql).toMatch(
        /create or replace function public\.save_scan_and_spend_credit\(\s*p_statement_name text,\s*p_file_name text,\s*p_subscription_count integer,\s*p_monthly_total numeric,\s*p_annual_total numeric,\s*p_subscriptions jsonb default '\[\]'::jsonb\s*\)/
      );
      expect(sql).toContain("security definer");
      expect(sql).toContain("set search_path = public, pg_temp");
      expect(sql).toContain("'credit_used', false");
      expect(sql).toContain("'credit_used', true");
      expect(sql).toContain("if v_remaining <= 0 then");
      expect(sql).toContain("round(v_amount_str::numeric, 2) <= 0");
      expect(sql).toContain("round(v_monthly_str::numeric, 2) <= 0");
      expect(sql).toContain(
        "revoke all on function public.save_scan_and_spend_credit(text, text, integer, numeric, numeric, jsonb) from public, anon"
      );
      expect(sql).toContain(
        "grant execute on function public.save_scan_and_spend_credit(text, text, integer, numeric, numeric, jsonb) to authenticated"
      );
    }

    expect(MIGRATION_SQL).not.toMatch(/\bdrop\s+table\b/i);
    expect(MIGRATION_SQL).not.toMatch(/\btruncate\b/i);
    expect(MIGRATION_SQL).not.toMatch(/\bdelete\s+from\b/i);

    // Preserve process_payment and service_role-only grants in schema.sql
    expect(SCHEMA_SQL).toContain("create or replace function public.process_payment(");
    expect(SCHEMA_SQL).toContain(
      "revoke all on function public.process_payment(uuid, text, text, numeric, integer) from public, anon, authenticated"
    );
    expect(SCHEMA_SQL).toContain(
      "grant execute on function public.process_payment(uuid, text, text, numeric, integer) to service_role"
    );
  });

  it("verifies Scanner.tsx calls save_scan_and_spend_credit exclusively without direct table inserts", () => {
    expect(SCANNER_TSX).toContain('supabase.rpc("save_scan_and_spend_credit"');
    expect(SCANNER_TSX).toContain("payload.credit_used === false");
    expect(SCANNER_TSX).toContain("No recurring charges found. No credit used.");
    expect(SCANNER_TSX).not.toMatch(/\.from\(["']scans["']\)\s*\.insert\(/);
    expect(SCANNER_TSX).not.toMatch(
      /\.from\(["']detected_subscriptions["']\)\s*\.insert\(/
    );
  });
});
