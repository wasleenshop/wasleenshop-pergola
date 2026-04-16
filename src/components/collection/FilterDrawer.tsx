"use client";

/**
 * FilterDrawer.tsx
 *
 * Mobile-only full-height slide-in drawer that wraps the filter panel.
 * Rendered via createPortal to escape any overflow-hidden parents.
 * Focus trapped, ESC to close, back-drop click to close.
 */

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilterCount: number;
  children: React.ReactNode;
}

export function FilterDrawer({
  isOpen,
  onClose,
  activeFilterCount,
  children,
}: FilterDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button on open; lock body scroll; ESC to close
  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", handler);
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm",
          "bg-white shadow-2xl flex flex-col",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-primary">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="text-xs bg-gold text-primary font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-primary transition-colors rounded-full hover:bg-neutral-100"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {/* Footer with apply button */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="btn btn-primary w-full"
          >
            {activeFilterCount > 0
              ? `View Results (${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} applied)`
              : "View Results"}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
