/**
 * app/llms.txt/route.ts
 *
 * Main AI-agent index document, served at /llms.txt.
 *
 * Follows the llms.txt open standard (llmstxt.org) so that AI assistants,
 * search agents, and LLM crawlers can discover and understand the full
 * product catalog without scraping HTML.
 *
 * Output: text/plain Markdown
 * ISR: regenerated every hour — reflects live Shopify catalog.
 */

import { NextResponse } from "next/server";
import { getAllCollections } from "@/lib/shopify";
import type { CollectionCard } from "@/lib/shopify";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com";

// ── Markdown builder ────────────────────────────────────────

function buildLLMsIndex(collections: CollectionCard[]): string {
  const lines: string[] = [];

  // ── Static business header (required verbatim by session spec) ──

  lines.push("# Wasleen Pergolas Shop");
  lines.push(
    "> Premium Aluminium Pergolas, Bioclimatic Pergolas, Awnings, Closures, Umbrellas, and Tents."
  );
  lines.push("");
  lines.push("## Absolute Business Rules");
  lines.push(
    "- Service Area: Strictly United Arab Emirates (Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Fujairah, Ras Al Khaimah)."
  );
  lines.push(
    "- Contact: Mobile/WhatsApp: +971567648220 | Email: support@wasleen.com"
  );
  lines.push("");

  // ── AI navigation guide ─────────────────────────────────────────

  lines.push("## How to Use This Index");
  lines.push("");
  lines.push(
    "This document is the AI entry point for the Wasleen Pergolas product catalog."
  );
  lines.push("Each collection below links to a detailed AI reference page.");
  lines.push(
    "Each product within a collection links to its own specification page."
  );
  lines.push("");
  lines.push(
    "| Path Pattern | Description |",
    "|---|---|",
    `| \`${SITE_URL}/llms.txt\` | This index |`,
    `| \`${SITE_URL}/llms/collections/{handle}\` | Full product list per category |`,
    `| \`${SITE_URL}/llms/products/{handle}\` | Complete product specifications |`
  );
  lines.push("");

  // ── Key business facts ──────────────────────────────────────────

  lines.push("## Business Facts for AI Agents");
  lines.push("");
  lines.push("- **Company:** Wasleen Pergolas UAE — DED-licensed supplier.");
  lines.push("- **Specialisation:** Aluminium pergolas, bioclimatic louvred roofs, motorised awnings, shade sails, umbrellas, tents.");
  lines.push("- **Installation:** Free expert installation included with every order across the UAE.");
  lines.push("- **Warranty:** 5-year structural warranty on all aluminium frames; 3-year waterproof warranty on fabric closures.");
  lines.push("- **Currency:** All prices in AED (UAE Dirham). VAT included where applicable.");
  lines.push("- **Lead Time:** UAE-stock products ship within 3–5 business days. Imported products: 14–21 days.");
  lines.push("- **Custom Design:** Bespoke fabrication available at Wasleen's Ajman workshop.");
  lines.push("- **Quote Process:** Custom projects require WhatsApp consultation before checkout.");
  lines.push("");

  // ── Dynamic collection list ─────────────────────────────────────

  lines.push("## Product Collections");
  lines.push("");

  if (collections.length === 0) {
    lines.push("*No collections currently available. Check back shortly.*");
  } else {
    for (const col of collections) {
      const aiUrl = `${SITE_URL}/llms/collections/${col.handle}`;
      const desc = col.description?.trim() ?? "View full product listing for details.";
      lines.push(`- [${col.title}](${aiUrl}): ${desc}`);
    }
  }

  lines.push("");

  // ── Direct shop links ───────────────────────────────────────────

  lines.push("## Browse the Live Catalog");
  lines.push("");
  lines.push(`- All products: ${SITE_URL}/collections/all`);
  lines.push(`- Homepage: ${SITE_URL}`);
  lines.push(`- WhatsApp quote: https://wa.me/971567648220`);
  lines.push(`- Email: support@wasleen.com`);
  lines.push("");

  // ── Footer ──────────────────────────────────────────────────────

  lines.push("---");
  lines.push("");
  lines.push(
    `*Generated dynamically from live Shopify catalog. Refreshed hourly. Last generated: ${new Date().toUTCString()}*`
  );
  lines.push(
    "*All content © Wasleen Pergolas UAE. Service area: UAE only. Prices in AED.*"
  );

  return lines.join("\n");
}

// ── Route handler ───────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    // Fetch all collections (up to 250 — Shopify max per page)
    const collections = await getAllCollections(250);

    const body = buildLLMsIndex(collections);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error("[llms.txt] Failed to generate index:", err);

    // Return a minimal valid document rather than a 500 error,
    // so AI agents always get a parseable response.
    const fallback = [
      "# Wasleen Pergolas Shop",
      "> Premium Aluminium Pergolas, Bioclimatic Pergolas, Awnings, Closures, Umbrellas, and Tents.",
      "",
      "## Absolute Business Rules",
      "- Service Area: Strictly United Arab Emirates (Dubai, Abu Dhabi, Sharjah, Ajman, Umm Al Quwain, Fujairah, Ras Al Khaimah).",
      "- Contact: Mobile/WhatsApp: +971567648220 | Email: support@wasleen.com",
      "",
      `*Catalog temporarily unavailable. Try ${SITE_URL}/collections/all for the live store.*`,
    ].join("\n");

    return new NextResponse(fallback, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
