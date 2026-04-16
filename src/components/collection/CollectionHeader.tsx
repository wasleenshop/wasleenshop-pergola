/**
 * CollectionHeader.tsx
 *
 * Server Component — collection title, description, and optional hero image.
 * Designed to be placed above the filter/grid split on both desktop and mobile.
 *
 * Shows:
 *  - Breadcrumb (Home → Collections → {title})
 *  - H1 title
 *  - Short description (if set in Shopify)
 *  - Hero image (if set on the collection)
 */

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { Collection } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────────────────────────

function Breadcrumbs({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-1.5 text-xs text-neutral-500 flex-wrap">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-gold transition-colors"
            aria-label="Home"
          >
            <Home size={13} aria-hidden="true" />
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight size={12} className="text-neutral-300" />
        </li>
        <li>
          <Link
            href="/collections"
            className="hover:text-gold transition-colors"
          >
            Collections
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight size={12} className="text-neutral-300" />
        </li>
        <li>
          <span className="text-primary font-medium" aria-current="page">
            {title}
          </span>
        </li>
      </ol>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export interface CollectionHeaderProps {
  collection: Pick<
    Collection,
    "title" | "description" | "descriptionHtml" | "image"
  >;
  /** Total products after current filters are applied. */
  productCount: number;
}

export function CollectionHeader({
  collection,
  productCount,
}: CollectionHeaderProps) {
  const { title, description, image } = collection;

  return (
    <header>
      <Breadcrumbs title={title} />

      {/* Hero image (optional) */}
      {image && (
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 bg-sand">
          <Image
            src={image.url}
            alt={image.altText ?? title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
            className="object-cover"
          />
          {/* Dark scrim for text legibility */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
            <p className="type-overline-gold mb-2">Collection</p>
            <h1 className="type-h1 text-white">{title}</h1>
          </div>
        </div>
      )}

      {/* Text header (shown below image or alone when no image) */}
      {!image && (
        <div className="mb-8">
          <p className="type-overline-gold mb-2">Collection</p>
          <h1 className="type-h1 text-primary">{title}</h1>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-neutral-500 text-sm leading-relaxed max-w-2xl mb-6">
          {description}
        </p>
      )}

      {/* Product count — updated dynamically when filters are active */}
      <p className="text-xs text-neutral-400">
        {productCount > 0
          ? `${productCount} product${productCount !== 1 ? "s" : ""}`
          : "No products found"}
      </p>
    </header>
  );
}
