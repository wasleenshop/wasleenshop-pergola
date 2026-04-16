"use client";

/**
 * app/(routes)/account/login/LoginContent.tsx
 *
 * Client Component — reads searchParams at runtime via useSearchParams().
 * Must be wrapped in <Suspense> by the parent Server Component (page.tsx).
 * This satisfies the cacheComponents rule: runtime API access stays inside
 * a Suspense boundary, letting the page shell prerender statically.
 */

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LoginButtons } from "./LoginButtons";

export function LoginContent() {
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/account";
  const error = searchParams.get("error");
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

// ── Helpers ───────────────────────────────────────────────────────

function resolveErrorMessage(error: string | null): string | null {
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
