"use client";

/**
 * CollectionPageClient.tsx
 *
 * Orchestrates all interactive collection-page state:
 *  - Live filter state (read from URL via useUrlFilterState)
 *  - Accumulated product list (initial + load-more pages)
 *  - Transition pending overlay while filters re-fetch on server
 *  - Load More action invocation
 *
 * Architecture:
 *  Server (page.tsx) reads searchParams → fetches products → passes initialProducts.
 *  When user changes filters, this component updates the URL → server re-renders
 *  with new initialProducts → useEffect resets local product list.
 *  Load More extends the list client-side via Server Action (no URL change).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CollectionHeader } from "./CollectionHeader";
import { FilterSidebar } from "./FilterSidebar";
import { SortDropdown } from "./SortDropdown";
import { ActiveFilters } from "./ActiveFilters";
import { ProductGrid } from "./ProductGrid";
import { useUrlFilterState } from "@/lib/utils/url-state";
import { loadMoreCollectionProducts } from "@/app/(routes)/collections/[handle]/actions";
import type { Collection, ProductCard, PageInfo } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface CollectionPageClientProps {
  handle: string;
  collection: Pick<
    Collection,
    "title" | "description" | "descriptionHtml" | "image"
  >;
  initialProducts: ProductCard[];
  initialPageInfo: PageInfo;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function CollectionPageClient({
  handle,
  collection,
  initialProducts,
  initialPageInfo,
}: CollectionPageClientProps) {
  const searchParams = useSearchParams();

  const {
    filterState,
    isPending,
    setSort,
    setPrice,
    toggleFeature,
    setMaterial,
    clearAll,
  } = useUrlFilterState();

  // ── Local product accumulation ─────────────────────────────────
  const [products, setProducts] = useState<ProductCard[]>(initialProducts);
  const [pageInfo, setPageInfo] = useState<PageInfo>(initialPageInfo);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync to new server-side data whenever initialProducts changes
  // (triggered by URL/filter change → server re-render)
  const prevInitialRef = useRef(initialProducts);
  useEffect(() => {
    if (prevInitialRef.current !== initialProducts) {
      prevInitialRef.current = initialProducts;
      setProducts(initialProducts);
      setPageInfo(initialPageInfo);
    }
  }, [initialProducts, initialPageInfo]);

  // ── Load More ──────────────────────────────────────────────────
  const handleLoadMore = useCallback(async () => {
    if (!pageInfo.endCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await loadMoreCollectionProducts(
        handle,
        pageInfo.endCursor,
        searchParams.toString()
      );
      setProducts((prev) => [...prev, ...result.products]);
      setPageInfo(result.pageInfo);
    } catch (err) {
      console.error("[CollectionPage] loadMore error", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [handle, pageInfo.endCursor, searchParams, isLoadingMore]);

  // ── Active filter helpers ──────────────────────────────────────
  const clearPrice = useCallback(() => setPrice(undefined), [setPrice]);
  const clearMaterial = useCallback(() => setMaterial(undefined), [setMaterial]);

  return (
    <div>
      {/* ── Collection hero header ───────────────────── */}
      <CollectionHeader
        collection={collection}
        productCount={products.length}
      />

      {/* ── Filter row (mobile) ──────────────────────── */}
      <div className="flex items-center justify-between gap-3 mb-5 lg:hidden">
        <FilterSidebar
          state={filterState}
          onSetPrice={setPrice}
          onToggleFeature={toggleFeature}
          onSetMaterial={setMaterial}
          onClearAll={clearAll}
        />
        <SortDropdown value={filterState.sort} onChange={setSort} />
      </div>

      {/* ── Active filter chips ──────────────────────── */}
      <ActiveFilters
        state={filterState}
        onClearPrice={clearPrice}
        onRemoveFeature={toggleFeature}
        onClearMaterial={clearMaterial}
        onClearAll={clearAll}
        className="mb-5"
      />

      {/* ── Desktop two-column layout ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12 items-start">
        {/* Sidebar (desktop only — mobile uses FilterDrawer above) */}
        <FilterSidebar
          state={filterState}
          onSetPrice={setPrice}
          onToggleFeature={toggleFeature}
          onSetMaterial={setMaterial}
          onClearAll={clearAll}
        />

        {/* Main content */}
        <div>
          {/* Desktop toolbar: product count + sort */}
          <div className="hidden lg:flex items-center justify-between gap-4 mb-6">
            <p className="text-sm text-neutral-400">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
            <SortDropdown value={filterState.sort} onChange={setSort} />
          </div>

          {/* Product grid */}
          <ProductGrid
            products={products}
            hasMore={pageInfo.hasNextPage}
            isLoading={isPending}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            totalVisible={products.length}
          />
        </div>
      </div>
    </div>
  );
}
