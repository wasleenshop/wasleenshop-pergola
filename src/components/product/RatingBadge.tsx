import React from "react";
import { getProductRating } from "@/lib/judgeme/client";
import { StarRating } from "./StarRating";
import { Skeleton } from "@/components/ui/Skeleton";

export interface RatingBadgeProps {
  productId: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Server Component: RatingBadge
 * Fetches the correct Judge.me ratings asynchronously and caches the result.
 */
export async function RatingBadge({ productId, size = "sm" }: RatingBadgeProps) {
  // Parallel fetching optimization is assumed by standard RSC promises
  const ratingData = await getProductRating(productId);

  // Fallback: No stars if rating unavailable (invalid ID, Network Failure)
  if (!ratingData) {
    return null; // Return empty silently
  }

  return (
    <StarRating 
      rating={ratingData.rating} 
      count={ratingData.count} 
      size={size} 
    />
  );
}

/**
 * Fallback skeleton component for use within a Suspense boundary if wrapped manually.
 */
export function RatingBadgeSkeleton({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const heightClass = size === "sm" ? "h-3" : size === "md" ? "h-4" : "h-5";
  return (
    <div className="flex items-center gap-2">
      <Skeleton className={`w-24 ${heightClass} rounded`} />
      <Skeleton className={`w-10 ${heightClass} rounded`} />
    </div>
  );
}
