/**
 * WhyWasleen.tsx
 *
 * Homepage section 5 — "Why Choose Wasleen".
 * Server Component (no interactivity — pure presentational).
 *
 * Layout: responsive 2×3 grid of trust item cards.
 * Trust items are static design constants (not Shopify data) —
 * these represent brand values, not inventory.
 */

// ─────────────────────────────────────────────────────────────────
// Trust item icons (inline SVG — lucide-react has no brand/emoji icons)
// ─────────────────────────────────────────────────────────────────

function DEDIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
      <path d="M16 3L4 9v7c0 7.18 5.14 13.9 12 15.5C22.86 29.9 28 23.18 28 16V9L16 3z" fill="currentColor" opacity=".15"/>
      <path d="M16 3L4 9v7c0 7.18 5.14 13.9 12 15.5C22.86 29.9 28 23.18 28 16V9L16 3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M11 16l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function UAEIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
      <circle cx="16" cy="16" r="12" fill="currentColor" opacity=".12"/>
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 4v24M4 16h24M7 7l18 18M25 7L7 25" stroke="currentColor" strokeWidth="1.5" opacity=".4"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
      <circle cx="16" cy="16" r="6" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth="2"/>
      <path d="M16 2v4M16 26v4M2 16h4M26 16h4M6.34 6.34l2.83 2.83M22.83 22.83l2.83 2.83M6.34 25.66l2.83-2.83M22.83 9.17l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
      <path d="M20 4a8 8 0 0 1-8 12.94L5.66 23.3A2.83 2.83 0 1 0 9.7 27.34L16.06 21A8 8 0 0 1 20 4z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M20 4l-3 3 2 5 3-1 2-5-4-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
      <path d="M16 3L4 8v8c0 6.63 5.14 12.84 12 14.5C22.86 28.84 28 22.63 28 16V8L16 3z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M12 16l2.5 2.5L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
      <path d="M6 4h6l3 7-3.5 2.5c1.8 3.6 5 6.8 8.6 8.6L22.5 18.5l7 3V28A2 2 0 0 1 27.5 30C13.4 29.5 2.5 18.6 2 4.5A2 2 0 0 1 4 2l2 2z" fill="currentColor" opacity=".15" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Trust items config (design constants — not Shopify data)
// ─────────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    id: "ded",
    icon: DEDIcon,
    title: "DED Licensed Supplier",
    description:
      "Fully registered with Dubai Economy & Tourism. Your investment is protected.",
    accentClass: "text-blue-600",
    bgClass: "bg-blue-50",
  },
  {
    id: "uae",
    icon: UAEIcon,
    title: "Made in UAE",
    description:
      "Fabricated at our Ajman workshop by skilled local craftsmen. No imports, no shortcuts.",
    accentClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
  {
    id: "climate",
    icon: SunIcon,
    title: "Dubai Climate Tested",
    description:
      "Every design is engineered for 50°C+ summers, sandstorms, and coastal humidity.",
    accentClass: "text-amber-600",
    bgClass: "bg-amber-50",
  },
  {
    id: "install",
    icon: WrenchIcon,
    title: "Free Installation UAE-Wide",
    description:
      "Professional installation included — Dubai, Abu Dhabi, Sharjah, and all Emirates.",
    accentClass: "text-gold-dark",
    bgClass: "bg-gold/10",
  },
  {
    id: "warranty",
    icon: ShieldIcon,
    title: "5-Year Manufacturing Warranty",
    description:
      "Industry-leading coverage on all structures. We stand behind every weld and bolt.",
    accentClass: "text-primary",
    bgClass: "bg-sand-dark",
  },
  {
    id: "support",
    icon: PhoneIcon,
    title: "24/7 WhatsApp Support",
    description:
      "Real experts available around the clock. Get answers, not bots.",
    accentClass: "text-emerald-600",
    bgClass: "bg-emerald-50",
  },
] as const;

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function WhyWasleen() {
  return (
    <section
      className="section-py bg-primary"
      aria-labelledby="why-wasleen-heading"
    >
      <div className="container-site">
        {/* Section header */}
        <div className="text-center mb-14 reveal">
          <span className="type-overline-gold block mb-3">
            The Wasleen Difference
          </span>
          <h2 className="type-h1 text-white" id="why-wasleen-heading">
            Why 1,000+ UAE Families{" "}
            <span className="text-gradient-gold">Choose Us</span>
          </h2>
          <p className="type-body-lg text-neutral-300 mt-4 max-w-2xl mx-auto">
            Not just another pergola supplier — a partner in transforming your
            outdoor space for life in the UAE.
          </p>
        </div>

        {/* 2×3 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`reveal card-dark rounded-2xl p-7 flex flex-col gap-4`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Icon badge */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center ${item.bgClass} ${item.accentClass} shrink-0`}
                >
                  <Icon />
                </div>

                {/* Text */}
                <div>
                  <h3 className="type-h5 text-white mb-2">{item.title}</h3>
                  <p className="type-body-sm text-neutral-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom stat row */}
        <div className="mt-16 pt-12 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center reveal">
          {[
            { value: "1,000+", label: "Happy Customers" },
            { value: "15+ Yrs", label: "Experience" },
            { value: "5-Year", label: "Warranty" },
            { value: "48 Hrs", label: "Installation" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="type-h2 text-gradient-gold">{stat.value}</p>
              <p className="type-label text-neutral-400 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
