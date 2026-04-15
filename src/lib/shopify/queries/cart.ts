/**
 * lib/shopify/queries/cart.ts
 *
 * Cart READ queries (mutations are in mutations/cart.ts).
 *
 * Note: Cart data must NEVER be cached — it's user-specific
 * and must always reflect the current state. No 'use cache'.
 */

import "server-only";

import { shopifyQuery } from "../client";
import { CART_FRAGMENTS } from "../constants";
import { normaliseCart } from "../normalise";
import type { Cart } from "../types";

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

const GET_CART_QUERY = /* GraphQL */ `
  ${CART_FRAGMENTS}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// Query functions (NOT cached — user-specific data)
// ─────────────────────────────────────────────────────────────

/**
 * Fetch a cart by ID.
 * NOT cached (user-specific, must always be fresh).
 * Returns null if the cart has expired or does not exist.
 */
export async function getCart(cartId: string): Promise<Cart | null> {
  interface ApiResponse {
    cart: unknown | null;
  }

  const data = await shopifyQuery<ApiResponse>(GET_CART_QUERY, { cartId });
  if (!data.cart) return null;
  return normaliseCart(data.cart);
}
