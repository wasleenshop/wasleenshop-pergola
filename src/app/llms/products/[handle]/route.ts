/**
 * app/llms/products/[handle]/route.ts
 *
 * Per-product AI reference document.
 * Served at /llms/products/{handle}
 *
 * Fetches the complete product object from Shopify — title, description,
 * all variants with prices, and every custom metafield — then renders
 * a structured Markdown specification sheet that AI agents can parse
 * to answer any question about the product.
 *
 * Output: text/plain Markdown
 * ISR: regenerated every 30 minutes (prices and stock change more often).
 */

import { NextRequest, NextResponse } from "next/server";
import { getProductByHandle, formatMoney } from "@/lib/shopify";
import type { Product, ProductMetafields, ProductVariant, MoneyV2 } from "@/lib/shopify";

export const revalidate = 1800; // 30 minutes

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

// ── Formatting helpers ──────────────────────────────────────

/** "true" → "Yes", "false" / undefined → "No", null → "—" */
function yn(val: boolean | undefined): string {
  if (val === undefined) return "—";
  return val ? "Yes" : "No";
}

/** Numeric value with fallback dash. */
function num(val: number | undefined, suffix = ""): string {
  if (val == null) return "—";
  return `${val}${suffix}`;
}

/** String value with fallback dash. */
function str(val: string | undefined): string {
  return val?.trim() || "—";
}

/** Format a MoneyV2 object — delegates to the project's existing formatter. */
function money(m: MoneyV2): string {
  return formatMoney(m, "en-AE");
}

/** Strip HTML tags from descriptionHtml for plain-text output. */
function stripHtml(html: string): string {
  // Replace block-level tags with newlines before stripping
  return html
    .replace(/<\/?(p|br|li|h[1-6]|div|ul|ol)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ── Specifications table ────────────────────────────────────

/**
 * Build the ## Technical Specifications table from normalised metafields.
 * Only emits rows for fields that are actually present.
 */
function buildSpecsTable(meta: ProductMetafields): string {
  const rows: Array<[string, string]> = [];

  // Materials & Construction
  if (meta.material) rows.push(["Material", str(meta.material)]);
  if (meta.dimensions) rows.push(["Dimensions", str(meta.dimensions)]);
  if (meta.weight_capacity) rows.push(["Weight Capacity", str(meta.weight_capacity)]);
  if (meta.color_options?.length) {
    rows.push(["Available Colours", meta.color_options.join(", ")]);
  }

  // Climate & durability
  if (meta.dubai_climate_tested !== undefined) rows.push(["Dubai Climate Tested", yn(meta.dubai_climate_tested)]);
  if (meta.eco_friendly !== undefined) rows.push(["Eco-Friendly", yn(meta.eco_friendly)]);

  // Warranty & installation
  if (meta.warranty_years != null) rows.push(["Structural Warranty", num(meta.warranty_years, " years")]);
  if (meta.installation_included !== undefined) {
    const cost = meta.installation_cost === 0 || meta.installation_cost == null
      ? "Free"
      : `AED ${meta.installation_cost}`;
    rows.push(["Installation", meta.installation_included ? `Included (${cost})` : "Not included"]);
  }

  // Origin & fulfilment
  if (meta.made_in_uae !== undefined) rows.push(["Made in UAE", yn(meta.made_in_uae)]);
  if (meta.ded_licensed !== undefined) rows.push(["DED Licensed Supplier", yn(meta.ded_licensed)]);
  if (meta.is_dropship !== undefined && meta.is_dropship) {
    rows.push(["Fulfilment", "Drop-shipped"]);
    if (meta.shipping_origin) rows.push(["Ships From", str(meta.shipping_origin)]);
    if (meta.lead_time_days != null) rows.push(["Estimated Lead Time", num(meta.lead_time_days, " business days")]);
    if (meta.supplier_name) rows.push(["Supplier", str(meta.supplier_name)]);
  } else if (meta.is_dropship === false) {
    rows.push(["Fulfilment", "UAE Stock"]);
  }

  // Custom design
  if (meta.is_custom_design) {
    rows.push(["Custom Design", "Yes — bespoke fabrication available"]);
    if (meta.deposit_percentage) {
      rows.push(["Deposit Required", `${meta.deposit_percentage}% of order value`]);
    }
  }
  if (meta.requires_consultation) {
    rows.push(["Order Process", "WhatsApp consultation required before checkout"]);
  }

  if (rows.length === 0) return "*Technical specifications not yet available for this product.*";

  const lines = [
    "| Specification | Value |",
    "|---|---|",
    ...rows.map(([label, value]) => `| ${label} | ${value} |`),
  ];
  return lines.join("\n");
}

// ── Variants table ──────────────────────────────────────────

function buildVariantsTable(variants: ProductVariant[]): string {
  if (variants.length === 0) return "*No variants listed.*";

  // If only one "Default Title" variant, keep it simple
  if (variants.length === 1 && variants[0].title === "Default Title") {
    const v = variants[0];
    return [
      `- **Price:** ${money(v.price)}`,
      `- **Availability:** ${v.availableForSale ? "In Stock" : "Out of Stock"}`,
      ...(v.sku ? [`- **SKU:** ${v.sku}`] : []),
    ].join("\n");
  }

  const hasCompareAt = variants.some((v) => v.compareAtPrice != null);
  const hasSku = variants.some((v) => v.sku != null);

  const header = [
    "| Variant",
    "Price",
    ...(hasCompareAt ? ["Was"] : []),
    "Available",
    ...(hasSku ? ["SKU"] : []),
    "|",
  ].join(" | ");

  const separator = [
    "|---",
    "---",
    ...(hasCompareAt ? ["---"] : []),
    "---",
    ...(hasSku ? ["---"] : []),
    "|",
  ].join("|");

  const rows = variants.map((v) => {
    const cells = [
      v.title,
      money(v.price),
      ...(hasCompareAt ? [v.compareAtPrice ? money(v.compareAtPrice) : "—"] : []),
      v.availableForSale ? "Yes" : "No",
      ...(hasSku ? [v.sku ?? "—"] : []),
    ];
    return `| ${cells.join(" | ")} |`;
  });

  return [header, separator, ...rows].join("\n");
}

// ── Purchasing notes section ────────────────────────────────

function buildPurchasingNotes(meta: ProductMetafields): string | null {
  const notes: string[] = [];

  if (meta.requires_consultation) {
    notes.push(
      "**⚡ Custom Quote Required:** This product requires a WhatsApp consultation " +
      "before purchase. Contact +971567648220 to discuss dimensions, finishes, and " +
      "installation requirements."
    );
  }

  if (meta.is_custom_design) {
    const deposit = meta.deposit_percentage ? ` A ${meta.deposit_percentage}% deposit is required to begin fabrication.` : "";
    notes.push(
      `**🔨 Custom Fabrication:** This is a bespoke product, custom-built at Wasleen's ` +
      `Ajman workshop to your specifications.${deposit} Lead time varies by complexity.`
    );
  }

  if (meta.is_dropship && meta.shipping_origin && meta.lead_time_days) {
    notes.push(
      `**📦 Shipping:** This product ships from ${meta.shipping_origin}. ` +
      `Estimated lead time: ${meta.lead_time_days} business days after order confirmation.`
    );
  } else if (!meta.is_dropship) {
    notes.push(
      "**📦 UAE Stock:** This product ships from Wasleen's UAE warehouse. " +
      "Typical delivery within 3–5 business days."
    );
  }

  if (meta.installation_included) {
    notes.push(
      "**🔧 Free Installation:** Professional installation by Wasleen's certified team " +
      "is included at no extra cost, anywhere in the UAE."
    );
  }

  if (meta.wasleen_choice) {
    notes.push(
      "**⭐ Wasleen's Choice:** This product is hand-picked by our team as a top recommendation for UAE conditions."
    );
  }

  if (meta.super_deal) {
    notes.push(
      "**💰 Super Deal:** This product is currently on special offer. Price may change without notice."
    );
  }

  return notes.length > 0 ? notes.join("\n\n") : null;
}

// ── Main document builder ───────────────────────────────────

function buildProductDoc(product: Product): string {
  const lines: string[] = [];

  const storeUrl = `${SITE_URL}/products/${product.handle}`;
  const aiUrl = `${SITE_URL}/llms/products/${product.handle}`;
  const meta = product.metafields;

  // ── Header ─────────────────────────────────────────────────

  lines.push(`# ${product.title}`);
  lines.push("");

  if (meta.subtitle) {
    lines.push(`> ${meta.subtitle}`);
    lines.push("");
  }

  // Identity block
  lines.push(`**Handle:** \`${product.handle}\``);
  lines.push(`**Shop URL:** ${storeUrl}`);
  lines.push(`**AI Reference URL:** ${aiUrl}`);
  if (product.vendor) lines.push(`**Brand/Vendor:** ${product.vendor}`);
  if (product.productType) lines.push(`**Category:** ${product.productType}`);
  lines.push(`**Availability:** ${product.availableForSale ? "In Stock ✓" : "Out of Stock ✗"}`);
  lines.push(`**Last Updated:** ${new Date(product.updatedAt).toUTCString()}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Pricing ─────────────────────────────────────────────────

  lines.push("## Pricing");
  lines.push("");

  const minPrice = money(product.priceRange.minVariantPrice);
  const maxPrice = money(product.priceRange.maxVariantPrice);
  const compareMin = product.compareAtPriceRange?.minVariantPrice;

  if (
    product.priceRange.minVariantPrice.amount ===
    product.priceRange.maxVariantPrice.amount
  ) {
    lines.push(`- **Price:** ${minPrice}`);
  } else {
    lines.push(`- **Starting from:** ${minPrice}`);
    lines.push(`- **Up to:** ${maxPrice}`);
  }

  if (
    compareMin &&
    parseFloat(compareMin.amount) > parseFloat(product.priceRange.minVariantPrice.amount)
  ) {
    const compareFormatted = money(compareMin);
    const saving = Math.round(
      ((parseFloat(compareMin.amount) - parseFloat(product.priceRange.minVariantPrice.amount)) /
        parseFloat(compareMin.amount)) *
        100
    );
    lines.push(`- **Was:** ${compareFormatted} (Save ${saving}%)`);
  }

  lines.push("- **Currency:** AED (UAE Dirham) — VAT inclusive where applicable.");
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Description ──────────────────────────────────────────────

  lines.push("## Description");
  lines.push("");

  const desc = product.description?.trim();
  if (desc) {
    lines.push(desc);
  } else {
    lines.push("*No description available.*");
  }

  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Variants ─────────────────────────────────────────────────

  const variantNodes = product.variants.edges.map((e) => e.node);

  lines.push(`## Variants (${variantNodes.length} total)`);
  lines.push("");
  lines.push(buildVariantsTable(variantNodes));
  lines.push("");

  // ── Product options ───────────────────────────────────────────

  const nonDefaultOptions = product.options.filter(
    (o) => !(o.values.length === 1 && o.values[0] === "Default Title")
  );

  if (nonDefaultOptions.length > 0) {
    lines.push("---");
    lines.push("");
    lines.push("## Product Options");
    lines.push("");
    for (const opt of nonDefaultOptions) {
      lines.push(`- **${opt.name}:** ${opt.values.join(", ")}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  // ── Technical Specifications ──────────────────────────────────

  lines.push("## Technical Specifications");
  lines.push("");
  lines.push(buildSpecsTable(meta));
  lines.push("");
  lines.push("---");
  lines.push("");

  // ── Purchasing notes ──────────────────────────────────────────

  const purchasingNotes = buildPurchasingNotes(meta);
  if (purchasingNotes) {
    lines.push("## Purchasing Notes");
    lines.push("");
    lines.push(purchasingNotes);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // ── Collections ───────────────────────────────────────────────

  if (product.tags.length > 0) {
    lines.push("## Tags");
    lines.push("");
    lines.push(product.tags.join(", "));
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // ── SEO data for AI context ───────────────────────────────────

  if (product.seo.description) {
    lines.push("## SEO Summary");
    lines.push("");
    lines.push(product.seo.description);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // ── Footer ────────────────────────────────────────────────────

  lines.push("## About Wasleen Pergolas");
  lines.push("");
  lines.push("UAE's premier DED-licensed supplier of aluminium pergolas and shade solutions.");
  lines.push("- **Service area:** Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Fujairah, Ras Al Khaimah.");
  lines.push("- **Free installation** by certified teams across the UAE.");
  lines.push("- **5-year structural warranty** on all aluminium frames.");
  lines.push("- **Contact:** +971567648220 | support@wasleen.com");
  lines.push(`- **Full catalog:** ${SITE_URL}/collections/all`);
  lines.push(`- **All AI references:** ${SITE_URL}/llms.txt`);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    `*AI Reference Document — Wasleen Pergolas UAE | ${SITE_URL}*`
  );
  lines.push(
    `*Generated: ${new Date().toUTCString()} | Refreshed every 30 minutes.*`
  );
  lines.push(
    "*Prices in AED. All specifications subject to change without notice.*"
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
    const product = await getProductByHandle(handle);

    if (!product) {
      const notFound = [
        `# Product Not Found`,
        "",
        `The product \`${handle}\` does not exist in the Wasleen Pergolas catalog.`,
        "",
        `- Browse all products: ${SITE_URL}/collections/all`,
        `- Product catalog index: ${SITE_URL}/llms.txt`,
        `- Contact for custom orders: https://wa.me/971567648220`,
      ].join("\n");

      return new NextResponse(notFound, {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const body = buildProductDoc(product);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error(`[llms/products/${handle}] Error:`, err);

    return new NextResponse(
      `# Error\n\nFailed to load product \`${handle}\`. Please try again shortly.\n\n${SITE_URL}/products/${handle}`,
      {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }
}
