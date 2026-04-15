/**
 * lib/shopify/normalise.ts
 *
 * Transforms raw Shopify API responses into clean, typed objects.
 *
 * Responsibilities:
 *  1. Map raw metafield arrays (keyed by namespace+key) into
 *     typed ProductMetafields / CollectionMetafields objects.
 *  2. Flatten Connection<Edge<T>> into typed objects.
 *  3. Provide null-safe defaults for all Maybe<T> fields.
 *
 * ZERO-HARDCODING LAW: No fallback content injected here —
 * only structural normalisation. Null stays null.
 */

import type {
  Product,
  ProductCard,
  ProductVariant,
  ProductMetafields,
  Collection,
  CollectionMetafields,
  Cart,
  CartLine,
  ShopifyImage,
  MoneyV2,
  Maybe,
} from "./types";

// ─────────────────────────────────────────────────────────────
// Metafield normalisation
// ─────────────────────────────────────────────────────────────

type RawMetafield = {
  id?: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
} | null;

/**
 * Parse a metafield value by its Shopify type.
 */
function parseMetafieldValue(
  value: string,
  type: string
): string | boolean | number | string[] | null {
  if (!value) return null;

  try {
    switch (type) {
      case "boolean":
        return value === "true";
      case "number_integer":
      case "number_decimal":
        return Number(value);
      case "list.single_line_text_field":
      case "list.product_reference":
        return JSON.parse(value) as string[];
      case "json":
        return JSON.parse(value);
      default:
        return value;
    }
  } catch {
    return value;
  }
}

/**
 * Convert raw metafields array into a typed ProductMetafields object.
 */
export function normaliseProductMetafields(
  rawMetafields: Array<RawMetafield>
): ProductMetafields {
  const result: ProductMetafields = {};

  for (const mf of rawMetafields) {
    if (!mf) continue;
    const parsed = parseMetafieldValue(mf.value, mf.type);

    switch (mf.key) {
      case "ded_licensed":
        result.ded_licensed = parsed as boolean | undefined;
        break;
      case "made_in_uae":
        result.made_in_uae = parsed as boolean | undefined;
        break;
      case "installation_included":
        result.installation_included = parsed as boolean | undefined;
        break;
      case "dubai_climate_tested":
        result.dubai_climate_tested = parsed as boolean | undefined;
        break;
      case "is_dropship":
        result.is_dropship = parsed as boolean | undefined;
        break;
      case "material":
        result.material = parsed as string | undefined;
        break;
      case "warranty_years":
        result.warranty_years = parsed as number | undefined;
        break;
      case "dimensions":
        result.dimensions = parsed as string | undefined;
        break;
      case "weight_capacity":
        result.weight_capacity = parsed as string | undefined;
        break;
      case "color_options":
        result.color_options = parsed as string[] | undefined;
        break;
      case "lead_time_days":
        result.lead_time_days = parsed as number | undefined;
        break;
      case "subtitle":
        result.subtitle = parsed as string | undefined;
        break;
    }
  }

  return result;
}

/**
 * Convert raw metafields array into CollectionMetafields.
 */
export function normaliseCollectionMetafields(
  rawMetafields: Array<RawMetafield>
): CollectionMetafields {
  const result: CollectionMetafields = {};

  for (const mf of rawMetafields) {
    if (!mf) continue;
    const parsed = parseMetafieldValue(mf.value, mf.type);

    switch (mf.key) {
      case "hero_video_url":
        result.hero_video_url = parsed as string | undefined;
        break;
      case "badge_label":
        result.badge_label = parsed as string | undefined;
        break;
      case "sort_order":
        result.sort_order = parsed as number | undefined;
        break;
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────
// Image normalisation
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseImage(raw: any): ShopifyImage {
  return {
    url: raw?.url ?? "",
    altText: raw?.altText ?? null,
    width: raw?.width ?? null,
    height: raw?.height ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// Money normalisation
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseMoney(raw: any): MoneyV2 {
  return {
    amount: raw?.amount ?? "0.00",
    currencyCode: raw?.currencyCode ?? "AED",
  };
}

// ─────────────────────────────────────────────────────────────
// Variant normalisation
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseVariant(raw: any): ProductVariant {
  return {
    id: raw.id,
    title: raw.title,
    availableForSale: raw.availableForSale ?? false,
    quantityAvailable: raw.quantityAvailable ?? null,
    selectedOptions: raw.selectedOptions ?? [],
    price: normaliseMoney(raw.price),
    compareAtPrice: raw.compareAtPrice
      ? normaliseMoney(raw.compareAtPrice)
      : null,
    image: raw.image ? normaliseImage(raw.image) : null,
    sku: raw.sku ?? null,
    barcode: raw.barcode ?? null,
    weight: raw.weight ?? null,
    weightUnit: raw.weightUnit ?? null,
  };
}

// ─────────────────────────────────────────────────────────────
// Product normalisation
// ─────────────────────────────────────────────────────────────

/**
 * Normalise a raw Shopify product response into a typed Product.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseProduct(raw: any): Product {
  const rawMetafields = Array.isArray(raw.metafields) ? raw.metafields : [];

  const images = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    edges: (raw.images?.edges ?? []).map((e: any) => ({
      node: normaliseImage(e.node),
      cursor: e.cursor ?? "",
    })),
    pageInfo: raw.images?.pageInfo ?? {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  const variants = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    edges: (raw.variants?.edges ?? []).map((e: any) => ({
      node: normaliseVariant(e.node),
      cursor: e.cursor ?? "",
    })),
    pageInfo: raw.variants?.pageInfo ?? {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  return {
    id: raw.id,
    handle: raw.handle,
    availableForSale: raw.availableForSale ?? false,
    title: raw.title,
    description: raw.description ?? "",
    descriptionHtml: raw.descriptionHtml ?? "",
    vendor: raw.vendor ?? "",
    productType: raw.productType ?? "",
    tags: raw.tags ?? [],
    updatedAt: raw.updatedAt,
    createdAt: raw.createdAt,
    priceRange: {
      minVariantPrice: normaliseMoney(raw.priceRange?.minVariantPrice),
      maxVariantPrice: normaliseMoney(raw.priceRange?.maxVariantPrice),
    },
    compareAtPriceRange: {
      minVariantPrice: normaliseMoney(raw.compareAtPriceRange?.minVariantPrice),
      maxVariantPrice: normaliseMoney(raw.compareAtPriceRange?.maxVariantPrice),
    },
    featuredImage: raw.featuredImage
      ? normaliseImage(raw.featuredImage)
      : null,
    images,
    seo: {
      title: raw.seo?.title ?? null,
      description: raw.seo?.description ?? null,
    },
    options: raw.options ?? [],
    variants,
    metafields: normaliseProductMetafields(rawMetafields),
    _rawMetafields: rawMetafields,
  };
}

/**
 * Normalise a raw product into the lightweight ProductCard shape.
 * Used in listing pages to minimise memory/serialisation overhead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseProductCard(raw: any): ProductCard {
  const rawMetafields = Array.isArray(raw.metafields) ? raw.metafields : [];

  // Get price from first variant if priceRange not available
  const firstVariant = raw.variants?.edges?.[0]?.node;
  const priceRange = raw.priceRange ?? {
    minVariantPrice: firstVariant?.price ?? { amount: "0", currencyCode: "AED" },
    maxVariantPrice: firstVariant?.price ?? { amount: "0", currencyCode: "AED" },
  };

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    featuredImage: raw.featuredImage
      ? normaliseImage(raw.featuredImage)
      : null,
    priceRange: {
      minVariantPrice: normaliseMoney(priceRange.minVariantPrice),
      maxVariantPrice: normaliseMoney(priceRange.maxVariantPrice),
    },
    compareAtPriceRange: {
      minVariantPrice: normaliseMoney(
        raw.compareAtPriceRange?.minVariantPrice ?? null
      ),
      maxVariantPrice: normaliseMoney(
        raw.compareAtPriceRange?.maxVariantPrice ?? null
      ),
    },
    availableForSale: raw.availableForSale ?? false,
    vendor: raw.vendor ?? "",
    tags: raw.tags ?? [],
    metafields: normaliseProductMetafields(rawMetafields),
  };
}

// ─────────────────────────────────────────────────────────────
// Collection normalisation
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseCollection(raw: any): Collection {
  const rawMetafields = Array.isArray(raw.metafields) ? raw.metafields : [];

  // Products may or may not be present in the query
  const productEdges = raw.products?.edges ?? [];
  const products = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    edges: productEdges.map((e: any) => ({
      node: normaliseProductCard(e.node),
      cursor: e.cursor ?? "",
    })),
    pageInfo: raw.products?.pageInfo ?? {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    description: raw.description ?? "",
    descriptionHtml: raw.descriptionHtml ?? "",
    updatedAt: raw.updatedAt ?? "",
    image: raw.image ? normaliseImage(raw.image) : null,
    seo: {
      title: raw.seo?.title ?? null,
      description: raw.seo?.description ?? null,
    },
    metafields: normaliseCollectionMetafields(rawMetafields),
    products,
  };
}

// ─────────────────────────────────────────────────────────────
// Cart normalisation
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseCartLine(raw: any): CartLine {
  const merchandise = raw.merchandise;

  return {
    id: raw.id,
    quantity: raw.quantity,
    attributes: raw.attributes ?? [],
    cost: {
      totalAmount: normaliseMoney(raw.cost?.totalAmount),
      amountPerQuantity: normaliseMoney(raw.cost?.amountPerQuantity),
      compareAtAmountPerQuantity: raw.cost?.compareAtAmountPerQuantity
        ? normaliseMoney(raw.cost.compareAtAmountPerQuantity)
        : null,
    },
    merchandise: {
      id: merchandise?.id ?? "",
      title: merchandise?.title ?? "",
      availableForSale: merchandise?.availableForSale ?? false,
      selectedOptions: merchandise?.selectedOptions ?? [],
      price: normaliseMoney(merchandise?.price),
      compareAtPrice: merchandise?.compareAtPrice
        ? normaliseMoney(merchandise.compareAtPrice)
        : null,
      image: merchandise?.image
        ? normaliseImage(merchandise.image)
        : null,
      product: {
        id: merchandise?.product?.id ?? "",
        handle: merchandise?.product?.handle ?? "",
        title: merchandise?.product?.title ?? "",
        featuredImage: merchandise?.product?.featuredImage
          ? normaliseImage(merchandise.product.featuredImage)
          : null,
        vendor: merchandise?.product?.vendor ?? "",
      },
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normaliseCart(raw: any): Cart {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity ?? 0,
    note: raw.note ?? null,
    attributes: raw.attributes ?? [],
    buyerIdentity: {
      email: raw.buyerIdentity?.email ?? null,
      phone: raw.buyerIdentity?.phone ?? null,
      countryCode: raw.buyerIdentity?.countryCode ?? null,
      customer: raw.buyerIdentity?.customer ?? null,
    },
    cost: {
      subtotalAmount: normaliseMoney(raw.cost?.subtotalAmount),
      totalAmount: normaliseMoney(raw.cost?.totalAmount),
      totalTaxAmount: raw.cost?.totalTaxAmount
        ? normaliseMoney(raw.cost.totalTaxAmount)
        : null,
      totalDutyAmount: raw.cost?.totalDutyAmount
        ? normaliseMoney(raw.cost.totalDutyAmount)
        : null,
    },
    lines: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      edges: (raw.lines?.edges ?? []).map((e: any) => ({
        node: normaliseCartLine(e.node),
        cursor: e.cursor ?? "",
      })),
      pageInfo: raw.lines?.pageInfo ?? {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    discountCodes: raw.discountCodes ?? [],
  };
}

// ─────────────────────────────────────────────────────────────
// Money formatting utilities
// ─────────────────────────────────────────────────────────────

/**
 * Format a MoneyV2 object as a localised currency string.
 * Default locale: en-AE (UAE English).
 */
export function formatMoney(
  money: MoneyV2,
  locale: string = "en-AE"
): string {
  const amount = parseFloat(money.amount);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Check if a product has a sale (compareAtPrice > price).
 */
export function isOnSale(
  price: MoneyV2,
  compareAtPrice: Maybe<MoneyV2>
): boolean {
  if (!compareAtPrice) return false;
  return parseFloat(compareAtPrice.amount) > parseFloat(price.amount);
}

/**
 * Calculate discount percentage.
 */
export function getDiscountPercentage(
  price: MoneyV2,
  compareAtPrice: Maybe<MoneyV2>
): number | null {
  if (!isOnSale(price, compareAtPrice) || !compareAtPrice) return null;
  const original = parseFloat(compareAtPrice.amount);
  const current = parseFloat(price.amount);
  return Math.round(((original - current) / original) * 100);
}
