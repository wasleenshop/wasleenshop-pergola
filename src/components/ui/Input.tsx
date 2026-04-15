import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "input",
          error && "input-error",
          className
        )}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
