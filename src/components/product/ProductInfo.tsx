"use client";

/**
 * ProductInfo.tsx
 *
 * Right-hand panel on the product page.
 * Contains: vendor, title, rating, price, trust badges, variant selector,
 * quantity picker, CTA buttons, delivery promise, and Wasleen Commitment.
 *
 * Also renders the sticky mobile CTA bar (bottom bar on small screens).
 */

import { useState, useCallback } from "react";
import {
  ShoppingBag,
  Zap,
  Truck,
  Clock,
  MessageCircle,
  Plus,
  Minus,
  Check,
  Shield,
} from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { actionAddToCart } from "@/lib/shopify/actions/cart";
import { ProductPrice } from "./ProductPrice";
import { StarRating } from "./StarRating";
import { Badge as ProductBadge } from "./Badge";
import { VariantSelector } from "./VariantSelector";
import { WasleenCommitment } from "./WasleenCommitment";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/shopify/normalise";
import type { Product, ProductVariant } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971567648220";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ProductInfoProps {
  product: Product;
  rating: { rating: number; count: number } | null;
  selectedVariant: ProductVariant | null;
  selectedOptions: Record<string, string>;
  onOptionChange: (optionName: string, value: string) => void;
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function DeliveryRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gold flex-shrink-0">{icon}</span>
      <span className="text-neutral-600">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function ProductInfo({
  product,
  rating,
  selectedVariant,
  selectedOptions,
  onOptionChange,
}: ProductInfoProps) {
  const { addToCart, isAddingToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addState, setAddState] = useState<"idle" | "added">("idle");
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const m = product.metafields;
  const requiresConsultation = m.requires_consultation === true;

  // All non-default options must be selected before purchase actions are enabled
  const needsSelection = product.options.some(
    (o) =>
      !(o.values.length === 1 && o.values[0] === "Default Title") &&
      !selectedOptions[o.name]
  );

  const isVariantAvailable = selectedVariant
    ? selectedVariant.availableForSale
    : product.availableForSale;

  const canAddToCart =
    !needsSelection && isVariantAvailable && !requiresConsultation;

  // Discount percentage (variant-level)
  const compareAtPrice = selectedVariant?.compareAtPrice ?? null;
  const currentPrice = selectedVariant?.price ?? null;
  const discountPct =
    compareAtPrice &&
    currentPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(currentPrice.amount)
      ? Math.round(
          ((parseFloat(compareAtPrice.amount) -
            parseFloat(currentPrice.amount)) /
            parseFloat(compareAtPrice.amount)) *
            100
        )
      : 0;

  // Trust badges from metafields
  const badges = {
    dedLicensed: m.ded_licensed === true,
    madeInUae: m.made_in_uae === true,
    installationIncluded: m.installation_included === true,
    warranty5Year: (m.warranty_years ?? 0) >= 5,
    dubaiClimate: m.dubai_climate_tested === true,
    wasleenChoice: m.wasleen_choice === true,
    superDeal: m.super_deal === true,
  } as const;

  const hasBadges = Object.values(badges).some(Boolean);

  // WhatsApp pre-filled message
  const waMessage = encodeURIComponent(
    `Hi! I'm interested in "${product.title}"${
      selectedVariant ? ` (${selectedVariant.title})` : ""
    }. Could you provide more details or a quote?`
  );
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`;

  // ── Handlers ──────────────────────────────────────────────────

  const handleAddToCart = useCallback(async () => {
    const variantId = selectedVariant?.id ?? product.variants.edges[0]?.node.id;
    if (!variantId) return;
    await addToCart(variantId, quantity);
    setAddState("added");
    setTimeout(() => setAddState("idle"), 2000);
  }, [selectedVariant, product.variants.edges, addToCart, quantity]);

  const handleBuyNow = useCallback(async () => {
    const variantId = selectedVariant?.id ?? product.variants.edges[0]?.node.id;
    if (!variantId) return;
    setIsBuyingNow(true);
    try {
      const result = await actionAddToCart(variantId, quantity);
      if (result.success) {
        window.location.href = result.cart.checkoutUrl;
      }
    } finally {
      setIsBuyingNow(false);
    }
  }, [selectedVariant, product.variants.edges, quantity]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Vendor overline ─────────────────────────────── */}
      {product.vendor && (
        <p className="type-overline-gold">{product.vendor}</p>
      )}

      {/* ── Title ───────────────────────────────────────── */}
      <h1 className="type-h1 text-primary">{product.title}</h1>

      {/* ── Rating ──────────────────────────────────────── */}
      {rating && rating.count > 0 && (
        <StarRating rating={rating.rating} count={rating.count} size="md" />
      )}

      {/* ── Price ───────────────────────────────────────── */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <ProductPrice
          priceRange={product.priceRange}
          compareAtPriceRange={product.compareAtPriceRange}
          selectedPrice={selectedVariant?.price}
          selectedCompareAtPrice={selectedVariant?.compareAtPrice}
          size="lg"
        />
        {discountPct > 0 && (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-error text-white">
            -{discountPct}%
          </span>
        )}
      </div>

      {/* ── Trust badges ────────────────────────────────── */}
      {hasBadges && (
        <div className="flex flex-wrap gap-2">
          {badges.dedLicensed && <ProductBadge type="ded_licensed" size="sm" />}
          {badges.madeInUae && <ProductBadge type="made_in_uae" size="sm" />}
          {badges.wasleenChoice && (
            <ProductBadge type="wasleen_choice" size="sm" />
          )}
          {badges.superDeal && <ProductBadge type="super_deal" size="sm" />}
          {badges.installationIncluded && (
            <ProductBadge type="installation_included" size="sm" />
          )}
          {badges.warranty5Year && (
            <ProductBadge type="warranty_5year" size="sm" />
          )}
          {badges.dubaiClimate && (
            <ProductBadge type="dubai_climate" size="sm" />
          )}
        </div>
      )}

      {/* ── Divider ─────────────────────────────────────── */}
      <div className="h-px bg-neutral-200" />

      {/* ── Variant selector ────────────────────────────── */}
      {product.options.length > 0 && (
        <VariantSelector
          options={product.options}
          variants={product.variants.edges}
          selectedOptions={selectedOptions}
          onOptionChange={onOptionChange}
        />
      )}

      {/* Selection prompt */}
      {needsSelection && (
        <p className="text-sm text-neutral-500 italic">
          Select all options above to see the exact price
        </p>
      )}

      {/* ── Quantity ────────────────────────────────────── */}
      {!requiresConsultation && (
        <div className="flex items-center gap-5">
          <span className="text-sm font-semibold text-primary">Quantity</span>
          <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-4 py-2.5 hover:bg-sand transition-colors text-primary"
              aria-label="Decrease quantity"
            >
              <Minus size={15} aria-hidden="true" />
            </button>
            <span
              className="px-5 py-2 text-sm font-semibold min-w-[3rem] text-center"
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-4 py-2.5 hover:bg-sand transition-colors text-primary"
              aria-label="Increase quantity"
            >
              <Plus size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* ── CTA buttons ─────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {requiresConsultation ? (
          /* Consultation-only products: WhatsApp quote */
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Request a WhatsApp Quote
          </a>
        ) : (
          <>
            {/* Add to Cart */}
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canAddToCart || isAddingToCart || addState === "added"}
              isLoading={isAddingToCart}
              onClick={handleAddToCart}
              aria-label={
                !canAddToCart
                  ? needsSelection
                    ? "Select options first"
                    : "Out of stock"
                  : addState === "added"
                    ? "Added to cart"
                    : "Add to cart"
              }
            >
              {addState === "added" ? (
                <>
                  <Check size={18} aria-hidden="true" />
                  Added to Cart
                </>
              ) : !isVariantAvailable && !needsSelection ? (
                "Out of Stock"
              ) : needsSelection ? (
                "Select Options"
              ) : (
                <>
                  <ShoppingBag size={18} aria-hidden="true" />
                  Add to Cart
                </>
              )}
            </Button>

            {/* Buy Now */}
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              disabled={!canAddToCart || isBuyingNow}
              isLoading={isBuyingNow}
              onClick={handleBuyNow}
            >
              <Zap size={18} aria-hidden="true" />
              Buy Now
            </Button>
          </>
        )}

        {/* WhatsApp help link — always visible */}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-primary transition-colors py-1"
        >
          <MessageCircle size={15} aria-hidden="true" />
          Need help? Chat with an expert
        </a>
      </div>

      {/* ── Delivery promise ────────────────────────────── */}
      <div className="border border-neutral-200 rounded-xl p-4 space-y-3 bg-sand/30">
        <DeliveryRow
          icon={<Truck size={17} />}
          label="Free delivery across all UAE Emirates"
        />
        <DeliveryRow
          icon={<Clock size={17} />}
          label="Expert installation in 3–5 business days"
        />
        <DeliveryRow
          icon={<Shield size={17} />}
          label={`${m.warranty_years ?? 5}-year product warranty included`}
        />
      </div>

      {/* ── Wasleen Commitment ──────────────────────────── */}
      <WasleenCommitment />

      {/* ── Sticky mobile CTA bar ───────────────────────── */}
      <MobileStickyBar
        product={product}
        selectedVariant={selectedVariant}
        canAddToCart={canAddToCart}
        isAddingToCart={isAddingToCart}
        addState={addState}
        requiresConsultation={requiresConsultation}
        waHref={waHref}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Mobile sticky CTA bar
// ─────────────────────────────────────────────────────────────────

interface MobileStickyBarProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  canAddToCart: boolean;
  isAddingToCart: boolean;
  addState: "idle" | "added";
  requiresConsultation: boolean;
  waHref: string;
  onAddToCart: () => void;
}

function MobileStickyBar({
  product,
  selectedVariant,
  canAddToCart,
  isAddingToCart,
  addState,
  requiresConsultation,
  waHref,
  onAddToCart,
}: MobileStickyBarProps) {
  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;

  return (
    <div
      className={cn(
        "lg:hidden fixed bottom-0 left-0 right-0 z-30",
        "bg-white border-t border-neutral-200 shadow-xl",
        "px-4 py-3 flex items-center gap-3",
        "safe-bottom" // env(safe-area-inset-bottom) handled by padding
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      {/* Price */}
      <div className="flex-1">
        <p className="text-xs text-neutral-500">From</p>
        <p className="text-base font-bold text-primary">
          {formatMoney(price)}
        </p>
      </div>

      {/* CTA */}
      {requiresConsultation ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary flex items-center gap-2 py-3 px-6"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Get Quote
        </a>
      ) : (
        <button
          onClick={onAddToCart}
          disabled={!canAddToCart || isAddingToCart || addState === "added"}
          className={cn(
            "btn btn-primary py-3 px-6 flex items-center gap-2",
            (!canAddToCart || isAddingToCart) && "opacity-50 pointer-events-none"
          )}
        >
          {addState === "added" ? (
            <>
              <Check size={16} aria-hidden="true" />
              Added
            </>
          ) : (
            <>
              <ShoppingBag size={16} aria-hidden="true" />
              Add to Cart
            </>
          )}
        </button>
      )}
    </div>
  );
}
