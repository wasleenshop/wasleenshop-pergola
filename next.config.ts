import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enables the 'use cache' directive, cacheLife(), and cacheTag()
    useCache: true,
  },
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
