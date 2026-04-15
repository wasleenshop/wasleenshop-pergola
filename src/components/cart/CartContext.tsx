"use client";

/**
 * components/cart/CartContext.tsx
 *
 * Global cart state for the entire app.
 *
 * Architecture:
 *  - `CartProvider` is rendered in the root layout (Server Component)
 *    and receives `initialCart` fetched server-side so there is zero
 *    loading flash on first render.
 *  - All mutations use optimistic updates: the local state is updated
 *    immediately, then replaced by the authoritative server response.
 *  - On mutation failure the pre-mutation snapshot is restored.
 *  - `pendingLineIds` lets CartItem show per-line spinners without
 *    needing to call useCart() directly (keeps CartItem decoupled).
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Cart, CartLine, Edge } from "@/lib/shopify/types";
import {
  actionAddToCart,
  actionUpdateCartItem,
  actionRemoveCartItem,
} from "@/lib/shopify/actions/cart";

// ─────────────────────────────────────────────────────────────────
// Mock cart — export for development / Storybook testing
// ─────────────────────────────────────────────────────────────────

export const MOCK_CART: Cart = {
  id:            "gid://shopify/Cart/mock-cart-001",
  checkoutUrl:   "#",
  totalQuantity: 3,
  note:          null,
  attributes:    [],
  buyerIdentity: { email: null, phone: null, countryCode: "AE", customer: null },
  cost: {
    subtotalAmount:  { amount: "15200.00", currencyCode: "AED" },
    totalAmount:     { amount: "15200.00", currencyCode: "AED" },
    totalTaxAmount:  null,
    totalDutyAmount: null,
  },
  lines: {
    edges: [
      {
        cursor: "1",
        node: {
          id: "gid://shopify/CartLine/mock-1", quantity: 1, attributes: [],
          cost: {
            totalAmount:               { amount: "8500.00",  currencyCode: "AED" },
            amountPerQuantity:         { amount: "8500.00",  currencyCode: "AED" },
            compareAtAmountPerQuantity:{ amount: "11000.00", currencyCode: "AED" },
          },
          merchandise: {
            id: "gid://shopify/ProductVariant/mock-v1", title: "Charcoal / 3×4m",
            availableForSale: true,
            selectedOptions: [{ name: "Color", value: "Charcoal" }, { name: "Size", value: "3×4m" }],
            price:          { amount: "8500.00",  currencyCode: "AED" },
            compareAtPrice: { amount: "11000.00", currencyCode: "AED" },
            image: null,
            product: {
              id: "gid://shopify/Product/mock-p1", handle: "classic-aluminum-pergola",
              title: "Classic Aluminum Pergola", featuredImage: null, vendor: "Wasleen Pergolas",
            },
          },
        },
      },
      {
        cursor: "2",
        node: {
          id: "gid://shopify/CartLine/mock-2", quantity: 2, attributes: [],
          cost: {
            totalAmount:               { amount: "6400.00", currencyCode: "AED" },
            amountPerQuantity:         { amount: "3200.00", currencyCode: "AED" },
            compareAtAmountPerQuantity: null,
          },
          merchandise: {
            id: "gid://shopify/ProductVariant/mock-v2", title: "Beige / 3m",
            availableForSale: true,
            selectedOptions: [{ name: "Color", value: "Beige" }, { name: "Width", value: "3m" }],
            price:          { amount: "3200.00", currencyCode: "AED" },
            compareAtPrice: null,
            image: null,
            product: {
              id: "gid://shopify/Product/mock-p2", handle: "retractable-awning",
              title: "Retractable Awning System", featuredImage: null, vendor: "Wasleen Pergolas",
            },
          },
        },
      },
    ],
    pageInfo: { hasNextPage: false, hasPreviousPage: false },
  },
  discountCodes: [],
};

// ─────────────────────────────────────────────────────────────────
// Optimistic update helpers (pure functions — no side-effects)
// ─────────────────────────────────────────────────────────────────

function applyOptimisticQtyUpdate(
  cart: Cart,
  lineId: string,
  newQty: number
): Cart {
  const newEdges: Edge<CartLine>[] = cart.lines.edges.map((edge) => {
    if (edge.node.id !== lineId) return edge;
    const { amountPerQuantity, compareAtAmountPerQuantity } = edge.node.cost;
    const unitAmt = parseFloat(amountPerQuantity.amount);
    return {
      ...edge,
      node: {
        ...edge.node,
        quantity: newQty,
        cost: {
          ...edge.node.cost,
          totalAmount: {
            amount:       (unitAmt * newQty).toFixed(2),
            currencyCode: amountPerQuantity.currencyCode,
          },
          // Recompute compareAt total for accurate savings display
          compareAtAmountPerQuantity: compareAtAmountPerQuantity
            ? {
                amount:       compareAtAmountPerQuantity.amount,
                currencyCode: compareAtAmountPerQuantity.currencyCode,
              }
            : null,
        },
      },
    };
  });

  return recomputeCartTotals({ ...cart, lines: { ...cart.lines, edges: newEdges } });
}

function applyOptimisticRemove(cart: Cart, lineId: string): Cart {
  const newEdges = cart.lines.edges.filter((e) => e.node.id !== lineId);
  return recomputeCartTotals({ ...cart, lines: { ...cart.lines, edges: newEdges } });
}

/** Recompute `totalQuantity` and `cost` from `lines`. */
function recomputeCartTotals(cart: Cart): Cart {
  const edges = cart.lines.edges;
  const totalQuantity = edges.reduce((s, e) => s + e.node.quantity, 0);
  const subtotal      = edges.reduce(
    (s, e) => s + parseFloat(e.node.cost.totalAmount.amount),
    0
  );
  const currency = cart.cost.subtotalAmount.currencyCode;

  return {
    ...cart,
    totalQuantity,
    cost: {
      ...cart.cost,
      subtotalAmount: { amount: subtotal.toFixed(2), currencyCode: currency },
      totalAmount:    { amount: subtotal.toFixed(2), currencyCode: currency },
    },
  };
}

// ─────────────────────────────────────────────────────────────────
// Context shape
// ─────────────────────────────────────────────────────────────────

export interface CartContextValue {
  cart:              Cart | null;
  isCartOpen:        boolean;
  /** True while addToCart server action is in-flight. */
  isAddingToCart:    boolean;
  /** Set of line IDs currently being mutated — for per-item spinners. */
  pendingLineIds:    ReadonlySet<string>;
  openCart:          () => void;
  closeCart:         () => void;
  addToCart:         (variantId: string, quantity?: number) => Promise<void>;
  updateCartItem:    (lineId: string, quantity: number)     => Promise<void>;
  removeCartItem:    (lineId: string)                       => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

// ─────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────

export interface CartProviderProps {
  children:     ReactNode;
  /** Cart fetched server-side in the root layout — eliminates loading flash. */
  initialCart:  Cart | null;
}

export function CartProvider({ children, initialCart }: CartProviderProps) {
  const [cart,           setCart]           = useState<Cart | null>(initialCart);
  const [isCartOpen,     setIsCartOpen]     = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [pendingLineIds, setPendingLineIds] = useState<Set<string>>(new Set());

  /** Mutable ref used to capture pre-mutation snapshot for rollback. */
  const snapshotRef = useRef<Cart | null>(null);

  const openCart  = useCallback(() => setIsCartOpen(true),  []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // ── addToCart ─────────────────────────────────────────────────
  const addToCart = useCallback(
    async (variantId: string, quantity = 1) => {
      setIsAddingToCart(true);
      setIsCartOpen(true); // Open drawer immediately for instant feedback

      const result = await actionAddToCart(variantId, quantity);

      setIsAddingToCart(false);

      if (result.success) {
        setCart(result.cart);
      } else {
        console.error("[Cart] addToCart:", result.error);
      }
    },
    []
  );

  // ── updateCartItem ────────────────────────────────────────────
  const updateCartItem = useCallback(
    async (lineId: string, quantity: number) => {
      // 1. Capture snapshot for rollback, apply optimistic update atomically
      setCart((prev) => {
        snapshotRef.current = prev;
        return prev ? applyOptimisticQtyUpdate(prev, lineId, quantity) : prev;
      });
      setPendingLineIds((prev) => new Set([...prev, lineId]));

      // 2. Fire mutation
      const result = await actionUpdateCartItem(lineId, quantity);

      // 3. Settle
      setPendingLineIds((prev) => {
        const next = new Set(prev);
        next.delete(lineId);
        return next;
      });

      if (result.success) {
        setCart(result.cart); // Replace optimistic with authoritative
      } else {
        setCart(snapshotRef.current); // Rollback
        console.error("[Cart] updateCartItem:", result.error);
      }
    },
    []
  );

  // ── removeCartItem ────────────────────────────────────────────
  const removeCartItem = useCallback(
    async (lineId: string) => {
      // 1. Capture snapshot and apply optimistic remove
      setCart((prev) => {
        snapshotRef.current = prev;
        return prev ? applyOptimisticRemove(prev, lineId) : prev;
      });
      setPendingLineIds((prev) => new Set([...prev, lineId]));

      // 2. Fire mutation
      const result = await actionRemoveCartItem(lineId);

      // 3. Settle
      setPendingLineIds((prev) => {
        const next = new Set(prev);
        next.delete(lineId);
        return next;
      });

      if (result.success) {
        setCart(result.cart); // Replace optimistic with authoritative
      } else {
        setCart(snapshotRef.current); // Rollback
        console.error("[Cart] removeCartItem:", result.error);
      }
    },
    []
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        isAddingToCart,
        pendingLineIds,
        openCart,
        closeCart,
        addToCart,
        updateCartItem,
        removeCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
