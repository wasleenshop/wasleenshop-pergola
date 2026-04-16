import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Tajawal } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { TrustBanner } from "@/components/layout/TrustBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getInitialCart } from "@/lib/shopify/actions/cart";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { getInitialCustomer } from "@/lib/shopify/customer-operations";
import { Analytics, GTMNoScript } from "@/components/Analytics";

/* ── Google Fonts — self-hosted via next/font ─────────────── */

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
  preload: true,
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  display: "swap",
  weight: ["300", "400", "500", "700", "800"],
  preload: false,
});

/* ── Viewport config ──────────────────────────────────────── */

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A1614",
};

/* ── Default metadata ─────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://shop.wasleen.com"
  ),
  title: {
    default: "Wasleen Pergolas | Premier Luxury Pergolas in UAE",
    template: "%s | Wasleen Pergolas",
  },
  description:
    "Premier supplier of Aluminium pergolas, bioclimatic pergolas, Awnings and Closures, Umbrellas and Tents in the UAE. Delivered across the Emirates.",
  keywords: [
    "pergolas UAE",
    "aluminium pergola Dubai",
    "bioclimatic pergola",
    "awnings UAE",
    "luxury pergola",
    "Wasleen pergola",
  ],
  openGraph: {
    type: "website",
    locale: "en_AE",
    alternateLocale: "ar_AE",
    siteName: "Wasleen Pergolas",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* ── Root Layout ──────────────────────────────────────────── */
//
// RootLayout is intentionally synchronous — no runtime API access here.
//
// cacheComponents: true requires that any access to request-time APIs
// (cookies, headers, searchParams) happens inside a <Suspense> boundary.
// Since the cart and customer both read httpOnly cookies, they are moved
// into <DynamicChrome>, an async Server Component wrapped in <Suspense>.
//
// Per the Next.js docs: placing a <Suspense> with a null fallback above the
// document body causes the entire app to defer to request time, which is
// correct for an e-commerce app where every page depends on per-user
// cart/session state.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${playfair.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-sand text-primary">
        {/* GTM noscript — must be the first child of <body> */}
        <GTMNoScript />

        {/*
          DynamicChrome reads cookies (cart + customer) so it must be
          inside <Suspense>. The null fallback defers all routes to
          request time — correct because every page needs per-user state.
        */}
        <Suspense fallback={null}>
          <DynamicChrome>{children}</DynamicChrome>
        </Suspense>

        {/* GTM + GA4 scripts + SPA route tracker */}
        <Analytics />
      </body>
    </html>
  );
}

/* ── Dynamic chrome (per-request) ─────────────────────────── */

async function DynamicChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  // Both reads are cookie-based: getInitialCustomer decodes a JWT from
  // an httpOnly cookie; getInitialCart reads a cart-id cookie and may
  // fetch from the Shopify Storefront API if a cart exists.
  const [initialCart, initialCustomer] = await Promise.all([
    getInitialCart(),
    getInitialCustomer(),
  ]);

  return (
    <CustomerProvider initialCustomer={initialCustomer}>
      <CartProvider initialCart={initialCart}>
        <TrustBanner />
        <Header />
        {children}
        <Footer />
        {/* Portal-rendered — mounts to document.body via createPortal */}
        <CartDrawer />
      </CartProvider>
    </CustomerProvider>
  );
}
