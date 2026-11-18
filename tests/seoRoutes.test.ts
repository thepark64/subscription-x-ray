import { readFileSync } from "node:fs";
import path from "node:path";
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
    expect(
      rules.some(
        (r) =>
          (r.userAgent === "Googlebot" || r.userAgent === "Googlebot-Image") &&
          Array.isArray(r.disallow) &&
          r.disallow.some((d) => d === "/" || d.includes("icon"))
      )
    ).toBe(false);
  });

  it("provides a 96x96 PNG favicon, favicon.ico, and apple-icon.png wired in layout metadata", () => {
    const icon96 = readFileSync(path.join(process.cwd(), "public/icon-96x96.png"));
    // PNG signature + IHDR width/height bytes (big-endian uint32 at offsets 16 and 20)
    expect(icon96.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
    expect(icon96.readUInt32BE(16)).toBe(96);
    expect(icon96.readUInt32BE(20)).toBe(96);

    const faviconIco = readFileSync(path.join(process.cwd(), "public/favicon.ico"));
    // ICO header: reserved=0, type=1, count>=1
    expect(faviconIco.readUInt16LE(0)).toBe(0);
    expect(faviconIco.readUInt16LE(2)).toBe(1);
    expect(faviconIco.readUInt16LE(4)).toBeGreaterThanOrEqual(1);

    const appleIcon = readFileSync(path.join(process.cwd(), "app/apple-icon.png"));
    expect(appleIcon.readUInt32BE(16)).toBe(180);
    expect(appleIcon.readUInt32BE(20)).toBe(180);

    const layout = readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
    expect(layout).toContain('"/icon-96x96.png"');
    expect(layout).toContain('sizes: "96x96"');
    expect(layout).toContain('"/favicon.ico"');
    expect(layout).toContain('"/apple-icon.png"');
    expect(layout).toContain('"/icon.svg"');

    const homePage = readFileSync(path.join(process.cwd(), "app/page.tsx"), "utf8");
    expect(homePage).toContain("₹3,896");
    expect(homePage).not.toContain("3,847");
  });
});

