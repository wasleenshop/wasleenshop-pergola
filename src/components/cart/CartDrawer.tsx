"use client";

/**
 * components/cart/CartDrawer.tsx
 *
 * Slide-out mini-cart that reads ALL state from CartContext.
 * The only prop it accepts is optional store-level configuration
 * (freeShippingThreshold) — everything else comes from useCart().
 */

import {
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X, ShoppingBag, ArrowRight, Truck, Tag } from "lucide-react";
import { CartItem } from "./CartItem";
import { useCart } from "./CartContext";
import type { CartLine } from "@/lib/shopify/types";
import { formatMoney } from "@/lib/shopify/normalise";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface CartDrawerProps {
  /**
   * AED threshold for free-shipping progress bar.
   * 0 (default) → "Free delivery on all orders" banner.
   * >0           → animated progress bar.
   * Source: store env var or Shopify shop settings.
   */
  freeShippingThreshold?: number;
}

// ─────────────────────────────────────────────────────────────────
// Focus trap hook
// ─────────────────────────────────────────────────────────────────

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    const getEls    = () => Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
    getEls()[0]?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const els = getEls();
      if (!els.length) { e.preventDefault(); return; }
      const first = els[0];
      const last  = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };
    container.addEventListener("keydown", handler);
    return () => container.removeEventListener("keydown", handler);
  }, [active, ref]);
}

// ─────────────────────────────────────────────────────────────────
// Portal
// ─────────────────────────────────────────────────────────────────

function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 py-16 text-center gap-6">
      <div className="relative w-24 h-24 animate-float-slow">
        <div className="absolute inset-0 rounded-full bg-gold/10" />
        <div className="absolute inset-2 rounded-full bg-gold/5" />
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 64 64" fill="none" className="w-14 h-14" aria-hidden="true">
            <rect x="8"  y="12" width="48" height="4"  rx="2" fill="var(--color-gold)" opacity="0.5" />
            <rect x="8"  y="12" width="4"  height="36" rx="2" fill="var(--color-gold)" opacity="0.35" />
            <rect x="52" y="12" width="4"  height="36" rx="2" fill="var(--color-gold)" opacity="0.35" />
            <rect x="17" y="12" width="2"  height="28" rx="1" fill="var(--color-gold)" opacity="0.25" />
            <rect x="26" y="12" width="2"  height="28" rx="1" fill="var(--color-gold)" opacity="0.25" />
            <rect x="35" y="12" width="2"  height="28" rx="1" fill="var(--color-gold)" opacity="0.25" />
            <rect x="44" y="12" width="2"  height="28" rx="1" fill="var(--color-gold)" opacity="0.25" />
            <path d="M24 44h16l-2 10H26L24 44z"   stroke="var(--color-gold)" strokeWidth="1.5" strokeLinejoin="round" fill="none" opacity="0.6" />
            <path d="M28 44v-4a4 4 0 018 0v4"      stroke="var(--color-gold)" strokeWidth="1.5" strokeLinecap="round"  fill="none" opacity="0.6" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="type-h4 text-primary">Your cart is empty</h3>
        <p className="type-body-sm text-neutral-500 max-w-[220px] mx-auto leading-relaxed">
          Discover our premium pergola collection and bring luxury to your outdoor space.
        </p>
      </div>

      <Link href="/collections" onClick={onClose} className="btn btn-primary btn-sm mt-2">
        Continue Shopping
        <ArrowRight size={15} aria-hidden="true" />
      </Link>
    </div>
  );
}

/** Shown while addToCart is in-flight and the cart hasn't resolved yet. */
function AddingSkeletonRow() {
  return (
    <div className="flex gap-3.5 py-4 border-b border-neutral-100 animate-pulse">
      <div className="skeleton w-[76px] h-[76px] rounded-xl shrink-0" />
      <div className="flex flex-col flex-1 gap-2 pt-1">
        <div className="skeleton skeleton-text w-3/4 h-3.5" />
        <div className="skeleton skeleton-text w-1/2 h-3"   />
        <div className="skeleton skeleton-text w-1/3 h-3"   />
        <div className="flex items-center justify-between mt-1">
          <div className="skeleton w-20 h-7 rounded-full" />
          <div className="skeleton skeleton-text w-16 h-4" />
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="px-5 py-2 space-y-0" aria-label="Loading cart" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-3.5 py-4 border-b border-neutral-100 last:border-0">
          <div className="skeleton w-[76px] h-[76px] rounded-xl shrink-0" />
          <div className="flex flex-col flex-1 gap-2 pt-1">
            <div className="skeleton skeleton-text w-3/4 h-3.5" />
            <div className="skeleton skeleton-text w-1/2 h-3"   />
            <div className="skeleton skeleton-text w-1/3 h-3"   />
            <div className="flex items-center justify-between mt-1">
              <div className="skeleton w-20 h-7 rounded-full" />
              <div className="skeleton skeleton-text w-16 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CartDrawer
// ─────────────────────────────────────────────────────────────────

export function CartDrawer({ freeShippingThreshold = 0 }: CartDrawerProps) {
  const {
    cart,
    isCartOpen,
    isAddingToCart,
    pendingLineIds,
    closeCart,
    updateCartItem,
    removeCartItem,
  } = useCart();

  // ── Two-phase animation: mount → CSS enter ────────────────────
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible,  setIsVisible]  = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      setIsRendered(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setIsVisible(true)));
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setIsRendered(false), 350);
      return () => clearTimeout(t);
    }
  }, [isCartOpen]);

  // ── Body scroll lock ──────────────────────────────────────────
  useEffect(() => {
    if (!isCartOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isCartOpen]);

  // ── ESC key ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isCartOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeCart(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isCartOpen, closeCart]);

  // ── Focus trap + return focus on close ────────────────────────
  const drawerRef  = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);

  useFocusTrap(drawerRef, isVisible);

  useEffect(() => {
    if (isCartOpen) { triggerRef.current = document.activeElement; }
    else            { (triggerRef.current as HTMLElement | null)?.focus(); }
  }, [isCartOpen]);

  // ── Derived values ────────────────────────────────────────────
  const lines: CartLine[] = cart?.lines.edges.map((e) => e.node) ?? [];
  const itemCount         = cart?.totalQuantity ?? 0;
  const subtotalAmount    = cart?.cost.subtotalAmount;

  // Cart is "loading" if addToCart is in-flight but the cart object hasn't
  // yet been populated with at least one item from this session.
  const isInitialLoading = isAddingToCart && lines.length === 0;
  const isEmpty          = !isInitialLoading && lines.length === 0 && !isAddingToCart;

  // Total savings from compareAt prices across all lines
  const totalSavings = lines.reduce((acc, line) => {
    const cap = line.cost.compareAtAmountPerQuantity;
    if (!cap) return acc;
    const diff = parseFloat(cap.amount) - parseFloat(line.cost.amountPerQuantity.amount);
    return diff > 0 ? acc + diff * line.quantity : acc;
  }, 0);
  const hasSavings = totalSavings > 0;

  // Free-shipping progress
  const showProgress        = freeShippingThreshold > 0 && !!subtotalAmount;
  const progressAmount      = subtotalAmount ? parseFloat(subtotalAmount.amount) : 0;
  const progressPct         = showProgress ? Math.min(100, (progressAmount / freeShippingThreshold) * 100) : 100;
  const remaining           = showProgress ? Math.max(0, freeShippingThreshold - progressAmount) : 0;
  const freeShippingUnlocked = !showProgress || progressPct >= 100;

  // ── Checkout handler — bypass Next.js router ──────────────────
  function handleCheckout() {
    if (cart?.checkoutUrl && cart.checkoutUrl !== "#") {
      window.location.href = cart.checkoutUrl;
    }
  }

  if (!isRendered) return null;

  return (
    <Portal>
      <>
        {/* ── Backdrop ─────────────────────────────────────── */}
        <div
          className={cn(
            "fixed inset-0 z-[50] bg-black/50 backdrop-blur-sm",
            "transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          onClick={closeCart}
          aria-hidden="true"
        />

        {/* ── Drawer panel ─────────────────────────────────── */}
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          tabIndex={-1}
          className={cn(
            "fixed right-0 top-0 bottom-0 z-[51]",
            "w-full max-w-md",
            "flex flex-col bg-white outline-none",
            "shadow-[-12px_0_48px_rgb(26,22,20,0.18)]",
            "transition-transform duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
            isVisible ? "translate-x-0" : "translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Gold left-edge accent */}
          <div
            className="absolute left-0 top-0 w-[3px] h-full pointer-events-none z-10"
            style={{ background: "var(--gradient-gold)" }}
            aria-hidden="true"
          />

          {/* ════════════════════════════════════════════════
              HEADER
          ════════════════════════════════════════════════ */}
          <div className="relative flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <ShoppingBag size={22} className="text-gold" aria-hidden="true" />
              <h2
                id="cart-drawer-title"
                className="font-heading text-xl font-semibold text-primary tracking-tight"
              >
                Your Cart
              </h2>
              {itemCount > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[1.375rem] h-[1.375rem] px-1.5 rounded-full text-[11px] font-bold leading-none bg-primary text-gold tabular-nums"
                  aria-label={`${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                >
                  {itemCount}
                </span>
              )}
            </div>

            <button
              onClick={closeCart}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-primary transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label="Close cart"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          {/* Gold divider */}
          <div className="mx-5 shrink-0 divider-gold" />

          {/* ════════════════════════════════════════════════
              FREE SHIPPING BANNER
          ════════════════════════════════════════════════ */}
          {!isEmpty && (
            <div
              className={cn(
                "mx-5 mt-3 px-3.5 py-2.5 rounded-xl shrink-0 flex items-center gap-2.5 text-xs",
                freeShippingUnlocked
                  ? "bg-success/10 text-success"
                  : "bg-sand text-neutral-600"
              )}
            >
              <Truck
                size={15}
                className={cn("shrink-0", freeShippingUnlocked ? "text-success" : "text-gold")}
                aria-hidden="true"
              />
              {freeShippingUnlocked ? (
                <span className="font-medium">
                  {showProgress ? "You've unlocked free shipping! 🎉" : "Free delivery on all orders"}
                </span>
              ) : (
                <div className="flex-1 space-y-1.5">
                  <span className="font-medium">
                    Add{" "}
                    <strong>
                      {formatMoney({
                        amount:       String(remaining),
                        currencyCode: subtotalAmount?.currencyCode ?? "AED",
                      })}
                    </strong>{" "}
                    more for free shipping
                  </span>
                  <div className="h-1 rounded-full bg-neutral-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPct}%`, background: "var(--gradient-gold)" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════
              BODY — scrollable items
          ════════════════════════════════════════════════ */}
          <div className="flex-1 overflow-y-auto min-h-0 pl-5 pr-3">
            {/* Initial load skeleton */}
            {isInitialLoading && <CartSkeleton />}

            {/* Empty state */}
            {isEmpty && <EmptyState onClose={closeCart} />}

            {/* Item list */}
            {!isEmpty && !isInitialLoading && (
              <ul role="list" className="divide-y divide-neutral-100 pr-2">
                {/* Existing lines */}
                {lines.map((line, i) => (
                  <li key={line.id} role="listitem">
                    <CartItem
                      line={line}
                      onUpdateQuantity={updateCartItem}
                      onRemove={removeCartItem}
                      disabled={pendingLineIds.has(line.id)}
                      animationDelay={i * 60}
                    />
                  </li>
                ))}
                {/* Skeleton row while a new item is being added */}
                {isAddingToCart && <li role="listitem"><AddingSkeletonRow /></li>}
              </ul>
            )}
          </div>

          {/* ════════════════════════════════════════════════
              FOOTER — only when cart has items
          ════════════════════════════════════════════════ */}
          {!isEmpty && !isInitialLoading && subtotalAmount && (
            <div className="shrink-0 bg-white border-t border-neutral-100 px-5 pt-4 pb-5 space-y-3">
              {/* Savings callout */}
              {hasSavings && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gold/10">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-gold-dark">
                    <Tag size={13} aria-hidden="true" />
                    You&apos;re saving
                  </span>
                  <span className="text-xs font-bold text-gold-dark tabular-nums">
                    {formatMoney({
                      amount:       totalSavings.toFixed(2),
                      currencyCode: subtotalAmount.currencyCode,
                    })}
                  </span>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">
                  Subtotal
                  <span className="text-neutral-400 ml-1 text-xs">
                    ({itemCount} item{itemCount !== 1 ? "s" : ""})
                  </span>
                </span>
                <span className="text-base font-bold text-primary tabular-nums">
                  {formatMoney(subtotalAmount)}
                </span>
              </div>

              {/* Shipping note */}
              <p className="text-xs text-neutral-400 text-center leading-snug">
                Shipping &amp; VAT calculated at checkout
              </p>

              {/* Checkout CTA — uses window.location.href to bypass Next.js router */}
              <button
                onClick={handleCheckout}
                disabled={isAddingToCart || lines.length === 0}
                className={cn(
                  "btn btn-primary w-full btn-lg group justify-center rounded-2xl",
                  "shadow-gold hover:shadow-gold-lg",
                  "disabled:opacity-50 disabled:pointer-events-none"
                )}
                aria-label={`Proceed to checkout — ${formatMoney(subtotalAmount)}`}
              >
                {isAddingToCart ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Updating cart…
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>

              {/* Trust microcopy */}
              <div className="flex items-center justify-center gap-4 pt-0.5">
                {([
                  { icon: "🔒", label: "Secure checkout"  },
                  { icon: "✅", label: "DED Licensed"     },
                  { icon: "🏅", label: "5-Year Warranty"  },
                ] as const).map(({ icon, label }) => (
                  <span key={label} className="flex items-center gap-1 text-[10px] text-neutral-400">
                    <span aria-hidden="true">{icon}</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    </Portal>
  );
}
