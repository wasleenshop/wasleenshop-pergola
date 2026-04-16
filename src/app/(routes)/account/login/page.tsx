/**
 * app/(routes)/account/login/page.tsx
 *
 * Login page — redirects visitors to Shopify OAuth.
 *
 * This page is intentionally minimal: there is no email/password form.
 * All authentication happens via the Shopify Customer Account API (OAuth 2.0
 * + PKCE), which also handles Google Sign-In if enabled in Shopify settings.
 *
 * The `?redirect` query param preserves the page the user was trying to reach
 * before being bounced here by the proxy (e.g. /account/orders).
 *
 * cacheComponents: searchParams is a runtime API — the dynamic part is wrapped
 * in <Suspense> so the static shell can prerender.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginButtons } from "./LoginButtons";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Wasleen Pergolas account to track orders, manage addresses, and access exclusive offers.",
  robots: { index: false, follow: false },
};

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
}

// ── Page shell (sync — prerenders) ────────────────────────────────

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-sand-100)] px-4 py-16">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginCardSkeleton />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>

        {/* Back to shop — static, outside Suspense */}
        <p className="mt-6 text-center text-xs text-[var(--color-primary-900)]/40">
          <Link href="/" className="hover:text-[var(--color-primary-900)] transition-colors">
            ← Back to shop
          </Link>
        </p>
      </div>
    </main>
  );
}

// ── Dynamic content (async — awaits runtime searchParams) ─────────

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect: redirectPath = "/account", error } = await searchParams;
  const errorMessage = resolveErrorMessage(error);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-sand-100)] p-8 sm:p-10">

      {/* Logo / brand mark */}
      <div className="text-center mb-8">
        <Link href="/" aria-label="Wasleen Pergolas — home">
          <span
            className="font-serif text-2xl font-bold text-[var(--color-primary-900)] tracking-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Wasleen
          </span>
        </Link>
        <p
          className="mt-1 text-xs uppercase tracking-widest text-[var(--color-primary-900)]/50"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Pergolas UAE
        </p>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1
          className="text-2xl font-semibold text-[var(--color-primary-900)]"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[var(--color-primary-900)]/60">
          Sign in to track your orders, save addresses, and more.
        </p>
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm"
        >
          {errorMessage}
        </div>
      )}

      {/* Auth buttons (Client Component — calls Server Actions) */}
      <LoginButtons redirectPath={redirectPath} mode="login" />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-[var(--color-sand-100)]" />
        </div>
        <div className="relative flex justify-center text-xs text-[var(--color-primary-900)]/40">
          <span className="bg-white px-3">OR</span>
        </div>
      </div>

      {/* Register CTA */}
      <p className="text-center text-sm text-[var(--color-primary-900)]/60">
        Don&apos;t have an account?{" "}
        <Link
          href={`/account/register${redirectPath !== "/account" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
          className="font-medium text-[var(--color-gold-500)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

// ── Skeleton fallback ─────────────────────────────────────────────

function LoginCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-sand-100)] p-8 sm:p-10 animate-pulse">
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="h-6 w-24 bg-[var(--color-sand-100)] rounded" />
        <div className="h-3 w-20 bg-[var(--color-sand-100)] rounded" />
      </div>
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="h-7 w-40 bg-[var(--color-sand-100)] rounded" />
        <div className="h-4 w-64 bg-[var(--color-sand-100)] rounded" />
      </div>
      <div className="space-y-3">
        <div className="h-12 w-full bg-[var(--color-sand-100)] rounded-xl" />
        <div className="h-12 w-full bg-[var(--color-sand-100)] rounded-xl" />
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────

function resolveErrorMessage(error: string | undefined): string | null {
  if (!error) return null;
  const map: Record<string, string> = {
    invalid_state:       "Authentication failed: the request was tampered with. Please try again.",
    token_exchange_400:  "Authentication failed: invalid request. Please try again.",
    token_exchange_401:  "Authentication failed: credentials rejected by Shopify.",
    token_exchange_500:  "Shopify is temporarily unavailable. Please try again in a moment.",
    network_error:       "Could not reach Shopify. Please check your connection and try again.",
    no_access_token:     "Authentication failed: no token received. Please try again.",
    missing_params:      "The authentication link is incomplete. Please sign in again.",
    auth_cancelled:      "You cancelled the sign-in. You can try again whenever you're ready.",
  };
  return (
    map[error] ??
    Object.entries(map).find(([k]) => error.startsWith(k))?.[1] ??
    "Sign-in failed. Please try again."
  );
}
