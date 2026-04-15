"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ExternalLink, ShoppingBag, Check } from "lucide-react";
import { QuickViewGallery } from "./QuickViewGallery";
import { StarRating } from "./StarRating";
import { ProductPrice } from "./ProductPrice";
import { Badge } from "./Badge";
import type { ProductCard } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface QuickViewModalProps {
  /** Pass a product to open the modal; null / undefined to close it. */
  product: ProductCard | null;
  /** Optional short description (max ~3 lines). */
  description?: string;
  /** Pre-fetched Judge.me rating. */
  rating?: { rating: number; count: number } | null;
  /** Called when the modal should close. */
  onClose: () => void;
  /**
   * Called when user clicks "Add to Cart".
   * Receives the first available variant GID (from product.firstVariantId).
   * Omit if cart is not yet wired — button will be hidden.
   */
  onAddToCart?: (variantId: string) => Promise<void>;
}

type AddState = "idle" | "loading" | "added";

// ─────────────────────────────────────────────────────────────────
// Key-features list derived from metafields
// ─────────────────────────────────────────────────────────────────

function KeyFeatures({ product }: { product: ProductCard }) {
  const m = product.metafields;

  const features: { key: string; label: string; icon: string }[] = [];

  if (m.installation_included) features.push({ key: "install",  label: "Free Installation",    icon: "🔧" });
  if (m.dubai_climate_tested)  features.push({ key: "climate",  label: "Dubai Climate Tested",  icon: "☀️" });
  if ((m.warranty_years ?? 0) >= 5) features.push({ key: "warranty", label: "5-Year Warranty", icon: "🛡️" });
  if (m.made_in_uae)           features.push({ key: "uae",      label: "Made in UAE",           icon: "🇦🇪" });
  if (m.ded_licensed)          features.push({ key: "ded",      label: "DED Licensed",          icon: "🏛️" });

  if (features.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
        Key Features
      </p>
      <ul className="space-y-1.5">
        {features.map((f) => (
          <li key={f.key} className="flex items-center gap-2 text-sm text-primary">
            <span aria-hidden="true">{f.icon}</span>
            {f.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Focus trap hook
// ─────────────────────────────────────────────────────────────────

function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const FOCUSABLE =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const container = ref.current;
    const elements  = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first     = elements[0];
    const last      = elements[elements.length - 1];

    // Initial focus — close button is conventionally first
    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (elements.length === 0) { e.preventDefault(); return; }

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [active, ref]);
}

// ─────────────────────────────────────────────────────────────────
// Portal wrapper — renders children into document.body
// ─────────────────────────────────────────────────────────────────

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function QuickViewModal({
  product,
  description,
  rating,
  onClose,
  onAddToCart,
}: QuickViewModalProps) {
  const isOpen = product !== null;

  // ── Animation state: two-phase mount → enter ─────────────────
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible,  setIsVisible]  = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Double rAF ensures CSS transition runs from the initial (hidden) state
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setIsVisible(true))
      );
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // ── Body scroll lock ──────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // ── ESC key ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // ── Focus trap ────────────────────────────────────────────────
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, isVisible);

  // ── Return focus to trigger on close ─────────────────────────
  const triggerRef = useRef<Element | null>(null);
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else {
      (triggerRef.current as HTMLElement | null)?.focus();
    }
  }, [isOpen]);

  // ── Add to Cart state ─────────────────────────────────────────
  const [addState, setAddState] = useState<AddState>("idle");

  const handleAddToCart = useCallback(async () => {
    if (!product?.firstVariantId || !onAddToCart) return;
    if (addState !== "idle") return;

    setAddState("loading");
    try {
      await onAddToCart(product.firstVariantId);
      setAddState("added");
      setTimeout(() => setAddState("idle"), 2000);
    } catch {
      setAddState("idle");
    }
  }, [product, onAddToCart, addState]);

  // ── Nothing to render ─────────────────────────────────────────
  if (!isRendered || !product) return null;

  const productUrl     = `/products/${product.handle}`;
  const canAddToCart   = !!product.firstVariantId && !!onAddToCart && product.availableForSale;

  // Build trust badge strip
  const m = product.metafields;
  const topBadges = [
    m.wasleen_choice && "wasleen_choice",
    m.super_deal     && "super_deal",
    m.ded_licensed   && "ded_licensed",
    m.made_in_uae    && "made_in_uae",
  ].filter(Boolean) as Array<
    "wasleen_choice" | "super_deal" | "ded_licensed" | "made_in_uae"
  >;

  return (
    <Portal>
      {/* ══════════════════════════════════════════════════════════
          Backdrop
      ══════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "fixed inset-0 z-[50] bg-primary/60 backdrop-blur-sm",
          "transition-opacity duration-300",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════════════════════════
          Modal panel
      ══════════════════════════════════════════════════════════ */}
      <div
        className={cn(
          "fixed inset-0 z-[51] flex items-end md:items-center justify-center",
          "pointer-events-none"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={product.title}
      >
        <div
          ref={panelRef}
          className={cn(
            // Base
            "pointer-events-auto w-full bg-white",
            "flex flex-col",
            "outline-none",
            // Mobile: full-screen bottom sheet
            "h-[95dvh] rounded-t-3xl md:rounded-2xl",
            // Desktop: centered panel capped at 800px
            "md:h-auto md:max-h-[90dvh] md:max-w-[800px] md:mx-4",
            // Animation
            "transition-all duration-300 ease-out",
            isVisible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-8 md:translate-y-0 md:scale-95"
          )}
          // Prevent click inside from closing via backdrop handler
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Close button ─────────────────────────────────── */}
          <button
            onClick={onClose}
            className={cn(
              "absolute top-4 right-4 z-10",
              "w-9 h-9 rounded-full",
              "bg-neutral-100 hover:bg-neutral-200",
              "flex items-center justify-center",
              "transition-colors duration-150",
              "text-neutral-500 hover:text-primary"
            )}
            aria-label="Close quick view"
          >
            <X size={18} aria-hidden="true" />
          </button>

          {/* ── Drag handle (mobile only) ─────────────────────── */}
          <div className="flex justify-center pt-3 pb-1 md:hidden shrink-0" aria-hidden="true">
            <div className="w-10 h-1 rounded-full bg-neutral-200" />
          </div>

          {/* ══════════════════════════════════════════════════
              Two-column layout (desktop) / stacked (mobile)
          ══════════════════════════════════════════════════ */}
          <div className="flex flex-col md:flex-row md:divide-x md:divide-neutral-100 min-h-0 flex-1 overflow-hidden">

            {/* ── Left: Image gallery ───────────────────────── */}
            <div className="md:w-[45%] shrink-0 p-4 md:p-6 md:overflow-y-auto">
              <QuickViewGallery
                images={product.images.length > 0 ? product.images : (product.featuredImage ? [product.featuredImage] : [])}
                title={product.title}
                priority
              />
            </div>

            {/* ── Right: Product info ───────────────────────── */}
            <div className="flex flex-col min-h-0 flex-1">
              {/* Scrollable info area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

                {/* Trust badges */}
                {topBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {topBadges.map((type) => (
                      <Badge key={type} type={type} size="sm" />
                    ))}
                  </div>
                )}

                {/* Title */}
                <div>
                  <h2 className="type-h3 text-primary leading-snug pr-8">
                    {product.title}
                  </h2>
                  {product.vendor && (
                    <p className="text-xs text-neutral-400 mt-1 font-medium uppercase tracking-wide">
                      {product.vendor}
                    </p>
                  )}
                </div>

                {/* Rating */}
                {rating && rating.count > 0 && (
                  <StarRating rating={rating.rating} count={rating.count} size="sm" />
                )}

                {/* Price */}
                <ProductPrice
                  priceRange={product.priceRange}
                  compareAtPriceRange={product.compareAtPriceRange}
                  size="md"
                />

                {/* Description */}
                {description && (
                  <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                    {description}
                  </p>
                )}

                {/* Key features */}
                <KeyFeatures product={product} />

                {/* Out of stock notice */}
                {!product.availableForSale && (
                  <p className="text-sm font-medium text-error">
                    Currently out of stock
                  </p>
                )}

                {/* Desktop CTAs — inline */}
                <div className="hidden md:flex gap-3 pt-2">
                  <CtaButtons
                    canAddToCart={canAddToCart}
                    addState={addState}
                    onAddToCart={handleAddToCart}
                    productUrl={productUrl}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* ── Mobile CTAs — sticky bottom ──────────────────── */}
          <div className="md:hidden shrink-0 px-4 py-4 border-t border-neutral-100 bg-white">
            <div className="flex gap-3">
              <CtaButtons
                canAddToCart={canAddToCart}
                addState={addState}
                onAddToCart={handleAddToCart}
                productUrl={productUrl}
              />
            </div>
          </div>

        </div>
      </div>
    </Portal>
  );
}

// ─────────────────────────────────────────────────────────────────
// CTA buttons — shared between mobile sticky + desktop inline
// ─────────────────────────────────────────────────────────────────

interface CtaButtonsProps {
  canAddToCart: boolean;
  addState: AddState;
  onAddToCart: () => void;
  productUrl: string;
}

function CtaButtons({ canAddToCart, addState, onAddToCart, productUrl }: CtaButtonsProps) {
  return (
    <>
      {canAddToCart && (
        <button
          onClick={onAddToCart}
          disabled={addState === "loading" || addState === "added"}
          className={cn(
            "flex-1 btn rounded-xl py-3 text-sm font-semibold",
            "flex items-center justify-center gap-2",
            "transition-all duration-200",
            addState === "added"
              ? "bg-success text-white border-transparent"
              : "btn-primary"
          )}
          aria-live="polite"
        >
          {addState === "loading" && (
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {addState === "added" && <Check size={16} aria-hidden="true" />}
          {addState === "idle"    && <ShoppingBag size={16} aria-hidden="true" />}
          {addState === "idle"    && "Add to Cart"}
          {addState === "loading" && "Adding…"}
          {addState === "added"   && "Added!"}
        </button>
      )}

      <Link
        href={productUrl}
        className={cn(
          "btn rounded-xl py-3 text-sm font-medium",
          "flex items-center justify-center gap-2",
          "transition-colors duration-200",
          canAddToCart
            ? "btn-ghost border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary px-4"
            : "flex-1 btn-primary"
        )}
      >
        {canAddToCart ? (
          <>
            <ExternalLink size={15} aria-hidden="true" />
            Full Details
          </>
        ) : (
          <>
            View Full Details
            <ExternalLink size={15} aria-hidden="true" />
          </>
        )}
      </Link>
    </>
  );
}
