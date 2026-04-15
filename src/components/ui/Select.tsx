import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            "input appearance-none pr-10 bg-transparent", 
            error && "input-error",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          {...props}
        >
          {children}
        </select>
        <ChevronDown 
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" 
          size={20} 
          aria-hidden="true" 
        />
      </div>
    );
  }
);
Select.displayName = "Select";
