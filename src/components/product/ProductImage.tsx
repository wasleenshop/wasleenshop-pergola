"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ShopifyImage, Maybe } from "@/lib/shopify/types";
import { cn } from "@/lib/utils";

export interface ProductImageProps {
  /** Pre-ordered flat list (featuredImage first). Max 5 shown. */
  images: ShopifyImage[];
  /** Fallback when images array is empty */
  featuredImage: Maybe<ShopifyImage>;
  title: string;
  /** Controlled by parent — true when mouse is over the card (desktop only) */
  isHovered?: boolean;
  /** Use Next.js priority loading (set true for the first 4 cards on page) */
  priority?: boolean;
  /** Tailwind sizes string passed to next/image */
  sizes?: string;
}

const DEFAULT_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw";

export function ProductImage({
  images,
  featuredImage,
  title,
  isHovered = false,
  priority = false,
  sizes = DEFAULT_SIZES,
}: ProductImageProps) {
  const [mobileIndex, setMobileIndex] = useState(0);

  // Build ordered list: deduplicate featuredImage from images array
  const allImages: ShopifyImage[] = (() => {
    const base = featuredImage
      ? [featuredImage, ...images.filter((img) => img.url !== featuredImage.url)]
      : images;
    return base.slice(0, 5);
  })();

  const hasMultiple = allImages.length > 1;

  // Mobile auto-rotation — only on touch/pointer-coarse devices
  useEffect(() => {
    if (!hasMultiple) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: none)").matches) return; // desktop

    const timer = setInterval(() => {
      setMobileIndex((i) => (i + 1) % allImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [hasMultiple, allImages.length]);

  // Which image index is currently visible:
  //  Desktop: 0 (default) or 1 (on hover) — binary crossfade
  //  Mobile:  mobileIndex (auto-rotating)
  //
  // When isHovered changes we rely on CSS opacity transitions, not index switching,
  // so desktop hover always refers to image at slot 0 vs slot 1.
  const visibleIndex: number = isHovered && hasMultiple ? 1 : mobileIndex;

  // No images — render placeholder
  if (allImages.length === 0) {
    return (
      <div
        className="w-full h-full bg-sand-dark flex items-center justify-center"
        aria-label={`${title} — no image available`}
      >
        <svg
          className="w-12 h-12 text-neutral-300"
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
    <div className="relative w-full h-full">
      {allImages.map((image, index) => {
        const isVisible = index === visibleIndex;
        return (
          <Image
            key={`${image.url}-${index}`}
            src={image.url}
            alt={image.altText ?? (index === 0 ? title : `${title} — view ${index + 1}`)}
            fill
            className={cn(
              "object-cover transition-opacity duration-500 ease-in-out",
              isVisible ? "opacity-100" : "opacity-0"
            )}
            sizes={sizes}
            priority={priority && index === 0}
            // Preload the second image during hover for instant crossfade
            loading={!priority && index > 1 ? "lazy" : undefined}
          />
        );
      })}

      {/* Mobile image indicator dots */}
      {hasMultiple && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 md:hidden pointer-events-none"
          aria-hidden="true"
        >
          {allImages.slice(0, 5).map((_, i) => (
            <span
              key={i}
              className={cn(
                "block w-1.5 h-1.5 rounded-full transition-colors duration-300",
                i === mobileIndex ? "bg-white" : "bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
