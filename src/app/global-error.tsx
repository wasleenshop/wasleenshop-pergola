"use client";

/**
 * app/global-error.tsx
 *
 * Global error boundary — catches unhandled errors at the root layout
 * level (e.g., layout.tsx itself crashing).
 *
 * IMPORTANT: Must render its own <html> + <body> because it replaces
 * the entire document when the root layout has thrown.
 */

import { useEffect } from "react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[Global Error]", error.message, error.digest ?? "");
    }
  }, [error]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Error — Wasleen Pergolas</title>
        <style>{`
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          body{
            font-family:system-ui,-apple-system,sans-serif;
            background:#F5F1EB;
            color:#1A1614;
            min-height:100vh;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:1.5rem;
          }
          .card{
            background:#fff;
            border-radius:1.5rem;
            padding:3rem 2rem;
            text-align:center;
            max-width:28rem;
            width:100%;
            box-shadow:0 4px 24px rgba(0,0,0,.08);
          }
          .icon{
            width:4rem;height:4rem;
            border-radius:50%;
            background:#FEF2F2;
            display:flex;align-items:center;justify-content:center;
            margin:0 auto 1.5rem;
          }
          h1{font-size:1.5rem;font-weight:700;margin-bottom:.75rem}
          p{font-size:.9rem;color:#71717A;line-height:1.6;margin-bottom:1.5rem}
          .digest{font-size:.7rem;font-family:monospace;color:#A1A1AA;margin-bottom:1.5rem}
          .btn{
            display:inline-flex;align-items:center;gap:.5rem;
            padding:.75rem 1.5rem;border-radius:9999px;
            font-size:.875rem;font-weight:600;cursor:pointer;
            border:none;background:#C9A962;color:#1A1614;
            transition:opacity .2s;
          }
          .btn:hover{opacity:.88}
          .btn:focus-visible{outline:2px solid #C9A962;outline-offset:2px}
        `}</style>
      </head>
      <body>
        <div className="card" style={{ background: "#fff", borderRadius: "1.5rem", padding: "3rem 2rem", textAlign: "center", maxWidth: "28rem", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
          {/* Alert icon */}
          <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#EF4444"
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

          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: ".75rem" }}>
            A critical error occurred
          </h1>

          <p style={{ fontSize: ".9rem", color: "#71717A", lineHeight: 1.6, marginBottom: "1.5rem" }}>
            Wasleen Pergolas encountered an unexpected problem. Our team has
            been notified. Please try reloading the page.
          </p>

          {error.digest && (
            <p style={{ fontSize: ".7rem", fontFamily: "monospace", color: "#A1A1AA", marginBottom: "1.5rem" }}>
              Reference: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{ display: "inline-flex", alignItems: "center", gap: ".5rem", padding: ".75rem 1.5rem", borderRadius: "9999px", fontSize: ".875rem", fontWeight: 600, cursor: "pointer", border: "none", background: "#C9A962", color: "#1A1614", transition: "opacity .2s" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}
