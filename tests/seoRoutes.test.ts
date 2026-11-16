import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("SEO metadata routes", () => {
  it("generates sitemap entries for homepage, login, scanner, and legal pages", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      "https://subscription-x-ray.vercel.app/",
      "https://subscription-x-ray.vercel.app/login",
      "https://subscription-x-ray.vercel.app/scanner",
      "https://subscription-x-ray.vercel.app/terms",
      "https://subscription-x-ray.vercel.app/privacy",
      "https://subscription-x-ray.vercel.app/refund",
    ]);

    expect(urls.some((u) => /\/(api|reset-password)/.test(u))).toBe(false);
  });

  it("configures robots.txt allowing site indexing and pointing to sitemap.xml", () => {
    const config = robots();
    expect(config.sitemap).toBe(
      "https://subscription-x-ray.vercel.app/sitemap.xml"
    );

    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    expect(rules[0].userAgent).toBe("*");
    expect(rules[0].allow).toBe("/");
    expect(rules[0].disallow).toEqual(["/api/", "/reset-password"]);
  });
});
