/**
 * app/loading.tsx
 *
 * Global loading UI — shown while any async Server Component
 * in the root segment is streaming in. Uses CSS animation classes
 * defined in globals.css / animations.css.
 */

export default function Loading() {
  return (
    <div
      className="min-h-screen bg-sand"
      role="status"
      aria-label="Loading page"
    >
      {/* ── Hero skeleton ─────────────────────────────────── */}
      <div className="skeleton h-[55vh] w-full rounded-none" />

      <div className="mx-auto max-w-7xl px-4 py-16 space-y-20">
        {/* ── Section header skeleton ───────────────────────── */}
        <div className="text-center space-y-3">
          <div className="skeleton skeleton-text h-4 w-24 mx-auto" />
          <div className="skeleton skeleton-text h-9 w-64 mx-auto" />
          <div className="skeleton skeleton-text h-4 w-96 mx-auto" />
        </div>

        {/* ── Product card grid skeleton ────────────────────── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-square w-full rounded-xl" />
              <div className="skeleton skeleton-text h-4 w-3/4" />
              <div className="skeleton skeleton-text h-4 w-1/2" />
              <div className="skeleton skeleton-text h-5 w-1/3" />
            </div>
          ))}
        </div>

        {/* ── Wide banner skeleton ──────────────────────────── */}
        <div className="skeleton h-48 w-full rounded-2xl" />

        {/* ── Three-column content skeleton ────────────────── */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton skeleton-circle w-14 h-14" />
              <div className="skeleton skeleton-text h-5 w-3/4" />
              <div className="skeleton skeleton-text h-4 w-full" />
              <div className="skeleton skeleton-text h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
