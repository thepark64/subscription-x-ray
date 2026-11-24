import type { MetadataRoute } from "next";
import { CANONICAL_SITE_URL } from "@/lib/config";
import { GUIDES } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-11-23T00:00:00.000Z");

  return [
    {
      url: `${CANONICAL_SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${CANONICAL_SITE_URL}/how-it-works`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${CANONICAL_SITE_URL}/help`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${CANONICAL_SITE_URL}/guides`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...GUIDES.map((guide) => ({
      url: `${CANONICAL_SITE_URL}${guide.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    {
      url: `${CANONICAL_SITE_URL}/faq`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${CANONICAL_SITE_URL}/compare`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${CANONICAL_SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${CANONICAL_SITE_URL}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${CANONICAL_SITE_URL}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${CANONICAL_SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${CANONICAL_SITE_URL}/refund`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
