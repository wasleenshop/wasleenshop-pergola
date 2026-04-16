/**
 * app/(routes)/collections/[handle]/page.tsx
 *
 * Collection listing page — Server Component.
 *
 * Responsibilities:
 *  1. Read searchParams → parse filter state + sort.
 *  2. Parallel fetch: collection metadata + filtered products.
 *  3. Generate dynamic <Metadata> with SEO title, description, OG tags.
 *  4. Inject JSON-LD BreadcrumbList structured data.
 *  5. Render <CollectionPageClient> with initial SSR data.
 *
 * When filters change, the client updates the URL and Next.js
 * re-runs this server component with new searchParams — giving
 * fresh filtered products with zero client-side data fetching.
 *
 * ISR: revalidate every 10 minutes (collection inventory changes
 * less frequently than product detail pages).
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getCollectionByHandle, getCollectionProducts } from "@/lib/shopify/queries/collection";
import {
  parseFilterState,
  buildShopifyFilters,
  parseSortParam,
} from "@/lib/utils/filter-utils";
import { CollectionPageClient } from "@/components/collection/CollectionPageClient";
import { ProductCardSkeleton } from "@/components/product/ProductCard";

// ─────────────────────────────────────────────────────────────────
// Route params
// ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// ─────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

  const title =
    collection.seo.title ??
    `${collection.title} | Premium Pergolas & Shade Solutions | Wasleen UAE`;

  const description =
    collection.seo.description ??
    (collection.description
      ? `${collection.description.slice(0, 150).trim()}. Free installation across UAE.`
      : `Shop ${collection.title} at Wasleen Pergolas UAE. Dubai climate tested, DED licensed, free installation.`);

  const ogImage = collection.image
    ? [{ url: collection.image.url, width: 1200, height: 630, alt: collection.title }]
    : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/collections/${handle}`,
      images: ogImage,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage[0] ? [ogImage[0].url] : [],
    },
    alternates: {
      canonical: `${siteUrl}/collections/${handle}`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// JSON-LD
// ─────────────────────────────────────────────────────────────────

function CollectionJsonLd({ handle, title }: { handle: string; title: string }) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",        item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Collections", item: `${siteUrl}/collections` },
      { "@type": "ListItem", position: 3, name: title,         item: `${siteUrl}/collections/${handle}` },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Grid loading fallback
// ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps) {
  const { handle } = await params;
  const sp = await searchParams;

  // Parse filter state from URL
  const filterState = parseFilterState(sp);
  const shopifyFilters = buildShopifyFilters(filterState);
  const { sortKey, reverse } = parseSortParam(filterState.sort);

  // Parallel: collection metadata + filtered products
  const [collection, productResult] = await Promise.all([
    getCollectionByHandle(handle),
    getCollectionProducts({
      handle,
      filters: shopifyFilters,
      sortKey,
      reverse,
      first: 24,
    }),
  ]);

  if (!collection) {
    notFound();
  }

  const { items: products, pageInfo } = productResult.products;

  return (
    <>
      <CollectionJsonLd handle={handle} title={collection.title} />

      <main className="min-h-screen">
        <div className="container-site section-py">
          <Suspense fallback={<GridSkeleton />}>
            <CollectionPageClient
              handle={handle}
              collection={collection}
              initialProducts={products}
              initialPageInfo={pageInfo}
            />
          </Suspense>
        </div>
      </main>
    </>
  );
}
