import * as React from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export interface StarRatingProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  maxStars?: number;
}

const sizeMap = {
  sm: { icon: 14, text: "text-xs" },
  md: { icon: 18, text: "text-sm" },
  lg: { icon: 24, text: "text-base" },
};

export const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  ({ className, rating, count, size = "md", maxStars = 5, ...props }, ref) => {
    const { icon: iconSize, text: textSize } = sizeMap[size];
    
    // Safely clamp rating
    const safeRating = Math.max(0, Math.min(rating, maxStars));
    
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div 
        ref={ref} 
        className={cn("flex items-center gap-1.5 text-neutral-600", className)}
        aria-label={`${safeRating} out of ${maxStars} stars${count !== undefined ? `, based on ${count} reviews` : ''}`}
        title={`${safeRating} out of ${maxStars} stars`}
        {...props}
      >
        <div className="flex" aria-hidden="true">
          {Array.from({ length: fullStars }).map((_, i) => (
            <Star key={`full-${i}`} size={iconSize} className="fill-warning text-warning" />
          ))}
          {hasHalfStar && (
            <div className="relative">
              <Star size={iconSize} className="text-neutral-300 fill-transparent" />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star size={iconSize} className="fill-warning text-warning" />
              </div>
            </div>
          )}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <Star key={`empty-${i}`} size={iconSize} className="text-neutral-300 fill-transparent" />
          ))}
        </div>
        
        {count !== undefined && (
          <span className={cn("font-medium ml-1", textSize)}>
            ({count})
          </span>
        )}
      </div>
    );
  }
);
StarRating.displayName = "StarRating";
