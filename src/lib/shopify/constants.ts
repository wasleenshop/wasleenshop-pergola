/**
 * lib/shopify/constants.ts
 *
 * Reusable GraphQL fragments for the Shopify Storefront API.
 *
 * ARCHITECTURE RULE — Fragment embedding:
 *  Primitive fragments (IMAGE, MONEY, etc.) contain ONLY their own
 *  fragment body. Compound fragments (PRODUCT_CORE, CART_LINE, etc.)
 *  use `...SpreadName` syntax but do NOT embed their dependency fragments.
 *
 *  Fragment dependencies are resolved at the QUERY level using the
 *  *_FRAGMENTS bundle exports below. This ensures each fragment
 *  definition appears exactly once per GraphQL document, avoiding
 *  "Fragment already defined" errors from the Shopify API.
 *
 * IMPORTANT: Shopify Storefront API 2024-10.
 */

// ── Primitive fragments ──────────────────────────────────────────
// Self-contained — no spread dependencies.

export const IMAGE_FRAGMENT = /* GraphQL */ `
  fragment ImageFields on Image {
    url
    altText
    width
    height
  }
`;

export const MONEY_FRAGMENT = /* GraphQL */ `
  fragment MoneyFields on MoneyV2 {
    amount
    currencyCode
  }
`;

export const SEO_FRAGMENT = /* GraphQL */ `
  fragment SEOFields on SEO {
    title
    description
  }
`;

export const PAGE_INFO_FRAGMENT = /* GraphQL */ `
  fragment PageInfoFields on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;

export const METAFIELD_FRAGMENT = /* GraphQL */ `
  fragment MetafieldFields on Metafield {
    id
    namespace
    key
    value
    type
  }
`;

// ── Compound fragments ───────────────────────────────────────────
// Use `...Spread` syntax. Do NOT embed primitive fragment strings here.
// Include their dependencies via a *_FRAGMENTS bundle at the query level.

export const PRODUCT_VARIANT_FRAGMENT = /* GraphQL */ `
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    selectedOptions {
      name
      value
    }
    price {
      ...MoneyFields
    }
    compareAtPrice {
      ...MoneyFields
    }
    image {
      ...ImageFields
    }
    sku
    barcode
    weight
    weightUnit
  }
`;

export const PRODUCT_CORE_FRAGMENT = /* GraphQL */ `
  fragment ProductCoreFields on Product {
    id
    handle
    availableForSale
    title
    description
    descriptionHtml
    vendor
    productType
    tags
    updatedAt
    createdAt
    priceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        ...MoneyFields
      }
      maxVariantPrice {
        ...MoneyFields
      }
    }
    featuredImage {
      ...ImageFields
    }
    images(first: 10) {
      edges {
        node {
          ...ImageFields
        }
      }
    }
    seo {
      ...SEOFields
    }
    options {
      id
      name
      values
    }
  }
`;

/** Full product fragment — includes variants + all custom metafields. */
export const PRODUCT_FULL_FRAGMENT = /* GraphQL */ `
  fragment ProductFullFields on Product {
    ...ProductCoreFields
    variants(first: 100) {
      edges {
        node {
          ...ProductVariantFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
    metafields(
      identifiers: [
        { namespace: "custom", key: "ded_licensed" }
        { namespace: "custom", key: "made_in_uae" }
        { namespace: "custom", key: "installation_included" }
        { namespace: "custom", key: "dubai_climate_tested" }
        { namespace: "custom", key: "eco_friendly" }
        { namespace: "custom", key: "super_deal" }
        { namespace: "custom", key: "wasleen_choice" }
        { namespace: "custom", key: "material" }
        { namespace: "custom", key: "warranty_years" }
        { namespace: "custom", key: "is_dropship" }
        { namespace: "custom", key: "requires_consultation" }
        { namespace: "custom", key: "is_custom_design" }
        { namespace: "custom", key: "deposit_percentage" }
        { namespace: "custom", key: "installation_cost" }
        { namespace: "custom", key: "supplier_name" }
        { namespace: "custom", key: "shipping_origin" }
        { namespace: "custom", key: "dimensions" }
        { namespace: "custom", key: "weight_capacity" }
        { namespace: "custom", key: "color_options" }
        { namespace: "custom", key: "lead_time_days" }
        { namespace: "descriptors", key: "subtitle" }
      ]
    ) {
      ...MetafieldFields
    }
  }
`;

export const COLLECTION_CORE_FRAGMENT = /* GraphQL */ `
  fragment CollectionCoreFields on Collection {
    id
    handle
    title
    description
    descriptionHtml
    updatedAt
    image {
      ...ImageFields
    }
    seo {
      ...SEOFields
    }
    metafields(
      identifiers: [
        { namespace: "custom", key: "hero_video_url" }
        { namespace: "custom", key: "badge_label" }
        { namespace: "custom", key: "sort_order" }
      ]
    ) {
      ...MetafieldFields
    }
  }
`;

export const CART_LINE_FRAGMENT = /* GraphQL */ `
  fragment CartLineFields on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...MoneyFields
      }
      amountPerQuantity {
        ...MoneyFields
      }
      compareAtAmountPerQuantity {
        ...MoneyFields
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        title
        availableForSale
        selectedOptions {
          name
          value
        }
        price {
          ...MoneyFields
        }
        compareAtPrice {
          ...MoneyFields
        }
        image {
          ...ImageFields
        }
        product {
          id
          handle
          title
          featuredImage {
            ...ImageFields
          }
          vendor
        }
      }
    }
  }
`;

export const CART_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    note
    attributes {
      key
      value
    }
    buyerIdentity {
      email
      phone
      countryCode
      customer {
        id
        email
        firstName
        lastName
      }
    }
    cost {
      subtotalAmount {
        ...MoneyFields
      }
      totalAmount {
        ...MoneyFields
      }
      totalTaxAmount {
        ...MoneyFields
      }
      totalDutyAmount {
        ...MoneyFields
      }
    }
    lines(first: 100) {
      edges {
        node {
          ...CartLineFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
    }
    discountCodes {
      code
      applicable
    }
  }
`;

// ── Fragment bundles ─────────────────────────────────────────────
// Embed ONE of these at the top of a query/mutation string.
// Each bundle includes all fragment definitions needed — exactly once.

/** For product detail queries (full product with variants). */
export const PRODUCT_FRAGMENTS = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${SEO_FRAGMENT}
  ${METAFIELD_FRAGMENT}
  ${PRODUCT_CORE_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
`;

/** For product listing queries (core fields, no variants). */
export const PRODUCT_LIST_FRAGMENTS = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${SEO_FRAGMENT}
  ${METAFIELD_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
  ${PRODUCT_CORE_FRAGMENT}
`;

/** For collection-only queries (no products). */
export const COLLECTION_FRAGMENTS = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${SEO_FRAGMENT}
  ${METAFIELD_FRAGMENT}
  ${COLLECTION_CORE_FRAGMENT}
`;

/** For collection queries that include products. */
export const COLLECTION_WITH_PRODUCTS_FRAGMENTS = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${SEO_FRAGMENT}
  ${METAFIELD_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
  ${COLLECTION_CORE_FRAGMENT}
  ${PRODUCT_CORE_FRAGMENT}
`;

/** For all cart queries and mutations. */
export const CART_FRAGMENTS = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${CART_LINE_FRAGMENT}
  ${CART_FRAGMENT}
`;

// ── Metafield identifiers ────────────────────────────────────────
// Used programmatically (e.g. for typed identifier arrays).

export const PRODUCT_METAFIELD_IDENTIFIERS = [
  { namespace: "custom", key: "ded_licensed" },
  { namespace: "custom", key: "made_in_uae" },
  { namespace: "custom", key: "installation_included" },
  { namespace: "custom", key: "dubai_climate_tested" },
  { namespace: "custom", key: "eco_friendly" },
  { namespace: "custom", key: "super_deal" },
  { namespace: "custom", key: "wasleen_choice" },
  { namespace: "custom", key: "material" },
  { namespace: "custom", key: "warranty_years" },
  { namespace: "custom", key: "is_dropship" },
  { namespace: "custom", key: "requires_consultation" },
  { namespace: "custom", key: "is_custom_design" },
  { namespace: "custom", key: "deposit_percentage" },
  { namespace: "custom", key: "installation_cost" },
  { namespace: "custom", key: "supplier_name" },
  { namespace: "custom", key: "shipping_origin" },
  { namespace: "custom", key: "dimensions" },
  { namespace: "custom", key: "weight_capacity" },
  { namespace: "custom", key: "color_options" },
  { namespace: "custom", key: "lead_time_days" },
  { namespace: "descriptors", key: "subtitle" },
] as const;

// ── Shopify API version ──────────────────────────────────────────

export const SHOPIFY_API_VERSION = "2024-10" as const;

// ── Cache tag prefixes (for tag-based revalidation) ─────────────

export const CACHE_TAGS = {
  PRODUCT: "shopify-product",
  PRODUCTS: "shopify-products",
  COLLECTION: "shopify-collection",
  COLLECTIONS: "shopify-collections",
  CART: "shopify-cart",
  CUSTOMER: "shopify-customer",
  NAVIGATION: "shopify-navigation",
  METAOBJECTS: "shopify-metaobjects",
  PAGES: "shopify-pages",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
