"use client";

/**
 * ProductTabs.tsx
 *
 * Four-tab section below the gallery/info split:
 *  1. Description   — product.descriptionHtml (rich text from Shopify)
 *  2. Specifications — metafield-driven spec grid
 *  3. Installation  — standard process + metafield-specific details
 *  4. Reviews       — Judge.me aggregate + widget embed
 *
 * Tab switching is client-side only; content received as props from
 * the Server Component (page.tsx), so no redundant data fetching here.
 */

import { useState } from "react";
import Script from "next/script";
import { CheckCircle2, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/shopify/normalise";
import type { Product } from "@/lib/shopify/types";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type TabKey = "description" | "specifications" | "installation" | "reviews";

interface Tab {
  key: TabKey;
  label: string;
}

const TABS: Tab[] = [
  { key: "description", label: "Description" },
  { key: "specifications", label: "Specifications" },
  { key: "installation", label: "Installation" },
  { key: "reviews", label: "Reviews" },
];

export interface ProductTabsProps {
  product: Product;
  rating: { rating: number; count: number } | null;
}

// ─────────────────────────────────────────────────────────────────
// Tab: Specifications
// ─────────────────────────────────────────────────────────────────

function SpecRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-4 py-3.5 border-b border-neutral-100 last:border-none">
      <dt className="w-40 flex-shrink-0 text-sm font-medium text-neutral-500">
        {label}
      </dt>
      <dd className="text-sm text-primary font-medium flex-1">{value}</dd>
    </div>
  );
}

function SpecificationsTab({ product }: { product: Product }) {
  const m = product.metafields;

  const hasSpecs =
    m.material ||
    m.dimensions ||
    m.warranty_years ||
    m.weight_capacity ||
    m.lead_time_days ||
    product.vendor;

  if (!hasSpecs) {
    return (
      <p className="text-neutral-500 text-sm py-4">
        Specifications are not available for this product.
      </p>
    );
  }

  return (
    <dl className="divide-y divide-neutral-100">
      <SpecRow label="Brand / Vendor" value={product.vendor || null} />
      <SpecRow label="Material" value={m.material} />
      <SpecRow label="Dimensions" value={m.dimensions} />
      <SpecRow label="Weight Capacity" value={m.weight_capacity} />
      <SpecRow
        label="Warranty"
        value={m.warranty_years ? `${m.warranty_years} years` : undefined}
      />
      <SpecRow
        label="Lead Time"
        value={m.lead_time_days ? `${m.lead_time_days} days` : undefined}
      />
      <SpecRow
        label="Origin"
        value={m.shipping_origin}
      />
      <SpecRow
        label="Installation"
        value={
          m.installation_included
            ? "Free professional installation included"
            : m.installation_cost !== undefined
              ? `AED ${m.installation_cost}`
              : undefined
        }
      />
      <SpecRow label="Product Type" value={product.productType || null} />
      {product.tags.length > 0 && (
        <SpecRow label="Tags" value={product.tags.join(", ")} />
      )}
    </dl>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: Installation
// ─────────────────────────────────────────────────────────────────

const INSTALL_STEPS = [
  {
    title: "Site Survey",
    desc: "Our team visits your property to assess the installation area, measure the space, and confirm structural requirements.",
  },
  {
    title: "Custom Fabrication",
    desc: "Your pergola is precision-fabricated to the agreed dimensions at our UAE facility or prepared from stock.",
  },
  {
    title: "Delivery & Assembly",
    desc: "Components are delivered and assembled on-site by our certified installation crew — typically 1–3 days.",
  },
  {
    title: "Final Inspection",
    desc: "We perform a full safety and quality inspection, walk you through the structure, and hand over the warranty documentation.",
  },
];

function InstallationTab({ product }: { product: Product }) {
  const m = product.metafields;

  return (
    <div className="space-y-8">
      {/* Key details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-sand rounded-xl p-4 text-center">
          <p className="type-overline text-neutral-500 mb-1">Installation</p>
          <p className="text-sm font-semibold text-primary">
            {m.installation_included
              ? "Free of charge"
              : m.installation_cost !== undefined
                ? formatMoney({ amount: String(m.installation_cost), currencyCode: "AED" })
                : "Included"}
          </p>
        </div>
        <div className="bg-sand rounded-xl p-4 text-center">
          <p className="type-overline text-neutral-500 mb-1">Timeline</p>
          <p className="text-sm font-semibold text-primary">
            {m.lead_time_days
              ? `${m.lead_time_days}–${m.lead_time_days + 7} days`
              : "3–10 business days"}
          </p>
        </div>
        <div className="bg-sand rounded-xl p-4 text-center">
          <p className="type-overline text-neutral-500 mb-1">Warranty</p>
          <p className="text-sm font-semibold text-primary">
            {m.warranty_years ?? 5} years
          </p>
        </div>
      </div>

      {/* Process steps */}
      <div>
        <h3 className="type-h4 mb-5">Our Installation Process</h3>
        <ol className="space-y-5">
          {INSTALL_STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold text-primary flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div>
                <h4 className="font-semibold text-primary text-sm mb-1">
                  {step.title}
                </h4>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* What's included */}
      <div>
        <h3 className="type-h4 mb-4">What&apos;s Included</h3>
        <ul className="space-y-2.5">
          {[
            "Site survey and measurements",
            "All structural components and hardware",
            "Professional assembly and anchoring",
            "Debris removal and site clean-up",
            "Warranty documentation",
            "Post-installation walk-through",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-600">
              <CheckCircle2
                size={16}
                className="text-success flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Tab: Reviews
// ─────────────────────────────────────────────────────────────────

function ReviewsTab({
  product,
  rating,
}: {
  product: Product;
  rating: { rating: number; count: number } | null;
}) {
  const shopDomain = process.env.NEXT_PUBLIC_JUDGEME_SHOP_DOMAIN ?? "";

  return (
    <div className="space-y-8">
      {/* Aggregate summary */}
      {rating && rating.count > 0 && (
        <div className="flex items-center gap-6 p-6 bg-sand rounded-2xl">
          <div className="text-center">
            <p className="text-5xl font-bold text-primary font-heading">
              {rating.rating.toFixed(1)}
            </p>
            <div className="flex justify-center gap-0.5 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < Math.round(rating.rating)
                      ? "fill-gold text-gold"
                      : "text-neutral-300"
                  }
                  aria-hidden="true"
                />
              ))}
            </div>
            <p className="text-sm text-neutral-500">
              {rating.count} review{rating.count !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex-1 text-sm text-neutral-500">
            <p>Verified reviews from UAE customers.</p>
            <p className="mt-1 text-xs">Powered by Judge.me</p>
          </div>
        </div>
      )}

      {/* Judge.me embedded widget */}
      {shopDomain && (
        <>
          {/* Widget container — Judge.me populates this on load */}
          <div
            id="judgeme_product_reviews"
            data-id={product.id}
            data-handle={product.handle}
            className="min-h-[200px]"
          />
          <Script
            id="judgeme-widget"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.judgeme = window.judgeme || {};
                window.judgeme.ready = window.judgeme.ready || [];
                window.judgeme.ready.push({
                  type: 'widget',
                  params: { shop_domain: '${shopDomain}' }
                });
              `,
            }}
          />
          <Script
            src="https://cdn.judge.me/js/widget.js"
            strategy="lazyOnload"
          />
        </>
      )}

      {/* Empty state */}
      {!rating || rating.count === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Clock size={40} className="text-neutral-300 mx-auto" />
          <p className="text-neutral-500">No reviews yet — be the first!</p>
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function ProductTabs({ product, rating }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  return (
    <div>
      {/* ── Tab navigation ────────────────────────────── */}
      <div
        className="flex overflow-x-auto border-b border-neutral-200"
        role="tablist"
        aria-label="Product information"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tab-panel-${tab.key}`}
            id={`tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-shrink-0 px-6 py-4 text-sm font-medium",
              "border-b-2 -mb-px transition-all duration-200",
              "whitespace-nowrap",
              activeTab === tab.key
                ? "border-gold text-gold"
                : "border-transparent text-neutral-500 hover:text-primary hover:border-neutral-300"
            )}
          >
            {tab.label}
            {tab.key === "reviews" && rating && rating.count > 0 && (
              <span className="ml-2 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full">
                {rating.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab panels ────────────────────────────────── */}
      <div className="py-8 lg:py-10">
        {/* Description */}
        <div
          id="tab-panel-description"
          role="tabpanel"
          aria-labelledby="tab-description"
          hidden={activeTab !== "description"}
        >
          {product.descriptionHtml ? (
            <div
              className="prose prose-sm max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-gold"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          ) : product.description ? (
            <p className="text-neutral-600 leading-relaxed">
              {product.description}
            </p>
          ) : (
            <p className="text-neutral-400 text-sm">
              No description available.
            </p>
          )}
        </div>

        {/* Specifications */}
        <div
          id="tab-panel-specifications"
          role="tabpanel"
          aria-labelledby="tab-specifications"
          hidden={activeTab !== "specifications"}
        >
          <SpecificationsTab product={product} />
        </div>

        {/* Installation */}
        <div
          id="tab-panel-installation"
          role="tabpanel"
          aria-labelledby="tab-installation"
          hidden={activeTab !== "installation"}
        >
          <InstallationTab product={product} />
        </div>

        {/* Reviews */}
        <div
          id="tab-panel-reviews"
          role="tabpanel"
          aria-labelledby="tab-reviews"
          hidden={activeTab !== "reviews"}
        >
          <ReviewsTab product={product} rating={rating} />
        </div>
      </div>
    </div>
  );
}
