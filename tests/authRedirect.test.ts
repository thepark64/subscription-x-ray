import { describe, expect, it } from "vitest";
import {
  extractAuthErrorFromLocation,
  getAuthRedirectBase,
  getEmailConfirmationRedirectUrl,
  getPasswordResetRedirectUrl,
  PRODUCTION_SITE_URL,
} from "../lib/authRedirect";

describe("authRedirect helpers", () => {
  it("defaults to https://subscription-x-ray.vercel.app when no custom URL is passed", () => {
    expect(PRODUCTION_SITE_URL).toBe("https://subscription-x-ray.vercel.app");
    expect(getAuthRedirectBase("")).toBe("https://subscription-x-ray.vercel.app");
    expect(getEmailConfirmationRedirectUrl("")).toBe(
      "https://subscription-x-ray.vercel.app/login"
    );
    expect(getPasswordResetRedirectUrl("")).toBe(
      "https://subscription-x-ray.vercel.app/reset-password"
    );
  });

  it("normalizes trailing slashes and paths on configured site URLs", () => {
    expect(
      getEmailConfirmationRedirectUrl("https://subscription-x-ray.vercel.app///")
    ).toBe("https://subscription-x-ray.vercel.app/login");
    expect(
      getPasswordResetRedirectUrl("https://subscription-x-ray.vercel.app/login")
    ).toBe("https://subscription-x-ray.vercel.app/reset-password");
  });

  it("extracts auth error descriptions from query or hash fragments", () => {
    expect(
      extractAuthErrorFromLocation(
        "?error=access_denied&error_description=Email+link+is+invalid+or+has+expired",
        ""
      )
    ).toBe("Email link is invalid or has expired");
    expect(
      extractAuthErrorFromLocation(
        "",
        "#error=server_error&error_description=Link%20expired"
      )
    ).toBe("Link expired");
    expect(extractAuthErrorFromLocation("", "")).toBeNull();
  });
});
