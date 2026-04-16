"use server";

/**
 * lib/shopify/customer-operations.ts
 *
 * Server Actions for Shopify Customer Account API OAuth 2.0 + PKCE.
 *
 * All functions are Server Actions (callable from Client Components via RPC).
 * Cookie handling uses the async Next.js `cookies()` API.
 * Crypto uses globalThis.crypto — available in Node.js 18+ (required by Next.js 16).
 *
 * OAuth flow:
 *  1. Client calls `actionInitiateOAuth(mode, redirectPath)` → receives auth URL
 *  2. Client navigates to auth URL (Shopify login/register screen)
 *  3. Shopify redirects to /account/oauth/callback?code=xxx&state=xxx
 *  4. Callback page calls `actionExchangeCode(code, state)` → sets httpOnly cookies
 *  5. Customer is now authenticated; `getInitialCustomer()` returns their profile
 */

import "server-only";

import { cookies } from "next/headers";
import type { CustomerProfile, OAuthTokenResponse, CustomerJwtClaims } from "./customer-types";

// ── Environment ───────────────────────────────────────────────────

const CLIENT_ID   = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_CLIENT_ID!;
const AUTH_URL    = process.env.SHOPIFY_AUTH_ENDPOINT!;
const TOKEN_URL   = process.env.SHOPIFY_TOKEN_ENDPOINT!;
const LOGOUT_URL  = process.env.SHOPIFY_LOGOUT_ENDPOINT!;
const SITE_URL    = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com").replace(
  /\/$/,
  ""
);

/**
 * Shopify OAuth redirect_uri — must match exactly what is registered in
 * Shopify Customer Account settings (Headless channel → Application URL).
 */
const REDIRECT_URI = `${SITE_URL}/account/oauth/callback`;

/**
 * Scopes for the Customer Account API OAuth flow.
 * - openid: required for id_token (provides sub, given_name, family_name)
 * - email:  provides email claim in the id_token
 * - profile: provides name claims (given_name, family_name)
 *
 * Note: https://api.customers.com/auth/customer.graphql is NOT included —
 * it requires separate app configuration in Shopify and is not needed here
 * because customer profile data is decoded entirely from the id_token JWT.
 */
const OAUTH_SCOPES = "openid email profile";

// ── Cookie names + lifetimes ──────────────────────────────────────

const COOKIE = {
  /** PKCE code_verifier — short-lived, single-use */
  VERIFIER:  "wasleen_pkce_verifier",
  /** CSRF state — short-lived, single-use */
  STATE:     "wasleen_oauth_state",
  /** Desired post-auth redirect path, carried through the OAuth round-trip */
  REDIRECT:  "wasleen_auth_redirect",
  /** Customer Account API access token */
  TOKEN:     "wasleen_customer_token",
  /** id_token JWT — needed for Shopify logout URL + profile decoding */
  ID_TOKEN:  "wasleen_customer_id_token",
  /** Refresh token — long-lived */
  REFRESH:   "wasleen_customer_refresh",
} as const;

const TTL = {
  PKCE:         60 * 10,            // 10 minutes — code must be exchanged quickly
  ACCESS:       60 * 60 * 24 * 30, // 30 days (overridden by expires_in from token)
  REFRESH:      60 * 60 * 24 * 90, // 90 days
} as const;

// ── PKCE helpers ──────────────────────────────────────────────────

/** Encode Uint8Array as URL-safe base64 (no padding). */
function base64UrlEncode(bytes: Uint8Array): string {
  const chars = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(chars).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/** Generate a 32-byte (256-bit) PKCE code_verifier. */
function generateCodeVerifier(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** Derive code_challenge from code_verifier using SHA-256 (S256 method). */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const data   = new TextEncoder().encode(verifier);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

/** Generate a 16-byte CSRF state token. */
function generateState(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

// ── JWT helpers ───────────────────────────────────────────────────

/**
 * Decode the payload of a JWT without verifying the signature.
 * Safe for reading Shopify-issued id_tokens where we trust the issuer
 * and the token was just obtained directly from Shopify's token endpoint.
 */
function decodeJwtPayload(token: string): Partial<CustomerJwtClaims> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return {};
    // Convert base64url → base64 → decode
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Partial<CustomerJwtClaims>;
  } catch {
    return {};
  }
}

/** Build a CustomerProfile from decoded JWT claims. */
function buildProfile(claims: Partial<CustomerJwtClaims>): CustomerProfile {
  const firstName  = claims.given_name  ?? null;
  const lastName   = claims.family_name ?? null;
  const email      = claims.email       ?? null;
  const displayName =
    firstName && lastName
      ? `${firstName} ${lastName}`.trim()
      : firstName ?? email ?? "Account";

  return {
    id:          claims.sub ?? "",
    email,
    firstName,
    lastName,
    displayName,
    phone: claims.phone_number ?? null,
  };
}

// ── Cookie helpers ────────────────────────────────────────────────

function cookieOpts(maxAge: number, isProd: boolean) {
  return {
    httpOnly:  true,
    secure:    isProd,
    sameSite:  "lax" as const,
    path:      "/",
    maxAge,
  };
}

// ── Server Actions ─────────────────────────────────────────────────

/**
 * Begin OAuth flow.
 *
 * Generates PKCE (code_verifier + code_challenge) and a CSRF state token,
 * stores them as short-lived httpOnly cookies, and returns the Shopify
 * authorization URL for the client to navigate to.
 *
 * @param mode         'login' or 'register' — controls Shopify's prompt hint
 * @param redirectPath Path to return to after successful auth (default: '/account')
 * @returns            Full Shopify authorization URL
 */
export async function actionInitiateOAuth(
  mode:         "login" | "register" = "login",
  redirectPath: string               = "/account"
): Promise<string> {
  const verifier   = generateCodeVerifier();
  const challenge  = await generateCodeChallenge(verifier);
  const state      = generateState();
  const isProd     = process.env.NODE_ENV === "production";
  const store      = await cookies();

  // Store PKCE verifier, CSRF state, and the desired post-auth redirect
  store.set(COOKIE.VERIFIER,  verifier,      cookieOpts(TTL.PKCE, isProd));
  store.set(COOKIE.STATE,     state,         cookieOpts(TTL.PKCE, isProd));
  store.set(COOKIE.REDIRECT,  redirectPath,  cookieOpts(TTL.PKCE, isProd));

  const params = new URLSearchParams({
    client_id:             CLIENT_ID,
    response_type:         "code",
    redirect_uri:          REDIRECT_URI,
    scope:                 OAUTH_SCOPES,
    state,
    code_challenge:        challenge,
    code_challenge_method: "S256",
  });

  // Shopify recognises `prompt=create` to show the sign-up screen directly
  if (mode === "register") {
    params.set("prompt", "create");
  }

  return `${AUTH_URL}?${params.toString()}`;
}

// ── Result types ──────────────────────────────────────────────────

export type ExchangeCodeResult =
  | { success: true;  redirectPath: string }
  | { success: false; error: string        };

/**
 * Exchange an OAuth authorization code for session tokens.
 *
 * Validates the CSRF state against the stored cookie, exchanges the code
 * using the PKCE verifier, and persists the resulting tokens as httpOnly
 * cookies.  Returns a discriminated-union result so the caller can handle
 * errors without a try/catch.
 *
 * Called from the /account/oauth/callback Client Component via RPC.
 *
 * @param code   `code` query param received from Shopify redirect
 * @param state  `state` query param — must match the stored CSRF state
 */
export async function actionExchangeCode(
  code:  string,
  state: string
): Promise<ExchangeCodeResult> {
  const store      = await cookies();
  const isProd     = process.env.NODE_ENV === "production";

  const storedState   = store.get(COOKIE.STATE)?.value;
  const codeVerifier  = store.get(COOKIE.VERIFIER)?.value;
  const redirectPath  = store.get(COOKIE.REDIRECT)?.value ?? "/account";

  // ── CSRF validation ─────────────────────────────────────────────
  if (!storedState || !codeVerifier || state !== storedState) {
    return { success: false, error: "invalid_state" };
  }

  // Clean up single-use PKCE + state cookies immediately
  for (const name of [COOKIE.STATE, COOKIE.VERIFIER, COOKIE.REDIRECT]) {
    store.delete(name);
  }

  // ── Token exchange ──────────────────────────────────────────────
  let tokenRes: Response;
  try {
    tokenRes = await fetch(TOKEN_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        grant_type:    "authorization_code",
        client_id:     CLIENT_ID,
        redirect_uri:  REDIRECT_URI,
        code,
        code_verifier: codeVerifier,
      }).toString(),
      // Always fresh — this is a one-time exchange
      cache: "no-store",
    });
  } catch (networkErr) {
    return {
      success: false,
      error:   `network_error: ${networkErr instanceof Error ? networkErr.message : String(networkErr)}`,
    };
  }

  if (!tokenRes.ok) {
    const body = await tokenRes.text().catch(() => "");
    return { success: false, error: `token_exchange_${tokenRes.status}: ${body}` };
  }

  let tokens: OAuthTokenResponse;
  try {
    tokens = (await tokenRes.json()) as OAuthTokenResponse;
  } catch {
    return { success: false, error: "token_parse_failed" };
  }

  if (!tokens.access_token) {
    return { success: false, error: "no_access_token" };
  }

  // ── Persist session cookies ─────────────────────────────────────
  store.set(
    COOKIE.TOKEN,
    tokens.access_token,
    cookieOpts(tokens.expires_in ?? TTL.ACCESS, isProd)
  );

  if (tokens.id_token) {
    store.set(COOKIE.ID_TOKEN, tokens.id_token, cookieOpts(TTL.ACCESS, isProd));
  }

  if (tokens.refresh_token) {
    store.set(COOKIE.REFRESH, tokens.refresh_token, cookieOpts(TTL.REFRESH, isProd));
  }

  return { success: true, redirectPath };
}

// ── Logout ────────────────────────────────────────────────────────

export type LogoutResult = { logoutUrl: string };

/**
 * Clear the customer session and return the Shopify logout URL.
 *
 * The caller must navigate to the returned URL so Shopify also ends the
 * SSO session on its side.  If we only clear the cookie, the Shopify
 * session would persist and re-login would be instant without prompting.
 *
 * @returns  Full Shopify logout URL with post_logout_redirect_uri
 */
export async function actionLogout(): Promise<LogoutResult> {
  const store   = await cookies();
  const idToken = store.get(COOKIE.ID_TOKEN)?.value ?? null;

  // Wipe session cookies (PKCE cookies are short-lived and expire on their own)
  for (const name of [COOKIE.TOKEN, COOKIE.ID_TOKEN, COOKIE.REFRESH] as const) {
    store.delete(name);
  }

  const params = new URLSearchParams({
    post_logout_redirect_uri: SITE_URL,
  });

  // id_token_hint allows Shopify to identify which session to terminate
  if (idToken) {
    params.set("id_token_hint", idToken);
  }

  return { logoutUrl: `${LOGOUT_URL}?${params.toString()}` };
}

// ── Session read (Server Component hydration) ─────────────────────

/**
 * Read the stored id_token cookie and decode the customer profile from it.
 *
 * Called in the root layout Server Component so CustomerProvider hydrates
 * with real data on the first render — no loading flash.
 *
 * Returns null if the customer is not logged in or the token has expired.
 * Never throws — errors are swallowed to avoid breaking the layout render.
 */
export async function getInitialCustomer(): Promise<CustomerProfile | null> {
  try {
    const store   = await cookies();
    const idToken = store.get(COOKIE.ID_TOKEN)?.value;

    if (!idToken) return null;

    const claims = decodeJwtPayload(idToken);

    // Reject expired tokens (clock skew leeway: 30 s)
    if (claims.exp && Math.floor(Date.now() / 1000) > claims.exp + 30) {
      return null;
    }

    // A sub claim is mandatory — without it we can't identify the customer
    if (!claims.sub) return null;

    return buildProfile(claims);
  } catch {
    return null;
  }
}
