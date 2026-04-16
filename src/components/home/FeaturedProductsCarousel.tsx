"use client";

/**
 * FeaturedProductsCarousel.tsx
 *
 * Client Component: interactive carousel for the Featured Products section.
 * Receives pre-fetched product + rating data from the parent server component.
 *
 * Features:
 *  - CSS scroll-snap based carousel (GPU-accelerated, touch-friendly)
 *  - Prev/Next arrow buttons
 *  - Active dot indicators (pill for active, circle for inactive)
 *  - Auto-plays every 5 seconds (pauses on hover)
 *  - QuickView modal integration
 *  - Responsive: 1 col (mobile) → 2 col (tablet) → 4 col (desktop)
 */

import {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { useCart } from "@/components/cart/CartContext";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ProductWithRating {
  product: ProductCardType;
  rating: { rating: number; count: number } | null;
}

export interface FeaturedProductsCarouselProps {
  products: ProductWithRating[];
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function FeaturedProductsCarousel({
  products,
}: FeaturedProductsCarouselProps) {
  const { addToCart } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(products.length <= 1);
  const [isPaused, setIsPaused] = useState(false);
  const [quickViewProduct, setQuickViewProduct] =
    useState<ProductCardType | null>(null);
  const [quickViewRating, setQuickViewRating] = useState<{
    rating: number;
    count: number;
  } | null>(null);

  // ── Helpers ──────────────────────────────────────────────────

  /** Width of one card (including gap) based on first card's DOM rect */
  const getCardStep = useCallback((): number => {
    const el = scrollRef.current;
    if (!el || !el.children[0]) return 0;
    const card = el.children[0] as HTMLElement;
    // gap-6 = 24px
    return card.getBoundingClientRect().width + 24;
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = getCardStep();
    if (step > 0) {
      setActiveIndex(Math.round(el.scrollLeft / step));
    }
    setAtStart(el.scrollLeft < 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, [getCardStep]);

  // ── Navigation ────────────────────────────────────────────────

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const step = getCardStep();
      el.scrollTo({ left: index * step, behavior: "smooth" });
    },
    [getCardStep]
  );

  const scrollNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      // Loop back to start
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      const step = getCardStep();
      el.scrollBy({ left: step, behavior: "smooth" });
    }
  }, [getCardStep]);

  const scrollPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const step = getCardStep();
    el.scrollBy({ left: -step, behavior: "smooth" });
  }, [getCardStep]);

  // ── Auto-play ─────────────────────────────────────────────────

  useEffect(() => {
    if (isPaused || products.length <= 4) return;
    const timer = setInterval(scrollNext, 5000);
    return () => clearInterval(timer);
  }, [isPaused, scrollNext, products.length]);

  // ── Scroll listener ───────────────────────────────────────────

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [updateScrollState]);

  // ── Cart ──────────────────────────────────────────────────────

  const handleAddToCart = useCallback(
    async (variantId: string) => {
      await addToCart(variantId, 1);
    },
    [addToCart]
  );

  // ── Quick View ────────────────────────────────────────────────

  const handleQuickView = useCallback(
    (product: ProductCardType) => {
      const entry = products.find((p) => p.product.id === product.id);
      setQuickViewProduct(product);
      setQuickViewRating(entry?.rating ?? null);
    },
    [products]
  );

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel wrapper */}
      <div className="relative">
        {/* Prev button */}
        <button
          onClick={scrollPrev}
          disabled={atStart}
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10",
            "w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md",
            "hidden md:flex items-center justify-center",
            "transition-all duration-200",
            "hover:bg-gold hover:border-gold hover:text-white",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-neutral-200 disabled:hover:text-inherit"
          )}
          aria-label="Previous products"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>

        {/* Scrollable track */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          aria-label="Featured products"
        >
          {products.map(({ product, rating }, index) => (
            <div
              key={product.id}
              className="flex-none w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] snap-start"
            >
              <ProductCard
                product={product}
                rating={rating}
                priority={index < 4}
                onQuickView={handleQuickView}
              />
            </div>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={scrollNext}
          disabled={atEnd}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10",
            "w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md",
            "hidden md:flex items-center justify-center",
            "transition-all duration-200",
            "hover:bg-gold hover:border-gold hover:text-white",
            "disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-neutral-200 disabled:hover:text-inherit"
          )}
          aria-label="Next products"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Dot indicators */}
      {products.length > 1 && (
        <div
          className="flex items-center justify-center gap-2 mt-6"
          role="tablist"
          aria-label="Carousel page indicator"
        >
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Go to product ${index + 1}`}
              className={cn(
                "rounded-full transition-all duration-300",
                index === activeIndex
                  ? "w-6 h-2 bg-gold"
                  : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400"
              )}
            />
          ))}
        </div>
      )}

      {/* Quick view modal */}
      <QuickViewModal
        product={quickViewProduct}
        rating={quickViewRating}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
