/**
 * app/sitemap.ts
 *
 * Dynamic XML sitemap — fetches all products and collections from Shopify
 * using lightweight queries (handle + updatedAt only) for efficiency.
 *
 * ISR: regenerated every hour.
 * Priority: 1.0 homepage → 0.8 products → 0.7 collections → 0.3 static
 */

import type { MetadataRoute } from "next";
import { shopifyQuery } from "@/lib/shopify/client";

// Regenerate every hour
export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

// ── Lightweight sitemap queries (no heavy fragments needed) ─

const SITEMAP_PRODUCTS_QUERY = /* GraphQL */ `
  query SitemapProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      edges {
        cursor
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

const SITEMAP_COLLECTIONS_QUERY = /* GraphQL */ `
  query SitemapCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: UPDATED_AT) {
      edges {
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

// ── Types ───────────────────────────────────────────────────

interface SitemapNode {
  handle: string;
  updatedAt: string;
}

interface SitemapQueryResult {
  edges: Array<{ cursor?: string; node: SitemapNode }>;
  pageInfo: { hasNextPage: boolean; endCursor: string };
}

// ── Pagination helpers ──────────────────────────────────────

/**
 * Paginates through all products, fetching only handle + updatedAt.
 * Shopify's maximum page size is 250; we walk pages until exhausted.
 */
async function fetchAllProductHandles(): Promise<SitemapNode[]> {
  const nodes: SitemapNode[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const data: { products: SitemapQueryResult } = await shopifyQuery<{
        products: SitemapQueryResult;
      }>(SITEMAP_PRODUCTS_QUERY, {
        first: 250,
        after: cursor,
      });

      for (const { node } of data.products.edges) {
        nodes.push(node);
      }

      hasNextPage = data.products.pageInfo.hasNextPage;
      cursor = data.products.pageInfo.endCursor ?? null;
    } catch {
      // Shopify unreachable — return what we have rather than crashing
      break;
    }
  }

  return nodes;
}

/**
 * Paginates through all collections, fetching only handle + updatedAt.
 */
async function fetchAllCollectionHandles(): Promise<SitemapNode[]> {
  const nodes: SitemapNode[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const data: { collections: SitemapQueryResult } = await shopifyQuery<{
        collections: SitemapQueryResult;
      }>(SITEMAP_COLLECTIONS_QUERY, {
        first: 250,
        after: cursor,
      });

      for (const { node } of data.collections.edges) {
        nodes.push(node);
      }

      hasNextPage = data.collections.pageInfo.hasNextPage;
      cursor = data.collections.pageInfo.endCursor ?? null;
    } catch {
      break;
    }
  }

  return nodes;
}

// ── Sitemap export ──────────────────────────────────────────

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    fetchAllProductHandles(),
    fetchAllCollectionHandles(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/collections/all`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/account/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/account/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const collectionPages: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/collections/${c.handle}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.handle}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...collectionPages, ...productPages];
}
