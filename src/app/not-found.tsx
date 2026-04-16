"use client";

/**
 * app/not-found.tsx
 *
 * 404 — Page Not Found
 *
 * Client component so the search form can use router.push.
 * Popular categories use known site handles (static site structure,
 * not dynamic product data — acceptable per project law exceptions).
 */

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Popular category shortcuts ──────────────────────────────
// These are the site's primary navigation categories — static structure.

const CATEGORIES = [
  {
    title: "Aluminium Pergolas",
    handle: "aluminium-pergolas",
    description: "Durable UAE-grade frames",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    title: "Bioclimatic Pergolas",
    handle: "bioclimatic-pergolas",
    description: "Louvred roof — sun & rain control",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Awnings & Closures",
    handle: "awnings",
    description: "Motorised shade solutions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
        />
      </svg>
    ),
  },
  {
    title: "Umbrellas & Tents",
    handle: "umbrellas-tents",
    description: "Commercial & residential shade",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3c-4.97 0-9 4.03-9 9h18c0-4.97-4.03-9-9-9Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v18m0 0c0 0-2.5-1-2.5-4m2.5 4c0 0 2.5-1 2.5-4"
        />
      </svg>
    ),
  },
] as const;

// ── Component ───────────────────────────────────────────────

export default function NotFound() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/collections/all?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <main className="min-h-[85vh] bg-sand flex flex-col items-center justify-center px-4 py-24">
      {/* ── 404 badge ────────────────────────────────────── */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-1.5">
        <span className="text-xs font-semibold tracking-widest text-gold uppercase">
          404
        </span>
      </div>

      {/* ── Heading ──────────────────────────────────────── */}
      <h1 className="font-heading text-4xl md:text-5xl text-primary text-center mb-4 leading-tight">
        Page Not Found
      </h1>
      <p className="text-neutral-500 text-center text-base md:text-lg max-w-md mb-10 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Try searching for what you need.
      </p>

      {/* ── Search form ──────────────────────────────────── */}
      <form
        onSubmit={handleSearch}
        className="w-full max-w-md mb-14"
        role="search"
        aria-label="Search products"
      >
        <div className="relative flex items-center">
          <label htmlFor="not-found-search" className="sr-only">
            Search products
          </label>
          <div
            className="pointer-events-none absolute left-4 text-neutral-400"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
          <input
            id="not-found-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pergolas, awnings…"
            className="w-full rounded-full border border-neutral-200 bg-white py-3.5 pl-12 pr-28 text-sm text-primary placeholder:text-neutral-400 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
          />
          <button
            type="submit"
            disabled={!query.trim()}
            className="absolute right-2 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Search
          </button>
        </div>
      </form>

      {/* ── Popular categories ────────────────────────────── */}
      <section aria-labelledby="categories-heading" className="w-full max-w-2xl mb-12">
        <h2
          id="categories-heading"
          className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-6"
        >
          Popular categories
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.handle}
              href={`/collections/${cat.handle}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 text-center transition-all hover:border-gold hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold transition-colors group-hover:bg-gold/20">
                {cat.icon}
              </span>
              <span className="text-xs font-semibold text-primary leading-snug">
                {cat.title}
              </span>
              <span className="hidden text-2xs text-neutral-400 sm:block">
                {cat.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Return home CTA ───────────────────────────────── */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-7 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-gold hover:border-gold hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
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
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Return to Homepage
      </Link>
    </main>
  );
}
