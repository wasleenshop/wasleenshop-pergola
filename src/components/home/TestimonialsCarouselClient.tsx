"use client";

/**
 * TestimonialsCarouselClient.tsx
 *
 * Client Component: auto-rotating testimonial carousel.
 * Receives pre-fetched reviews from TestimonialsCarousel (server component).
 *
 * Features:
 *  - Auto-rotates every 7 seconds (pauses on hover/focus)
 *  - Prev/Next navigation
 *  - Active dot indicator
 *  - Star rating display
 *  - Smooth fade + slide transition between cards
 */

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StarRating } from "@/components/product/StarRating";
import type { ShopReview } from "@/lib/judgeme/shop-reviews";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface TestimonialsCarouselClientProps {
  reviews: ShopReview[];
}

// ─────────────────────────────────────────────────────────────────
// Quote icon (decorative)
// ─────────────────────────────────────────────────────────────────

function QuoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="40"
      height="32"
      viewBox="0 0 40 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 32V19.2C0 8.533 6.4 2.133 19.2 0L21.6 3.6C15.6 4.8 11.867 7.2 10.4 10.8 9.467 12.933 9.2 15.2 9.6 17.6H16V32H0ZM24 32V19.2C24 8.533 30.4 2.133 43.2 0L45.6 3.6C39.6 4.8 35.867 7.2 34.4 10.8c-.933 2.133-1.2 4.4-.8 6.8H40V32H24Z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Single review card
// ─────────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  isActive,
}: {
  review: ShopReview;
  isActive: boolean;
}) {
  const initials = review.reviewerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formattedDate = review.publishedAt
    ? new Date(review.publishedAt).toLocaleDateString("en-AE", {
        year: "numeric",
        month: "short",
      })
    : "";

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col justify-between",
        "transition-all duration-500 ease-in-out",
        isActive
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-8 pointer-events-none"
      )}
      aria-hidden={!isActive}
    >
      {/* Quote mark */}
      <QuoteIcon className="text-gold/20 mb-2 w-10 h-8 shrink-0" />

      {/* Review body */}
      <blockquote className="flex-1">
        {review.title && (
          <p className="type-h5 text-primary mb-3 font-semibold">
            &ldquo;{review.title}&rdquo;
          </p>
        )}
        <p className="type-body-lg text-neutral-600 leading-relaxed line-clamp-5">
          {review.body}
        </p>
      </blockquote>

      {/* Reviewer info */}
      <footer className="mt-6 flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-dark to-gold flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <span className="type-label font-bold text-primary">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="type-label-lg font-semibold text-primary truncate">
            {review.reviewerName}
          </p>
          {review.productTitle && (
            <p className="type-body-sm text-neutral-400 truncate">
              Verified buyer · {review.productTitle}
            </p>
          )}
          {formattedDate && (
            <p className="type-body-sm text-neutral-400">{formattedDate}</p>
          )}
        </div>

        {/* Star rating */}
        <div className="shrink-0">
          <StarRating rating={review.rating} count={0} size="sm" />
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function TestimonialsCarouselClient({
  reviews,
}: TestimonialsCarouselClientProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i + 1) % reviews.length);
  }, [reviews.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  // Auto-rotate every 7s
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;
    const timer = setInterval(goNext, 7000);
    return () => clearInterval(timer);
  }, [isPaused, goNext, reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Card stage — fixed height */}
      <div className="relative h-72 sm:h-64">
        {reviews.map((review, index) => (
          <ReviewCard
            key={review.id}
            review={review}
            isActive={index === activeIndex}
          />
        ))}
      </div>

      {/* Controls */}
      {reviews.length > 1 && (
        <div className="flex items-center gap-6 mt-8">
          {/* Prev */}
          <button
            onClick={goPrev}
            className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-all duration-200"
            aria-label="Previous review"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          {/* Dots */}
          <div
            className="flex items-center gap-2 flex-1 justify-center"
            role="tablist"
            aria-label="Review indicator"
          >
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Review ${index + 1} of ${reviews.length}`}
                className={cn(
                  "rounded-full transition-all duration-300",
                  index === activeIndex
                    ? "w-6 h-2 bg-gold"
                    : "w-2 h-2 bg-neutral-300 hover:bg-neutral-400"
                )}
              />
            ))}
          </div>

          {/* Next */}
          <button
            onClick={goNext}
            className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-gold hover:border-gold hover:text-white transition-all duration-200"
            aria-label="Next review"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
