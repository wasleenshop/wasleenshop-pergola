/**
 * app/(routes)/account/oauth/callback/page.tsx
 *
 * OAuth callback handler — the redirect_uri registered with Shopify.
 *
 * Shopify redirects here after the customer authenticates:
 *   /account/oauth/callback?code=xxx&state=yyy
 *   /account/oauth/callback?error=access_denied  (user cancelled)
 *
 * Because setting cookies is not allowed during Server Component rendering,
 * this page is a Client Component that calls the `actionExchangeCode` Server
 * Action inside a useEffect.  The Server Action sets the httpOnly session
 * cookies and returns the destination path; this component then navigates.
 *
 * The Suspense boundary is required because useSearchParams() opts the
 * component into client-side rendering and must be wrapped.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { OAuthCallbackHandler } from "./OAuthCallbackHandler";

export const metadata: Metadata = {
  title: "Signing in…",
  robots: { index: false, follow: false },
};

export default function OAuthCallbackPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[var(--color-sand-100)]"
      aria-label="Authentication in progress"
    >
      <Suspense fallback={<CallbackSkeleton />}>
        <OAuthCallbackHandler />
      </Suspense>
    </main>
  );
}

/** Shown while the Suspense boundary resolves (tiny flash) */
function CallbackSkeleton() {
  return (
    <div className="text-center space-y-4 px-4">
      <div
        className="w-10 h-10 border-2 border-[var(--color-gold-500)] border-t-transparent rounded-full animate-spin mx-auto"
        aria-hidden="true"
      />
      <p className="text-sm text-[var(--color-primary-900)]/60">
        Completing sign-in…
      </p>
    </div>
  );
}
