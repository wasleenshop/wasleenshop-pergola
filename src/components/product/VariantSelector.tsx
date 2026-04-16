"use client";

/**
 * VariantSelector.tsx
 *
 * Renders a set of option pickers for a product's variants.
 * - Each option type (e.g. "Color", "Size") gets its own row.
 * - Values are shown as pill buttons; unavailable ones are struck-through.
 * - A pure presentational component — state lives in ProductPageClient.
 */

import { cn } from "@/lib/utils";
import type { ProductOption, ProductVariant } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface VariantSelectorProps {
  /** Product options (e.g. [{name:"Color", values:["Charcoal","White"]}]) */
  options: ProductOption[];
  /** All product variants (used to determine availability per combination). */
  variants: Array<{ node: ProductVariant }>;
  /** Currently selected option values keyed by option name. */
  selectedOptions: Record<string, string>;
  /** Called when the user picks a different option value. */
  onOptionChange: (optionName: string, value: string) => void;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/**
 * Returns true if picking `value` for `optionName` — while keeping all
 * other currently-selected options — would yield at least one available variant.
 */
function isValueAvailable(
  optionName: string,
  value: string,
  selectedOptions: Record<string, string>,
  variants: Array<{ node: ProductVariant }>
): boolean {
  const test = { ...selectedOptions, [optionName]: value };
  return variants.some(({ node }) => {
    const matches = node.selectedOptions.every((o) => {
      const tested = test[o.name];
      // If the other option isn't selected yet, treat as wildcard
      return tested === undefined || tested === o.value;
    });
    return matches && node.availableForSale;
  });
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function VariantSelector({
  options,
  variants,
  selectedOptions,
  onOptionChange,
}: VariantSelectorProps) {
  // Hide selector when the product has only a single "Default Title" variant
  const isSingleDefault =
    options.length === 1 &&
    options[0].values.length === 1 &&
    options[0].values[0] === "Default Title";

  if (isSingleDefault) return null;

  return (
    <div className="space-y-5">
      {options.map((option) => {
        const selected = selectedOptions[option.name];

        return (
          <div key={option.id}>
            {/* Option label + selected value */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-semibold text-primary">
                {option.name}
              </span>
              {selected && (
                <span className="text-sm text-neutral-500">{selected}</span>
              )}
            </div>

            {/* Option value pills */}
            <div className="flex flex-wrap gap-2" role="group" aria-label={option.name}>
              {option.values.map((value) => {
                const isSelected = selected === value;
                const available = isValueAvailable(
                  option.name,
                  value,
                  selectedOptions,
                  variants
                );

                return (
                  <button
                    key={value}
                    onClick={() => {
                      if (available) onOptionChange(option.name, value);
                    }}
                    disabled={!available}
                    aria-pressed={isSelected}
                    aria-label={`${option.name}: ${value}${!available ? " — unavailable" : ""}`}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                      isSelected
                        ? [
                            "border-gold bg-gold text-primary",
                            "shadow-[0_4px_24px_0_rgb(201_169_98/0.35)]",
                          ]
                        : available
                          ? [
                              "border-neutral-300 text-primary bg-white",
                              "hover:border-gold hover:text-gold",
                            ]
                          : [
                              "border-neutral-200 text-neutral-300 bg-neutral-50",
                              "cursor-not-allowed line-through",
                            ]
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
