"use client";

/**
 * components/Analytics.tsx
 *
 * Google Tag Manager + GA4 integration.
 *
 * Exports:
 *  - <Analytics />     — GTM script injection + SPA route-change tracking.
 *                        Place once in layout.tsx (inside <body>).
 *  - <GTMNoScript />   — GTM <noscript> iframe fallback.
 *                        Place immediately after the opening <body> tag.
 *  - trackEvent        — Typed event helpers for GA4 ecommerce events.
 *                        Import in product/cart components as needed.
 *
 * Architecture:
 *  - GTM manages all tags; GA4 is configured inside GTM.
 *  - We also load gtag.js independently so `gtag()` is available for
 *    non-GTM direct calls if needed.
 *  - PageTracker uses usePathname() which requires a <Suspense> boundary
 *    to avoid bailing out of static rendering.
 */

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

// ── Env constants ───────────────────────────────────────────

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// ── Route-change tracker ────────────────────────────────────

/**
 * Fires a `page_view` event into the GTM dataLayer on every SPA
 * navigation. Wrapped in <Suspense> by the parent to allow static
 * rendering of routes that don't use useSearchParams.
 */
function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const url = pathname + (qs ? `?${qs}` : "");

    // Push to GTM dataLayer
    window.dataLayer?.push({
      event: "page_view",
      page_path: url,
      page_title: document.title,
      page_location: window.location.href,
    });
  }, [pathname, searchParams]);

  return null;
}

// ── Main Analytics component ────────────────────────────────

/**
 * Drop this once inside <body> in layout.tsx.
 * Renders nothing visible — only <Script> tags + the route tracker.
 */
export function Analytics() {
  if (!GTM_ID) return null;

  return (
    <>
      {/* ── GTM bootstrap ──────────────────────────────────────
          strategy="afterInteractive" defers loading until after
          the page is interactive, avoiding LCP / FID regressions. */}
      <Script
        id="gtm-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(w,d,s,l,i){
  w[l]=w[l]||[];
  w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),
      dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;
  j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
  f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
        }}
      />

      {/* ── GA4 (direct, in addition to GTM) ───────────────────
          Allows gtag() calls even if GTM hasn't loaded yet. */}
      {GA_ID && (
        <>
          <Script
            id="ga4-gtag-js"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('config','${GA_ID}',{
  send_page_view: false
});`,
            }}
          />
        </>
      )}

      {/* ── SPA route-change tracking ───────────────────────── */}
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
    </>
  );
}

// ── GTM noscript fallback ───────────────────────────────────

/**
 * Place immediately after the opening <body> tag in layout.tsx.
 * Required for GTM to work in environments where JS is disabled.
 */
export function GTMNoScript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      {/* eslint-disable-next-line jsx-a11y/iframe-has-title */}
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
        aria-hidden="true"
      />
    </noscript>
  );
}

// ── Typed event helpers ─────────────────────────────────────

/**
 * Push ecommerce events to the GTM dataLayer.
 * Import and call these from product/cart/checkout components.
 *
 * Follows the GA4 Enhanced Ecommerce schema.
 */

interface GA4Item {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_variant?: string;
  item_category?: string;
  item_brand?: string;
  index?: number;
}

function pushDL(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // Clear ecommerce object before each push (GA4 requirement)
  window.dataLayer?.push({ ecommerce: null });
  window.dataLayer?.push({ event, ...payload });
}

export const trackEvent = {
  /**
   * Fire when a product page is viewed.
   * Maps to GA4 `view_item`.
   */
  viewProduct(item: GA4Item & { currency?: string }) {
    pushDL("view_item", {
      ecommerce: {
        currency: item.currency ?? "AED",
        value: item.price,
        items: [item],
      },
    });

    // Klaviyo: Viewed Product
    window._learnq?.push([
      "track",
      "Viewed Product",
      {
        ProductID: item.item_id,
        ProductName: item.item_name,
        Price: item.price,
        ProductCategories: item.item_category ? [item.item_category] : [],
      },
    ]);
  },

  /**
   * Fire when a product is added to the cart.
   * Maps to GA4 `add_to_cart`.
   */
  addToCart(item: GA4Item & { currency?: string }) {
    pushDL("add_to_cart", {
      ecommerce: {
        currency: item.currency ?? "AED",
        value: item.price * (item.quantity ?? 1),
        items: [item],
      },
    });

    // Klaviyo: Added to Cart
    window._learnq?.push([
      "track",
      "Added to Cart",
      {
        ProductID: item.item_id,
        ProductName: item.item_name,
        Quantity: item.quantity ?? 1,
        ItemPrice: item.price,
        RowTotal: item.price * (item.quantity ?? 1),
      },
    ]);
  },

  /**
   * Fire when a product is removed from the cart.
   * Maps to GA4 `remove_from_cart`.
   */
  removeFromCart(item: GA4Item & { currency?: string }) {
    pushDL("remove_from_cart", {
      ecommerce: {
        currency: item.currency ?? "AED",
        value: item.price * (item.quantity ?? 1),
        items: [item],
      },
    });
  },

  /**
   * Fire when the user starts checkout.
   * Maps to GA4 `begin_checkout`.
   */
  beginCheckout(params: {
    value: number;
    currency?: string;
    items: GA4Item[];
    coupon?: string;
  }) {
    pushDL("begin_checkout", {
      ecommerce: {
        currency: params.currency ?? "AED",
        value: params.value,
        coupon: params.coupon,
        items: params.items,
      },
    });

    // Klaviyo: Started Checkout
    window._learnq?.push([
      "track",
      "Started Checkout",
      {
        $value: params.value,
        ItemNames: params.items.map((i) => i.item_name),
        Items: params.items,
      },
    ]);
  },

  /**
   * Fire when a collection/product list is viewed.
   * Maps to GA4 `view_item_list`.
   */
  viewItemList(params: {
    listId: string;
    listName: string;
    items: GA4Item[];
  }) {
    pushDL("view_item_list", {
      ecommerce: {
        item_list_id: params.listId,
        item_list_name: params.listName,
        items: params.items.map((item, index) => ({ ...item, index })),
      },
    });

    // Klaviyo: Viewed Collection
    window._learnq?.push([
      "track",
      "Viewed Collection",
      {
        CollectionID: params.listId,
        CollectionName: params.listName,
      },
    ]);
  },

  /**
   * Fire when a search is performed.
   * Maps to GA4 `search`.
   */
  search(searchTerm: string) {
    pushDL("search", { search_term: searchTerm });
  },

  /**
   * Fire a custom event with arbitrary payload.
   */
  custom(eventName: string, payload?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    window.dataLayer?.push({ event: eventName, ...(payload ?? {}) });
  },
} as const;
