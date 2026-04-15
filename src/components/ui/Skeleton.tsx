import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rect";
}

export const Skeleton = ({ className, variant = "rect", ...props }: SkeletonProps) => {
  return (
    <div
      className={cn(
        "skeleton",
        variant === "text" && "skeleton-text",
        variant === "circle" && "skeleton-circle",
        className
      )}
      {...props}
      aria-hidden="true"
    />
  );
};
