"use client";

/**
 * contexts/CustomerContext.tsx
 *
 * Global customer authentication state.
 *
 * Architecture mirrors CartContext:
 *  - `CustomerProvider` lives in the root layout and receives `initialCustomer`
 *    fetched server-side, so there is zero loading flash on first render.
 *  - `login()` / `register()` call `actionInitiateOAuth` (Server Action) to
 *    generate PKCE + CSRF cookies, then redirect the browser to Shopify.
 *  - `logout()` calls `actionLogout` (Server Action) to wipe the session
 *    cookies, then redirects to the Shopify logout URL so the SSO session
 *    also ends on Shopify's side.
 *  - After a successful OAuth exchange the Callback page calls
 *    `setCustomer()` (exposed via context) so the profile updates in-memory
 *    without requiring a full page reload.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import {
  actionInitiateOAuth,
  actionLogout,
} from "@/lib/shopify/customer-operations";

import type { CustomerContextValue, CustomerProfile } from "@/lib/shopify/customer-types";

// ── Context ───────────────────────────────────────────────────────

const CustomerContext = createContext<CustomerContextValue | null>(null);

/**
 * Access the customer context.
 * Must be used inside a <CustomerProvider>.
 */
export function useCustomerContext(): CustomerContextValue {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error("useCustomerContext must be used inside <CustomerProvider>");
  }
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────

export interface CustomerProviderProps {
  children:        ReactNode;
  /**
   * Customer profile decoded server-side in the root layout.
   * Null when the visitor is not authenticated.
   */
  initialCustomer: CustomerProfile | null;
}

export function CustomerProvider({
  children,
  initialCustomer,
}: CustomerProviderProps) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(
    initialCustomer
  );
  const [loading, setLoading] = useState(false);

  // ── login ─────────────────────────────────────────────────────
  /**
   * Start the OAuth login flow.
   * Generates PKCE + state on the server and redirects to Shopify.
   */
  const login = useCallback(
    async (redirectPath: string = "/account") => {
      setLoading(true);
      try {
        const authUrl = await actionInitiateOAuth("login", redirectPath);
        // Hard navigation so the browser sends the new cookies set by the
        // Server Action in the same request (not a client-side route change)
        window.location.href = authUrl;
      } catch (err) {
        console.error("[Auth] login initiation failed:", err);
        setLoading(false);
      }
      // Note: loading stays true because the page is navigating away
    },
    []
  );

  // ── register ──────────────────────────────────────────────────
  /**
   * Start the OAuth registration flow.
   * Same as login but passes `prompt=create` to Shopify.
   */
  const register = useCallback(
    async (redirectPath: string = "/account") => {
      setLoading(true);
      try {
        const authUrl = await actionInitiateOAuth("register", redirectPath);
        window.location.href = authUrl;
      } catch (err) {
        console.error("[Auth] register initiation failed:", err);
        setLoading(false);
      }
    },
    []
  );

  // ── logout ────────────────────────────────────────────────────
  /**
   * Clear the session and redirect to Shopify logout endpoint.
   * Clears local state immediately for instant UI feedback.
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setCustomer(null); // Optimistic clear — instant header update

    try {
      const { logoutUrl } = await actionLogout();
      window.location.href = logoutUrl;
    } catch (err) {
      console.error("[Auth] logout failed:", err);
      setLoading(false);
    }
  }, []);

  return (
    <CustomerContext.Provider
      value={{ customer, loading, login, register, logout }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

// ── Re-export types for consumers ─────────────────────────────────
export type { CustomerProfile, CustomerContextValue };
