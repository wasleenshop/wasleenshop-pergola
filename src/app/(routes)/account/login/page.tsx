/**
 * app/(routes)/account/login/page.tsx
 *
 * Login page — redirects visitors to Shopify OAuth.
 *
 * This is a pure Server Component shell with NO runtime API access.
 * searchParams are read inside <LoginContent> (a Client Component wrapped
 * in <Suspense>), which satisfies the cacheComponents rule that uncached
 * data must never be accessed outside a Suspense boundary.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginContent } from "./LoginContent";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Wasleen Pergolas account to track orders, manage addresses, and access exclusive offers.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-sand-100)] px-4 py-16">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginCardSkeleton />}>
          <LoginContent />
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
