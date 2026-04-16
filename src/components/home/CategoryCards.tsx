/**
 * CategoryCards.tsx
 *
 * Homepage section 2 — "Shop By Category".
 * Server Component: fetches 4 collections from Shopify for live images/titles.
 *
 * Layout: 2×2 responsive grid (stacks to 1-col on mobile).
 * Each card: collection image + gradient overlay + title + CTA arrow.
 * Handles missing collection images gracefully with a gradient fallback.
 */

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCollectionsByHandles } from "@/lib/shopify";

// ─────────────────────────────────────────────────────────────────
// Config constants (structural — allowed per Zero-Hardcoding exceptions)
// ─────────────────────────────────────────────────────────────────

const CATEGORY_HANDLES = [
  "aluminium-pergolas",
  "bioclimatic-pergolas",
  "awnings",
  "wooden-pergolas",
] as const;

/** Display fallbacks shown when the Shopify collection is missing */
const CATEGORY_FALLBACKS: Record<
  string,
  { title: string; subtitle: string }
> = {
  "aluminium-pergolas": {
    title: "Aluminium Pergolas",
    subtitle: "Modern & durable, engineered for UAE summers",
  },
  "bioclimatic-pergolas": {
    title: "Bioclimatic Pergolas",
    subtitle: "Smart louvred roofs for total climate control",
  },
  awnings: {
    title: "Awnings & Closures",
    subtitle: "Retractable shade for patios and facades",
  },
  "wooden-pergolas": {
    title: "Wooden Pergolas",
    subtitle: "Classic warmth with modern engineering",
  },
};

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export async function CategoryCards() {
  const results = await getCollectionsByHandles([...CATEGORY_HANDLES]);

  return (
    <section
      className="section-py bg-white"
      aria-labelledby="category-section-heading"
    >
      <div className="container-site">
        {/* Section header */}
        <div className="text-center mb-12 reveal">
          <span className="type-overline-gold block mb-3">Browse Our Range</span>
          <h2 className="type-h1" id="category-section-heading">
            Shop By Category
          </h2>
          <p className="type-body-lg text-neutral-500 mt-4 max-w-xl mx-auto">
            From sleek aluminium to smart bioclimatic systems — find your
            perfect shade solution.
          </p>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {CATEGORY_HANDLES.map((handle, index) => {
            const collection = results[index];
            const fallback = CATEGORY_FALLBACKS[handle];
            const title = collection?.title ?? fallback.title;
            const subtitle =
              (collection?.description?.slice(0, 100)) || fallback.subtitle;
            const imageUrl = collection?.image?.url ?? null;
            const imageAlt = collection?.image?.altText ?? title;

            return (
              <Link
                key={handle}
                href={`/collections/${handle}`}
                className="group relative flex min-h-[320px] lg:min-h-[400px] overflow-hidden rounded-2xl bg-primary-light focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                aria-label={`Browse ${title}`}
              >
                {/* Background */}
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 640px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={index < 2}
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary-light to-primary"
                    aria-hidden="true"
                  />
                )}

                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
                  aria-hidden="true"
                />

                {/* Content — sits at bottom */}
                <div className="relative z-10 mt-auto p-6 lg:p-8 w-full">
                  <h3 className="type-h3 text-white mb-2 group-hover:text-gold transition-colors duration-300">
                    {title}
                  </h3>
                  <p className="type-body-sm text-neutral-300 mb-4 line-clamp-2 max-w-sm">
                    {subtitle}
                  </p>
                  <span className="inline-flex items-center gap-2 text-gold font-semibold text-sm tracking-wide">
                    Explore Collection
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
