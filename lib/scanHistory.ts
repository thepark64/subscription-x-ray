export function normalizeStatementName(value: string): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 80);
}

export function deriveStatementName(
  filename: string,
  customLabel?: string
): string {
  const manual = customLabel ? normalizeStatementName(customLabel) : "";
  if (manual) return manual;

  const base = filename
    .trim()
    .replace(/\.csv$/i, "")
    .replace(/[_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!base) return "Statement scan";
  return base.length > 60 ? `${base.slice(0, 57).trimEnd()}…` : base;
}

export function normalizeFileName(filename: string): string {
  const leaf = filename.split(/[\\/]/).pop() ?? filename;
  const cleaned = leaf.replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 120);
}

export function formatScanTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatSubscriptionCountLabel(count: number): string {
  const safe = Number.isFinite(count) ? Math.max(0, Math.round(count)) : 0;
  return `${safe} ${safe === 1 ? "subscription" : "subscriptions"} found`;
}

export function isMissingColumnError(
  error: { code?: string; message?: string } | null | undefined,
  columnName: string
): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  return (
    code === "42703" ||
    code === "PGRST204" ||
    msg.includes(columnName.toLowerCase())
  );
}
