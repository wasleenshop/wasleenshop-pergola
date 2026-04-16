"use client";

/**
 * InstallationVideo.tsx
 *
 * Homepage section 6 — "From Order to Shade in 5 Days".
 * Client Component: IntersectionObserver for viewport-triggered autoplay,
 * custom play/pause controls, and reduced-motion support.
 *
 * Video source: passed as prop (connect to Shopify metafield in parent).
 * Poster image: passed as prop (shown while video loads / if autoplay blocked).
 */

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface InstallationVideoProps {
  /** Video URL (.mp4). If empty, the section shows the poster image only. */
  videoUrl?: string;
  /** Poster image — shown while video loads or when autoplay is blocked */
  posterUrl?: string;
}

// ─────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────

export function InstallationVideo({
  videoUrl = "",
  posterUrl = "/images/installation-poster.jpg",
}: InstallationVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── IntersectionObserver — autoplay when in viewport ──────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || prefersReduced) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            video
              .play()
              .then(() => {
                setIsPlaying(true);
                setHasStarted(true);
              })
              .catch(() => {
                // Autoplay blocked — user must click play
              });
          } else if (!entry.isIntersecting) {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.4 }
    );

    const section = sectionRef.current;
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, [videoUrl, hasStarted, prefersReduced]);

  // ── Play/Pause toggle ─────────────────────────────────────────
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <section
      ref={sectionRef}
      className="section-py bg-white"
      aria-labelledby="installation-video-heading"
    >
      <div className="container-site">
        {/* Header */}
        <div className="text-center mb-10 reveal">
          <span className="type-overline-gold block mb-3">See It in Action</span>
          <h2 className="type-h1" id="installation-video-heading">
            From Order to Shade in{" "}
            <span className="text-gradient-gold">5 Days</span>
          </h2>
          <p className="type-body-lg text-neutral-500 mt-4 max-w-xl mx-auto">
            Watch our team measure, fabricate, and install a complete pergola
            from start to finish.
          </p>
        </div>

        {/* Video container */}
        <div className="relative rounded-3xl overflow-hidden bg-primary aspect-video max-w-4xl mx-auto shadow-2xl reveal">
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterUrl || undefined}
                muted
                playsInline
                loop
                preload="metadata"
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                aria-label="Wasleen pergola installation time-lapse"
              />

              {/* Custom play/pause button — centered overlay */}
              <button
                onClick={togglePlay}
                className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "transition-opacity duration-300",
                  isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
                )}
                aria-label={isPlaying ? "Pause video" : "Play video"}
              >
                <span
                  className={cn(
                    "w-20 h-20 rounded-full bg-gold/90 backdrop-blur-sm",
                    "flex items-center justify-center shadow-gold-lg",
                    "transition-transform duration-200 hover:scale-110"
                  )}
                >
                  {isPlaying ? (
                    <Pause size={32} className="text-primary" aria-hidden="true" />
                  ) : (
                    <Play size={32} className="text-primary ml-1" aria-hidden="true" />
                  )}
                </span>
              </button>
            </>
          ) : (
            /* Poster-only state — video not connected yet */
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : {}}
            >
              <div className="absolute inset-0 bg-primary/60 flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gold/90 flex items-center justify-center shadow-gold-lg">
                  <Play size={32} className="text-primary ml-1" aria-hidden="true" />
                </div>
                <p className="type-label text-white/70 uppercase tracking-widest">
                  Video Coming Soon
                </p>
              </div>
            </div>
          )}

          {/* Overlay label */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
            <div className="glass rounded-xl px-4 py-2">
              <p className="type-label text-white font-semibold">
                Real Wasleen Installation — Dubai
              </p>
              <p className="text-white/60 text-xs">48-hour complete install</p>
            </div>
          </div>
        </div>

        {/* Feature callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto text-center reveal">
          {[
            { step: "01", label: "Site measurement", detail: "Same-day available" },
            { step: "02", label: "Fabrication", detail: "Ajman workshop, 2–3 days" },
            { step: "03", label: "Installation", detail: "1–2 days, zero mess" },
          ].map(({ step, label, detail }) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <span className="type-overline-gold">{step}</span>
              <p className="type-label-lg font-semibold text-primary">{label}</p>
              <p className="type-body-sm text-neutral-500">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
