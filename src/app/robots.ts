/**
 * app/robots.ts
 *
 * Generates /robots.txt dynamically.
 * Disallows account, checkout, and API routes from all crawlers.
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/checkout/", "/api/", "/cdn-cgi/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
