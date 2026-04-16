/**
 * FeaturedProducts.tsx
 *
 * Homepage section 4 — "Wasleen's Choice".
 * Server Component: fetches products from the "wasleen-choice" collection,
 * parallel-fetches Judge.me ratings, then delegates to the client carousel.
 *
 * Renders null if the collection doesn't exist or has no products.
 */

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCollectionProducts } from "@/lib/shopify";
import { getProductRating } from "@/lib/judgeme/client";
import { FeaturedProductsCarousel } from "./FeaturedProductsCarousel";
import type { ProductCard } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Extract numeric Shopify ID from GID (e.g. "gid://shopify/Product/123" → "123") */
function toNumericId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export async function FeaturedProducts() {
  // ── Fetch products ──────────────────────────────────────────
  let products: ProductCard[] = [];

  try {
    const result = await getCollectionProducts({
      handle: "wasleen-choice",
      first: 8,
      sortKey: "BEST_SELLING",
    });
    products = result.products.items;
  } catch {
    // Collection doesn't exist yet — section hides gracefully
    return null;
  }

  if (products.length === 0) return null;

  // ── Fetch ratings in parallel ────────────────────────────────
  const ratings = await Promise.all(
    products.map((p) =>
      getProductRating(toNumericId(p.id)).catch(() => null)
    )
  );

  const productsWithRatings = products.map((product, i) => ({
    product,
    rating: ratings[i],
  }));

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <section
      className="section-py bg-sand"
      aria-labelledby="featured-products-heading"
    >
      <div className="container-site">
        {/* Section header */}
        <div className="text-center mb-12 reveal">
          <span className="type-overline-gold block mb-3">
            Wasleen&apos;s Choice
          </span>
          <h2 className="type-h1" id="featured-products-heading">
            Our Most Loved Pergolas
          </h2>
          <p className="type-body-lg text-neutral-500 mt-4 max-w-2xl mx-auto">
            Handpicked by our experts — the perfect blend of style, durability,
            and value for UAE homes.
          </p>
        </div>

        {/* Carousel */}
        <FeaturedProductsCarousel products={productsWithRatings} />

        {/* CTA */}
        <div className="text-center mt-10">
          <Link href="/collections/wasleen-choice">
            <Button variant="secondary" size="lg">
              View All Wasleen&apos;s Choice
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
