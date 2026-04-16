import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enables 'use cache' directive, cacheLife(), and cacheTag() (replaces experimental.useCache)
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
