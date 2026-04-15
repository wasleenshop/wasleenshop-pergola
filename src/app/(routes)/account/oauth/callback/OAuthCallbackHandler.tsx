"use client";

/**
 * app/(routes)/account/oauth/callback/OAuthCallbackHandler.tsx
 *
 * Client Component that reads the OAuth callback params from the URL and
 * calls the `actionExchangeCode` Server Action to complete the auth flow.
 *
 * Separated from the page so it can use useSearchParams() inside a Suspense
 * boundary (required by Next.js App Router).
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { actionExchangeCode } from "@/lib/shopify/customer-operations";

type Phase = "exchanging" | "redirecting" | "error";

export function OAuthCallbackHandler() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [phase, setPhase] = useState<Phase>("exchanging");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const code  = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // ── Shopify returned an error (e.g. user cancelled) ─────────
    if (error) {
      if (error === "access_denied") {
        router.replace("/account/login?error=auth_cancelled");
      } else {
        router.replace(
          `/account/login?error=${encodeURIComponent(error)}`
        );
      }
      return;
    }

    // ── Missing required params ──────────────────────────────────
    if (!code || !state) {
      router.replace("/account/login?error=missing_params");
      return;
    }

    // ── Exchange code for session tokens ─────────────────────────
    actionExchangeCode(code, state)
      .then((result) => {
        if (result.success) {
          setPhase("redirecting");
          // Replace so the callback URL is not in the browser history
          router.replace(result.redirectPath);
        } else {
          setPhase("error");
          setErrorMsg(result.error);
          router.replace(
            `/account/login?error=${encodeURIComponent(result.error)}`
          );
        }
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "unknown_error";
        setPhase("error");
        setErrorMsg(msg);
        router.replace(
          `/account/login?error=${encodeURIComponent(msg)}`
        );
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — runs once on mount; params are stable

  return (
    <div className="text-center space-y-4 px-4" role="status" aria-live="polite">
      {phase !== "error" ? (
        <>
          <div
            className="w-10 h-10 border-2 border-[var(--color-gold-500)] border-t-transparent rounded-full animate-spin mx-auto"
            aria-hidden="true"
          />
          <p className="text-sm text-[var(--color-primary-900)]/60">
            {phase === "exchanging" ? "Completing sign-in…" : "Redirecting…"}
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-red-600">
            Something went wrong. Redirecting to sign-in…
          </p>
          {/* errorMsg is logged server-side; only generic message shown to user */}
          {process.env.NODE_ENV !== "production" && errorMsg && (
            <pre className="text-xs text-left bg-red-50 p-3 rounded text-red-700 max-w-sm mx-auto overflow-auto">
              {errorMsg}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
