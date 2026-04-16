/**
 * app/(routes)/products/[handle]/page.tsx
 *
 * Product detail page — Server Component.
 *
 * Responsibilities:
 *  1. Fetch product, rating, and recommendations in parallel (server-side).
 *  2. Generate dynamic <Metadata> including OG images and description.
 *  3. Inject JSON-LD Product structured data for SEO.
 *  4. Render the complete page layout:
 *       Breadcrumbs
 *       ProductPageClient (gallery + info — client-stateful wrapper)
 *       ProductTabs (description / specs / installation / reviews)
 *       ProductFAQ
 *       CustomerGallery
 *       RelatedProducts
 *
 * ISR: revalidate every 5 minutes. On-demand revalidation via
 *      Shopify webhooks → POST /api/revalidate?tag=product-{handle}.
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Home } from "lucide-react";

import { getProductByHandle, getProductRecommendations } from "@/lib/shopify/queries/product";
import { getProductRating } from "@/lib/judgeme/client";
import { formatMoney } from "@/lib/shopify/normalise";

import { ProductPageClient } from "@/components/product/ProductPageClient";
import { ProductTabs } from "@/components/product/ProductTabs";
import { ProductFAQ } from "@/components/product/ProductFAQ";
import { CustomerGallery } from "@/components/product/CustomerGallery";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ProductCardSkeleton } from "@/components/product/ProductCard";

// ─────────────────────────────────────────────────────────────────
// ISR config
// ─────────────────────────────────────────────────────────────────

export const revalidate = 300; // 5 minutes

// ─────────────────────────────────────────────────────────────────
// Route params
// ─────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ handle: string }>;
}

// ─────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const price = formatMoney(product.priceRange.minVariantPrice);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

  const title =
    product.seo.title ??
    `${product.title} | Dubai Climate Tested | Wasleen UAE`;

  const description =
    product.seo.description ??
    [
      product.description.slice(0, 120).trim(),
      `From ${price}.`,
      "Free installation across UAE.",
    ]
      .filter(Boolean)
      .join(" ");

  const ogImages = product.images.edges.map((e) => ({
    url: e.node.url,
    width: e.node.width ?? 1200,
    height: e.node.height ?? 1200,
    alt: e.node.altText ?? product.title,
  }));

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${handle}`,
      images: ogImages,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages[0] ? [ogImages[0].url] : [],
    },
    alternates: {
      canonical: `${siteUrl}/products/${handle}`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// JSON-LD structured data
// ─────────────────────────────────────────────────────────────────

function ProductJsonLd({
  product,
  rating,
}: {
  product: Awaited<ReturnType<typeof getProductByHandle>>;
  rating: { rating: number; count: number } | null;
}) {
  if (!product) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.edges.map((e) => e.node.url),
    brand: {
      "@type": "Brand",
      name: product.vendor || "Wasleen Pergolas",
    },
    sku: product.variants.edges[0]?.node.sku ?? product.handle,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      lowPrice: product.priceRange.minVariantPrice.amount,
      highPrice: product.priceRange.maxVariantPrice.amount,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/products/${product.handle}`,
      seller: {
        "@type": "Organization",
        name: "Wasleen Pergolas",
        url: siteUrl,
      },
    },
    ...(rating && rating.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.rating.toFixed(1),
            reviewCount: rating.count,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Breadcrumbs
// ─────────────────────────────────────────────────────────────────

function Breadcrumbs({
  productTitle,
  collectionHandle,
  collectionTitle,
}: {
  productTitle: string;
  collectionHandle?: string;
  collectionTitle?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 lg:mb-8">
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

        {collectionHandle && collectionTitle ? (
          <>
            <li>
              <Link
                href={`/collections/${collectionHandle}`}
                className="hover:text-gold transition-colors capitalize"
              >
                {collectionTitle}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={12} className="text-neutral-300" />
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/collections/all"
                className="hover:text-gold transition-colors"
              >
                All Products
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={12} className="text-neutral-300" />
            </li>
          </>
        )}

        <li>
          <span
            className="text-primary font-medium truncate max-w-[200px] sm:max-w-xs"
            aria-current="page"
          >
            {productTitle}
          </span>
        </li>
      </ol>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────
// Skeleton for related products Suspense fallback
// ─────────────────────────────────────────────────────────────────

function RelatedSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params;

  // Phase 1: fetch the product (needed for ID before parallel fetches)
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  // Phase 2: parallel — rating + recommendations (both need product.id)
  const [rating, recommendations] = await Promise.all([
    getProductRating(product.id),
    getProductRecommendations(product.id),
  ]);

  // Collection context for breadcrumbs (first collection the product belongs to)
  const firstCollection = product.tags
    .find((t) => t.startsWith("collection:"))
    ?.replace("collection:", "");

  return (
    <>
      {/* JSON-LD */}
      <ProductJsonLd product={product} rating={rating} />

      <main className="min-h-screen">
        {/* ── Above-the-fold: Gallery + Info ───────── */}
        <section className="container-site pt-6 pb-12 lg:pb-16">
          <Breadcrumbs productTitle={product.title} />

          <ProductPageClient product={product} rating={rating} />
        </section>

        {/* ── Divider ──────────────────────────────── */}
        <div className="container-site">
          <div className="h-px bg-neutral-200" />
        </div>

        {/* ── Tabs: Description / Specs / Install / Reviews ── */}
        <section className="container-site py-10 lg:py-14">
          <ProductTabs product={product} rating={rating} />
        </section>

        {/* ── FAQ ──────────────────────────────────── */}
        <section className="bg-white">
          <div className="container-site py-12 lg:py-16">
            <ProductFAQ />
          </div>
        </section>

        {/* ── Customer Gallery ─────────────────────── */}
        <section className="container-site py-10 lg:py-14">
          <CustomerGallery />
        </section>

        {/* ── Related Products ─────────────────────── */}
        {recommendations.length > 0 && (
          <section className="container-site py-10 lg:py-14">
            <Suspense fallback={<RelatedSkeleton />}>
              <RelatedProducts products={recommendations} />
            </Suspense>
          </section>
        )}

        {/* Bottom padding for mobile sticky CTA bar */}
        <div className="h-20 lg:hidden" aria-hidden="true" />
      </main>
    </>
  );
}
