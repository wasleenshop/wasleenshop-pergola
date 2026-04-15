import * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "ghost-light";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    
    // Map variants to our design system globals.css custom classes
    const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline: "btn-secondary",
      ghost: "btn-ghost",
      "ghost-light": "btn-ghost-light",
    };

    const sizeClasses = {
      sm: "btn-sm",
      md: "", // base size is defined in .btn itself
      lg: "btn-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        className={cn(
          "btn",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading && <Spinner className="w-4 h-4 mr-2" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
