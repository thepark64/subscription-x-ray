import { SITE_URL } from "@/lib/config";

export const PRODUCTION_SITE_URL = "https://subscription-x-ray.vercel.app";

export function getAuthRedirectBase(configuredUrl?: string): string {
  const candidate = (configuredUrl ?? SITE_URL).trim().replace(/\/+$/, "");
  if (!candidate) return PRODUCTION_SITE_URL;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.origin;
    }
  } catch {
    // fallback below
  }
  return PRODUCTION_SITE_URL;
}

export function getEmailConfirmationRedirectUrl(configuredUrl?: string): string {
  return `${getAuthRedirectBase(configuredUrl)}/login`;
}

export function getPasswordResetRedirectUrl(configuredUrl?: string): string {
  return `${getAuthRedirectBase(configuredUrl)}/reset-password`;
}

export function extractAuthErrorFromLocation(
  search: string,
  hash: string
): string | null {
  const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(cleanHash);
  const raw =
    searchParams.get("error_description") ||
    hashParams.get("error_description") ||
    searchParams.get("error") ||
    hashParams.get("error");
  return raw ? raw.replace(/\+/g, " ").trim() : null;
}
