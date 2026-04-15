/**
 * lib/shopify/types.ts
 *
 * Complete TypeScript types for all Shopify Storefront API
 * responses used in this project.
 *
 * Rules:
 *  - All API response shapes are typed here.
 *  - Use `Maybe<T>` for nullable Shopify fields.
 *  - Raw API types (suffix *Raw) → normalised app types (no suffix).
 *  - Normalised types are what components consume.
 */

// ── Primitives ───────────────────────────────────────────────

export type Maybe<T> = T | null;

export interface ShopifyErrorLocation {
  line: number;
  column: number;
}

export interface ShopifyError {
  message: string;
  locations?: ShopifyErrorLocation[];
  path?: string[];
  extensions?: Record<string, unknown>;
}

export interface ShopifyResponse<T> {
  data?: T;
  errors?: ShopifyError[];
  extensions?: {
    cost?: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

// ── Connection / Pagination ──────────────────────────────────

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Edge<T> {
  node: T;
  cursor: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

// ── Shared primitives ────────────────────────────────────────

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: Maybe<string>;
  width: Maybe<number>;
  height: Maybe<number>;
}

export interface SEO {
  title: Maybe<string>;
  description: Maybe<string>;
}

export interface Metafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface CustomAttribute {
  key: string;
  value: string;
}

// ── Metafields (normalised — keyed by namespace.key) ─────────

export interface ProductMetafields {
  // Custom trust badges
  ded_licensed?: boolean;
  made_in_uae?: boolean;
  installation_included?: boolean;
  dubai_climate_tested?: boolean;
  is_dropship?: boolean;
  // Product specifications
  material?: string;
  warranty_years?: number;
  dimensions?: string;
  weight_capacity?: string;
  color_options?: string[];
  lead_time_days?: number;
  // Descriptors
  subtitle?: string;
}

export interface CollectionMetafields {
  hero_video_url?: string;
  badge_label?: string;
  sort_order?: number;
}

// ── Product ──────────────────────────────────────────────────

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: Maybe<number>;
  selectedOptions: SelectedOption[];
  price: MoneyV2;
  compareAtPrice: Maybe<MoneyV2>;
  image: Maybe<ShopifyImage>;
  sku: Maybe<string>;
  barcode: Maybe<string>;
  weight: Maybe<number>;
  weightUnit: Maybe<string>;
}

export interface PriceRange {
  minVariantPrice: MoneyV2;
  maxVariantPrice: MoneyV2;
}

export interface Product {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  updatedAt: string;
  createdAt: string;
  priceRange: PriceRange;
  compareAtPriceRange: PriceRange;
  featuredImage: Maybe<ShopifyImage>;
  images: Connection<ShopifyImage>;
  seo: SEO;
  options: ProductOption[];
  variants: Connection<ProductVariant>;
  metafields: ProductMetafields;
  /** Raw metafield array from API — used internally for normalisation */
  _rawMetafields?: Maybe<Metafield>[];
}

/** Lightweight product card shape — used in listing pages */
export type ProductCard = Pick<
  Product,
  | "id"
  | "handle"
  | "title"
  | "featuredImage"
  | "priceRange"
  | "compareAtPriceRange"
  | "availableForSale"
  | "vendor"
  | "tags"
  | "metafields"
>;

// ── Collection ───────────────────────────────────────────────

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  updatedAt: string;
  image: Maybe<ShopifyImage>;
  seo: SEO;
  metafields: CollectionMetafields;
  products: Connection<Product>;
  /** Only populated in getAllCollections — no products for perf */
  _noProducts?: true;
}

export type CollectionCard = Pick<
  Collection,
  "id" | "handle" | "title" | "image" | "description" | "metafields"
>;

// ── Cart ─────────────────────────────────────────────────────

export interface CartLine {
  id: string;
  quantity: number;
  attributes: CustomAttribute[];
  cost: {
    totalAmount: MoneyV2;
    amountPerQuantity: MoneyV2;
    compareAtAmountPerQuantity: Maybe<MoneyV2>;
  };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    selectedOptions: SelectedOption[];
    price: MoneyV2;
    compareAtPrice: Maybe<MoneyV2>;
    image: Maybe<ShopifyImage>;
    product: {
      id: string;
      handle: string;
      title: string;
      featuredImage: Maybe<ShopifyImage>;
      vendor: string;
    };
  };
}

export interface DiscountCode {
  code: string;
  applicable: boolean;
}

export interface BuyerIdentityInput {
  email?: string;
  phone?: string;
  countryCode?: string;
  customerAccessToken?: string;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  note: Maybe<string>;
  attributes: CustomAttribute[];
  buyerIdentity: {
    email: Maybe<string>;
    phone: Maybe<string>;
    countryCode: Maybe<string>;
    customer: Maybe<{
      id: string;
      email?: string;
      firstName?: string;
      lastName?: string;
    }>;
  };
  cost: {
    subtotalAmount: MoneyV2;
    totalAmount: MoneyV2;
    totalTaxAmount: Maybe<MoneyV2>;
    totalDutyAmount: Maybe<MoneyV2>;
  };
  lines: Connection<CartLine>;
  discountCodes: DiscountCode[];
}

/** Input shape for adding items to the cart */
export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: CustomAttribute[];
}

/** Input shape for updating items in the cart */
export interface CartLineUpdateInput {
  id: string;
  quantity: number;
  attributes?: CustomAttribute[];
}

// ── Customer ─────────────────────────────────────────────────

export interface CustomerAddress {
  id: string;
  firstName: Maybe<string>;
  lastName: Maybe<string>;
  company: Maybe<string>;
  address1: Maybe<string>;
  address2: Maybe<string>;
  city: Maybe<string>;
  province: Maybe<string>;
  country: Maybe<string>;
  zip: Maybe<string>;
  phone: Maybe<string>;
}

export interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: Maybe<string>;
  fulfillmentStatus: string;
  currentTotalPrice: MoneyV2;
  lineItems: Connection<OrderLineItem>;
}

export interface OrderLineItem {
  title: string;
  quantity: number;
  variant: Maybe<
    Pick<ProductVariant, "id" | "title" | "price" | "image" | "selectedOptions">
  >;
}

export interface Customer {
  id: string;
  email: string;
  firstName: Maybe<string>;
  lastName: Maybe<string>;
  displayName: string;
  phone: Maybe<string>;
  createdAt: string;
  defaultAddress: Maybe<CustomerAddress>;
  addresses: Connection<CustomerAddress>;
  orders: Connection<Order>;
}

// ── Customer auth ────────────────────────────────────────────

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface CustomerUserError {
  code: Maybe<string>;
  field: Maybe<string[]>;
  message: string;
}

// ── Function return types ────────────────────────────────────

export interface ShopifyFetchResult<T> {
  data: T;
  status: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pageInfo: PageInfo;
}

// ── Collection query input ────────────────────────────────────

export interface CollectionProductsInput {
  handle: string;
  first?: number;
  after?: string;
  sortKey?: ProductCollectionSortKeys;
  reverse?: boolean;
  filters?: ProductFilter[];
}

export type ProductCollectionSortKeys =
  | "TITLE"
  | "PRICE"
  | "BEST_SELLING"
  | "CREATED"
  | "MANUAL"
  | "COLLECTION_DEFAULT"
  | "RELEVANCE";

export interface ProductFilter {
  available?: boolean;
  price?: { min?: number; max?: number };
  productMetafield?: { namespace: string; key: string; value: string };
  variantOption?: { name: string; value: string };
  productType?: string;
  vendor?: string;
  tag?: string;
}

// ── Metaobject types ──────────────────────────────────────────

export interface MetaobjectField {
  key: string;
  value: Maybe<string>;
  type: string;
  reference?: Maybe<{
    __typename: string;
    id?: string;
    url?: string;
    altText?: Maybe<string>;
    width?: Maybe<number>;
    height?: Maybe<number>;
  }>;
}

export interface Metaobject {
  id: string;
  handle: string;
  type: string;
  fields: MetaobjectField[];
}

// ── Page / Menu ───────────────────────────────────────────────

export interface MenuItem {
  id: string;
  title: string;
  url: string;
  type: string;
  items?: MenuItem[];
  resourceId?: Maybe<string>;
}

export interface Menu {
  id: string;
  handle: string;
  title: string;
  items: MenuItem[];
}

export interface ShopPage {
  id: string;
  handle: string;
  title: string;
  body: string;
  bodySummary: string;
  createdAt: string;
  updatedAt: string;
  seo: SEO;
}

// ── Shop info ─────────────────────────────────────────────────

export interface ShopInfo {
  name: string;
  description: Maybe<string>;
  primaryDomain: { url: string };
  shipsToCountries: string[];
  moneyFormat: string;
}
