"use client";

/**
 * ProductGallery.tsx
 *
 * Full-featured product image gallery:
 * - Main image with hover-zoom on desktop, swipe indicators on mobile
 * - Thumbnail strip (horizontal scroll)
 * - Full-screen lightbox with keyboard & swipe navigation
 *
 * When a variant with a distinct image is selected, the gallery
 * scrolls to (or prepends) that image automatically.
 */

import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";
import type { ShopifyImage } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface ProductGalleryProps {
  /** All product images in display order. */
  images: ShopifyImage[];
  /** Active variant's image (if different from the default). */
  variantImage?: ShopifyImage | null;
  /** Used for alt text fallback. */
  title: string;
}

// ─────────────────────────────────────────────────────────────────
// Thumbnail
// ─────────────────────────────────────────────────────────────────

function Thumbnail({
  img,
  index,
  title,
  isActive,
  onClick,
}: {
  img: ShopifyImage;
  index: number;
  title: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`View image ${index + 1}`}
      aria-current={isActive ? "true" : undefined}
      className={cn(
        "flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200",
        isActive
          ? "border-gold shadow-[0_4px_24px_0_rgb(201_169_98/0.35)]"
          : "border-transparent hover:border-neutral-300"
      )}
    >
      <Image
        src={img.url}
        alt={img.altText ?? `${title} — image ${index + 1}`}
        width={80}
        height={80}
        className="object-cover w-full h-full"
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Lightbox
// ─────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  activeIndex,
  title,
  onClose,
  onPrev,
  onNext,
}: {
  images: ShopifyImage[];
  activeIndex: number;
  title: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const active = images[activeIndex];

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  if (!active) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${activeIndex + 1} of ${images.length}: ${title}`}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X size={28} />
      </button>

      {/* Counter */}
      <span className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-sm tabular-nums">
        {activeIndex + 1} / {images.length}
      </span>

      {/* Image */}
      <div
        className="relative w-full max-w-4xl max-h-[85vh] px-16 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-square max-h-[80vh]">
          <Image
            src={active.url}
            alt={active.altText ?? title}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 transition-colors hover:bg-white/10 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 transition-colors hover:bg-white/10 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function ProductGallery({ images, variantImage, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // When variant image changes, jump to it in the gallery
  useEffect(() => {
    if (!variantImage) return;
    const idx = images.findIndex((img) => img.url === variantImage.url);
    if (idx !== -1) {
      setActiveIndex(idx);
      // Scroll thumbnail into view
      const el = thumbsRef.current?.children[idx] as HTMLElement | undefined;
      el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [variantImage, images]);

  const displayImages = images.length > 0 ? images : [];
  const activeImage = displayImages[activeIndex] ?? null;

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % displayImages.length);
  }, [displayImages.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + displayImages.length) % displayImages.length);
  }, [displayImages.length]);

  if (!activeImage) return null;

  return (
    <>
      <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
        {/* ── Main image ──────────────────────────────────── */}
        <div
          className="relative aspect-square rounded-2xl overflow-hidden bg-sand group cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={activeImage.url}
            alt={activeImage.altText ?? title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 640px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Zoom hint */}
          <button
            onClick={() => setLightboxOpen(true)}
            className={cn(
              "absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-md",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "pointer-events-none group-hover:pointer-events-auto"
            )}
            aria-label="Open full-screen image"
            tabIndex={-1}
          >
            <ZoomIn size={18} className="text-primary" aria-hidden="true" />
          </button>

          {/* Prev / Next arrows (always visible on mobile, fade in on desktop) */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2",
                  "bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md",
                  "transition-opacity duration-200",
                  "md:opacity-0 md:group-hover:opacity-100"
                )}
                aria-label="Previous image"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2",
                  "bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md",
                  "transition-opacity duration-200",
                  "md:opacity-0 md:group-hover:opacity-100"
                )}
                aria-label="Next image"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </>
          )}

          {/* Mobile dot indicators */}
          {displayImages.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden"
              aria-hidden="true"
            >
              {displayImages.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 bg-white",
                    i === activeIndex ? "w-4 opacity-100" : "w-1.5 opacity-50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Thumbnail strip ──────────────────────────────── */}
        {displayImages.length > 1 && (
          <div
            ref={thumbsRef}
            className="flex gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
            role="list"
            aria-label="Product images"
          >
            {displayImages.map((img, i) => (
              <div key={img.url + i} role="listitem">
                <Thumbnail
                  img={img}
                  index={i}
                  title={title}
                  isActive={i === activeIndex}
                  onClick={() => setActiveIndex(i)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ─────────────────────────────────────── */}
      {mounted && lightboxOpen && (
        <Lightbox
          images={displayImages}
          activeIndex={activeIndex}
          title={title}
          onClose={() => setLightboxOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </>
  );
}
