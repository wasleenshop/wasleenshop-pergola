# Wasleen Pergolas Shop

Headless Shopify e-commerce platform for Wasleen Pergolas, the premier supplier of Aluminium pergolas, bioclimatic pergolas, Awnings, Closures, Umbrellas, and Tents in the UAE.

## Tech Stack
- Next.js 15 (App Router)
- React Server Components
- TypeScript
- Tailwind CSS
- Shopify Storefront API

## Architectural Laws
1. **The Zero-Hardcoding Law**: The Shopify backend is the single source of truth.
2. **The Zero-Error Law**: Production-ready code, strict TypeScript, elegant error handling.
3. **The Performance Law**: 90+ Lighthouse scores.
4. **The Widget Strategy**: Timed engagement widgets (Tidio, WhatsApp Expert Help).

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   Copy `.env.local.example` to `.env.local` and fill in the required keys.
   ```bash
   cp .env.local.example .env.local
   ```
4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

## Design System
- **Primary**: `#1A1614` (charcoal)
- **Gold**: `#C9A962`
- **Sand**: `#F5F1EB`
- **White**: `#FFFFFF`
- **Fonts**: Playfair Display (Headings), Inter (Body), Tajawal (Arabic)
