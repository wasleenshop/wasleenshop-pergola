"use client";

/**
 * WasleenCommitment.tsx
 *
 * Bordered block listing the four Wasleen service pillars.
 * Each row opens a portal Modal explaining the specific policy,
 * with a "Learn more" link to the relevant /policies/[type] page.
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Truck, Wrench, RefreshCcw, Shield, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Policy definitions
// ─────────────────────────────────────────────────────────────────

type PolicyKey = "shipping" | "installation" | "returns" | "privacy";

interface PolicyDefinition {
  icon: React.ReactNode;
  title: string;
  description: string;
  policyPage: string;
}

const POLICIES: Record<PolicyKey, PolicyDefinition> = {
  shipping: {
    icon: <Truck size={18} aria-hidden="true" />,
    title: "Free Shipping",
    description:
      "We deliver free across all UAE Emirates — Dubai, Abu Dhabi, Sharjah, Ajman, and beyond. Orders are dispatched within 1–2 business days, with live tracking provided at every step.",
    policyPage: "/policies/shipping-policy",
  },
  installation: {
    icon: <Wrench size={18} aria-hidden="true" />,
    title: "Free Expert Installation",
    description:
      "Every pergola purchase includes free, professional installation by our certified UAE team. Typical projects are completed in 1–3 days. We handle site survey, assembly, anchoring, and final inspection.",
    policyPage: "/policies/installation-policy",
  },
  returns: {
    icon: <RefreshCcw size={18} aria-hidden="true" />,
    title: "Return & Refund Policy",
    description:
      "Your satisfaction is our priority. Standard stock items may be returned within 14 days in original, undamaged condition. Custom-fabricated products are non-refundable once production has begun.",
    policyPage: "/policies/refund-policy",
  },
  privacy: {
    icon: <Shield size={18} aria-hidden="true" />,
    title: "Security & Privacy",
    description:
      "Your data is protected with industry-standard SSL encryption. We never sell or share your personal information. All payment transactions are processed securely through Shopify Payments.",
    policyPage: "/policies/privacy-policy",
  },
};

const POLICY_KEYS = Object.keys(POLICIES) as PolicyKey[];

// ─────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────

function PolicyModal({
  policyKey,
  onClose,
}: {
  policyKey: PolicyKey;
  onClose: () => void;
}) {
  const policy = POLICIES[policyKey];

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="commitment-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-primary to-primary-light px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-gold flex-shrink-0">{policy.icon}</span>
            <h2
              id="commitment-modal-title"
              className="text-lg font-semibold text-white font-heading leading-tight"
            >
              {policy.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-neutral-600 leading-relaxed text-sm">
            {policy.description}
          </p>

          <Link
            href={policy.policyPage}
            onClick={onClose}
            className="btn btn-ghost w-full flex items-center justify-center"
          >
            Learn more
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export function WasleenCommitment() {
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-200 bg-sand/50">
          <h3 className="text-xs font-semibold text-gold tracking-widest uppercase">
            Wasleen Commitment
          </h3>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-100">
          {POLICY_KEYS.map((key) => {
            const policy = POLICIES[key];
            return (
              <button
                key={key}
                onClick={() => setActivePolicy(key)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5",
                  "hover:bg-sand/50 transition-colors duration-150 text-left",
                  "focus-visible:outline-none focus-visible:bg-sand/50"
                )}
              >
                <span className="text-gold flex-shrink-0">{policy.icon}</span>
                <span className="text-sm font-medium text-primary flex-1">
                  {policy.title}
                </span>
                <ChevronRight
                  size={16}
                  className="text-neutral-400 flex-shrink-0"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal — portal rendered, only when mounted & policy selected */}
      {mounted && activePolicy && (
        <PolicyModal
          policyKey={activePolicy}
          onClose={() => setActivePolicy(null)}
        />
      )}
    </>
  );
}
