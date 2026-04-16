/**
 * TestimonialsCarousel.tsx
 *
 * Homepage section 8 — "What Our Customers Say".
 * Server Component: fetches Judge.me shop reviews, passes to client carousel.
 *
 * Renders null if no reviews are available (graceful degradation).
 * Layout: 2-column split — left stats, right carousel.
 */

import { getShopReviews } from "@/lib/judgeme/shop-reviews";
import { TestimonialsCarouselClient } from "./TestimonialsCarouselClient";

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export async function TestimonialsCarousel() {
  const reviews = await getShopReviews(8);

  if (reviews.length === 0) return null;

  return (
    <section
      className="section-py bg-white"
      aria-labelledby="testimonials-heading"
    >
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left — heading + aggregate stats */}
          <div className="lg:col-span-2 reveal-left">
            <span className="type-overline-gold block mb-4">
              Customer Reviews
            </span>
            <h2 className="type-h1 mb-6" id="testimonials-heading">
              What Our Customers{" "}
              <span className="text-gradient-gold">Say</span>
            </h2>
            <p className="type-body-lg text-neutral-500 mb-10">
              Real reviews from UAE homeowners who transformed their outdoor
              spaces with Wasleen.
            </p>

            {/* Aggregate stats */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 text-right shrink-0">
                  <span className="type-h3 text-gold">4.9</span>
                </div>
                <div className="flex-1">
                  {/* Star bar */}
                  <div className="flex gap-1 mb-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-5 h-5 text-gold"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="type-body-sm text-neutral-500">
                    Based on {reviews.length}+ verified reviews
                  </p>
                </div>
              </div>

              <div className="accent-line" aria-hidden="true" />

              <div className="grid grid-cols-2 gap-4">
                <div className="card-sand rounded-xl p-4 text-center">
                  <p className="type-h3 text-gold">98%</p>
                  <p className="type-body-sm text-neutral-500 mt-1">
                    Would recommend
                  </p>
                </div>
                <div className="card-sand rounded-xl p-4 text-center">
                  <p className="type-h3 text-gold">48h</p>
                  <p className="type-body-sm text-neutral-500 mt-1">
                    Avg. install time
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — carousel */}
          <div className="lg:col-span-3 reveal-right">
            <div className="bg-sand rounded-3xl p-6 sm:p-8">
              <TestimonialsCarouselClient reviews={reviews} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
