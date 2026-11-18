import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

vi.mock("next/font/google", () => ({
  DM_Sans: () => ({ variable: "--font-sans" }),
  Plus_Jakarta_Sans: () => ({ variable: "--font-display" }),
  JetBrains_Mono: () => ({ variable: "--font-mono" }),
}));

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

  it("ensures every public route has unique <=60 title, <=155 description, matching canonical and og:url, and unique social metadata", async () => {
    const { metadata: layoutMetadata } = await import("@/app/layout");
    const { metadata: homeMeta } = await import("@/app/page");
    const { metadata: loginMeta } = await import("@/app/login/page");
    const { metadata: scannerMeta } = await import("@/app/scanner/page");
    const { metadata: termsMeta } = await import("@/app/terms/page");
    const { metadata: privacyMeta } = await import("@/app/privacy/page");
    const { metadata: refundMeta } = await import("@/app/refund/page");

    expect(layoutMetadata.metadataBase?.toString().replace(/\/+$/, "")).toBe(
      "https://subscription-x-ray.vercel.app"
    );

    const routes = [
      homeMeta,
      loginMeta,
      scannerMeta,
      termsMeta,
      privacyMeta,
      refundMeta,
    ];

    const titles = new Set<string>();
    const descriptions = new Set<string>();
    const ogTitles = new Set<string>();
    const ogDescriptions = new Set<string>();
    const twTitles = new Set<string>();
    const twDescriptions = new Set<string>();

    for (const meta of routes) {
      const title = String(meta.title ?? "");
      const desc = String(meta.description ?? "");
      const canonical = String(meta.alternates?.canonical ?? "");
      const ogUrl = String(meta.openGraph?.url ?? "");
      const ogTitle = String(meta.openGraph?.title ?? "");
      const ogDesc = String(meta.openGraph?.description ?? "");
      const twTitle = String(meta.twitter?.title ?? "");
      const twDesc = String(meta.twitter?.description ?? "");

      expect(title.length).toBeGreaterThanOrEqual(30);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(desc.length).toBeGreaterThanOrEqual(120);
      expect(desc.length).toBeLessThanOrEqual(155);
      expect(canonical).toMatch(/^\//);
      expect(ogUrl).toBe(canonical);

      titles.add(title);
      descriptions.add(desc);
      ogTitles.add(ogTitle);
      ogDescriptions.add(ogDesc);
      twTitles.add(twTitle);
      twDescriptions.add(twDesc);
    }

    expect(titles.size).toBe(routes.length);
    expect(descriptions.size).toBe(routes.length);
    expect(ogTitles.size).toBe(routes.length);
    expect(ogDescriptions.size).toBe(routes.length);
    expect(twTitles.size).toBe(routes.length);
    expect(twDescriptions.size).toBe(routes.length);

    const brandMark = readFileSync(
      path.join(process.cwd(), "components/BrandMark.tsx"),
      "utf8"
    );
    expect(brandMark).toContain('alt = "Subscription X-Ray logo"');
    expect(brandMark).not.toContain('alt=""');

    const scannerClient = readFileSync(
      path.join(process.cwd(), "components/ScannerClient.tsx"),
      "utf8"
    );
    expect(scannerClient).toContain("<h1>Statement scanner</h1>");
    expect(scannerClient).toContain("How browser-only scanning works");

    const loginClient = readFileSync(
      path.join(process.cwd(), "components/LoginClient.tsx"),
      "utf8"
    );
    expect(loginClient).toContain("What your Subscription X-Ray account includes");
  });
});


