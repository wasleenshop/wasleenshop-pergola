"use client";

/**
 * RelatedProducts.tsx
 *
 * Four-column product grid using the same ProductCard used elsewhere.
 * Integrates QuickViewModal so the experience is consistent with the
 * collection listing pages.
 *
 * Data is fetched server-side (getProductRecommendations) and passed
 * in as props, so this component is client-only for QuickView state.
 */

import { useState, useCallback } from "react";
import { ProductCard } from "./ProductCard";
import { QuickViewModal } from "./QuickViewModal";
import { useCart } from "@/components/cart/CartContext";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface RelatedProductsProps {
  products: ProductCardType[];
  /** Section heading — defaults to "You May Also Like" */
  heading?: string;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function RelatedProducts({
  products,
  heading = "You May Also Like",
}: RelatedProductsProps) {
  const { addToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductCardType | null>(null);

  const handleQuickView = useCallback((product: ProductCardType) => {
    setQuickViewProduct(product);
  }, []);

  const handleAddToCart = useCallback(
    async (variantId: string) => {
      await addToCart(variantId, 1);
    },
    [addToCart]
  );

  // Limit to 4 products max for layout
  const displayProducts = products.slice(0, 4);

  if (displayProducts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading">
      <h2 id="related-heading" className="type-h2 mb-8">
        {heading}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayProducts.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            rating={null} // ratings are not pre-fetched for related products
            priority={false}
            onQuickView={handleQuickView}
          />
        ))}
      </div>

      {/* QuickView modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </section>
  );
}
