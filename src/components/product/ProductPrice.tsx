import { formatMoney } from "@/lib/shopify/normalise";
import type { PriceRange, MoneyV2, Maybe } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export interface ProductPriceProps {
  priceRange: PriceRange;
  compareAtPriceRange: PriceRange;
  /** When a specific variant is selected, pass its prices to show exact pricing. */
  selectedPrice?: MoneyV2;
  selectedCompareAtPrice?: Maybe<MoneyV2>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE: Record<NonNullable<ProductPriceProps["size"]>, { price: string; compare: string }> = {
  sm: { price: "text-base font-bold",  compare: "text-sm" },
  md: { price: "text-xl font-bold",    compare: "text-base" },
  lg: { price: "text-2xl font-bold",   compare: "text-lg" },
};

export function ProductPrice({
  priceRange,
  compareAtPriceRange,
  selectedPrice,
  selectedCompareAtPrice,
  size = "md",
  className,
}: ProductPriceProps) {
  // Use selected variant price when available, otherwise use range
  const price: MoneyV2 = selectedPrice ?? priceRange.minVariantPrice;
  const compareAtRaw = selectedCompareAtPrice !== undefined
    ? selectedCompareAtPrice
    : compareAtPriceRange.minVariantPrice;

  // Only treat as a compare-at price if the amount is genuinely higher
  const compareAt: Maybe<MoneyV2> =
    compareAtRaw && parseFloat(compareAtRaw.amount) > parseFloat(price.amount)
      ? compareAtRaw
      : null;

  const isOnSale = compareAt !== null;

  // Show a range if min ≠ max (no variant selected yet)
  const showRange =
    !selectedPrice &&
    parseFloat(priceRange.maxVariantPrice.amount) !== parseFloat(priceRange.minVariantPrice.amount);

  const sizes = SIZE[size];

  return (
    <div className={cn("flex items-baseline flex-wrap gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          sizes.price,
          isOnSale ? "text-error" : "text-primary"
        )}
      >
        {showRange
          ? `${formatMoney(priceRange.minVariantPrice)} – ${formatMoney(priceRange.maxVariantPrice)}`
          : formatMoney(price)}
      </span>

      {isOnSale && compareAt && (
        <span
          className={cn(sizes.compare, "text-neutral-400 line-through")}
          aria-label={`Was ${formatMoney(compareAt)}`}
        >
          {formatMoney(compareAt)}
        </span>
      )}
    </div>
  );
}
