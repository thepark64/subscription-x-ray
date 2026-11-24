import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GUIDES, HELP_CENTER_CATEGORIES } from "@/lib/guides";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-sans" }),
  Geist_Mono: () => ({ variable: "--font-mono" }),
}));

describe("SEO metadata routes", () => {
  it("generates sitemap entries strictly for all 30 indexable public pages", () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      "https://subscription-x-ray.vercel.app/",
      "https://subscription-x-ray.vercel.app/how-it-works",
      "https://subscription-x-ray.vercel.app/help",
      "https://subscription-x-ray.vercel.app/guides",
      ...GUIDES.map((guide) => `https://subscription-x-ray.vercel.app${guide.href}`),
      "https://subscription-x-ray.vercel.app/faq",
      "https://subscription-x-ray.vercel.app/compare",
      "https://subscription-x-ray.vercel.app/about",
      "https://subscription-x-ray.vercel.app/contact",
      "https://subscription-x-ray.vercel.app/terms",
      "https://subscription-x-ray.vercel.app/privacy",
      "https://subscription-x-ray.vercel.app/refund",
    ]);
    expect(urls).toHaveLength(30);
    expect(urls.some((u) => /\/(api|login|scanner|reset-password)/.test(u))).toBe(false);
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

  it("provides a 96x96 PNG favicon, favicon.ico, apple-icon.png, and accurate public/llms.txt", () => {
    const icon96 = readFileSync(path.join(process.cwd(), "public/icon-96x96.png"));
    expect(icon96.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
    expect(icon96.readUInt32BE(16)).toBe(96);
    expect(icon96.readUInt32BE(20)).toBe(96);

    const faviconIco = readFileSync(path.join(process.cwd(), "public/favicon.ico"));
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
    expect(homePage).toContain("10 MB");
    expect(homePage).toContain("Still Paying for Something You Forgot?");
    expect(homePage).toContain("Find My Forgotten Subscriptions");
    expect(homePage).not.toMatch(/aggregateRating|reviewCount/);

    const faqPage = readFileSync(path.join(process.cwd(), "app/faq/page.tsx"), "utf8");
    expect(faqPage).toContain("FAQPage");
    expect(faqPage).not.toMatch(/aggregateRating|reviewCount/);

    const llmsTxtPath = path.join(process.cwd(), "public/llms.txt");
    expect(existsSync(llmsTxtPath)).toBe(true);
    const llmsTxt = readFileSync(llmsTxtPath, "utf8");
    expect(llmsTxt).toContain("https://subscription-x-ray.vercel.app");
    expect(llmsTxt).toContain("https://subscription-x-ray.vercel.app/help");
    expect(llmsTxt).toContain("₹69");
    expect(llmsTxt).toContain("12");
    expect(llmsTxt).not.toMatch(/SUPABASE_SERVICE_ROLE|CASHFREE_SECRET|Bearer\s+/i);
  });

  it("ensures all routes have unique <=60 title, <=155 description, matching canonical and og:url, and noindex on gated auth routes", async () => {
    const { metadata: layoutMetadata } = await import("@/app/layout");
    const { metadata: homeMeta } = await import("@/app/page");
    const { metadata: howItWorksMeta } = await import("@/app/how-it-works/page");
    const { metadata: helpMeta } = await import("@/app/help/page");
    const { metadata: guidesMeta } = await import("@/app/guides/page");
    const { metadata: g1Meta } = await import("@/app/guides/find-upi-autopay-mandates/page");
    const { metadata: g2Meta } = await import("@/app/guides/cancel-upi-autopay/page");
    const { metadata: g3Meta } = await import("@/app/guides/find-hidden-subscriptions/page");
    const { metadata: g4Meta } = await import("@/app/guides/identify-nach-emandate/page");
    const { metadata: g5Meta } = await import("@/app/guides/recurring-card-payments/page");
    const { metadata: g6Meta } = await import("@/app/guides/read-bank-statements/page");
    const { metadata: g7Meta } = await import("@/app/guides/debit-card-recurring-payments/page");
    const { metadata: g8Meta } = await import("@/app/guides/hdfc-sbi-icici-automatic-payments/page");
    const { metadata: g9Meta } = await import("@/app/guides/calculate-monthly-subscription-spending/page");
    const { metadata: g10Meta } = await import("@/app/guides/bank-statement-privacy-security/page");
    const { metadata: g11Meta } = await import("@/app/guides/find-forgotten-subscriptions/page");
    const { metadata: g12Meta } = await import("@/app/guides/cancel-credit-card-subscriptions/page");
    const { metadata: g13Meta } = await import("@/app/guides/stop-recurring-card-payments/page");
    const { metadata: g14Meta } = await import("@/app/guides/cancel-nach-mandate/page");
    const { metadata: g15Meta } = await import("@/app/guides/cancel-google-play-subscription/page");
    const { metadata: g16Meta } = await import("@/app/guides/cancel-apple-subscription/page");
    const { metadata: g17Meta } = await import("@/app/guides/identify-unknown-bank-debits/page");
    const { metadata: g18Meta } = await import("@/app/guides/find-hidden-subscriptions-bank-statement/page");
    const { metadata: g19Meta } = await import("@/app/guides/stop-forgotten-free-trials/page");
    const { metadata: faqMeta } = await import("@/app/faq/page");
    const { metadata: compareMeta } = await import("@/app/compare/page");
    const { metadata: aboutMeta } = await import("@/app/about/page");
    const { metadata: contactMeta } = await import("@/app/contact/page");
    const { metadata: loginMeta } = await import("@/app/login/page");
    const { metadata: scannerMeta } = await import("@/app/scanner/page");
    const { metadata: resetMeta } = await import("@/app/reset-password/page");
    const { metadata: termsMeta } = await import("@/app/terms/page");
    const { metadata: privacyMeta } = await import("@/app/privacy/page");
    const { metadata: refundMeta } = await import("@/app/refund/page");

    expect(layoutMetadata.metadataBase?.toString().replace(/\/+$/, "")).toBe(
      "https://subscription-x-ray.vercel.app"
    );

    expect(loginMeta.robots).toEqual({ index: false, follow: true });
    expect(scannerMeta.robots).toEqual({ index: false, follow: true });
    expect(resetMeta.robots).toEqual({ index: false, follow: false });

    const routes = [
      homeMeta,
      howItWorksMeta,
      helpMeta,
      guidesMeta,
      g1Meta,
      g2Meta,
      g3Meta,
      g4Meta,
      g5Meta,
      g6Meta,
      g7Meta,
      g8Meta,
      g9Meta,
      g10Meta,
      g11Meta,
      g12Meta,
      g13Meta,
      g14Meta,
      g15Meta,
      g16Meta,
      g17Meta,
      g18Meta,
      g19Meta,
      faqMeta,
      compareMeta,
      aboutMeta,
      contactMeta,
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
    const canonicals = new Set<string>();

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
      canonicals.add(canonical);
    }

    expect(titles.size).toBe(routes.length);
    expect(descriptions.size).toBe(routes.length);
    expect(ogTitles.size).toBe(routes.length);
    expect(ogDescriptions.size).toBe(routes.length);
    expect(twTitles.size).toBe(routes.length);
    expect(twDescriptions.size).toBe(routes.length);
    expect(canonicals.size).toBe(routes.length);

    expect(HELP_CENTER_CATEGORIES).toEqual([
      "Find Forgotten Subscriptions",
      "Cancel Credit Card Subscriptions",
      "Stop UPI AutoPay",
      "Cancel NACH Mandates",
      "Cancel Google Play Subscriptions",
      "Cancel Apple Subscriptions",
      "Identify Unknown Bank Charges",
      "Stop Free Trial Renewals",
    ]);

    for (const guide of GUIDES) {
      const filePath = path.join(
        process.cwd(),
        "app/guides",
        guide.slug,
        "page.tsx"
      );
      expect(existsSync(filePath)).toBe(true);
      expect(guide.helpCategories.length).toBeGreaterThanOrEqual(1);
      for (const rel of guide.relatedSlugs) {
        expect(GUIDES.some((g) => g.slug === rel)).toBe(true);
      }
    }

    const helpPage = readFileSync(
      path.join(process.cwd(), "app/help/page.tsx"),
      "utf8"
    );
    expect(helpPage).toContain(
      "Forgotten a Subscription? Find It and Stop Unwanted Charges."
    );

    const scannerSource = readFileSync(
      path.join(process.cwd(), "components/Scanner.tsx"),
      "utf8"
    );
    expect(scannerSource).toContain("How to Cancel");
    expect(scannerSource).toContain(
      "Subscription X-Ray identifies recurring payment patterns from your"
    );

    const brandMark = readFileSync(
      path.join(process.cwd(), "components/BrandMark.tsx"),
      "utf8"
    );
    expect(brandMark).toContain('alt = "Subscription X-Ray logo"');
    expect(brandMark).not.toContain('alt=""');

    const siteHeader = readFileSync(
      path.join(process.cwd(), "components/SiteHeader.tsx"),
      "utf8"
    );
    expect(siteHeader).toContain("mobile-nav-toggle");
    expect(siteHeader).toContain("mobile-nav-drawer");

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
    expect(loginClient).toContain("Browser-local statement parsing:");
    expect(loginClient).not.toContain("100% browser-side parsing");

    expect(scannerClient).toContain("₹1–₹5 mandate holds");
    expect(scannerClient).not.toContain("₹1–₹2");

    const guideLayout = readFileSync(
      path.join(process.cwd(), "components/GuideLayout.tsx"),
      "utf8"
    );
    expect(guideLayout).toContain("guide.updatedAt");
    expect(guideLayout).not.toContain("Updated 18 Nov 2026");

    const privacyPage = readFileSync(
      path.join(process.cwd(), "app/privacy/page.tsx"),
      "utf8"
    );
    expect(privacyPage).toContain("Google Tag Manager");
    expect(privacyPage).toContain("Google Analytics 4");
    expect(privacyPage).toContain("never sent through these analytics events");
  }, 15000);
});
