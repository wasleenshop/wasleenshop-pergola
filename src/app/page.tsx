/**
 * app/page.tsx
 *
 * Homepage — assembles all 11 sections below the hero.
 *
 * Architecture:
 *  - Server Components (CategoryCards, FeaturedProducts, TestimonialsCarousel,
 *    BlogPreview) fetch their own data concurrently via React 19 concurrent
 *    server rendering. Each is wrapped in <Suspense> so data-fetching sections
 *    stream in independently without blocking static sections.
 *  - Client Components (CustomDesignBanner, InstallationVideo, Newsletter)
 *    hydrate after the shell is sent to the browser.
 *  - Static sections (WhyWasleen, InstagramGallery, HowItWorks) render
 *    synchronously — no Suspense needed.
 *
 * Scroll animations:
 *  ScrollReveal wires a single IntersectionObserver that toggles `.is-visible`
 *  on all `.reveal*` elements as they enter the viewport (animations.css).
 */

import { Suspense } from "react";

import { HeroSection } from "@/components/home/HeroSection";
import { CategoryCards } from "@/components/home/CategoryCards";
import { CustomDesignBanner } from "@/components/home/CustomDesignBanner";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { WhyWasleen } from "@/components/home/WhyWasleen";
import { InstallationVideo } from "@/components/home/InstallationVideo";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BlogPreview } from "@/components/home/BlogPreview";
import { Newsletter } from "@/components/home/Newsletter";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { getHomepageHeroContent } from "@/lib/shopify";

// ─────────────────────────────────────────────────────────────────
// Skeleton placeholder used as Suspense fallback
// ─────────────────────────────────────────────────────────────────

function SectionSkeleton({ height = "h-96" }: { height?: string }) {
  return (
    <div
      className={`w-full ${height} bg-neutral-100 animate-pulse`}
      aria-hidden="true"
    />
  );
}

// ─────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const heroContent = await getHomepageHeroContent();

  return (
    <>
      <main className="flex flex-col flex-1">
        {/* 1. Hero — built in Session 9 */}
        <HeroSection
          title={heroContent?.title}
          videoDesktop={heroContent?.videoDesktop}
          videoMobile={heroContent?.videoMobile}
        />

        {/* 2. Category Cards — server, fetches 4 Shopify collections */}
        <Suspense fallback={<SectionSkeleton height="h-[700px]" />}>
          <CategoryCards />
        </Suspense>

        {/* 3. Custom Design Banner — client, before/after drag slider */}
        <CustomDesignBanner />

        {/* 4. Featured Products — server + client carousel */}
        <Suspense fallback={<SectionSkeleton height="h-[600px]" />}>
          <FeaturedProducts />
        </Suspense>

        {/* 5. Why Wasleen — static trust grid */}
        <WhyWasleen />

        {/* 6. Installation Video — client, autoplay on scroll */}
        <InstallationVideo />

        {/* 7. Instagram Gallery — static placeholder */}
        <InstagramGallery />

        {/* 8. Testimonials — server, Judge.me reviews */}
        <Suspense fallback={<SectionSkeleton height="h-[500px]" />}>
          <TestimonialsCarousel />
        </Suspense>

        {/* 9. How It Works — static 4-step timeline */}
        <HowItWorks />

        {/* 10. Blog Preview — server, Shopify articles */}
        <Suspense fallback={<SectionSkeleton height="h-[480px]" />}>
          <BlogPreview />
        </Suspense>

        {/* 11. Newsletter — client, Klaviyo form */}
        <Newsletter />
      </main>

      {/* Global scroll-reveal: single IntersectionObserver for all .reveal* elements */}
      <ScrollReveal />
    </>
  );
}
