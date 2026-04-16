/**
 * app/(routes)/account/register/page.tsx
 *
 * Registration page — redirects new visitors to Shopify OAuth.
 *
 * Pure Server Component shell with NO runtime API access.
 * searchParams are read inside <RegisterContent> (a Client Component
 * wrapped in <Suspense>), satisfying the cacheComponents rule.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RegisterContent } from "./RegisterContent";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Wasleen Pergolas account to track orders, manage deliveries, and access exclusive UAE deals.",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-sand-100)] px-4 py-16">
      <div className="w-full max-w-md">
        <Suspense fallback={<RegisterCardSkeleton />}>
          <RegisterContent />
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

function RegisterCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-sand-100)] p-8 sm:p-10 animate-pulse">
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="h-6 w-24 bg-[var(--color-sand-100)] rounded" />
        <div className="h-3 w-20 bg-[var(--color-sand-100)] rounded" />
      </div>
      <div className="flex flex-col items-center gap-2 mb-8">
        <div className="h-7 w-48 bg-[var(--color-sand-100)] rounded" />
        <div className="h-4 w-64 bg-[var(--color-sand-100)] rounded" />
      </div>
      <div className="space-y-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 w-56 bg-[var(--color-sand-100)] rounded" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-12 w-full bg-[var(--color-sand-100)] rounded-xl" />
        <div className="h-12 w-full bg-[var(--color-sand-100)] rounded-xl" />
      </div>
    </div>
  );
}
