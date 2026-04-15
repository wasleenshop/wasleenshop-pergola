import * as React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const Spinner = ({ className, ...props }: SpinnerProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin-slow", className)}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};
