/**
 * lib/utils/filter-utils.ts
 *
 * Pure utility functions for the collection filtering system.
 * NO "use client" — safe to import from Server and Client components.
 *
 * Responsibilities:
 *  1. Define every filter option (price, feature, material, sort).
 *  2. Parse URL search-param objects → typed FilterState.
 *  3. Build Shopify ProductFilter[] from FilterState.
 *  4. Serialize FilterState back to URLSearchParams for navigation.
 */

import type { ProductFilter, ProductCollectionSortKeys } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Sort
// ─────────────────────────────────────────────────────────────────

export type SortOption =
  | "best-selling"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "title-asc"
  | "title-desc";

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "best-selling", label: "Best Selling" },
  { value: "price-asc",    label: "Price: Low to High" },
  { value: "price-desc",   label: "Price: High to Low" },
  { value: "newest",       label: "Newest" },
  { value: "title-asc",    label: "Title: A–Z" },
  { value: "title-desc",   label: "Title: Z–A" },
];

const SORT_SHOPIFY_MAP: Record<
  SortOption,
  { sortKey: ProductCollectionSortKeys; reverse: boolean }
> = {
  "best-selling": { sortKey: "BEST_SELLING", reverse: false },
  "price-asc":    { sortKey: "PRICE",        reverse: false },
  "price-desc":   { sortKey: "PRICE",        reverse: true  },
  "newest":       { sortKey: "CREATED",      reverse: true  },
  "title-asc":    { sortKey: "TITLE",        reverse: false },
  "title-desc":   { sortKey: "TITLE",        reverse: true  },
};

export function parseSortParam(
  sort?: string
): { sortKey: ProductCollectionSortKeys; reverse: boolean } {
  return SORT_SHOPIFY_MAP[sort as SortOption] ?? SORT_SHOPIFY_MAP["best-selling"];
}

// ─────────────────────────────────────────────────────────────────
// Price ranges
// ─────────────────────────────────────────────────────────────────

export type PriceRangeKey =
  | "0-5000"
  | "5000-10000"
  | "10000-20000"
  | "20000plus";

export const PRICE_OPTIONS: Array<{ key: PriceRangeKey; label: string }> = [
  { key: "0-5000",      label: "Under AED 5,000" },
  { key: "5000-10000",  label: "AED 5,000 – 10,000" },
  { key: "10000-20000", label: "AED 10,000 – 20,000" },
  { key: "20000plus",   label: "Over AED 20,000" },
];

const PRICE_SHOPIFY_MAP: Record<PriceRangeKey, ProductFilter["price"]> = {
  "0-5000":      { min: 0,     max: 5000  },
  "5000-10000":  { min: 5000,  max: 10000 },
  "10000-20000": { min: 10000, max: 20000 },
  "20000plus":   { min: 20000 },
};

// ─────────────────────────────────────────────────────────────────
// Feature filters (metafield-based)
// ─────────────────────────────────────────────────────────────────

export type FeatureKey =
  | "installation"
  | "made_in_uae"
  | "dubai_climate"
  | "eco_friendly"
  | "ded_licensed"
  | "in_stock";

export const FEATURE_OPTIONS: Array<{
  key: FeatureKey;
  label: string;
  icon: string;
}> = [
  { key: "installation",  label: "Free Installation",    icon: "🔧" },
  { key: "made_in_uae",   label: "Made in UAE",           icon: "🇦🇪" },
  { key: "dubai_climate", label: "Dubai Climate Tested",  icon: "☀️" },
  { key: "eco_friendly",  label: "Eco Friendly",          icon: "🌿" },
  { key: "ded_licensed",  label: "DED Licensed",          icon: "🏛️" },
  { key: "in_stock",      label: "In Stock Only",         icon: "✅" },
];

type MetafieldFilter = NonNullable<ProductFilter["productMetafield"]>;

const FEATURE_METAFIELD_MAP: Partial<Record<FeatureKey, MetafieldFilter>> = {
  installation:  { namespace: "custom", key: "installation_included", value: "true" },
  made_in_uae:   { namespace: "custom", key: "made_in_uae",           value: "true" },
  dubai_climate: { namespace: "custom", key: "dubai_climate_tested",  value: "true" },
  eco_friendly:  { namespace: "custom", key: "eco_friendly",          value: "true" },
  ded_licensed:  { namespace: "custom", key: "ded_licensed",          value: "true" },
};

// ─────────────────────────────────────────────────────────────────
// Material filters (metafield-based)
// ─────────────────────────────────────────────────────────────────

export type MaterialKey = "aluminium" | "wood" | "steel";

export const MATERIAL_OPTIONS: Array<{ key: MaterialKey; label: string }> = [
  { key: "aluminium", label: "Aluminium" },
  { key: "wood",      label: "Wood" },
  { key: "steel",     label: "Steel" },
];

const MATERIAL_METAFIELD_MAP: Record<MaterialKey, MetafieldFilter> = {
  aluminium: { namespace: "custom", key: "material", value: "Aluminium" },
  wood:      { namespace: "custom", key: "material", value: "Wood" },
  steel:     { namespace: "custom", key: "material", value: "Steel" },
};

// ─────────────────────────────────────────────────────────────────
// FilterState — the canonical in-memory representation
// ─────────────────────────────────────────────────────────────────

export interface FilterState {
  sort:      SortOption;
  price?:    PriceRangeKey;
  features:  FeatureKey[];
  material?: MaterialKey;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  sort:     "best-selling",
  features: [],
};

// ─────────────────────────────────────────────────────────────────
// Parse URL params → FilterState
// ─────────────────────────────────────────────────────────────────

/**
 * Accepts either the Next.js page `searchParams` prop (server) or a
 * plain-object copy derived from `useSearchParams()` (client).
 */
export function parseFilterState(
  params: Record<string, string | string[] | undefined>
): FilterState {
  const sort = isSortOption(params["sort"])
    ? (params["sort"] as SortOption)
    : "best-selling";

  const price = isPriceKey(params["price"])
    ? (params["price"] as PriceRangeKey)
    : undefined;

  const rawF = params["f"];
  const features = (
    Array.isArray(rawF) ? rawF : rawF ? [rawF] : []
  ).filter(isFeatureKey) as FeatureKey[];

  const material = isMaterialKey(params["material"])
    ? (params["material"] as MaterialKey)
    : undefined;

  return { sort, price, features, material };
}

function isSortOption(v: unknown): v is SortOption {
  return SORT_OPTIONS.some((o) => o.value === v);
}
function isPriceKey(v: unknown): v is PriceRangeKey {
  return PRICE_OPTIONS.some((o) => o.key === v);
}
function isFeatureKey(v: unknown): v is FeatureKey {
  return FEATURE_OPTIONS.some((o) => o.key === v);
}
function isMaterialKey(v: unknown): v is MaterialKey {
  return MATERIAL_OPTIONS.some((o) => o.key === v);
}

// ─────────────────────────────────────────────────────────────────
// FilterState → Shopify ProductFilter[]
// ─────────────────────────────────────────────────────────────────

export function buildShopifyFilters(state: FilterState): ProductFilter[] {
  const filters: ProductFilter[] = [];

  // In-stock availability filter
  if (state.features.includes("in_stock")) {
    filters.push({ available: true });
  }

  // Price range
  if (state.price) {
    const priceFilter = PRICE_SHOPIFY_MAP[state.price];
    if (priceFilter) filters.push({ price: priceFilter });
  }

  // Feature metafields
  for (const key of state.features) {
    if (key === "in_stock") continue;
    const mf = FEATURE_METAFIELD_MAP[key];
    if (mf) filters.push({ productMetafield: mf });
  }

  // Material metafield
  if (state.material) {
    const mf = MATERIAL_METAFIELD_MAP[state.material];
    if (mf) filters.push({ productMetafield: mf });
  }

  return filters;
}

// ─────────────────────────────────────────────────────────────────
// FilterState → URLSearchParams
// ─────────────────────────────────────────────────────────────────

export function buildSearchParams(state: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.sort !== "best-selling") params.set("sort", state.sort);
  if (state.price)                   params.set("price", state.price);
  for (const f of state.features)    params.append("f", f);
  if (state.material)                params.set("material", state.material);
  return params;
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Total number of active dimension filters (excludes sort). */
export function getActiveFilterCount(state: FilterState): number {
  return (
    (state.price ? 1 : 0) +
    state.features.length +
    (state.material ? 1 : 0)
  );
}

/** Human-readable label for a filter chip. */
export function getFilterLabel(
  type: "price" | "feature" | "material",
  key: string
): string {
  if (type === "price")
    return PRICE_OPTIONS.find((o) => o.key === key)?.label ?? key;
  if (type === "feature")
    return FEATURE_OPTIONS.find((o) => o.key === key)?.label ?? key;
  if (type === "material")
    return MATERIAL_OPTIONS.find((o) => o.key === key)?.label ?? key;
  return key;
}
