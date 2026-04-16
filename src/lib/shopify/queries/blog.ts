/**
 * lib/shopify/queries/blog.ts
 *
 * Shopify Storefront API — blog/article queries.
 * Used by the homepage BlogPreview section.
 *
 * Caching: 'hours' — articles change infrequently.
 */

import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { shopifyQuery } from "../client";
import { IMAGE_FRAGMENT, SEO_FRAGMENT, CACHE_TAGS } from "../constants";

// ─────────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────────

const GET_BLOG_ARTICLES_QUERY = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${SEO_FRAGMENT}
  query GetBlogArticles($handle: String!, $first: Int!) {
    blog(handle: $handle) {
      id
      handle
      title
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            id
            handle
            title
            excerpt
            publishedAt
            image {
              ...ImageFields
            }
            authorV2 {
              name
            }
            seo {
              ...SEOFields
            }
          }
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface BlogArticle {
  id: string;
  handle: string;
  blogHandle: string;
  title: string;
  excerpt: string | null;
  publishedAt: string;
  image: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  author: string | null;
}

// ─────────────────────────────────────────────────────────────────
// Query function
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch the latest N articles from a Shopify blog.
 *
 * @param blogHandle - Shopify blog handle (e.g. "news", "guides")
 * @param first      - Number of articles to fetch (default: 3)
 * @returns          - Array of normalised BlogArticle objects, empty on error/missing
 */
export async function getBlogArticles(options: {
  blogHandle?: string;
  first?: number;
}): Promise<BlogArticle[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.PAGES);

  const { blogHandle = "news", first = 3 } = options;

  interface ApiResponse {
    blog: {
      id: string;
      handle: string;
      title: string;
      articles: {
        edges: Array<{
          node: {
            id: string;
            handle: string;
            title: string;
            excerpt: string | null;
            publishedAt: string;
            image: {
              url: string;
              altText: string | null;
              width: number | null;
              height: number | null;
            } | null;
            authorV2: { name: string } | null;
            seo: { title: string | null; description: string | null };
          };
        }>;
      };
    } | null;
  }

  try {
    const data = await shopifyQuery<ApiResponse>(GET_BLOG_ARTICLES_QUERY, {
      handle: blogHandle,
      first,
    });

    if (!data.blog) return [];

    const blogHandle_ = data.blog.handle;

    return data.blog.articles.edges.map((edge) => ({
      id: edge.node.id,
      handle: edge.node.handle,
      blogHandle: blogHandle_,
      title: edge.node.title,
      excerpt: edge.node.excerpt ?? null,
      publishedAt: edge.node.publishedAt,
      image: edge.node.image ?? null,
      author: edge.node.authorV2?.name ?? null,
    }));
  } catch {
    // Blog may not exist yet — silent degradation
    return [];
  }
}
