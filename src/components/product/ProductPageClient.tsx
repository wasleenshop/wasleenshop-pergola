"use client";

/**
 * ProductPageClient.tsx
 *
 * Thin client wrapper that owns the selected-variant state and
 * coordinates the gallery and info panel.
 *
 * Why a separate file?
 *  ProductGallery and ProductInfo are both 'use client' components
 *  that need to share `selectedVariant`. Lifting state here keeps
 *  both children as pure presentational components (no cross-sibling
 *  coupling) while the server-rendered page.tsx stays a Server Component.
 */

import { useState, useMemo, useCallback } from "react";
import type { Product, ProductVariant } from "@/lib/shopify/types";
import { ProductGallery } from "./ProductGallery";
import { ProductInfo } from "./ProductInfo";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ProductPageClientProps {
  product: Product;
  rating: { rating: number; count: number } | null;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Given a map of selected option values, find the matching variant.
 * Returns null when not all options have been selected.
 */
function findVariant(
  selectedOptions: Record<string, string>,
  edges: Array<{ node: ProductVariant }>
): ProductVariant | null {
  for (const { node } of edges) {
    const matches = node.selectedOptions.every(
      (o) => selectedOptions[o.name] === o.value
    );
    if (matches) return node;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function ProductPageClient({ product, rating }: ProductPageClientProps) {
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});

  // Derive selected variant reactively
  const selectedVariant = useMemo<ProductVariant | null>(() => {
    // If the only variant is "Default Title", auto-select it
    const edges = product.variants.edges;
    if (
      edges.length === 1 &&
      edges[0].node.selectedOptions.length === 1 &&
      edges[0].node.selectedOptions[0].value === "Default Title"
    ) {
      return edges[0].node;
    }
    return findVariant(selectedOptions, edges);
  }, [selectedOptions, product.variants.edges]);

  const handleOptionChange = useCallback(
    (optionName: string, value: string) => {
      setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
    },
    []
  );

  // Images: put variant-specific image first if it's not already in the list
  const allImages = product.images.edges.map((e) => e.node);
  const variantImage = selectedVariant?.image ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-14 items-start">
      {/* Left: Gallery */}
      <ProductGallery
        images={allImages}
        variantImage={variantImage}
        title={product.title}
      />

      {/* Right: Info */}
      <ProductInfo
        product={product}
        rating={rating}
        selectedVariant={selectedVariant}
        selectedOptions={selectedOptions}
        onOptionChange={handleOptionChange}
      />
    </div>
  );
}
