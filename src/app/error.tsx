"use client";

/**
 * app/error.tsx
 *
 * Route-level error boundary — catches any unhandled errors thrown
 * by Server or Client Components within the root layout segment.
 *
 * `reset` re-renders the segment, giving users a retry path without
 * a full page reload.
 */

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // In production, pipe this to your error monitoring service
    // (e.g., Sentry.captureException(error))
    if (process.env.NODE_ENV !== "production") {
      console.error("[Route Error]", error.message, error.digest ?? "");
    }
  }, [error]);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-24">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl text-primary mb-3">
          Something went wrong
        </h1>

        {/* Message */}
        <p className="text-neutral-500 text-base mb-2">
          We ran into an unexpected error. Our team has been notified and
          we&apos;re working on it.
        </p>

        {/* Digest for support reference (production only) */}
        {error.digest && (
          <p className="text-xs text-neutral-400 mb-8 font-mono">
            Reference: {error.digest}
          </p>
        )}
        {!error.digest && <div className="mb-8" />}

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
