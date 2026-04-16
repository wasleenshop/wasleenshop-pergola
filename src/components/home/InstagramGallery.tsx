/**
 * InstagramGallery.tsx
 *
 * Homepage section 7 — "Installed Across UAE".
 * Server Component (no interactivity).
 *
 * NOTE: Instagram's Basic Display API was deprecated in 2024.
 * This renders a placeholder grid that invites visitors to share photos.
 * Replace the <PlaceholderTile> grid with a UGC platform API
 * (e.g. Taggbox, Yotpo) when available.
 *
 * Reuses the exact same pattern as CustomerGallery.tsx on the product page.
 */

// ─────────────────────────────────────────────────────────────────
// Instagram icon (inline SVG — lucide-react v1.x has no brand icons)
// ─────────────────────────────────────────────────────────────────

function InstagramIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Placeholder tile
// ─────────────────────────────────────────────────────────────────

function PlaceholderTile({ index }: { index: number }) {
  // Staggered opacity for visual variety
  const opacities = [
    "opacity-60",
    "opacity-40",
    "opacity-55",
    "opacity-70",
    "opacity-45",
    "opacity-65",
    "opacity-50",
    "opacity-35",
  ];

  return (
    <li
      className={`
        aspect-square rounded-xl overflow-hidden
        bg-gradient-to-br from-sand-dark to-sand-darker
        ${opacities[index % opacities.length]}
        flex items-center justify-center
        transition-opacity duration-300 hover:opacity-80
      `}
      aria-hidden="true"
    >
      <InstagramIcon size={28} className="text-neutral-400" />
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

const INSTAGRAM_HANDLE = "@wasleen_pergolas_uae";
const INSTAGRAM_HASHTAG = "#wasleenpergolas";
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/wasleen_pergolas_uae/";
const INSTAGRAM_HASHTAG_URL =
  "https://www.instagram.com/explore/tags/wasleenpergolas/";

export function InstagramGallery() {
  return (
    <section
      className="section-py bg-sand"
      aria-labelledby="instagram-gallery-heading"
    >
      <div className="container-site">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8 reveal">
          <div>
            <span className="type-overline-gold block mb-2">
              Customer Gallery
            </span>
            <h2 className="type-h1" id="instagram-gallery-heading">
              Installed Across UAE
            </h2>
            <p className="type-body-lg text-neutral-500 mt-3 max-w-lg">
              Tag us to be featured here — our customers&apos; spaces are our
              best portfolio.
            </p>
          </div>

          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-dark transition-colors shrink-0 self-start sm:self-auto"
            aria-label={`Follow ${INSTAGRAM_HANDLE} on Instagram`}
          >
            <InstagramIcon size={20} />
            {INSTAGRAM_HANDLE}
          </a>
        </div>

        {/* Photo grid — placeholder until UGC platform is connected */}
        <ul
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 reveal"
          aria-label="Customer installation photos (coming soon)"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <PlaceholderTile key={i} index={i} />
          ))}
        </ul>

        {/* Hashtag CTA */}
        <div className="text-center mt-8 reveal">
          <p className="type-body text-neutral-500">
            Share your Wasleen installation using{" "}
            <a
              href={INSTAGRAM_HASHTAG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:text-gold transition-colors"
            >
              {INSTAGRAM_HASHTAG}
            </a>{" "}
            and get featured on our website.
          </p>
        </div>
      </div>
    </section>
  );
}
