import React from "react";
import { cn } from "@/lib/utils";

export type ProductBadgeType = 
  | "ded_licensed"
  | "made_in_uae"
  | "installation_included"
  | "warranty_5year"
  | "super_deal"
  | "wasleen_choice"
  | "dubai_climate";

export type ProductBadgeSize = "sm" | "md" | "lg";

export type ProductBadgePosition = "top-left" | "top-right" | "bottom" | "static";

export interface ProductBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The type of badge, dictates colors, icon and text label */
  type: ProductBadgeType;
  /** Sizing of the badge */
  size?: ProductBadgeSize;
  /** Positioning if placed over a product image */
  position?: ProductBadgePosition;
}

const BADGE_CONFIG: Record<ProductBadgeType, { 
  icon: string; 
  label: string; 
  className: string;
}> = {
  ded_licensed: {
    icon: "🏛️",
    label: "DED Licensed",
    className: "bg-[image:var(--gradient-gold)] text-[var(--color-primary)]",
  },
  made_in_uae: {
    icon: "🇦🇪",
    label: "Made in UAE",
    // Exact requested color -> Emerald (#059669)
    className: "bg-[#059669] text-white",
  },
  installation_included: {
    icon: "🔧",
    label: "Free Installation",
    // Exact requested color -> Amber (#D97706)
    className: "bg-[#D97706] text-white",
  },
  warranty_5year: {
    icon: "🛡️",
    label: "5-Year Warranty",
    // Exact requested color -> Blue (#1E40AF)
    className: "bg-[#1E40AF] text-white",
  },
  super_deal: {
    icon: "🔥",
    label: "Super Deal",
    // Red gradient with pulse
    className: "bg-gradient-to-r from-red-600 to-red-500 text-white animate-pulse",
  },
  wasleen_choice: {
    icon: "⭐",
    label: "Wasleen's Choice",
    // Black bg, Gold text matching exact CSS fallback requests
    className: "bg-black text-[var(--color-gold)] border border-[var(--color-gold)]",
  },
  dubai_climate: {
    icon: "☀️",
    label: "Dubai Climate Tested",
    // Exact requested color -> Sand (#E4C89E)
    className: "bg-[#E4C89E] text-[var(--color-primary)]",
  },
};

const SIZE_CONFIG: Record<ProductBadgeSize, string> = {
  sm: "px-2 py-1 text-xs gap-1.5 rounded-sm",
  md: "px-3 py-1.5 text-sm gap-2 rounded-md",
  lg: "px-4 py-2 text-base gap-2 rounded-lg",
};

const POSITION_CONFIG: Record<ProductBadgePosition, string> = {
  "top-left": "absolute top-3 left-3 z-10",
  "top-right": "absolute top-3 right-3 z-10",
  "bottom": "absolute bottom-3 left-3 z-10", // Commonly bottom-left for product cards
  "static": "relative",
};

export const Badge = React.forwardRef<HTMLDivElement, ProductBadgeProps>(
  ({ type, size = "md", position = "static", className, ...props }, ref) => {
    const config = BADGE_CONFIG[type];
    const sizeClasses = SIZE_CONFIG[size];
    const positionClasses = POSITION_CONFIG[position];

    if (!config) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center font-medium shadow-sm transition-transform duration-200 hover:-translate-y-[2px] hover:shadow-md max-w-fit cursor-default",
          sizeClasses,
          positionClasses,
          config.className,
          className
        )}
        {...props}
      >
        <span aria-hidden="true" className="leading-none shrink-0">
          {config.icon}
        </span>
        <span className="leading-none tracking-wide">{config.label}</span>
      </div>
    );
  }
);
Badge.displayName = "ProductBadge";
