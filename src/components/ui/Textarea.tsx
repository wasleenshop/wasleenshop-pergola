import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "input min-h-[100px] resize-y", 
          error && "input-error",
          className
        )}
        aria-invalid={error ? "true" : "false"}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
