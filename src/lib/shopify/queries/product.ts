/**
 * lib/shopify/queries/product.ts
 *
 * All product-related GraphQL queries.
 *
 * Caching strategy (Next.js 16):
 *  - `'use cache'` + `cacheLife('hours')` for product detail pages
 *    (changes are rare; revalidated on-demand via webhook → revalidateTag)
 *  - `'use cache'` + `cacheLife('minutes')` for product listings
 *    (refresh more frequently for inventory accuracy)
 *  - Cache tags applied per-product for surgical invalidation.
 *
 * ZERO-HARDCODING LAW: No content hardcoded — all data from Shopify.
 */

import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { shopifyQuery } from "../client";
import {
  PRODUCT_FULL_FRAGMENT,
  PRODUCT_CORE_FRAGMENT,
  METAFIELD_FRAGMENT,
  PAGE_INFO_FRAGMENT,
  CACHE_TAGS,
} from "../constants";
import { normaliseProduct, normaliseProductCard } from "../normalise";
import type {
  Product,
  ProductCard,
  PaginatedResult,
} from "../types";

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

const GET_PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FULL_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFullFields
    }
  }
`;

const GET_PRODUCT_BY_ID_QUERY = /* GraphQL */ `
  ${PRODUCT_FULL_FRAGMENT}
  query GetProductById($id: ID!) {
    product(id: $id) {
      ...ProductFullFields
    }
  }
`;

const GET_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_CORE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
  ${METAFIELD_FRAGMENT}
  query GetProducts(
    $first: Int!
    $after: String
    $query: String
    $sortKey: ProductSortKeys
    $reverse: Boolean
  ) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: $sortKey
      reverse: $reverse
    ) {
      edges {
        cursor
        node {
          ...ProductCoreFields
          metafields(
            identifiers: [
              { namespace: "custom", key: "ded_licensed" }
              { namespace: "custom", key: "made_in_uae" }
              { namespace: "custom", key: "installation_included" }
              { namespace: "custom", key: "dubai_climate_tested" }
              { namespace: "custom", key: "material" }
              { namespace: "custom", key: "warranty_years" }
              { namespace: "custom", key: "is_dropship" }
              { namespace: "descriptors", key: "subtitle" }
            ]
          ) {
            ...MetafieldFields
          }
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
              }
            }
          }
        }
      }
      pageInfo {
        ...PageInfoFields
      }
    }
  }
`;

const GET_PRODUCT_RECOMMENDATIONS_QUERY = /* GraphQL */ `
  ${PRODUCT_CORE_FRAGMENT}
  ${METAFIELD_FRAGMENT}
  query GetProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductCoreFields
      metafields(
        identifiers: [
          { namespace: "custom", key: "ded_licensed" }
          { namespace: "custom", key: "warranty_years" }
          { namespace: "descriptors", key: "subtitle" }
        ]
      ) {
        ...MetafieldFields
      }
      variants(first: 1) {
        edges {
          node {
            id
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            availableForSale
          }
        }
      }
    }
  }
`;

const SEARCH_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_CORE_FRAGMENT}
  ${METAFIELD_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
  query SearchProducts(
    $query: String!
    $first: Int!
    $after: String
    $sortKey: SearchSortKeys
    $reverse: Boolean
  ) {
    search(
      query: $query
      first: $first
      after: $after
      sortKey: $sortKey
      reverse: $reverse
      types: [PRODUCT]
    ) {
      edges {
        cursor
        node {
          ... on Product {
            ...ProductCoreFields
            metafields(
              identifiers: [
                { namespace: "custom", key: "ded_licensed" }
                { namespace: "custom", key: "installation_included" }
                { namespace: "descriptors", key: "subtitle" }
              ]
            ) {
              ...MetafieldFields
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  availableForSale
                }
              }
            }
          }
        }
      }
      pageInfo {
        ...PageInfoFields
      }
      totalCount
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// Query functions (with 'use cache')
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a single product by its URL handle.
 * Cached for 1 hour; tagged for on-demand invalidation via webhook.
 */
export async function getProductByHandle(
  handle: string
): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.PRODUCT, `${CACHE_TAGS.PRODUCT}-${handle}`);

  interface ApiResponse {
    product: unknown | null;
  }

  const data = await shopifyQuery<ApiResponse>(GET_PRODUCT_BY_HANDLE_QUERY, {
    handle,
  });

  if (!data.product) return null;
  return normaliseProduct(data.product);
}

/**
 * Fetch a single product by its Shopify GID.
 */
export async function getProductById(id: string): Promise<Product | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.PRODUCT, `${CACHE_TAGS.PRODUCT}-id-${id}`);

  interface ApiResponse {
    product: unknown | null;
  }

  const data = await shopifyQuery<ApiResponse>(GET_PRODUCT_BY_ID_QUERY, { id });
  if (!data.product) return null;
  return normaliseProduct(data.product);
}

/**
 * Fetch all products with pagination.
 * Cached for 5 minutes to reflect inventory changes promptly.
 */
export async function getProducts(options?: {
  first?: number;
  after?: string;
  query?: string;
  sortKey?: "TITLE" | "PRICE" | "BEST_SELLING" | "CREATED" | "RELEVANCE";
  reverse?: boolean;
}): Promise<PaginatedResult<ProductCard>> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAGS.PRODUCTS);

  const {
    first = 24,
    after,
    query,
    sortKey = "BEST_SELLING",
    reverse = false,
  } = options ?? {};

  interface ApiResponse {
    products: {
      edges: Array<{ node: unknown; cursor: string }>;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor?: string;
        endCursor?: string;
      };
    };
  }

  const data = await shopifyQuery<ApiResponse>(GET_PRODUCTS_QUERY, {
    first,
    after: after ?? null,
    query: query ?? null,
    sortKey,
    reverse,
  });

  return {
    items: data.products.edges.map((edge) => normaliseProductCard(edge.node)),
    pageInfo: data.products.pageInfo,
  };
}

/**
 * Fetch Shopify's automatically-generated product recommendations.
 * Cached for 1 hour — Shopify updates these infrequently.
 */
export async function getProductRecommendations(
  productId: string
): Promise<ProductCard[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.PRODUCTS, `${CACHE_TAGS.PRODUCT}-recs-${productId}`);

  interface ApiResponse {
    productRecommendations: unknown[];
  }

  const data = await shopifyQuery<ApiResponse>(
    GET_PRODUCT_RECOMMENDATIONS_QUERY,
    { productId }
  );

  return (data.productRecommendations ?? []).map(normaliseProductCard);
}

/**
 * Full-text product search with rankings.
 * Not cached — search results are per-query and must be fresh.
 */
export async function searchProducts(options: {
  query: string;
  first?: number;
  after?: string;
  sortKey?: "RELEVANCE" | "PRICE";
  reverse?: boolean;
}): Promise<PaginatedResult<ProductCard> & { totalCount: number }> {
  const { query, first = 20, after, sortKey = "RELEVANCE", reverse = false } =
    options;

  interface ApiResponse {
    search: {
      edges: Array<{ node: unknown; cursor: string }>;
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor?: string;
        endCursor?: string;
      };
      totalCount: number;
    };
  }

  const data = await shopifyQuery<ApiResponse>(SEARCH_PRODUCTS_QUERY, {
    query,
    first,
    after: after ?? null,
    sortKey,
    reverse,
  });

  return {
    items: data.search.edges
      .map((edge) => edge.node)
      .filter(Boolean)
      .map(normaliseProductCard),
    pageInfo: data.search.pageInfo,
    totalCount: data.search.totalCount,
  };
}

/**
 * Fetch multiple products in parallel by handles.
 * Used for featured/curated product grids.
 */
export async function getProductsByHandles(
  handles: string[]
): Promise<Array<Product | null>> {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.PRODUCTS);

  return Promise.all(handles.map((handle) => getProductByHandle(handle)));
}
