/**
 * lib/shopify/queries/collection.ts
 *
 * Collection-related GraphQL queries.
 *
 * Caching:
 *  - Collection metadata: 'hours' (changes rarely)
 *  - Collection products: 'minutes' (inventory changes)
 *  - Navigation/menu collections: 'days' (structural)
 */

import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { shopifyQuery } from "../client";
import {
  COLLECTION_FRAGMENTS,
  COLLECTION_WITH_PRODUCTS_FRAGMENTS,
  PRODUCT_LIST_FRAGMENTS,
  CACHE_TAGS,
} from "../constants";
import { normaliseCollection, normaliseProductCard } from "../normalise";
import type {
  Collection,
  CollectionCard,
  PaginatedResult,
  ProductCard,
  ProductCollectionSortKeys,
  ProductFilter,
} from "../types";

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

const GET_COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENTS}
  query GetCollectionByHandle($handle: String!) {
    collection(handle: $handle) {
      ...CollectionCoreFields
    }
  }
`;

const GET_COLLECTION_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_LIST_FRAGMENTS}
  query GetCollectionProducts(
    $handle: String!
    $first: Int!
    $after: String
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $filters: [ProductFilter!]
  ) {
    collection(handle: $handle) {
      id
      handle
      title
      products(
        first: $first
        after: $after
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
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
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  availableForSale
                  quantityAvailable
                }
              }
            }
          }
        }
        pageInfo {
          ...PageInfoFields
        }
        filters {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
      }
    }
  }
`;

const GET_ALL_COLLECTIONS_QUERY = /* GraphQL */ `
  ${COLLECTION_FRAGMENTS}
  query GetAllCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: TITLE) {
      edges {
        cursor
        node {
          ...CollectionCoreFields
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const GET_COLLECTION_WITH_PRODUCTS_QUERY = /* GraphQL */ `
  ${COLLECTION_WITH_PRODUCTS_FRAGMENTS}
  query GetCollectionWithProducts(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys
  ) {
    collection(handle: $handle) {
      ...CollectionCoreFields
      products(first: $first, sortKey: $sortKey) {
        edges {
          node {
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
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// Filter types (Shopify native filter response)
// ─────────────────────────────────────────────────────────────

export interface CollectionFilterValue {
  id: string;
  label: string;
  count: number;
  input: string; // serialised JSON for re-use as filter input
}

export interface CollectionFilter {
  id: string;
  label: string;
  type: string;
  values: CollectionFilterValue[];
}

export interface CollectionProductsResult {
  collection: {
    id: string;
    handle: string;
    title: string;
  };
  products: PaginatedResult<ProductCard>;
  filters: CollectionFilter[];
}

// ─────────────────────────────────────────────────────────────
// Query functions
// ─────────────────────────────────────────────────────────────

/**
 * Fetch collection metadata only (no products).
 * Used for collection hero sections, SEO metadata.
 */
export async function getCollectionByHandle(
  handle: string
): Promise<Collection | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(
    CACHE_TAGS.COLLECTION,
    `${CACHE_TAGS.COLLECTION}-${handle}`
  );

  interface ApiResponse {
    collection: unknown | null;
  }

  const data = await shopifyQuery<ApiResponse>(
    GET_COLLECTION_BY_HANDLE_QUERY,
    { handle }
  );

  if (!data.collection) return null;
  return normaliseCollection(data.collection);
}

/**
 * Fetch products within a collection with full filter support.
 * Cached by minutes — inventory accuracy matters here.
 */
export async function getCollectionProducts(options: {
  handle: string;
  first?: number;
  after?: string;
  sortKey?: ProductCollectionSortKeys;
  reverse?: boolean;
  filters?: ProductFilter[];
}): Promise<CollectionProductsResult> {
  "use cache";
  cacheLife("minutes");
  cacheTag(
    CACHE_TAGS.COLLECTION,
    `${CACHE_TAGS.COLLECTION}-${options.handle}`,
    CACHE_TAGS.PRODUCTS
  );

  const {
    handle,
    first = 24,
    after,
    sortKey = "COLLECTION_DEFAULT",
    reverse = false,
    filters = [],
  } = options;

  interface ApiResponse {
    collection: {
      id: string;
      handle: string;
      title: string;
      products: {
        edges: Array<{ node: unknown; cursor: string }>;
        pageInfo: {
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          startCursor?: string;
          endCursor?: string;
        };
        filters: CollectionFilter[];
      };
    } | null;
  }

  const data = await shopifyQuery<ApiResponse>(
    GET_COLLECTION_PRODUCTS_QUERY,
    {
      handle,
      first,
      after: after ?? null,
      sortKey,
      reverse,
      filters: filters.length > 0 ? filters : null,
    }
  );

  if (!data.collection) {
    return {
      collection: { id: "", handle, title: "" },
      products: { items: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } },
      filters: [],
    };
  }

  return {
    collection: {
      id: data.collection.id,
      handle: data.collection.handle,
      title: data.collection.title,
    },
    products: {
      items: data.collection.products.edges.map((e) =>
        normaliseProductCard(e.node)
      ),
      pageInfo: data.collection.products.pageInfo,
    },
    filters: data.collection.products.filters ?? [],
  };
}

/**
 * Fetch all collections (for navigation, sitemap).
 * Cached for days — structural data changes rarely.
 */
export async function getAllCollections(
  first: number = 50
): Promise<CollectionCard[]> {
  "use cache";
  cacheLife("days");
  cacheTag(CACHE_TAGS.COLLECTIONS);

  interface ApiResponse {
    collections: {
      edges: Array<{ node: unknown }>;
    };
  }

  const data = await shopifyQuery<ApiResponse>(GET_ALL_COLLECTIONS_QUERY, {
    first,
    after: null,
  });

  return data.collections.edges.map((edge) =>
    normaliseCollection(edge.node) as CollectionCard
  );
}

/**
 * Fetch a collection with its first N products included.
 * Used for homepage featured-category sections.
 */
export async function getCollectionWithProducts(options: {
  handle: string;
  first?: number;
  sortKey?: ProductCollectionSortKeys;
}): Promise<Collection | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(
    CACHE_TAGS.COLLECTION,
    `${CACHE_TAGS.COLLECTION}-hero-${options.handle}`
  );

  const { handle, first = 8, sortKey = "BEST_SELLING" } = options;

  interface ApiResponse {
    collection: unknown | null;
  }

  const data = await shopifyQuery<ApiResponse>(
    GET_COLLECTION_WITH_PRODUCTS_QUERY,
    { handle, first, sortKey }
  );

  if (!data.collection) return null;
  return normaliseCollection(data.collection);
}

/**
 * Fetch multiple collections in parallel by handles.
 *
 * NOTE: Does NOT use 'use cache' at this level — each inner
 * getCollectionByHandle call has its own cache entry.
 */
export async function getCollectionsByHandles(
  handles: string[]
): Promise<Array<Collection | null>> {
  return Promise.all(handles.map((h) => getCollectionByHandle(h)));
}
