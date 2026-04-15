/**
 * lib/shopify/constants.ts
 *
 * Reusable GraphQL fragments shared across all queries.
 * Centralising fragments here ensures consistency and allows
 * a single edit to propagate across all queries automatically.
 *
 * IMPORTANT: Shopify Storefront API 2024-10.
 */

// ── Primitive fragments ──────────────────────────────────────

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

// ── Metafield identifiers ────────────────────────────────────
// Used in product queries via the `metafields(identifiers: [...])` arg.

export const PRODUCT_METAFIELD_IDENTIFIERS = [
  { namespace: "custom", key: "ded_licensed" },
  { namespace: "custom", key: "made_in_uae" },
  { namespace: "custom", key: "installation_included" },
  { namespace: "custom", key: "dubai_climate_tested" },
  { namespace: "custom", key: "material" },
  { namespace: "custom", key: "warranty_years" },
  { namespace: "custom", key: "is_dropship" },
  { namespace: "custom", key: "dimensions" },
  { namespace: "custom", key: "weight_capacity" },
  { namespace: "custom", key: "color_options" },
  { namespace: "custom", key: "lead_time_days" },
  { namespace: "descriptors", key: "subtitle" },
] as const;

export const METAFIELD_FRAGMENT = /* GraphQL */ `
  fragment MetafieldFields on Metafield {
    id
    namespace
    key
    value
    type
  }
`;

// ── Variant fragment ─────────────────────────────────────────

export const PRODUCT_VARIANT_FRAGMENT = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
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

// ── Core product fragment (no variants — keeps the payload lean) ─

export const PRODUCT_CORE_FRAGMENT = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
  ${SEO_FRAGMENT}
  ${METAFIELD_FRAGMENT}
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

// ── Full product fragment (variants + metafields included) ───

export const PRODUCT_FULL_FRAGMENT = /* GraphQL */ `
  ${PRODUCT_CORE_FRAGMENT}
  ${PRODUCT_VARIANT_FRAGMENT}
  ${METAFIELD_FRAGMENT}
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
        { namespace: "custom", key: "material" }
        { namespace: "custom", key: "warranty_years" }
        { namespace: "custom", key: "is_dropship" }
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

// ── Cart fragment ────────────────────────────────────────────

export const CART_LINE_FRAGMENT = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${MONEY_FRAGMENT}
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
  ${CART_LINE_FRAGMENT}
  ${MONEY_FRAGMENT}
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

// ── Collection fragment ──────────────────────────────────────

export const COLLECTION_CORE_FRAGMENT = /* GraphQL */ `
  ${IMAGE_FRAGMENT}
  ${SEO_FRAGMENT}
  ${METAFIELD_FRAGMENT}
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

// ── Shopify API version ──────────────────────────────────────

export const SHOPIFY_API_VERSION = "2024-10" as const;

// ── Cache tag prefixes (for tag-based revalidation) ─────────

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
