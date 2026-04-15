/**
 * app/(routes)/account/register/page.tsx
 *
 * Registration page — redirects new visitors to Shopify OAuth.
 *
 * Uses the same OAuth flow as the login page but passes `prompt=create`
 * so Shopify shows the account creation screen instead of the sign-in form.
 * Google Sign-In is available on both pages via Shopify's hosted UI.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { LoginButtons } from "../login/LoginButtons";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Wasleen Pergolas account to track orders, manage deliveries, and access exclusive UAE deals.",
  robots: { index: false, follow: false },
};

interface RegisterPageProps {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { redirect: redirectPath = "/account" } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-sand-100)] px-4 py-16">
      <div className="w-full max-w-md">
        {/* ── Card ─────────────────────────────────────────────────── */}
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
              Create your account
            </h1>
            <p className="mt-2 text-sm text-[var(--color-primary-900)]/60">
              Join Wasleen Pergolas to track orders, save addresses, and get exclusive UAE deals.
            </p>
          </div>

          {/* Benefits list */}
          <ul className="mb-6 space-y-2">
            {[
              "Track your pergola orders in real time",
              "Save UAE delivery addresses",
              "Exclusive member pricing",
              "5-year warranty claim support",
            ].map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm text-[var(--color-primary-900)]/70"
              >
                <span className="text-[var(--color-emerald-600)] font-bold mt-0.5 shrink-0" aria-hidden="true">
                  ✓
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          {/* Auth buttons — register mode */}
          <LoginButtons redirectPath={redirectPath} mode="register" />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[var(--color-sand-100)]" />
            </div>
            <div className="relative flex justify-center text-xs text-[var(--color-primary-900)]/40">
              <span className="bg-white px-3">ALREADY HAVE AN ACCOUNT?</span>
            </div>
          </div>

          {/* Sign-in CTA */}
          <p className="text-center text-sm text-[var(--color-primary-900)]/60">
            <Link
              href={`/account/login${redirectPath !== "/account" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`}
              className="font-medium text-[var(--color-gold-500)] hover:underline"
            >
              Sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Back to shop */}
        <p className="mt-6 text-center text-xs text-[var(--color-primary-900)]/40">
          <Link href="/" className="hover:text-[var(--color-primary-900)] transition-colors">
            ← Back to shop
          </Link>
        </p>
      </div>
    </main>
  );
}
