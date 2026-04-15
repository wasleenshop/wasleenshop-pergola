"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "./Badge";
import { StarRating } from "./StarRating";
import { ProductImage } from "./ProductImage";
import { ProductPrice } from "./ProductPrice";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ProductCard as ProductCardType } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ProductCardProps {
  product: ProductCardType;
  /** Pre-fetched Judge.me rating. Pass null to hide ratings. */
  rating?: { rating: number; count: number } | null;
  /**
   * Set true for the first 4 cards on a page (above the fold).
   * Enables priority image loading and prefetching for LCP.
   */
  priority?: boolean;
  /** Called when the Quick View button is pressed. Wire up the modal here. */
  onQuickView?: (product: ProductCardType) => void;
}

// ─────────────────────────────────────────────────────────────────
// Discount badge
// ─────────────────────────────────────────────────────────────────

function DiscountBadge({ pct }: { pct: number }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-error text-white tabular-nums"
      aria-label={`${pct}% off`}
    >
      -{pct}%
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────
// Out-of-stock overlay
// ─────────────────────────────────────────────────────────────────

function OutOfStockOverlay() {
  return (
    <div
      className="absolute inset-0 bg-primary/60 flex items-center justify-center z-10"
      aria-hidden="true"
    >
      <span className="bg-primary/90 text-sand text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full">
        Out of Stock
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function ProductCard({
  product,
  rating,
  priority = false,
  onQuickView,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const m = product.metafields;

  // Which trust badges to show
  const badges = {
    dedLicensed:          m.ded_licensed === true,
    madeInUae:            m.made_in_uae === true,
    wasleenChoice:        m.wasleen_choice === true,
    superDeal:            m.super_deal === true,
    installationIncluded: m.installation_included === true,
    warranty5Year:        (m.warranty_years ?? 0) >= 5,
    dubaiClimate:         m.dubai_climate_tested === true,
  } as const;

  // Discount percentage (from price range — before variant selection)
  const compareAtAmount = parseFloat(product.compareAtPriceRange.minVariantPrice.amount);
  const priceAmount     = parseFloat(product.priceRange.minVariantPrice.amount);
  const discountPct =
    compareAtAmount > priceAmount
      ? Math.round(((compareAtAmount - priceAmount) / compareAtAmount) * 100)
      : 0;

  const hasBottomBadges =
    badges.installationIncluded || badges.warranty5Year || badges.dubaiClimate;

  const productUrl = `/products/${product.handle}`;

  function handleQuickView(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden bg-white",
        "shadow-base hover:shadow-xl",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1",
        !product.availableForSale && "opacity-80"
      )}
    >
      {/* ── Image section ───────────────────────────────────── */}
      <div
        className="relative aspect-[4/3] overflow-hidden bg-sand"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={productUrl}
          prefetch={priority}
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 z-0"
        />

        <ProductImage
          images={product.images}
          featuredImage={product.featuredImage}
          title={product.title}
          isHovered={isHovered}
          priority={priority}
        />

        {/* Out of stock overlay */}
        {!product.availableForSale && <OutOfStockOverlay />}

        {/* Top-Left: DED Licensed + Made in UAE */}
        {(badges.dedLicensed || badges.madeInUae) && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {badges.dedLicensed && <Badge type="ded_licensed" size="sm" />}
            {badges.madeInUae   && <Badge type="made_in_uae"  size="sm" />}
          </div>
        )}

        {/* Top-Right: Wasleen's Choice + Super Deal */}
        {(badges.wasleenChoice || badges.superDeal) && (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
            {badges.wasleenChoice && <Badge type="wasleen_choice" size="sm" />}
            {badges.superDeal     && <Badge type="super_deal"     size="sm" />}
          </div>
        )}

        {/* Bottom-Left: Discount % */}
        {discountPct > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <DiscountBadge pct={discountPct} />
          </div>
        )}

        {/* Desktop Quick View — fades in on hover, centered */}
        <button
          onClick={handleQuickView}
          className={cn(
            "absolute inset-x-0 bottom-0 z-20",
            "hidden md:flex items-center justify-center gap-2",
            "py-3 bg-primary/80 backdrop-blur-sm text-white text-sm font-medium",
            "transition-all duration-300",
            "translate-y-full group-hover:translate-y-0",
            "opacity-0 group-hover:opacity-100",
            // Keep disabled visually but accessible if onQuickView not wired yet
            !onQuickView && "cursor-default"
          )}
          aria-label={`Quick view ${product.title}`}
          tabIndex={isHovered ? 0 : -1}
        >
          <Eye size={16} aria-hidden="true" />
          Quick View
        </button>
      </div>

      {/* ── Content section ─────────────────────────────────── */}
      <Link href={productUrl} prefetch={priority} className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Title */}
        <h3
          className={cn(
            "type-body-lg font-semibold leading-snug line-clamp-2",
            "text-primary group-hover:text-gold transition-colors duration-200"
          )}
        >
          {product.title}
        </h3>

        {/* Rating */}
        {rating && rating.count > 0 && (
          <StarRating rating={rating.rating} count={rating.count} size="sm" />
        )}

        {/* Price */}
        <ProductPrice
          priceRange={product.priceRange}
          compareAtPriceRange={product.compareAtPriceRange}
          size="sm"
          className="mt-auto"
        />

        {/* Service badges — installation, warranty, climate */}
        {hasBottomBadges && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {badges.installationIncluded && (
              <Badge type="installation_included" size="sm" />
            )}
            {badges.warranty5Year && (
              <Badge type="warranty_5year" size="sm" />
            )}
            {badges.dubaiClimate && (
              <Badge type="dubai_climate" size="sm" />
            )}
          </div>
        )}
      </Link>

      {/* Mobile Quick View button — visible below card content */}
      <div className="px-4 pb-4 md:hidden">
        <button
          onClick={handleQuickView}
          className={cn(
            "w-full py-2.5 rounded-full text-sm font-medium",
            "border border-neutral-200 text-neutral-600",
            "hover:border-gold hover:text-gold",
            "transition-colors duration-200",
            "flex items-center justify-center gap-2"
          )}
          aria-label={`Quick view ${product.title}`}
        >
          <Eye size={14} aria-hidden="true" />
          Quick View
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white shadow-base"
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <Skeleton variant="rect" className="aspect-[4/3] w-full rounded-none" />

      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        <Skeleton variant="text" className="w-3/4 h-4" />
        <Skeleton variant="text" className="w-1/2 h-4" />
        <Skeleton variant="text" className="w-1/3 h-5" />
        <div className="flex gap-2 pt-1">
          <Skeleton variant="rect" className="w-20 h-6 rounded-full" />
          <Skeleton variant="rect" className="w-24 h-6 rounded-full" />
        </div>
      </div>
    </div>
  );
}
