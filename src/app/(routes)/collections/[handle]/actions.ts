"use server";

/**
 * app/(routes)/collections/[handle]/actions.ts
 *
 * Server Actions for the collection page.
 * These are called by the client via RPC (button click → server function).
 *
 * Separation of concerns:
 *  - page.tsx handles initial SSR data (search-param-driven)
 *  - actions.ts handles incremental load-more (cursor-driven)
 */

import { getCollectionProducts } from "@/lib/shopify/queries/collection";
import {
  parseFilterState,
  buildShopifyFilters,
  parseSortParam,
  type FilterState,
} from "@/lib/utils/filter-utils";
import type { ProductCard } from "@/lib/shopify/types";
import type { PageInfo } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Result type
// ─────────────────────────────────────────────────────────────────

export interface LoadMoreResult {
  products: ProductCard[];
  pageInfo: PageInfo;
}

// ─────────────────────────────────────────────────────────────────
// Action
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch the next page of products for a collection.
 *
 * @param handle        Collection URL handle.
 * @param afterCursor   Shopify cursor from the last loaded page.
 * @param searchString  Serialised URL search params (window.location.search)
 *                      used to re-apply the active filter state.
 */
export async function loadMoreCollectionProducts(
  handle: string,
  afterCursor: string,
  searchString: string
): Promise<LoadMoreResult> {
  // Re-parse filter state from the serialised search string so
  // load-more always respects the active filters in the URL.
  const params = new URLSearchParams(searchString);
  const rawParams: Record<string, string | string[]> = {};

  params.forEach((value, key) => {
    const existing = rawParams[key];
    if (existing !== undefined) {
      rawParams[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value];
    } else {
      rawParams[key] = value;
    }
  });

  const filterState = parseFilterState(rawParams);
  const shopifyFilters = buildShopifyFilters(filterState);
  const { sortKey, reverse } = parseSortParam(filterState.sort);

  const result = await getCollectionProducts({
    handle,
    after: afterCursor,
    filters: shopifyFilters,
    sortKey,
    reverse,
    first: 24,
  });

  return {
    products: result.products.items,
    pageInfo: result.products.pageInfo,
  };
}
