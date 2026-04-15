/**
 * lib/shopify/index.ts
 *
 * Primary barrel export for the Shopify integration layer.
 *
 * Import everything your app needs from '@/lib/shopify'.
 * This provides a stable import surface even if internal
 * file structures change.
 */

export { shopifyQuery, shopifyAdminFetch, ShopifyClientError, ShopifyRateLimitError, ShopifyNetworkError } from "./client";

// Queries
export {
  getProductByHandle,
  getProductById,
  getProducts,
  getProductRecommendations,
  searchProducts,
  getProductsByHandles,
} from "./queries/product";

export {
  getCollectionByHandle,
  getCollectionProducts,
  getAllCollections,
  getCollectionWithProducts,
  getCollectionsByHandles,
} from "./queries/collection";

export type {
  CollectionFilter,
  CollectionFilterValue,
  CollectionProductsResult,
} from "./queries/collection";

export { getCart } from "./queries/cart";

export {
  getCustomer,
  getCustomerOrders,
  getCustomerAddresses,
} from "./queries/customer";

// Mutations
export {
  createCart,
  addToCart,
  updateCartLine,
  removeFromCart,
  updateCartBuyerIdentity,
  updateCartDiscountCodes,
  updateCartNote,
  updateCartAttributes,
  CartMutationError,
} from "./mutations/cart";

export {
  createCustomer,
  createCustomerAccessToken,
  renewCustomerAccessToken,
  deleteCustomerAccessToken,
  updateCustomer,
  recoverCustomerPassword,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
  CustomerMutationError,
} from "./mutations/customer";

export type { CreateCustomerInput, UpdateCustomerInput, AddressInput } from "./mutations/customer";

// Normalise utilities (useful in non-standard shapes)
export {
  normaliseProduct,
  normaliseProductCard,
  normaliseCollection,
  normaliseCart,
  normaliseProductMetafields,
  formatMoney,
  isOnSale,
  getDiscountPercentage,
} from "./normalise";

// Types
export type {
  // Primitives
  Maybe,
  MoneyV2,
  ShopifyImage,
  SEO,
  Metafield,
  CustomAttribute,
  PageInfo,
  Connection,
  Edge,
  // Products
  Product,
  ProductCard,
  ProductVariant,
  ProductOption,
  SelectedOption,
  PriceRange,
  ProductMetafields,
  ProductCollectionSortKeys,
  ProductFilter,
  // Collections
  Collection,
  CollectionCard,
  CollectionMetafields,
  // Cart
  Cart,
  CartLine,
  CartLineInput,
  CartLineUpdateInput,
  DiscountCode,
  BuyerIdentityInput,
  // Customer
  Customer,
  CustomerAccessToken,
  CustomerUserError,
  CustomerAddress,
  Order,
  OrderLineItem,
  // Pagination
  PaginatedResult,
  // Metaobjects
  Metaobject,
  MetaobjectField,
  // Navigation
  Menu,
  MenuItem,
  ShopPage,
  ShopInfo,
  // Errors
  ShopifyError,
  ShopifyResponse,
} from "./types";

// Constants
export { CACHE_TAGS, SHOPIFY_API_VERSION } from "./constants";
export type { CacheTag } from "./constants";
