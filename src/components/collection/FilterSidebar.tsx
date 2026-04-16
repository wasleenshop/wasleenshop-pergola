"use client";

/**
 * FilterSidebar.tsx
 *
 * Desktop: sticky left sidebar rendering all filter groups.
 * Mobile: renders the same filter groups inside <FilterDrawer>.
 *
 * Filter groups:
 *  1. Price ranges   (radio-style — one at a time)
 *  2. Features       (checkbox-style — multiple)
 *  3. Material       (radio-style — one at a time)
 */

import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { FilterDrawer } from "./FilterDrawer";
import { cn } from "@/lib/utils";
import {
  PRICE_OPTIONS,
  FEATURE_OPTIONS,
  MATERIAL_OPTIONS,
  getActiveFilterCount,
  type FilterState,
  type PriceRangeKey,
  type FeatureKey,
  type MaterialKey,
} from "@/lib/utils/filter-utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface FilterSidebarProps {
  state: FilterState;
  onSetPrice: (key: PriceRangeKey | undefined) => void;
  onToggleFeature: (key: FeatureKey) => void;
  onSetMaterial: (key: MaterialKey | undefined) => void;
  onClearAll: () => void;
}

// ─────────────────────────────────────────────────────────────────
// Filter group accordion
// ─────────────────────────────────────────────────────────────────

function FilterGroup({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200 last:border-none py-4">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold text-primary mb-0"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          size={16}
          className={cn(
            "text-neutral-400 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          open ? "max-h-96 mt-4" : "max-h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Checkbox / Radio items
// ─────────────────────────────────────────────────────────────────

function FilterOption({
  label,
  checked,
  onChange,
  icon,
  type = "checkbox",
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  icon?: string;
  type?: "checkbox" | "radio";
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-1">
      <input
        type={type}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={cn(
          "flex-shrink-0 w-4 h-4 border transition-all duration-150",
          type === "radio" ? "rounded-full" : "rounded",
          checked
            ? "bg-gold border-gold"
            : "border-neutral-300 group-hover:border-gold bg-white"
        )}
        aria-hidden="true"
      >
        {checked && (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            className="w-full h-full"
          >
            {type === "radio" ? (
              <circle cx="8" cy="8" r="3" fill="white" />
            ) : (
              <path
                d="M3.5 8L6.5 11L12.5 5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        )}
      </span>
      <span className="flex items-center gap-1.5 text-sm text-neutral-700 group-hover:text-primary transition-colors">
        {icon && <span>{icon}</span>}
        {label}
      </span>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────
// Filter panel (shared between sidebar and drawer)
// ─────────────────────────────────────────────────────────────────

export function FilterPanel({
  state,
  onSetPrice,
  onToggleFeature,
  onSetMaterial,
  onClearAll,
}: FilterSidebarProps) {
  const activeCount = getActiveFilterCount(state);

  return (
    <div>
      {/* Clear all */}
      {activeCount > 0 && (
        <div className="mb-4">
          <button
            onClick={onClearAll}
            className="text-xs font-medium text-error hover:underline transition-colors"
          >
            Clear all ({activeCount})
          </button>
        </div>
      )}

      {/* ── Price ──────────────────────────────── */}
      <FilterGroup title="Price" defaultOpen>
        <div className="space-y-1">
          {PRICE_OPTIONS.map((opt) => (
            <FilterOption
              key={opt.key}
              label={opt.label}
              type="radio"
              checked={state.price === opt.key}
              onChange={() =>
                onSetPrice(state.price === opt.key ? undefined : opt.key)
              }
            />
          ))}
        </div>
      </FilterGroup>

      {/* ── Features ───────────────────────────── */}
      <FilterGroup title="Features" defaultOpen>
        <div className="space-y-1">
          {FEATURE_OPTIONS.map((opt) => (
            <FilterOption
              key={opt.key}
              label={opt.label}
              icon={opt.icon}
              type="checkbox"
              checked={state.features.includes(opt.key)}
              onChange={() => onToggleFeature(opt.key)}
            />
          ))}
        </div>
      </FilterGroup>

      {/* ── Material ───────────────────────────── */}
      <FilterGroup title="Material" defaultOpen={false}>
        <div className="space-y-1">
          {MATERIAL_OPTIONS.map((opt) => (
            <FilterOption
              key={opt.key}
              label={opt.label}
              type="radio"
              checked={state.material === opt.key}
              onChange={() =>
                onSetMaterial(state.material === opt.key ? undefined : opt.key)
              }
            />
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Desktop sidebar
// ─────────────────────────────────────────────────────────────────

export function FilterSidebar(props: FilterSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeCount = getActiveFilterCount(props.state);

  return (
    <>
      {/* ── Desktop sticky sidebar ───────────── */}
      <aside
        className="hidden lg:block sticky top-24 self-start"
        aria-label="Product filters"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters
            {activeCount > 0 && (
              <span className="text-xs bg-gold text-primary font-bold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </h2>
        </div>
        <FilterPanel {...props} />
      </aside>

      {/* ── Mobile filter trigger ────────────── */}
      <button
        onClick={() => setDrawerOpen(true)}
        className={cn(
          "lg:hidden flex items-center gap-2",
          "px-4 py-2 rounded-full border text-sm font-medium",
          "transition-all duration-200",
          activeCount > 0
            ? "border-gold text-gold bg-gold/5"
            : "border-neutral-200 text-primary hover:border-gold"
        )}
        aria-label={`Filters${activeCount > 0 ? ` (${activeCount} active)` : ""}`}
      >
        <SlidersHorizontal size={15} aria-hidden="true" />
        Filters
        {activeCount > 0 && (
          <span className="text-xs bg-gold text-primary font-bold px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Mobile drawer ────────────────────── */}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeFilterCount={activeCount}
      >
        <FilterPanel {...props} />
      </FilterDrawer>
    </>
  );
}
