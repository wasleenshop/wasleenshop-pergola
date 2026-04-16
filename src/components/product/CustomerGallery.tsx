/**
 * CustomerGallery.tsx
 *
 * UGC (User-Generated Content) gallery section.
 *
 * NOTE: Instagram's Basic Display API was deprecated in 2024.
 * Direct Instagram embedding requires Meta Business approval + webhooks,
 * which is out of scope for this session.
 *
 * Current implementation:
 *  - Beautiful placeholder that invites customers to share photos
 *  - Includes the #wasleenpergolas hashtag CTA
 *  - Ready to swap in real images once a UGC platform (e.g. Yotpo, Taggbox)
 *    is integrated — just replace the <PlaceholderGrid> with API data
 *
 * To activate: fetch posts from your UGC provider and render them
 * inside the <ul> grid below, replacing the placeholder items.
 */

// Instagram SVG inline — lucide-react v1.x has no brand icons
function InstagramIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
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
// Placeholder grid item
// ─────────────────────────────────────────────────────────────────

function PlaceholderTile({ index }: { index: number }) {
  // Subtle animated shimmer tiles — visible until real photos are wired in
  const opacities = [
    "opacity-60",
    "opacity-40",
    "opacity-50",
    "opacity-70",
    "opacity-45",
    "opacity-55",
    "opacity-65",
    "opacity-35",
  ];

  return (
    <li
      className={`
        aspect-square rounded-xl bg-gradient-to-br from-sand-dark to-sand-darker
        ${opacities[index % opacities.length]}
        flex items-center justify-center
      `}
      aria-hidden="true"
    >
      <InstagramIcon size={28} className="text-neutral-400" />
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function CustomerGallery() {
  const instagramHandle = "@wasleen.pergolas";
  const hashtag = "#wasleenpergolas";

  return (
    <section
      className="bg-sand rounded-3xl px-6 py-10 md:px-10 md:py-14 space-y-8"
      aria-labelledby="gallery-heading"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="type-overline-gold mb-2">Customer Gallery</p>
          <h2 id="gallery-heading" className="type-h2">
            See It in Real Homes
          </h2>
          <p className="type-body-sm text-neutral-500 mt-2">
            Tag us on Instagram to be featured here
          </p>
        </div>

        <a
          href={`https://www.instagram.com/explore/tags/wasleenpergolas/`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-dark transition-colors shrink-0"
          aria-label="View customer photos on Instagram"
        >
          <InstagramIcon size={18} />
          {instagramHandle}
        </a>
      </div>

      {/* Photo grid placeholder */}
      <ul
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        aria-label="Customer photos (coming soon)"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <PlaceholderTile key={i} index={i} />
        ))}
      </ul>

      {/* CTA */}
      <div className="text-center">
        <p className="text-sm text-neutral-500">
          Share your Wasleen installation on Instagram using{" "}
          <a
            href={`https://www.instagram.com/explore/tags/wasleenpergolas/`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:text-gold transition-colors"
          >
            {hashtag}
          </a>{" "}
          and get featured on our website.
        </p>
      </div>
    </section>
  );
}
