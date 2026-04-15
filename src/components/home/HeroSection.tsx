"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface HeroSectionProps {
  /** Desktop landscape video URL (16:9) — from Shopify metafield */
  videoDesktop?: string;
  /** Mobile portrait video URL (9:16) — from Shopify metafield */
  videoMobile?: string;
  /** Poster image shown while desktop video buffers */
  posterDesktop?: string;
  /** Poster image shown while mobile video buffers */
  posterMobile?: string;
}

// Static fallback values — replace with real /public assets before launch
const FALLBACKS = {
  videoDesktop: "",
  videoMobile: "",
  posterDesktop: "/images/hero-poster-desktop.jpg",
  posterMobile: "/images/hero-poster-mobile.jpg",
};

const WHATSAPP_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971567648220"}`;

export function HeroSection({
  videoDesktop = FALLBACKS.videoDesktop,
  videoMobile = FALLBACKS.videoMobile,
  posterDesktop = FALLBACKS.posterDesktop,
  posterMobile = FALLBACKS.posterMobile,
}: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Pause video when scrolled out of view — saves CPU/battery
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay blocked — poster image remains visible
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.unobserve(video);
  }, []);

  const handleScrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section
      className="relative w-full h-[100svh] min-h-[600px] flex items-center justify-center overflow-hidden bg-primary -mt-16 lg:-mt-20"
      aria-label="Wasleen Pergolas Hero"
    >
      {/* Desktop video (hidden on mobile) */}
      {videoDesktop && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterDesktop}
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          aria-hidden="true"
        >
          <source src={videoDesktop} type="video/mp4" />
        </video>
      )}

      {/* Mobile video (hidden on desktop) */}
      {videoMobile && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={posterMobile}
          className="absolute inset-0 w-full h-full object-cover block md:hidden"
          aria-hidden="true"
        >
          <source src={videoMobile} type="video/mp4" />
        </video>
      )}

      {/* Poster fallback when no video src (shown via CSS background) */}
      {!videoDesktop && (
        <div
          className="absolute inset-0 hidden md:block bg-cover bg-center"
          style={{ backgroundImage: `url(${posterDesktop})` }}
          aria-hidden="true"
        />
      )}
      {!videoMobile && (
        <div
          className="absolute inset-0 block md:hidden bg-cover bg-center"
          style={{ backgroundImage: `url(${posterMobile})` }}
          aria-hidden="true"
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 container-site px-6 w-full flex flex-col items-center justify-center text-center mt-12 md:mt-0">
        <div className="space-y-6 max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="type-display-lg text-white drop-shadow-md">
            Transform Your Outdoor Space Into a{" "}
            <span className="text-gradient-gold">Luxury Oasis</span>
          </h1>

          <p className="type-body-lg md:text-xl text-neutral-200 font-medium tracking-wide drop-shadow-sm max-w-2xl mx-auto">
            Premium Pergolas &bull; Awnings &bull; Shade Solutions
          </p>

          <p className="type-overline-gold md:text-sm tracking-widest drop-shadow-sm">
            Made in UAE &bull; Installed in 48 Hours &bull; 5-Year Warranty
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-in-up delay-200">
            <Link href="/collections" className="w-full sm:w-auto">
              <Button size="lg" className="w-full shadow-gold-lg hover:shadow-gold">
                Explore Collections
              </Button>
            </Link>

            <Link href="/custom-design" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="ghost-light"
                className="w-full backdrop-blur-sm"
              >
                Custom Design
              </Button>
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full bg-[#25D366] text-white hover:bg-[#128C7E] border-none shadow-md"
              >
                <MessageCircle size={20} aria-hidden="true" />
                WhatsApp Us
              </Button>
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="hidden lg:grid grid-cols-4 gap-8 absolute bottom-32 w-full max-w-5xl mx-auto border-t border-white/20 pt-6 animate-fade-in-up delay-300">
          <div className="text-center">
            <p className="type-h3 text-white">1000+</p>
            <p className="type-label text-neutral-300 uppercase tracking-widest">Happy Customers</p>
          </div>
          <div className="text-center border-l border-white/20">
            <p className="type-h3 text-white">15+ Years</p>
            <p className="type-label text-neutral-300 uppercase tracking-widest">Experience</p>
          </div>
          <div className="text-center border-l border-white/20">
            <p className="type-h3 text-white">5 Year</p>
            <p className="type-label text-neutral-300 uppercase tracking-widest">Warranty</p>
          </div>
          <div className="text-center border-l border-white/20">
            <p className="type-h3 text-white">24/7</p>
            <p className="type-label text-neutral-300 uppercase tracking-widest">Support</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-fade-in-up delay-500">
        <span className="type-label-lg text-white/80 mb-2 font-medium tracking-wide">
          Scroll to Explore
        </span>
        <button
          onClick={handleScrollDown}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-gold hover:text-primary transition-colors cursor-pointer"
          aria-label="Scroll down to page content"
        >
          <ChevronDown size={24} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
