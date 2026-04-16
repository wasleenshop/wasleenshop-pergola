import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Tajawal } from "next/font/google";
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
  // Weights used across the design system
  weight: ["300", "400", "500", "600", "700"],
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  // Playfair is a variable font — all weights available automatically
  weight: ["400", "500", "600", "700", "800", "900"],
  preload: true,
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  display: "swap",
  weight: ["300", "400", "500", "700", "800"],
  preload: false, // Only loaded when Arabic content is present
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch cart + customer in parallel — both are server-side reads from
  // httpOnly cookies, so there is zero loading flash on first render.
  const [initialCart, initialCustomer] = await Promise.all([
    getInitialCart(),
    getInitialCustomer(),
  ]);

  return (
    <html
      lang="en"
      dir="ltr"
      className={`${inter.variable} ${playfair.variable} ${tajawal.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-sand text-primary">
        {/* GTM noscript — must be the first child of <body> */}
        <GTMNoScript />
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
        {/* GTM + GA4 scripts + SPA route tracker */}
        <Analytics />
      </body>
    </html>
  );
}
