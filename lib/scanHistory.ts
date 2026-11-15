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
