import * as React from "react";
import { cn } from "@/lib/utils";
import { Award, ShieldCheck, Sun, CheckCircle, Percent, Sparkles } from "lucide-react";

export type BadgeType = 
  | "ded_licensed"
  | "made_in_uae"
  | "warranty"
  | "deal"
  | "choice"
  | "climate"
  | "default";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type?: BadgeType;
  size?: BadgeSize;
}

const badgeConfig: Record<BadgeType, { icon: React.ElementType; classes: string }> = {
  ded_licensed: {
    icon: Award,
    classes: "badge-gold",
  },
  made_in_uae: {
    icon: CheckCircle,
    classes: "badge-dark",
  },
  warranty: {
    icon: ShieldCheck,
    classes: "badge-sand",
  },
  deal: {
    icon: Percent,
    classes: "bg-red-50 text-red-700 border-red-200 border",
  },
  choice: {
    icon: Sparkles,
    classes: "badge-gold",
  },
  climate: {
    icon: Sun,
    classes: "bg-amber-50 text-amber-800 border-amber-200 border",
  },
  default: {
    icon: Sparkles,
    classes: "badge-sand",
  },
};

const sizeConfig: Record<BadgeSize, { badge: string; icon: number }> = {
  sm: { badge: "text-[10px] px-2 py-0.5 gap-1", icon: 12 },
  md: { badge: "text-xs px-3 py-1 gap-1.5", icon: 14 },
  lg: { badge: "text-sm px-4 py-1.5 gap-2", icon: 16 },
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, type = "default", size = "md", children, ...props }, ref) => {
    
    const { icon: Icon, classes } = badgeConfig[type];
    const { badge: sizeClass, icon: iconSize } = sizeConfig[size];

    return (
      <span
        ref={ref}
        className={cn(
          "badge",
          classes,
          sizeClass,
          className
        )}
        {...props}
      >
        <Icon size={iconSize} aria-hidden="true" />
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";
