"use client";

/**
 * ActiveFilters.tsx
 *
 * Displays horizontal chips for every active filter dimension.
 * Chip × button calls the appropriate clear handler.
 * "Clear all" button appears when any filter is active.
 */

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFilterLabel,
  getActiveFilterCount,
  type FilterState,
  type PriceRangeKey,
  type FeatureKey,
  type MaterialKey,
} from "@/lib/utils/filter-utils";

export interface ActiveFiltersProps {
  state: FilterState;
  onClearPrice: () => void;
  onRemoveFeature: (key: FeatureKey) => void;
  onClearMaterial: () => void;
  onClearAll: () => void;
  className?: string;
}

interface ChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-3 py-1.5 rounded-full text-xs font-medium",
        "bg-gold/10 text-primary border border-gold/30"
      )}
    >
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove filter: ${label}`}
        className="text-neutral-400 hover:text-primary transition-colors -mr-0.5"
      >
        <X size={12} aria-hidden="true" />
      </button>
    </span>
  );
}

export function ActiveFilters({
  state,
  onClearPrice,
  onRemoveFeature,
  onClearMaterial,
  onClearAll,
  className,
}: ActiveFiltersProps) {
  const activeCount = getActiveFilterCount(state);

  if (activeCount === 0) return null;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-2", className)}
      aria-label="Active filters"
    >
      {/* Price chip */}
      {state.price && (
        <FilterChip
          label={getFilterLabel("price", state.price)}
          onRemove={onClearPrice}
        />
      )}

      {/* Feature chips */}
      {state.features.map((key) => (
        <FilterChip
          key={key}
          label={getFilterLabel("feature", key)}
          onRemove={() => onRemoveFeature(key)}
        />
      ))}

      {/* Material chip */}
      {state.material && (
        <FilterChip
          label={getFilterLabel("material", state.material)}
          onRemove={onClearMaterial}
        />
      )}

      {/* Clear all */}
      {activeCount > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-neutral-500 hover:text-error underline-offset-2 hover:underline transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
