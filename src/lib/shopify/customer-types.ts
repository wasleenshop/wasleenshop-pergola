/**
 * lib/shopify/customer-types.ts
 *
 * Type definitions for the Shopify Customer Account API OAuth 2.0 + PKCE flow.
 *
 * These are separate from the Storefront API customer types in types.ts.
 * The Customer Account API uses a different auth model: OAuth JWT tokens
 * instead of the legacy customerAccessToken (string).
 */

// ── OAuth token response from token endpoint ─────────────────────

export interface OAuthTokenResponse {
  access_token: string;
  token_type: "Bearer";
  /** Token lifetime in seconds (typically 86400 = 24 h) */
  expires_in: number;
  /** Long-lived refresh token (Shopify may or may not return this) */
  refresh_token?: string;
  /** Signed JWT containing basic customer claims — used for profile + logout */
  id_token?: string;
}

// ── JWT payload claims decoded from id_token ─────────────────────

export interface CustomerJwtClaims {
  /** Customer GID: "gid://shopify/Customer/12345678" */
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  phone_number?: string;
  /** Issued-at timestamp (unix seconds) */
  iat: number;
  /** Expiry timestamp (unix seconds) */
  exp: number;
  iss?: string;
  aud?: string | string[];
}

// ── Lightweight profile stored in context ────────────────────────

/**
 * Decoded from id_token JWT — no extra API call required.
 * Used by CustomerContext and rendered in Header, Account pages.
 */
export interface CustomerProfile {
  /** Shopify Customer GID (from JWT sub claim) */
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  /** Human-readable label: "Jane Doe", email, or "Account" */
  displayName: string;
  phone: string | null;
}

// ── Context value shape ───────────────────────────────────────────

export interface CustomerContextValue {
  /** Authenticated customer profile, or null when logged out */
  customer: CustomerProfile | null;
  /** True while an auth action (login/logout/exchange) is in-flight */
  loading: boolean;
  /**
   * Redirect to Shopify OAuth — login mode.
   * @param redirectPath  Where to land after successful auth (default: /account)
   */
  login: (redirectPath?: string) => Promise<void>;
  /**
   * Redirect to Shopify OAuth — registration mode.
   * @param redirectPath  Where to land after successful auth (default: /account)
   */
  register: (redirectPath?: string) => Promise<void>;
  /** Clear local session and redirect to Shopify logout endpoint */
  logout: () => Promise<void>;
}
