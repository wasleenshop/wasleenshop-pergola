"use client";

/**
 * ProductGrid.tsx
 *
 * Renders the product card grid and the "Load More" button.
 * Also handles the Quick View modal.
 *
 * Receives:
 *  - products: current display list (initial + any loaded-more)
 *  - hasMore: whether there are additional pages
 *  - isLoading: transition pending (filter/sort change)
 *  - isLoadingMore: load-more action in flight
 *  - onLoadMore: callback to trigger the next page
 *  - totalVisible: count label for "Showing X products"
 */

import { useState, useCallback } from "react";
import { Loader2, Package } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { useCart } from "@/components/cart/CartContext";
import { cn } from "@/lib/utils";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ProductGridProps {
  products: ProductCardType[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  totalVisible?: number;
}

// ─────────────────────────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────────────────────────

function EmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center gap-5">
      <Package size={48} className="text-neutral-300" aria-hidden="true" />
      <div>
        <h3 className="type-h4 text-primary mb-2">No products found</h3>
        <p className="text-sm text-neutral-500">
          No products match your current filters.
        </p>
      </div>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="btn btn-secondary"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function ProductGrid({
  products,
  hasMore,
  isLoading,
  isLoadingMore,
  onLoadMore,
  totalVisible,
}: ProductGridProps) {
  const { addToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductCardType | null>(null);

  const handleAddToCart = useCallback(
    async (variantId: string) => {
      await addToCart(variantId, 1);
    },
    [addToCart]
  );

  const isEmpty = !isLoading && products.length === 0;

  return (
    <div>
      {/* Product grid */}
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5",
          "transition-opacity duration-300",
          isLoading && "opacity-40 pointer-events-none"
        )}
        aria-busy={isLoading}
        aria-live="polite"
        aria-label="Products"
      >
        {/* Loading skeletons (filter transition) */}
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={`sk-${i}`} />
          ))}

        {/* Products */}
        {!isLoading &&
          products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              rating={null}
              priority={i < 4}
              onQuickView={setQuickViewProduct}
            />
          ))}

        {/* Empty state */}
        {isEmpty && <EmptyState />}
      </div>

      {/* Product count + Load More */}
      {!isLoading && products.length > 0 && (
        <div className="mt-10 flex flex-col items-center gap-4">
          {/* Counter */}
          <p className="text-sm text-neutral-400">
            Showing {totalVisible ?? products.length} product
            {products.length !== 1 ? "s" : ""}
          </p>

          {/* Load More */}
          {hasMore && (
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className={cn(
                "btn btn-secondary min-w-[180px]",
                isLoadingMore && "opacity-70 pointer-events-none"
              )}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Loading…
                </>
              ) : (
                "Load More"
              )}
            </button>
          )}

          {/* End of results */}
          {!hasMore && products.length > 12 && (
            <p className="text-xs text-neutral-400">
              You&apos;ve seen all products
            </p>
          )}
        </div>
      )}

      {/* Quick View modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
