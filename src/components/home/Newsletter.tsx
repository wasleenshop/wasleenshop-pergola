"use client";

/**
 * Newsletter.tsx
 *
 * Homepage section 11 — "Join 5,000+ UAE Homeowners".
 * Client Component: email form that POSTs to /api/newsletter (Klaviyo).
 *
 * States: idle → loading → success / error.
 * Accessibility: live region announces success/error to screen readers.
 * Performance: form submits to our own API route — Klaviyo private key
 *              is never exposed to the client bundle.
 */

import { useState, useRef, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

type FormState = "idle" | "loading" | "success" | "error";

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function Newsletter() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = inputRef.current?.value?.trim();

    if (!email) return;

    setFormState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        setFormState("error");
        return;
      }

      setFormState("success");
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <section
      className="section-py bg-primary"
      aria-labelledby="newsletter-heading"
    >
      <div className="container-site">
        <div className="max-w-2xl mx-auto text-center">
          {/* Decorative accent */}
          <div className="accent-line-center mb-6" aria-hidden="true" />

          <span className="type-overline-gold block mb-4">Stay in the Loop</span>

          <h2 className="type-h1 text-white mb-4" id="newsletter-heading">
            Join 5,000+ UAE Homeowners
          </h2>

          <p className="type-body-lg text-neutral-300 mb-10">
            Get exclusive offers, seasonal discounts, and design inspiration
            delivered to your inbox. No spam — unsubscribe anytime.
          </p>

          {/* Success state */}
          {formState === "success" ? (
            <div
              className="flex flex-col items-center gap-4"
              role="status"
              aria-live="polite"
            >
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="type-h4 text-white">You&apos;re subscribed!</p>
              <p className="type-body text-neutral-400">
                Welcome to the Wasleen community. Check your inbox for a welcome
                gift.
              </p>
            </div>
          ) : (
            /* Form */
            <form
              onSubmit={handleSubmit}
              noValidate
              aria-label="Newsletter signup"
            >
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  ref={inputRef}
                  id="newsletter-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  disabled={formState === "loading"}
                  className={cn(
                    "input flex-1 bg-white/10 border-white/20 text-white placeholder:text-neutral-400",
                    "focus:border-gold focus:bg-white/15",
                    "disabled:opacity-50"
                  )}
                  aria-describedby={
                    formState === "error" ? "newsletter-error" : undefined
                  }
                />
                <Button
                  type="submit"
                  size="lg"
                  isLoading={formState === "loading"}
                  className="shrink-0"
                >
                  Subscribe
                </Button>
              </div>

              {/* Error message */}
              {formState === "error" && errorMessage && (
                <p
                  id="newsletter-error"
                  className="mt-3 type-body-sm text-red-400"
                  role="alert"
                  aria-live="assertive"
                >
                  {errorMessage}
                </p>
              )}

              <p className="mt-4 type-body-sm text-neutral-500">
                By subscribing you agree to our{" "}
                <a
                  href="/policies/privacy-policy"
                  className="underline hover:text-neutral-300 transition-colors"
                >
                  Privacy Policy
                </a>
                . Unsubscribe at any time.
              </p>
            </form>
          )}

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            {[
              { value: "5,000+", label: "Subscribers" },
              { value: "Weekly", label: "Deals" },
              { value: "No spam", label: "Ever" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="type-h5 text-gold">{value}</p>
                <p className="type-label text-neutral-500 uppercase tracking-widest">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
