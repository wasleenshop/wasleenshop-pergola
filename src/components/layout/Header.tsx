"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Search, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// WhatsApp icon — brand icon, not available in lucide-react
// ─────────────────────────────────────────────────────────────────

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Navigation structure
// TODO: Replace with Shopify Menu API (getMenu query) once wired
// ─────────────────────────────────────────────────────────────────

interface NavChild {
  label: string;
  href: string;
  desc?: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  accent?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Pergolas",
    href: "/collections/pergolas",
    children: [
      { label: "Aluminium Pergolas",   href: "/collections/aluminium-pergolas",   desc: "Modern & durable" },
      { label: "Bioclimatic Pergolas", href: "/collections/bioclimatic-pergolas", desc: "Louvred roof control" },
      { label: "Wooden Pergolas",      href: "/collections/wooden-pergolas",      desc: "Classic warmth" },
      { label: "View All Pergolas",    href: "/collections/pergolas",             desc: "Browse every model" },
    ],
  },
  { label: "Awnings",           href: "/collections/awnings" },
  { label: "Umbrellas & Tents", href: "/collections/umbrellas-tents" },
  { label: "Super Deals",       href: "/collections/deals", accent: true },
  { label: "About",             href: "/about" },
];

const WHATSAPP_URL = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "971567648220"}`;

// ─────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────

export interface HeaderProps {
  /**
   * Cart item count for the badge.
   * Pass 0 (or omit) until CartContext is wired in.
   */
  cartCount?: number;
}

// ─────────────────────────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────────────────────────

function Logo({ light }: { light: boolean }) {
  return (
    <Link
      href="/"
      className="flex flex-col leading-none shrink-0 focus-visible:outline-gold"
      aria-label="Wasleen Pergolas — Home"
    >
      <span
        className={cn(
          "font-heading text-xl lg:text-[1.375rem] font-bold tracking-[0.1em] uppercase",
          "transition-colors duration-300",
          light ? "text-white" : "text-white"
        )}
      >
        Wasleen
      </span>
      <span className="text-[0.5rem] tracking-[0.28em] uppercase font-sans font-semibold text-gold">
        Pergolas
      </span>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────
// Desktop dropdown
// ─────────────────────────────────────────────────────────────────

function DropdownMenu({
  children,
  open,
}: {
  children: NavChild[];
  open: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute top-full left-1/2 -translate-x-1/2 pt-3 z-10",
        "transition-all duration-200 ease-out",
        open
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-1 pointer-events-none"
      )}
      role="menu"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 overflow-hidden min-w-[220px]">
        {children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            role="menuitem"
            className={cn(
              "flex flex-col px-5 py-3.5",
              "hover:bg-sand transition-colors duration-150",
              "group/item border-b border-neutral-50 last:border-0"
            )}
          >
            <span className="text-sm font-semibold text-primary group-hover/item:text-gold transition-colors duration-150">
              {child.label}
            </span>
            {child.desc && (
              <span className="text-xs text-neutral-400 mt-0.5">{child.desc}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isScrolled,      setIsScrolled]      = useState(false);
  const [mobileOpen,      setMobileOpen]       = useState(false);
  const [activeDropdown,  setActiveDropdown]   = useState<string | null>(null);
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Scroll detection ──────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll(); // sync on mount (avoids flash)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Keyboard / route-change close ─────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Lock body scroll when mobile nav is open ──────────────────
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ── Dropdown hover helpers ────────────────────────────────────
  const openDropdown = (label: string) => {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current);
    setActiveDropdown(label);
  };

  const closeDropdown = () => {
    dropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  // Transparent only when NOT scrolled AND mobile menu is closed
  const isTransparent = !isScrolled && !mobileOpen;

  // Icon colour classes
  const iconCls = cn(
    "p-2.5 rounded-full transition-colors duration-200",
    "text-white/80 hover:text-white hover:bg-white/10"
  );

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          Header bar
      ══════════════════════════════════════════════════════════ */}
      <header
        className={cn(
          "sticky top-0 z-[30]",
          "transition-all duration-300 ease-in-out",
          isTransparent
            ? "bg-transparent"
            : "bg-primary/95 backdrop-blur-md shadow-[0_1px_0_0_rgb(255_255_255/0.06)]"
        )}
      >
        <div className="container-site">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Logo light={isTransparent} />

            {/* ── Desktop navigation ────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
              {NAV_ITEMS.map((item) =>
                item.children ? (
                  // Nav item with dropdown
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => openDropdown(item.label)}
                    onMouseLeave={closeDropdown}
                  >
                    <button
                      className={cn(
                        "flex items-center gap-1 px-4 py-2 rounded-full",
                        "text-sm font-medium transition-colors duration-200",
                        "text-white/80 hover:text-white hover:bg-white/8"
                      )}
                      aria-haspopup="true"
                      aria-expanded={activeDropdown === item.label}
                    >
                      {item.label}
                      <svg
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          activeDropdown === item.label && "rotate-180"
                        )}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <DropdownMenu
                      children={item.children}
                      open={activeDropdown === item.label}
                    />
                  </div>
                ) : (
                  // Plain nav link
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium",
                      "transition-colors duration-200",
                      item.accent
                        ? "text-gold hover:text-gold-light font-semibold"
                        : "text-white/80 hover:text-white hover:bg-white/8"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            {/* ── Utility icons ─────────────────────────────────── */}
            <div className="flex items-center gap-0.5">

              {/* WhatsApp — desktop only */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "hidden lg:flex items-center gap-2",
                  "px-4 py-2 rounded-full",
                  "text-xs font-semibold transition-all duration-200",
                  "border",
                  isTransparent
                    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                    : "bg-gold/15 border-gold/30 text-gold hover:bg-gold/25"
                )}
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                Get a Quote
              </a>

              {/* Search */}
              <button className={iconCls} aria-label="Search products">
                <Search size={18} aria-hidden="true" />
              </button>

              {/* Account — hidden on mobile */}
              <Link
                href="/account"
                className={cn(iconCls, "hidden md:flex")}
                aria-label="My Account"
              >
                <User size={18} aria-hidden="true" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className={cn(iconCls, "relative")}
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount > 1 ? "s" : ""}` : ""}`}
              >
                <ShoppingBag size={18} aria-hidden="true" />
                {cartCount > 0 && (
                  <span
                    className={cn(
                      "absolute -top-0.5 -right-0.5",
                      "min-w-[1.1rem] h-[1.1rem] px-[0.2rem]",
                      "rounded-full bg-gold text-primary",
                      "text-[10px] font-bold leading-none",
                      "flex items-center justify-center"
                    )}
                    aria-hidden="true"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Hamburger — mobile only */}
              <button
                className={cn(iconCls, "lg:hidden ml-1")}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                {mobileOpen
                  ? <X    size={22} aria-hidden="true" />
                  : <Menu size={22} aria-hidden="true" />
                }
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          Mobile navigation drawer
      ══════════════════════════════════════════════════════════ */}

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[28] bg-primary/50 backdrop-blur-sm",
          "transition-opacity duration-300 lg:hidden",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <nav
        id="mobile-nav"
        className={cn(
          "fixed inset-y-0 right-0 z-[29]",
          "w-full max-w-[320px] bg-primary",
          "flex flex-col overflow-y-auto overscroll-contain",
          "transition-transform duration-300 ease-out",
          "lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}
        inert={!mobileOpen ? true : undefined}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <Link
            href="/"
            className="flex flex-col leading-none"
            onClick={() => setMobileOpen(false)}
            aria-label="Wasleen Pergolas — Home"
          >
            <span className="font-heading text-xl font-bold tracking-[0.1em] uppercase text-sand">
              Wasleen
            </span>
            <span className="text-[0.5rem] tracking-[0.28em] uppercase font-sans font-semibold text-gold">
              Pergolas
            </span>
          </Link>
          <button
            className="p-2 text-sand/60 hover:text-sand rounded-full transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 px-3 py-5 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3.5 rounded-xl",
                  "text-base font-medium transition-colors duration-150",
                  item.accent
                    ? "text-gold font-semibold"
                    : "text-sand/80 hover:text-sand hover:bg-white/5"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>

              {/* Sub-links */}
              {item.children && (
                <div className="ml-4 pl-4 mb-2 mt-0.5 border-l border-white/10 space-y-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="flex px-4 py-2.5 text-sm text-sand/50 hover:text-gold rounded-lg transition-colors duration-150"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Drawer footer */}
        <div className="px-5 py-6 border-t border-white/8 space-y-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full justify-center text-sm"
            onClick={() => setMobileOpen(false)}
          >
            <WhatsAppIcon className="w-4 h-4" />
            Get a Free Quote
          </a>
          <Link
            href="/account"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl",
              "text-sm font-medium text-sand/60 hover:text-sand hover:bg-white/5",
              "transition-colors duration-150"
            )}
            onClick={() => setMobileOpen(false)}
          >
            <User size={16} aria-hidden="true" />
            My Account
          </Link>
        </div>
      </nav>
    </>
  );
}
