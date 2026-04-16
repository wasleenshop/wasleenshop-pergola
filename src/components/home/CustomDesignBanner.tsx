"use client";

/**
 * CustomDesignBanner.tsx
 *
 * Homepage section 3 — "Made in UAE, Designed for You".
 * Client Component: interactive before/after drag slider.
 *
 * Layout: split left/right (stacks on mobile).
 * Left:  Before/After image comparison slider.
 * Right: Headline, trust points, dual CTAs.
 *
 * Image sources: passed as props (from parent server component or
 * public assets). Defaults to placeholder paths — replace with real
 * assets in /public/images/custom-design/.
 */

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface CustomDesignBannerProps {
  /** URL for the "before" image (plain outdoor space) */
  beforeImageUrl?: string;
  /** URL for the "after" image (pergola installed) */
  afterImageUrl?: string;
}

// ─────────────────────────────────────────────────────────────────
// Trust points (design constants — static marketing copy)
// ─────────────────────────────────────────────────────────────────

const TRUST_POINTS = [
  "Fabricated at our Ajman workshop",
  "3D design mockup included, free of charge",
  "50% deposit, balance on completion",
  "Free on-site measurement across the UAE",
] as const;

// ─────────────────────────────────────────────────────────────────
// Before/After drag slider (sub-component)
// ─────────────────────────────────────────────────────────────────

function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  };
  const onMouseUp = () => {
    isDragging.current = false;
  };

  // Touch handlers
  const onTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden aspect-[4/3] cursor-ew-resize select-none shadow-xl"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      role="img"
      aria-label="Before and after custom pergola design comparison"
    >
      {/* After image (full — shown underneath) */}
      <div className="absolute inset-0">
        <Image
          src={afterUrl}
          alt="After: luxury pergola installed"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <span className="absolute top-4 right-4 bg-gold text-primary text-2xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
          After
        </span>
      </div>

      {/* Before image — clip-path reveals left portion up to slider position */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeUrl}
          alt="Before: plain outdoor space"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <span className="absolute top-4 left-4 bg-primary/80 text-sand text-2xs font-bold tracking-widest uppercase px-3 py-1 rounded-full">
          Before
        </span>
      </div>

      {/* Vertical divider line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-white shadow-lg z-10 pointer-events-none"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      />

      {/* Drag handle */}
      <button
        className={cn(
          "absolute top-1/2 z-20",
          "w-10 h-10 rounded-full bg-white shadow-xl",
          "flex items-center justify-center cursor-ew-resize",
          "-translate-x-1/2 -translate-y-1/2",
          "focus-visible:ring-2 focus-visible:ring-gold"
        )}
        style={{ left: `${position}%` }}
        onMouseDown={onMouseDown}
        onTouchStart={(e) => e.preventDefault()}
        onTouchMove={onTouchMove}
        aria-label={`Comparison slider at ${Math.round(position)}%`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        role="slider"
      >
        {/* Double chevron icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 5L3 10L7 15"
            stroke="#1A1614"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 5L17 10L13 15"
            stroke="#1A1614"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

const WHATSAPP_BASE = `https://wa.me/${
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971567648220"
}`;

export function CustomDesignBanner({
  beforeImageUrl = "/images/custom-design-before.jpg",
  afterImageUrl = "/images/custom-design-after.jpg",
}: CustomDesignBannerProps) {
  const whatsappUrl = `${WHATSAPP_BASE}?text=${encodeURIComponent(
    "Hi! I'm interested in a custom pergola design for my outdoor space."
  )}`;

  return (
    <section
      className="section-py bg-sand"
      aria-labelledby="custom-design-heading"
    >
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — slider */}
          <div className="reveal-left">
            <BeforeAfterSlider
              beforeUrl={beforeImageUrl}
              afterUrl={afterImageUrl}
            />
            <p className="type-body-sm text-neutral-400 text-center mt-3">
              Drag to compare — real Wasleen installation
            </p>
          </div>

          {/* Right — copy */}
          <div className="reveal-right">
            <span className="type-overline-gold block mb-4">
              Made in UAE, Designed for You
            </span>

            <h2 className="type-display-md mb-6" id="custom-design-heading">
              Your Vision, Our{" "}
              <span className="text-gradient-gold">Craftsmanship</span>
            </h2>

            <p className="type-body-lg text-neutral-600 mb-8">
              Our Ajman workshop transforms your ideas into precision-built
              pergolas. We measure, design, fabricate, and install — all
              in-house. No middlemen. No shortcuts.
            </p>

            <ul className="space-y-3 mb-10" aria-label="Custom design benefits">
              {TRUST_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 type-body text-neutral-700"
                >
                  <span className="shrink-0 w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center mt-0.5">
                    <Check size={12} className="text-gold-dark" aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/collections/custom-design">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Custom Design
                </Button>
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="secondary" className="w-full">
                  Get a Free Quote
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
