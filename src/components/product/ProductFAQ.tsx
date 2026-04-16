"use client";

/**
 * ProductFAQ.tsx
 *
 * Accordion FAQ section shown below the product tabs.
 * Questions are standard pergola / Wasleen FAQs — content that applies
 * to every product page equally. If product-specific FAQs are later added
 * to Shopify as a metaobject, they can be passed in via `extraItems`.
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

interface FAQItem {
  question: string;
  answer: string;
}

// ─────────────────────────────────────────────────────────────────
// FAQ data — standard Wasleen pergola questions
// ─────────────────────────────────────────────────────────────────

const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    question: "How long does installation take?",
    answer:
      "Most pergola installations are completed in 1–3 days by our certified crew. Large bioclimatic pergola systems or multi-bay setups may take 3–5 days. After your order is confirmed, our team will visit for a site survey and give you an exact timeline.",
  },
  {
    question: "What's included in the warranty?",
    answer:
      "All Wasleen pergolas come with a 5-year structural warranty covering manufacturing defects, frame integrity, and finish quality. Motorised systems carry a 2-year warranty on motors and electronics. Installation workmanship is guaranteed for 1 year.",
  },
  {
    question: "Can I customise the dimensions?",
    answer:
      "Yes — all our aluminium pergolas can be fabricated to custom dimensions. Select your size using the options above, or for non-standard requirements use the WhatsApp Quote button and our team will guide you through the custom design process.",
  },
  {
    question: "What maintenance is required?",
    answer:
      "Wasleen pergolas are low-maintenance. Rinse the aluminium frame with fresh water every 3–6 months to remove dust and salt deposits. For retractable roofs, lubricate the track guides annually. Avoid abrasive cleaners that can damage the powder-coat finish.",
  },
  {
    question: "Is the pergola suitable for UAE weather conditions?",
    answer:
      "Absolutely. Every Wasleen pergola is Dubai-climate tested to withstand temperatures above 50°C, wind speeds of up to 120 km/h, and intense UV exposure. The aluminium frame is powder-coated to resist corrosion from humidity and coastal salt air.",
  },
  {
    question: "Do you deliver outside Dubai?",
    answer:
      "We deliver and install across all UAE Emirates — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain. Delivery is free UAE-wide.",
  },
];

// ─────────────────────────────────────────────────────────────────
// Sub-component: single accordion item
// ─────────────────────────────────────────────────────────────────

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const id = `faq-answer-${index}`;
  const triggerId = `faq-trigger-${index}`;

  return (
    <div className="border-b border-neutral-200 last:border-none">
      <button
        id={triggerId}
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between gap-4",
          "py-5 text-left",
          "transition-colors duration-150",
          "hover:text-gold",
          isOpen ? "text-gold" : "text-primary"
        )}
      >
        <span className="text-sm font-semibold leading-snug">
          {item.question}
        </span>
        <ChevronDown
          size={18}
          className={cn(
            "flex-shrink-0 transition-transform duration-300",
            isOpen ? "rotate-180 text-gold" : "text-neutral-400"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Collapsed content — height animated via max-height */}
      <div
        id={id}
        role="region"
        aria-labelledby={triggerId}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        )}
      >
        <p className="text-sm text-neutral-600 leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export interface ProductFAQProps {
  /** Extra product-specific FAQ items prepended before the defaults. */
  extraItems?: FAQItem[];
}

export function ProductFAQ({ extraItems = [] }: ProductFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [...extraItems, ...DEFAULT_FAQ_ITEMS];

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="type-h2 mb-8">
        Frequently Asked Questions
      </h2>

      <div
        className="divide-y divide-neutral-200 border-t border-neutral-200"
        role="list"
      >
        {items.map((item, i) => (
          <div key={item.question} role="listitem">
            <AccordionItem
              item={item}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
              index={i}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
