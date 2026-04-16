"use client";

/**
 * lib/utils/url-state.ts
 *
 * Client-side hook for reading and navigating collection filter state
 * from/to URL search params.
 *
 * Why a hook?
 *  `useSearchParams`, `useRouter`, and `useTransition` are client-only APIs.
 *  Wrapping them here keeps CollectionPageClient lean and makes the
 *  navigation logic independently testable.
 *
 * Usage:
 *   const { filterState, navigate, isPending, clearAll } = useUrlFilterState();
 */

import { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  parseFilterState,
  buildSearchParams,
  type FilterState,
  type SortOption,
  type PriceRangeKey,
  type FeatureKey,
  type MaterialKey,
} from "./filter-utils";

// ─────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────

export interface UseUrlFilterStateReturn {
  /** Live filter state parsed from the current URL. */
  filterState: FilterState;
  /** True while a navigation transition is in flight. */
  isPending: boolean;
  /** Navigate to a fully new state (replaces history entry). */
  navigate: (newState: FilterState) => void;
  /** Convenience: change only sort. */
  setSort: (sort: SortOption) => void;
  /** Convenience: toggle price range (undefined to clear). */
  setPrice: (price: PriceRangeKey | undefined) => void;
  /** Convenience: toggle a single feature on/off. */
  toggleFeature: (feature: FeatureKey) => void;
  /** Convenience: set material (undefined to clear). */
  setMaterial: (material: MaterialKey | undefined) => void;
  /** Clear all dimension filters; preserve sort. */
  clearAll: () => void;
}

export function useUrlFilterState(): UseUrlFilterStateReturn {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Always read from the live URL — survives prop changes during transition
  const filterState = parseFilterState(Object.fromEntries(searchParams));

  /** Push a new filter state into the URL (replace history). */
  const navigate = useCallback(
    (newState: FilterState) => {
      const params = buildSearchParams(newState).toString();
      startTransition(() => {
        router.replace(params ? `${pathname}?${params}` : pathname, {
          scroll: false,
        });
      });
    },
    [router, pathname]
  );

  const setSort = useCallback(
    (sort: SortOption) => navigate({ ...filterState, sort }),
    [navigate, filterState]
  );

  const setPrice = useCallback(
    (price: PriceRangeKey | undefined) => navigate({ ...filterState, price }),
    [navigate, filterState]
  );

  const toggleFeature = useCallback(
    (feature: FeatureKey) => {
      const next = filterState.features.includes(feature)
        ? filterState.features.filter((f) => f !== feature)
        : [...filterState.features, feature];
      navigate({ ...filterState, features: next });
    },
    [navigate, filterState]
  );

  const setMaterial = useCallback(
    (material: MaterialKey | undefined) => navigate({ ...filterState, material }),
    [navigate, filterState]
  );

  const clearAll = useCallback(
    () => navigate({ sort: filterState.sort, features: [] }),
    [navigate, filterState]
  );

  return {
    filterState,
    isPending,
    navigate,
    setSort,
    setPrice,
    toggleFeature,
    setMaterial,
    clearAll,
  };
}
