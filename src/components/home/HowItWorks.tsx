/**
 * HowItWorks.tsx
 *
 * Homepage section 9 — "How It Works".
 * Server Component (no interactivity — purely presentational).
 *
 * Layout: horizontal 4-step timeline (desktop), vertical list (mobile).
 * Steps are design constants — not sourced from Shopify.
 */

import Link from "next/link";
import { Button } from "@/components/ui/Button";

// ─────────────────────────────────────────────────────────────────
// Step icons (inline SVG)
// ─────────────────────────────────────────────────────────────────

function BrowseIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
      <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 12h24" stroke="currentColor" strokeWidth="2"/>
      <circle cx="21" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M23.5 21.5L26 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="9" cy="9" r="1" fill="currentColor"/>
      <circle cx="13" cy="9" r="1" fill="currentColor"/>
    </svg>
  );
}

function QuoteIcon2() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
      <path d="M6 14h8v10H6V14zM18 14h8v10h-8V14z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M14 14c0-4.4-3.6-8-8-8M26 14c0-4.4-3.6-8-8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function InstallIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
      <path d="M20 4a8 8 0 0 1-8 12.94L5.66 23.3A2.83 2.83 0 1 0 9.7 27.34L16.06 21A8 8 0 0 1 20 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M20 4l-3 3 2 5 3-1 2-5-4-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function EnjoyIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 18s1.5 4 6 4 6-4 6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="13" r="1.5" fill="currentColor"/>
      <circle cx="20" cy="13" r="1.5" fill="currentColor"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Steps config (design constants)
// ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    icon: BrowseIcon,
    title: "Choose Your Design",
    description:
      "Browse our curated collections or tell us your vision for a fully custom build.",
    detail: "100+ models in stock",
    href: "/collections",
    cta: "Browse Collections",
  },
  {
    number: "02",
    icon: QuoteIcon2,
    title: "Get Your Quote",
    description:
      "Instant pricing online, or WhatsApp us for a free on-site measurement and custom quote.",
    detail: "Same-day response",
    href: null,
    cta: null,
  },
  {
    number: "03",
    icon: InstallIcon,
    title: "Professional Installation",
    description:
      "Our certified team installs your pergola in 1–2 days with zero mess and zero hassle.",
    detail: "Free UAE-wide",
    href: null,
    cta: null,
  },
  {
    number: "04",
    icon: EnjoyIcon,
    title: "Enjoy Your Outdoor Space",
    description:
      "Your transformed space is ready. We're on call 24/7 for support, for life.",
    detail: "5-year warranty included",
    href: null,
    cta: null,
  },
] as const;

// ─────────────────────────────────────────────────────────────────
// Connector arrow (desktop horizontal line)
// ─────────────────────────────────────────────────────────────────

function Connector() {
  return (
    <div
      className="hidden lg:flex items-center justify-center flex-1 pt-10 px-2"
      aria-hidden="true"
    >
      <div className="w-full h-px bg-gradient-to-r from-gold/30 via-gold to-gold/30 relative">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function HowItWorks() {
  return (
    <section
      className="section-py bg-sand"
      aria-labelledby="how-it-works-heading"
    >
      <div className="container-site">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <span className="type-overline-gold block mb-3">Simple Process</span>
          <h2 className="type-h1" id="how-it-works-heading">
            How It Works
          </h2>
          <p className="type-body-lg text-neutral-500 mt-4 max-w-xl mx-auto">
            From browsing to your first evening under the stars — it&apos;s
            easier than you think.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-0">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="flex lg:flex-col flex-row items-start lg:items-center lg:flex-1 gap-4 lg:gap-0 reveal"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Step card */}
                <div className="lg:w-full flex flex-col lg:items-center gap-4 lg:text-center">
                  {/* Number + icon badge */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-gold/20 shadow-md flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-primary transition-colors duration-300">
                      <Icon />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold text-primary text-2xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>

                  {/* Text (inside card, below icon on desktop) */}
                  <div className="flex-1 lg:px-4 lg:mt-2">
                    <h3 className="type-h5 font-semibold text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="type-body-sm text-neutral-500 leading-relaxed mb-2">
                      {step.description}
                    </p>
                    <span className="inline-block type-overline-gold">
                      {step.detail}
                    </span>
                  </div>
                </div>

                {/* Connector between steps (desktop only) */}
                {index < STEPS.length - 1 && <Connector />}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-14 reveal">
          <p className="type-body-lg text-neutral-500 mb-6">
            Ready to start? Most customers are installed within a week.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/collections">
              <Button size="lg">Browse Collections</Button>
            </Link>
            <a
              href={`https://wa.me/${
                process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971567648220"
              }?text=${encodeURIComponent(
                "Hi! I'd like to get a quote for a pergola."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="secondary">
                Get a Free Quote
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
