"use server";

/**
 * lib/shopify/actions/cart.ts
 *
 * Next.js Server Actions for all cart mutations.
 *
 * Rules:
 *  - `cookies()` is async in Next.js 15+ — always await it.
 *  - All exported functions are callable from Client Components via RPC.
 *  - Cart ID is stored as an HttpOnly cookie — never exposed to JS.
 *  - Returns a discriminated union `CartActionResult` so the client
 *    can handle errors without try/catch.
 */

import { cookies } from "next/headers";
import { getCart } from "../queries/cart";
import {
  createCart as mutateCreateCart,
  addToCart as mutateAddToCart,
  updateCartLine,
  removeFromCart as mutateRemoveFromCart,
} from "../mutations/cart";
import type { Cart } from "../types";

// ─────────────────────────────────────────────────────────────────
// Cookie config
// ─────────────────────────────────────────────────────────────────

const CART_COOKIE     = "wasleen_cart_id";
const COOKIE_MAX_AGE  = 60 * 60 * 24 * 60; // 60 days in seconds

// ─────────────────────────────────────────────────────────────────
// Return type — serialisable discriminated union
// ─────────────────────────────────────────────────────────────────

export type CartActionResult =
  | { success: true;  cart: Cart   }
  | { success: false; error: string };

// ─────────────────────────────────────────────────────────────────
// Internal cookie helpers
// ─────────────────────────────────────────────────────────────────

async function getCartId(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function saveCartId(cartId: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, cartId, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === "production",
    sameSite:  "lax",
    path:      "/",
    maxAge:    COOKIE_MAX_AGE,
  });
}

// ─────────────────────────────────────────────────────────────────
// Internal: get an active cart or create a fresh one
// ─────────────────────────────────────────────────────────────────

async function resolveCart(): Promise<Cart> {
  const cartId = await getCartId();

  if (cartId) {
    // Fetch existing cart — returns null if expired / not found
    const existing = await getCart(cartId).catch(() => null);
    if (existing) return existing;
  }

  // No cart (or expired) — create an empty one and persist its ID
  const fresh = await mutateCreateCart();
  await saveCartId(fresh.id);
  return fresh;
}

// ─────────────────────────────────────────────────────────────────
// Exported: initial hydration (called from Server Components)
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch the cart for initial page render.
 * Called from the root layout (Server Component) — NOT via RPC.
 * Returns null if no cart cookie exists or cart has expired.
 */
export async function getInitialCart(): Promise<Cart | null> {
  const cartId = await getCartId();
  if (!cartId) return null;
  return getCart(cartId).catch(() => null);
}

// ─────────────────────────────────────────────────────────────────
// Exported: Server Actions (callable from Client Components via RPC)
// ─────────────────────────────────────────────────────────────────

/**
 * Add a variant to the cart, creating the cart if it doesn't exist.
 * Opens the cart drawer after success (handled by the Context).
 */
export async function actionAddToCart(
  variantId: string,
  quantity: number = 1
): Promise<CartActionResult> {
  try {
    const cartId = await getCartId();
    let cart: Cart;

    if (!cartId) {
      // First item ever — create cart with this line
      cart = await mutateCreateCart({
        lines: [{ merchandiseId: variantId, quantity }],
      });
      await saveCartId(cart.id);
    } else {
      try {
        cart = await mutateAddToCart(cartId, [
          { merchandiseId: variantId, quantity },
        ]);
      } catch {
        // Cart expired mid-session — recreate with this line
        cart = await mutateCreateCart({
          lines: [{ merchandiseId: variantId, quantity }],
        });
        await saveCartId(cart.id);
      }
    }

    return { success: true, cart };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to add item to cart",
    };
  }
}

/**
 * Update the quantity of an existing cart line.
 * Caller is responsible for NOT passing qty = 0 — use `actionRemoveCartItem`.
 */
export async function actionUpdateCartItem(
  lineId:   string,
  quantity: number
): Promise<CartActionResult> {
  try {
    const cartId = await getCartId();
    if (!cartId) return { success: false, error: "No active cart" };

    const cart = await updateCartLine(cartId, [{ id: lineId, quantity }]);
    return { success: true, cart };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update cart item",
    };
  }
}

/**
 * Remove a line from the cart entirely.
 */
export async function actionRemoveCartItem(
  lineId: string
): Promise<CartActionResult> {
  try {
    const cartId = await getCartId();
    if (!cartId) return { success: false, error: "No active cart" };

    const cart = await mutateRemoveFromCart(cartId, [lineId]);
    return { success: true, cart };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to remove cart item",
    };
  }
}
