import React from "react";
import { StarRating as UIStarRating } from "@/components/ui/StarRating";

export interface StarRatingProps {
  /** The average rating from 0 to 5 */
  rating: number;
  /** Total number of reviews */
  count?: number;
  /** Visual size class */
  size?: "sm" | "md" | "lg";
}

/**
 * Product Star Rating Component
 * Directly maps to Wasleen's UI Library component but isolates
 * the interface to strictly the props derived from Judge.me endpoints.
 */
export function StarRating({ rating, count, size = "sm" }: StarRatingProps) {
  // If no rating data, display empty state or standard default
  if (!rating && rating !== 0) {
    return null; // Silent fallback (as per integration pattern rule: "Fallback: No stars if rating unavailable")
  }

  return (
    <UIStarRating 
      rating={rating} 
      count={count} 
      size={size} 
      className="text-gold fill-gold" 
    />
  );
}
