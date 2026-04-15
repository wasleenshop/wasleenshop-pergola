/**
 * proxy.ts  ← Next.js 16 renames `middleware.ts` to `proxy.ts`
 *
 * Route protection for the Wasleen Pergolas customer account area.
 *
 * Logic:
 *  1. Any /account/* route that is NOT in the PUBLIC_PATHS list requires
 *     an active customer session (wasleen_customer_token cookie present).
 *  2. Unauthenticated visitors are redirected to /account/login with a
 *     `redirect` param so they land back on the original page after sign-in.
 *  3. Already-authenticated visitors attempting to access /account/login
 *     or /account/register are redirected to /account (avoid stale sessions
 *     re-triggering OAuth unnecessarily).
 *
 * This is an OPTIMISTIC check — it only reads the cookie existence, not
 * the token validity.  Full token verification happens server-side when
 * the protected page fetches customer data.
 *
 * NOTE: Next.js 16 renamed the file convention from `middleware.ts` to
 * `proxy.ts` and the exported function from `middleware` to `proxy`.
 * The `middleware` export is deprecated.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route lists ───────────────────────────────────────────────────

/**
 * /account/* paths that do NOT require authentication.
 * Must be exact prefix matches (path.startsWith).
 */
const PUBLIC_ACCOUNT_PATHS = [
  "/account/login",
  "/account/register",
  "/account/oauth",   // covers /account/oauth/callback
] as const;

/**
 * /account/* paths that send already-authenticated users to /account
 * instead of rendering the sign-in/sign-up UI again.
 */
const AUTH_REDIRECT_PATHS = [
  "/account/login",
  "/account/register",
] as const;

/** Cookie written by actionExchangeCode — presence = authenticated */
const SESSION_COOKIE = "wasleen_customer_token";

// ── Proxy function ────────────────────────────────────────────────

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Only intercept /account/* routes
  if (!pathname.startsWith("/account")) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // ── Already authenticated + trying to access login/register ───
  const isAuthRedirectPath = AUTH_REDIRECT_PATHS.some((p) =>
    pathname.startsWith(p)
  );

  if (hasSession && isAuthRedirectPath) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // ── Not authenticated + accessing a protected route ────────────
  const isPublicPath = PUBLIC_ACCOUNT_PATHS.some((p) =>
    pathname.startsWith(p)
  );

  if (!hasSession && !isPublicPath) {
    const loginUrl = new URL("/account/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// ── Matcher ───────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Run on all /account/* paths.
     * Exclude static assets, API routes, and Next.js internals.
     */
    "/account/:path*",
  ],
};
