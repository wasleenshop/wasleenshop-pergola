import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FooterNewsletterForm } from "./FooterNewsletterForm";

// Brand social icons — not available in lucide-react, using inline SVGs
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} width="20" height="20" aria-hidden="true">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} width="20" height="20" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} width="20" height="20" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} width="20" height="20" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} width="20" height="20" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} width="20" height="20" aria-hidden="true">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.105 0 7.301 2.925 7.301 6.828 0 4.084-2.571 7.37-6.143 7.37-1.2 0-2.327-.624-2.711-1.36l-.738 2.81c-.267 1.039-1.002 2.34-1.493 3.136 1.157.348 2.385.535 3.655.535 6.621 0 11.988-5.367 11.988-11.987C24.006 5.367 18.638 0 12.017 0z"/>
  </svg>
);

const FOOTER_LINKS = {
  shop: [
    { label: "Aluminium Pergolas", href: "/collections/aluminium" },
    { label: "Bioclimatic Pergolas", href: "/collections/bioclimatic" },
    { label: "Wooden Pergolas", href: "/collections/wooden" },
    { label: "Awnings", href: "/collections/awnings" },
    { label: "Custom Designs", href: "/custom-designs" },
    { label: "Super Deals", href: "/collections/deals" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Why Wasleen", href: "/why-wasleen" },
    { label: "Showrooms", href: "/showrooms" },
    { label: "Certifications", href: "/certifications" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  resources: [
    { label: "Buying Guide", href: "/buying-guide" },
    { label: "Installation", href: "/installation" },
    { label: "Maintenance", href: "/maintenance" },
    { label: "Blog", href: "/blog" },
    { label: "FAQs", href: "/faqs" },
    { label: "Warranty", href: "/warranty" },
  ],
  support: [
    { label: "Track Order", href: "/track-order" },
    { label: "Shipping", href: "/policies/shipping" },
    { label: "Returns", href: "/policies/returns" },
    { label: "Terms of Service", href: "/policies/terms" },
    { label: "Privacy Policy", href: "/policies/privacy" },
    { label: "Free Consultation", href: "/consultation" },
  ],
};

const SOCIALS = [
  { icon: FacebookIcon, href: "https://facebook.com/wasleen", label: "Facebook" },
  { icon: InstagramIcon, href: "https://instagram.com/wasleen", label: "Instagram" },
  { icon: LinkedInIcon, href: "https://linkedin.com/company/wasleen", label: "LinkedIn" },
  { icon: YouTubeIcon, href: "https://youtube.com/@wasleen", label: "YouTube" },
  { icon: TikTokIcon, href: "https://tiktok.com/@wasleen", label: "TikTok" },
  { icon: PinterestIcon, href: "https://pinterest.com/wasleen", label: "Pinterest" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-neutral-300">
      {/* Newsletter Section */}
      <div className="border-b border-neutral-800">
        <div className="container-site section-py max-w-7xl">
          <div className="flex flex-col flex-wrap md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="type-h3 text-white mb-2">Join the Wasleen Club</h3>
              <p className="type-body-sm text-neutral-400">
                Subscribe to receive exclusive deals, new product reveals, and design inspiration for your outdoor space.
              </p>
            </div>
            <FooterNewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-site section-py max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8">
          
          {/* Brand Column (takes up 2 columns out of 6 conceptually) */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block" aria-label="Wasleen Pergolas Home">
              <span className="text-2xl font-bold tracking-tight text-white font-heading">
                WASLEEN
              </span>
            </Link>
            <p className="type-body-sm leading-relaxed text-neutral-400 max-w-sm">
              The UAE's premier supplier of luxury Aluminium pergolas, bioclimatic solutions, and high-end outdoor closures. Transform your outdoor living today.
            </p>

            <ul className="space-y-3 type-body-sm text-neutral-400">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-gold shrink-0" />
                <span>Dubai Design District, Building 3, UAE</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gold shrink-0" />
                <a
                  href={`tel:+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971567648220"}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  +{process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971567648220"}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gold shrink-0" />
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@wasleen.com"}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@wasleen.com"}
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3 pt-2">
              {SOCIALS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-gold hover:text-primary transition-colors duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Shop */}
            <div className="space-y-5">
              <h4 className="text-white font-semibold type-label-lg tracking-wide">Shop</h4>
              <ul className="space-y-3 type-body-sm">
                {FOOTER_LINKS.shop.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-gold transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-5">
              <h4 className="text-white font-semibold type-label-lg tracking-wide">Company</h4>
              <ul className="space-y-3 type-body-sm">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-gold transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-5">
              <h4 className="text-white font-semibold type-label-lg tracking-wide">Resources</h4>
              <ul className="space-y-3 type-body-sm">
                {FOOTER_LINKS.resources.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-gold transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-5">
              <h4 className="text-white font-semibold type-label-lg tracking-wide">Support</h4>
              <ul className="space-y-3 type-body-sm">
                {FOOTER_LINKS.support.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-gold transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-neutral-800">
        <div className="container-site max-w-7xl py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 type-body-sm text-neutral-500 text-center md:text-left">
            <span>&copy; {new Date().getFullYear()} Wasleen Pergolas LLC. All rights reserved.</span>
            <span className="hidden md:inline-block">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold"></span>
              <span aria-label="Official DED Licensed Provider">DED Licensed Supplier</span>
            </div>
          </div>
          <div className="flex items-center gap-6 type-body-sm font-medium">
            <Link href="/policies/terms" className="hover:text-gold transition-colors duration-200">
              Terms
            </Link>
            <Link href="/policies/privacy" className="hover:text-gold transition-colors duration-200">
              Privacy
            </Link>
            <Link href="/sitemap" className="hover:text-gold transition-colors duration-200">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
