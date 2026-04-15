"use client";

/**
 * app/(routes)/account/login/LoginButtons.tsx
 *
 * Client Component — renders the Sign In / Register OAuth buttons.
 * Separated from the Server Component page so the interactive buttons
 * can call Server Actions without making the whole page a Client Component.
 */

import { useState } from "react";
import { useCustomerContext } from "@/contexts/CustomerContext";

interface LoginButtonsProps {
  redirectPath: string;
  /** Controls copy: 'login' shows "Sign in", 'register' shows "Create account" */
  mode: "login" | "register";
}

export function LoginButtons({ redirectPath, mode }: LoginButtonsProps) {
  const { login, register, loading } = useCustomerContext();
  const [busy, setBusy] = useState(false);
  const isDisabled = busy || loading;

  const handleShopify = async () => {
    setBusy(true);
    if (mode === "login") {
      await login(redirectPath);
    } else {
      await register(redirectPath);
    }
    // busy stays true as browser navigates away
  };

  const handleGoogle = async () => {
    setBusy(true);
    // Google Sign-In uses the same Shopify OAuth endpoint.
    // Shopify surfaces Google as an option on its hosted login screen.
    // We initiate login and Shopify handles the Google IdP selection.
    if (mode === "login") {
      await login(redirectPath);
    } else {
      await register(redirectPath);
    }
  };

  return (
    <div className="space-y-3">
      {/* ── Primary: Shopify (email / SSO) ─────────────────────── */}
      <button
        type="button"
        onClick={handleShopify}
        disabled={isDisabled}
        aria-busy={isDisabled}
        className="
          w-full flex items-center justify-center gap-3
          px-5 py-3 rounded-xl
          bg-[var(--color-primary-900)] text-white
          text-sm font-medium
          transition-all duration-200
          hover:bg-[var(--color-primary-900)]/90
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold-500)] focus-visible:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {isDisabled ? (
          <LoadingSpinner />
        ) : (
          <ShopifyIcon />
        )}
        <span>
          {mode === "login" ? "Sign in with Shopify" : "Create account with Shopify"}
        </span>
      </button>

      {/* ── Secondary: Google ───────────────────────────────────── */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={isDisabled}
        aria-busy={isDisabled}
        className="
          w-full flex items-center justify-center gap-3
          px-5 py-3 rounded-xl
          bg-white text-[var(--color-primary-900)]
          border border-[var(--color-primary-900)]/20
          text-sm font-medium
          transition-all duration-200
          hover:bg-[var(--color-sand-100)]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold-500)] focus-visible:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
          shadow-sm
        "
      >
        {isDisabled ? (
          <LoadingSpinner dark />
        ) : (
          <GoogleIcon />
        )}
        <span>
          {mode === "login" ? "Sign in with Google" : "Create account with Google"}
        </span>
      </button>

      {/* Fine print */}
      <p className="text-center text-xs text-[var(--color-primary-900)]/40 pt-1">
        Secure checkout powered by Shopify
      </p>
    </div>
  );
}

// ── Icon components ───────────────────────────────────────────────

function LoadingSpinner({ dark = false }: { dark?: boolean }) {
  return (
    <svg
      className={`w-4 h-4 animate-spin ${dark ? "text-[var(--color-primary-900)]" : "text-white"}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ShopifyIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      viewBox="0 0 109 124"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M74.7 14.8s-.3-1.7-1.4-2.4c-1.1-.7-2.6-.2-2.6-.2s-1.2-3.6-4.8-5.3c-3.6-1.7-7.4-.2-9.3 2.8-1.6 2.5-1.8 6.1-1.8 6.1L74.7 14.8z"
        fill="white"
      />
      <path
        d="M95.8 20.9c-.1-1-.9-1.5-1.5-1.5s-12-.9-12-.9-7.9-7.8-8.7-8.5c-.8-.7-2.3-.5-2.9-.3l-4 1.2C65.1 8 62.4 4.8 58 3.6 50.8 1.6 44 5.7 41.2 11.7c-.2.4-.4.9-.6 1.3l-10.1 3.1c-3 .9-3.1 1-3.5 3.8C26.7 22 15 113.3 15 113.3l66 12.3 35.9-7.7S95.9 21.9 95.8 20.9zM64.7 17l-8.8 2.7c-.1-3.4 0-8.1 2.4-11 2.9 1.2 5.4 4.7 6.4 8.3zm-12 3.7c-2.1.6-4.4 1.3-6.7 2 1.9-6.3 5.4-9.4 8.5-10.5-.1 2.8-.7 6.2-1.8 8.5zm-5.6-1.6c3.5-1.6 7.1-2.5 7.1-2.5S52.5 12.2 50.6 9c-.7.3-1.4.7-2.1 1.2-1.5 1.2-2.9 3.2-3.9 5.7l2.5-.8z"
        fill="white"
        opacity="0.8"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
