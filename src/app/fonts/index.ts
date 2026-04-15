/**
 * app/fonts/index.ts
 *
 * Central font registry for Wasleen Pergolas.
 * Fonts are loaded once in the root layout; this file exports
 * the CSS variable names so they can be referenced in code
 * without magic strings.
 *
 * Note: Actual next/font instances MUST be instantiated in a
 * Server Component (layout.tsx). Do NOT import from next/font
 * in Client Components — use these CSS variable names instead.
 */

/** CSS variable name injected by inter font instance */
export const FONT_SANS_VAR = "--font-inter" as const;

/** CSS variable name injected by playfair font instance */
export const FONT_HEADING_VAR = "--font-playfair" as const;

/** CSS variable name injected by tajawal font instance */
export const FONT_ARABIC_VAR = "--font-tajawal" as const;

/** Tailwind font-family class for body copy */
export const fontSansClass = "font-sans" as const;

/** Tailwind font-family class for headings */
export const fontHeadingClass = "font-heading" as const;

/** Tailwind font-family class for Arabic content */
export const fontArabicClass = "font-arabic" as const;
