"use client";

/**
 * SortDropdown.tsx
 *
 * Accessible native <select> for collection sort order.
 * Calls `onSort` immediately on change — no submit button needed.
 */

import { ArrowUpDown } from "lucide-react";
import { SORT_OPTIONS, type SortOption } from "@/lib/utils/filter-utils";
import { cn } from "@/lib/utils";

export interface SortDropdownProps {
  value: SortOption;
  onChange: (sort: SortOption) => void;
  className?: string;
}

export function SortDropdown({ value, onChange, className }: SortDropdownProps) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <ArrowUpDown
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label="Sort products"
        className={cn(
          "appearance-none pl-8 pr-8 py-2",
          "text-sm font-medium text-primary bg-white",
          "border border-neutral-200 rounded-full",
          "hover:border-gold transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold",
          "cursor-pointer"
        )}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {/* Custom chevron */}
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none w-3.5 h-3.5"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
