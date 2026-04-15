"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface QuickViewGalleryProps {
  images: ShopifyImage[];
  title: string;
  /** Use Next.js priority loading for the first image */
  priority?: boolean;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function QuickViewGallery({
  images,
  title,
  priority = false,
}: QuickViewGalleryProps) {
  const [current, setCurrent]   = useState(0);
  const pointerStart             = useRef<{ x: number; time: number } | null>(null);
  const isDragging               = useRef(false);
  const containerRef             = useRef<HTMLDivElement>(null);

  const count   = images.length;
  const canPrev = current > 0;
  const canNext = current < count - 1;

  const prev = useCallback(() => setCurrent((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setCurrent((i) => Math.min(count - 1, i + 1)), [count]);

  // ── Keyboard navigation ───────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    };

    container.addEventListener("keydown", handleKey);
    return () => container.removeEventListener("keydown", handleKey);
  }, [prev, next]);

  // ── Pointer (touch + mouse) swipe ────────────────────────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointerStart.current = { x: e.clientX, time: performance.now() };
    isDragging.current   = false;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;
    if (Math.abs(e.clientX - pointerStart.current.x) > 8) {
      isDragging.current = true;
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;

    const dx       = e.clientX - pointerStart.current.x;
    const dt       = performance.now() - pointerStart.current.time;
    const velocity = Math.abs(dx) / Math.max(dt, 1);

    if (isDragging.current && (Math.abs(dx) > 60 || velocity > 0.5)) {
      if (dx < 0) next();
      else         prev();
    }

    pointerStart.current = null;
    isDragging.current   = false;
  };

  // ── No images fallback ────────────────────────────────────────
  if (count === 0) {
    return (
      <div className="w-full aspect-square bg-sand-dark flex items-center justify-center rounded-2xl">
        <svg
          className="w-10 h-10 text-neutral-300"
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
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 outline-none"
      tabIndex={0}
      aria-label={`Product image gallery, ${count} image${count > 1 ? "s" : ""}`}
      role="region"
    >
      {/* ── Main image frame ──────────────────────────────────── */}
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-2xl bg-sand",
          "cursor-grab active:cursor-grabbing select-none",
          "touch-pan-y"
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => { pointerStart.current = null; }}
        aria-live="polite"
        aria-atomic="true"
      >
        {images.map((img, i) => (
          <Image
            key={`${img.url}-${i}`}
            src={img.url}
            alt={
              img.altText ??
              (i === 0 ? title : `${title} — image ${i + 1} of ${count}`)
            }
            fill
            className={cn(
              "object-cover transition-opacity duration-300 ease-in-out",
              i === current ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 768px) 100vw, 400px"
            priority={priority && i === 0}
            draggable={false}
          />
        ))}

        {/* ── Arrow buttons ────────────────────────────────────── */}
        {count > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className={cn(
                "absolute left-2.5 top-1/2 -translate-y-1/2 z-10",
                "w-9 h-9 rounded-full bg-white/90 shadow-md",
                "flex items-center justify-center",
                "transition-all duration-150",
                canPrev
                  ? "opacity-100 hover:bg-white hover:shadow-lg"
                  : "opacity-0 pointer-events-none"
              )}
              aria-label="Previous image"
              tabIndex={canPrev ? 0 : -1}
            >
              <ChevronLeft size={18} className="text-primary" aria-hidden="true" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className={cn(
                "absolute right-2.5 top-1/2 -translate-y-1/2 z-10",
                "w-9 h-9 rounded-full bg-white/90 shadow-md",
                "flex items-center justify-center",
                "transition-all duration-150",
                canNext
                  ? "opacity-100 hover:bg-white hover:shadow-lg"
                  : "opacity-0 pointer-events-none"
              )}
              aria-label="Next image"
              tabIndex={canNext ? 0 : -1}
            >
              <ChevronRight size={18} className="text-primary" aria-hidden="true" />
            </button>
          </>
        )}

        {/* ── Image counter badge ──────────────────────────────── */}
        {count > 1 && (
          <span
            className="absolute bottom-2.5 right-2.5 z-10 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded-full pointer-events-none"
            aria-hidden="true"
          >
            {current + 1} / {count}
          </span>
        )}
      </div>

      {/* ── Thumbnail strip / dot indicator ─────────────────────── */}
      {count > 1 && (
        <div
          className="flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label="Select image"
        >
          {images.map((img, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Image ${i + 1}`}
              onClick={() => setCurrent(i)}
              className={cn(
                "relative overflow-hidden rounded-lg transition-all duration-200",
                "border-2 shrink-0",
                i === current
                  ? "w-12 h-12 border-gold shadow-md"
                  : "w-10 h-10 border-transparent opacity-60 hover:opacity-100 hover:border-neutral-300"
              )}
            >
              <Image
                src={img.url}
                alt={img.altText ?? `Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
