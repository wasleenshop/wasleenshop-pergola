"use client";

/**
 * ScrollReveal.tsx
 *
 * Client Component — mounts a single IntersectionObserver that toggles
 * `.is-visible` on all elements with `.reveal`, `.reveal-left`,
 * `.reveal-right`, or `.reveal-scale` classes as they enter the viewport.
 *
 * Pairs with the CSS rules in styles/animations.css:
 *   .reveal { opacity: 0; transform: translateY(20px); transition: ... }
 *   .reveal.is-visible { opacity: 1; transform: none; }
 *
 * Usage: render <ScrollReveal /> once per page — it observes ALL reveal
 * elements on the page via a shared observer.
 *
 * Respects prefers-reduced-motion: if enabled, the CSS transition is
 * disabled (handled in animations.css), but elements are still marked
 * visible so content is accessible.
 */

import { useEffect } from "react";

const REVEAL_SELECTORS = ".reveal, .reveal-left, .reveal-right, .reveal-scale";

export function ScrollReveal() {
  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTORS)
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Unobserve after reveal — one-shot animation
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Renders nothing — purely a side-effect component
  return null;
}
