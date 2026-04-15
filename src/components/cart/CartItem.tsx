"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Trash2, Minus, Plus } from "lucide-react";
import type { CartLine } from "@/lib/shopify/types";
import { formatMoney, isOnSale } from "@/lib/shopify/normalise";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface CartItemProps {
  /** The normalised Shopify CartLine object */
  line: CartLine;
  /** Called with (lineId, newQty). If newQty reaches 0, call onRemove instead */
  onUpdateQuantity: (lineId: string, quantity: number) => Promise<void>;
  /** Called with lineId when the item should be fully removed */
  onRemove: (lineId: string) => Promise<void>;
  /** Set true during a global cart mutation to disable all controls */
  disabled?: boolean;
  /** CSS animation-delay in ms — for staggered entry on drawer open */
  animationDelay?: number;
}

type ItemAction = "idle" | "increment" | "decrement" | "remove";

// ─────────────────────────────────────────────────────────────────
// Micro-spinner (inline — avoids a separate import)
// ─────────────────────────────────────────────────────────────────

function InlineSpinner({ size = 12 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// CartItem
// ─────────────────────────────────────────────────────────────────

export function CartItem({
  line,
  onUpdateQuantity,
  onRemove,
  disabled = false,
  animationDelay = 0,
}: CartItemProps) {
  const [action, setAction] = useState<ItemAction>("idle");
  const isBusy = action !== "idle";

  const { merchandise, quantity, cost } = line;
  const image = merchandise.image ?? merchandise.product.featuredImage;
  const onSale = isOnSale(merchandise.price, merchandise.compareAtPrice);

  // Build variant label — join selectedOptions (e.g. "Charcoal / 3×4m")
  const variantLabel = merchandise.selectedOptions.map((o) => o.value).join(" / ");
  const showVariant  = !!variantLabel && variantLabel !== "Default Title";

  // ── Handlers ─────────────────────────────────────────────────

  const handleDecrement = useCallback(async () => {
    if (isBusy || disabled) return;
    if (quantity <= 1) {
      setAction("remove");
      try   { await onRemove(line.id); }
      finally { setAction("idle"); }
    } else {
      setAction("decrement");
      try   { await onUpdateQuantity(line.id, quantity - 1); }
      finally { setAction("idle"); }
    }
  }, [isBusy, disabled, quantity, line.id, onRemove, onUpdateQuantity]);

  const handleIncrement = useCallback(async () => {
    if (isBusy || disabled) return;
    setAction("increment");
    try   { await onUpdateQuantity(line.id, quantity + 1); }
    finally { setAction("idle"); }
  }, [isBusy, disabled, quantity, line.id, onUpdateQuantity]);

  const handleRemove = useCallback(async () => {
    if (isBusy || disabled) return;
    setAction("remove");
    try   { await onRemove(line.id); }
    finally { setAction("idle"); }
  }, [isBusy, disabled, line.id, onRemove]);

  // ── Render ────────────────────────────────────────────────────

  return (
    <article
      className={cn(
        "flex gap-3.5 py-4 animate-fade-in-up",
        "transition-opacity duration-200",
        isBusy && "opacity-50 pointer-events-none"
      )}
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: "both" }}
      aria-label={merchandise.product.title}
    >
      {/* ── Product Image ──────────────────────────────────── */}
      <div className="relative w-[76px] h-[76px] shrink-0 overflow-hidden rounded-xl bg-sand shadow-sm">
        {image ? (
          <Image
            src={image.url}
            alt={image.altText ?? merchandise.product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          // No-image placeholder
          <div className="w-full h-full flex items-center justify-center bg-sand-dark">
            <svg
              className="w-7 h-7 text-neutral-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* On-sale ribbon */}
        {onSale && (
          <div
            className="absolute top-1 left-1 bg-error text-white text-[9px] font-bold px-1 py-0.5 rounded"
            aria-hidden="true"
          >
            SALE
          </div>
        )}
      </div>

      {/* ── Info column ────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 gap-1.5">

        {/* Title + Remove button row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-primary leading-snug line-clamp-2 flex-1">
            {merchandise.product.title}
          </h3>

          <button
            onClick={handleRemove}
            disabled={isBusy || disabled}
            className={cn(
              "shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
              "text-neutral-400 hover:text-error hover:bg-red-50",
              "transition-all duration-150",
              "focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-1",
              "outline-none"
            )}
            aria-label={`Remove ${merchandise.product.title}`}
          >
            {action === "remove"
              ? <InlineSpinner size={13} />
              : <Trash2 size={13} aria-hidden="true" />
            }
          </button>
        </div>

        {/* Variant label */}
        {showVariant && (
          <p className="text-xs text-neutral-500 leading-none truncate">
            {variantLabel}
          </p>
        )}

        {/* Unit price */}
        <div className="flex items-center gap-1.5">
          <span className={cn("text-xs font-medium", onSale ? "text-error" : "text-neutral-600")}>
            {formatMoney(merchandise.price)}
          </span>
          {onSale && merchandise.compareAtPrice && (
            <span className="text-xs text-neutral-400 line-through">
              {formatMoney(merchandise.compareAtPrice)}
            </span>
          )}
          <span className="text-xs text-neutral-400">/ unit</span>
        </div>

        {/* Quantity selector + line total */}
        <div className="flex items-center justify-between mt-0.5">

          {/* ── Qty control ─────────────────────────────────── */}
          <div
            className="flex items-center rounded-full border border-neutral-200 bg-white"
            role="group"
            aria-label="Quantity"
          >
            <button
              onClick={handleDecrement}
              disabled={isBusy || disabled}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full",
                "text-neutral-500 hover:text-primary hover:bg-sand",
                "transition-colors duration-150 outline-none",
                "focus-visible:ring-1 focus-visible:ring-gold"
              )}
              aria-label={quantity <= 1 ? "Remove item" : "Decrease quantity"}
            >
              {action === "decrement" ? <InlineSpinner size={10} /> : <Minus size={11} aria-hidden="true" />}
            </button>

            <span
              className="w-7 text-center text-sm font-semibold text-primary select-none tabular-nums"
              aria-live="polite"
              aria-label={`Quantity: ${quantity}`}
            >
              {quantity}
            </span>

            <button
              onClick={handleIncrement}
              disabled={isBusy || disabled}
              className={cn(
                "w-7 h-7 flex items-center justify-center rounded-full",
                "text-neutral-500 hover:text-primary hover:bg-sand",
                "transition-colors duration-150 outline-none",
                "focus-visible:ring-1 focus-visible:ring-gold"
              )}
              aria-label="Increase quantity"
            >
              {action === "increment" ? <InlineSpinner size={10} /> : <Plus size={11} aria-hidden="true" />}
            </button>
          </div>

          {/* ── Line total ──────────────────────────────────── */}
          <div className="text-right">
            <span className="text-sm font-bold text-primary tabular-nums">
              {formatMoney(cost.totalAmount)}
            </span>
            {cost.compareAtAmountPerQuantity &&
              parseFloat(cost.compareAtAmountPerQuantity.amount) > parseFloat(cost.amountPerQuantity.amount) && (
                <p className="text-[10px] text-neutral-400 line-through tabular-nums leading-none mt-0.5">
                  {formatMoney({
                    amount: String(
                      parseFloat(cost.compareAtAmountPerQuantity.amount) * quantity
                    ),
                    currencyCode: cost.compareAtAmountPerQuantity.currencyCode,
                  })}
                </p>
              )
            }
          </div>
        </div>
      </div>
    </article>
  );
}
