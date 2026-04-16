/**
 * app/llms/collections/[handle]/route.ts
 *
 * Per-collection AI reference document.
 * Served at /llms/collections/{handle}
 *
 * Fetches the collection metadata and its top 20 best-selling products,
 * then renders a structured Markdown document listing every product with
 * its key specs and a deep-link to the product's own AI reference page.
 *
 * Output: text/plain Markdown
 * ISR: regenerated every hour.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCollectionByHandle, getCollectionProducts, formatMoney } from "@/lib/shopify";
import type { ProductCard, ProductMetafields } from "@/lib/shopify";

export const revalidate = 3600; // 1 hour

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

// ── Spec summary helper ─────────────────────────────────────

/**
 * Build a compact inline spec string from normalised ProductMetafields.
 * Returns only the fields that are present / truthy.
 */
function buildSpecSummary(meta: ProductMetafields): string {
  const parts: string[] = [];

  if (meta.material) parts.push(`Material: ${meta.material}`);
  if (meta.warranty_years != null) parts.push(`Warranty: ${meta.warranty_years} years`);
  if (meta.installation_included) parts.push("Installation: Included (Free)");
  if (meta.made_in_uae) parts.push("Made in UAE");
  if (meta.ded_licensed) parts.push("DED Licensed");
  if (meta.dubai_climate_tested) parts.push("Dubai Climate Tested");
  if (meta.eco_friendly) parts.push("Eco-Friendly");
  if (meta.requires_consultation) parts.push("Requires Consultation (Custom Quote)");
  if (meta.dimensions) parts.push(`Dimensions: ${meta.dimensions}`);
  if (meta.is_dropship && meta.shipping_origin) {
    const days = meta.lead_time_days;
    parts.push(`Ships from: ${meta.shipping_origin}${days ? ` (${days} days)` : ""}`);
  }

  return parts.length > 0 ? parts.join(" | ") : "Specifications on product page.";
}

// ── Markdown builder ────────────────────────────────────────

function buildCollectionDoc(
  handle: string,
  title: string,
  description: string,
  seoDescription: string | null | undefined,
  updatedAt: string,
  products: ProductCard[]
): string {
  const lines: string[] = [];

  const storeUrl = `${SITE_URL}/collections/${handle}`;
  const aiUrl = `${SITE_URL}/llms/collections/${handle}`;
  const blurb = description.trim() || seoDescription?.trim() || "A curated selection of premium outdoor shade products.";

  // ── Header ────────────────────────────────────────────────

  lines.push(`# ${title} — Wasleen Pergolas`);
  lines.push("");
  lines.push(`> ${blurb}`);
  lines.push("");
  lines.push(`**Shop URL:** ${storeUrl}`);
  lines.push(`**AI Reference URL:** ${aiUrl}`);
  lines.push(`**Last Updated:** ${new Date(updatedAt).toUTCString()}`);
  lines.push(`**Product Count:** ${products.length} products shown (sorted by best-selling)`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Business rules (repeated for context isolation) ────────

  lines.push("## Business Rules for This Collection");
  lines.push("");
  lines.push("- **Service Area:** UAE only (Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Fujairah, Ras Al Khaimah).");
  lines.push("- **Installation:** Free expert installation included with all products.");
  lines.push("- **Warranty:** Minimum 5-year structural warranty on all frames.");
  lines.push("- **Currency:** All prices in AED (UAE Dirham).");
  lines.push("- **Contact:** +971567648220 | support@wasleen.com");
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Product list ───────────────────────────────────────────

  lines.push(`## Products in ${title} (${products.length})`);
  lines.push("");

  if (products.length === 0) {
    lines.push("*No products currently in this collection.*");
  } else {
    for (const product of products) {
      const productAiUrl = `${SITE_URL}/llms/products/${product.handle}`;
      const minPrice = formatMoney(product.priceRange.minVariantPrice);
      const maxPrice = formatMoney(product.priceRange.maxVariantPrice);
      const priceStr =
        product.priceRange.minVariantPrice.amount ===
        product.priceRange.maxVariantPrice.amount
          ? minPrice
          : `${minPrice} – ${maxPrice}`;
      const availability = product.availableForSale ? "**In Stock**" : "~~Out of Stock~~";
      const specs = buildSpecSummary(product.metafields);

      lines.push(`### [${product.title}](${productAiUrl})`);
      lines.push("");
      if (product.metafields.subtitle) {
        lines.push(`*${product.metafields.subtitle}*`);
        lines.push("");
      }
      lines.push(`- **Price:** ${priceStr}`);
      lines.push(`- **Availability:** ${availability}`);
      if (product.vendor) lines.push(`- **Brand:** ${product.vendor}`);
      lines.push(`- **Specs:** ${specs}`);
      if (product.tags.length > 0) {
        lines.push(`- **Tags:** ${product.tags.slice(0, 8).join(", ")}`);
      }
      lines.push(`- **Full AI Reference:** ${productAiUrl}`);
      lines.push(`- **Shop Page:** ${SITE_URL}/products/${product.handle}`);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");

  // ── Compact product table for quick scanning ───────────────

  if (products.length > 0) {
    lines.push("## Quick Reference Table");
    lines.push("");
    lines.push("| Product | Price (AED) | Available | Material | Warranty |");
    lines.push("|---|---|---|---|---|");

    for (const product of products) {
      const price = formatMoney(product.priceRange.minVariantPrice);
      const avail = product.availableForSale ? "Yes" : "No";
      const mat = product.metafields.material ?? "—";
      const warranty = product.metafields.warranty_years != null
        ? `${product.metafields.warranty_years} yrs`
        : "—";
      const name = product.title.replace(/\|/g, "–"); // escape pipe chars in tables
      lines.push(`| [${name}](${SITE_URL}/llms/products/${product.handle}) | from ${price} | ${avail} | ${mat} | ${warranty} |`);
    }

    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // ── Footer ──────────────────────────────────────────────────

  lines.push("## About Wasleen Pergolas");
  lines.push("");
  lines.push(
    "Wasleen Pergolas is the UAE's premier DED-licensed supplier of " +
    "aluminium pergolas, bioclimatic roofs, and outdoor shade solutions."
  );
  lines.push(`- Browse all collections: ${SITE_URL}/collections/all`);
  lines.push(`- WhatsApp for a custom quote: https://wa.me/971567648220`);
  lines.push(`- Email: support@wasleen.com`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    `*AI Reference Document — Wasleen Pergolas UAE | ${SITE_URL} | Refreshed hourly.*`
  );
  lines.push(
    "*Prices in AED. Free installation across UAE. Service area: UAE only.*"
  );

  return lines.join("\n");
}

// ── Route handler ───────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
): Promise<NextResponse> {
  const { handle } = await params;

  try {
    // Fetch collection metadata + products in parallel
    const [collection, productsResult] = await Promise.all([
      getCollectionByHandle(handle),
      getCollectionProducts({ handle, first: 20, sortKey: "BEST_SELLING" }),
    ]);

    // 404 — collection doesn't exist in Shopify
    if (!collection) {
      const notFound = [
        `# Collection Not Found`,
        "",
        `The collection \`${handle}\` does not exist in the Wasleen Pergolas catalog.`,
        "",
        `Browse all collections: ${SITE_URL}/llms.txt`,
        `Shop all products: ${SITE_URL}/collections/all`,
      ].join("\n");

      return new NextResponse(notFound, {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const body = buildCollectionDoc(
      collection.handle,
      collection.title,
      collection.description,
      collection.seo.description,
      collection.updatedAt,
      productsResult.products.items
    );

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error(`[llms/collections/${handle}] Error:`, err);
    return new NextResponse(
      `# Error\n\nFailed to load collection \`${handle}\`. Please try again.\n\n${SITE_URL}/collections/${handle}`,
      {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }
}
