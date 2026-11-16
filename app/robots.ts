import type { MetadataRoute } from "next";

const BASE_URL = "https://subscription-x-ray.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/reset-password"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
