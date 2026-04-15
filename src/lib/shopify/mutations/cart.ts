/**
 * lib/shopify/mutations/cart.ts
 *
 * All cart mutation functions.
 * These are called from Server Actions — NEVER from Client Components.
 *
 * After each mutation the cart cookie should be set/updated
 * by the Server Action that calls these functions.
 */

import "server-only";

import { shopifyQuery } from "../client";
import { CART_FRAGMENTS } from "../constants";
import { normaliseCart } from "../normalise";
import type {
  Cart,
  CartLineInput,
  CartLineUpdateInput,
  BuyerIdentityInput,
  CustomAttribute,
} from "../types";

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENTS}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENTS}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENTS}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENTS}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_BUYER_IDENTITY_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENTS}
  mutation CartBuyerIdentityUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_DISCOUNT_CODES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENTS}
  mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]!) {
    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_NOTE_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENTS}
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

const CART_ATTRIBUTES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FRAGMENTS}
  mutation CartAttributesUpdate(
    $cartId: ID!
    $attributes: [AttributeInput!]!
  ) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart {
        ...CartFields
      }
      userErrors {
        code
        field
        message
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// Error helpers
// ─────────────────────────────────────────────────────────────

interface CartUserError {
  code: string | null;
  field: string[] | null;
  message: string;
}

export class CartMutationError extends Error {
  public readonly userErrors: CartUserError[];

  constructor(userErrors: CartUserError[]) {
    const messages = userErrors.map((e) => e.message).join("; ");
    super(`[Shopify Cart] Mutation failed: ${messages}`);
    this.name = "CartMutationError";
    this.userErrors = userErrors;
  }
}

function throwIfUserErrors(userErrors: CartUserError[]): void {
  const realErrors = userErrors.filter(
    (e) => e.code !== null || e.message
  );
  if (realErrors.length > 0) {
    throw new CartMutationError(realErrors);
  }
}

// ─────────────────────────────────────────────────────────────
// Mutation functions
// ─────────────────────────────────────────────────────────────

/**
 * Create a new cart, optionally with initial line items.
 */
export async function createCart(options?: {
  lines?: CartLineInput[];
  note?: string;
  attributes?: CustomAttribute[];
  buyerIdentity?: BuyerIdentityInput;
}): Promise<Cart> {
  interface ApiResponse {
    cartCreate: {
      cart: unknown;
      userErrors: CartUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(CART_CREATE_MUTATION, {
    input: {
      lines: options?.lines ?? [],
      note: options?.note,
      attributes: options?.attributes,
      buyerIdentity: options?.buyerIdentity,
    },
  });

  throwIfUserErrors(data.cartCreate.userErrors);
  return normaliseCart(data.cartCreate.cart);
}

/**
 * Add one or more items to an existing cart.
 */
export async function addToCart(
  cartId: string,
  lines: CartLineInput[]
): Promise<Cart> {
  interface ApiResponse {
    cartLinesAdd: {
      cart: unknown;
      userErrors: CartUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines,
  });

  throwIfUserErrors(data.cartLinesAdd.userErrors);
  return normaliseCart(data.cartLinesAdd.cart);
}

/**
 * Update quantities for existing cart lines.
 * Set quantity to 0 to use removeFromCart instead.
 */
export async function updateCartLine(
  cartId: string,
  lines: CartLineUpdateInput[]
): Promise<Cart> {
  interface ApiResponse {
    cartLinesUpdate: {
      cart: unknown;
      userErrors: CartUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines,
  });

  throwIfUserErrors(data.cartLinesUpdate.userErrors);
  return normaliseCart(data.cartLinesUpdate.cart);
}

/**
 * Remove one or more lines from the cart by line IDs.
 */
export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  interface ApiResponse {
    cartLinesRemove: {
      cart: unknown;
      userErrors: CartUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds,
  });

  throwIfUserErrors(data.cartLinesRemove.userErrors);
  return normaliseCart(data.cartLinesRemove.cart);
}

/**
 * Update the buyer identity on a cart.
 * Called after customer logs in to associate cart with their account.
 */
export async function updateCartBuyerIdentity(
  cartId: string,
  buyerIdentity: BuyerIdentityInput
): Promise<Cart> {
  interface ApiResponse {
    cartBuyerIdentityUpdate: {
      cart: unknown;
      userErrors: CartUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CART_BUYER_IDENTITY_UPDATE_MUTATION,
    { cartId, buyerIdentity }
  );

  throwIfUserErrors(data.cartBuyerIdentityUpdate.userErrors);
  return normaliseCart(data.cartBuyerIdentityUpdate.cart);
}

/**
 * Apply or remove discount codes from the cart.
 * Pass an empty array to remove all discount codes.
 */
export async function updateCartDiscountCodes(
  cartId: string,
  discountCodes: string[]
): Promise<Cart> {
  interface ApiResponse {
    cartDiscountCodesUpdate: {
      cart: unknown;
      userErrors: CartUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CART_DISCOUNT_CODES_UPDATE_MUTATION,
    { cartId, discountCodes }
  );

  throwIfUserErrors(data.cartDiscountCodesUpdate.userErrors);
  return normaliseCart(data.cartDiscountCodesUpdate.cart);
}

/**
 * Update the cart-level note (order instructions).
 */
export async function updateCartNote(
  cartId: string,
  note: string
): Promise<Cart> {
  interface ApiResponse {
    cartNoteUpdate: {
      cart: unknown;
      userErrors: CartUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(CART_NOTE_UPDATE_MUTATION, {
    cartId,
    note,
  });

  throwIfUserErrors(data.cartNoteUpdate.userErrors);
  return normaliseCart(data.cartNoteUpdate.cart);
}

/**
 * Update custom attributes on the cart.
 * Used for order-level metadata (e.g. referral source, project type).
 */
export async function updateCartAttributes(
  cartId: string,
  attributes: CustomAttribute[]
): Promise<Cart> {
  interface ApiResponse {
    cartAttributesUpdate: {
      cart: unknown;
      userErrors: CartUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CART_ATTRIBUTES_UPDATE_MUTATION,
    { cartId, attributes }
  );

  throwIfUserErrors(data.cartAttributesUpdate.userErrors);
  return normaliseCart(data.cartAttributesUpdate.cart);
}
