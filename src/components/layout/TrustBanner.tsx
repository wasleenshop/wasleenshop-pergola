import React from 'react';

export interface TrustBannerItem {
  id: string;
  text: string;
  icon?: string | null;
}

export interface TrustBannerProps {
  /**
   * Items to display in the trust banner.
   * As per the Zero-Hardcoding law, these should ideally come from Shopify Metaobjects
   * or Storefront API. If not provided, falls back to the default items.
   */
  items?: TrustBannerItem[];
}

const DEFAULT_ITEMS: TrustBannerItem[] = [
  { id: '1', text: 'Free Expert Installation', icon: '🔧' },
  { id: '2', text: 'DED Licensed Supplier', icon: '🏛️' },
  { id: '3', text: '5-Year Warranty', icon: '🛡️' },
  { id: '4', text: 'Dubai Climate Tested', icon: '☀️' },
  { id: '5', text: 'Made in UAE', icon: '🇦🇪' },
  { id: '6', text: '24/7 WhatsApp Support', icon: '📞' },
  { id: '7', text: 'Free Delivery UAE-Wide', icon: '🚚' },
  { id: '8', text: 'Install in 48 Hours', icon: '⚡' },
];

export function TrustBanner({ items = DEFAULT_ITEMS }: TrustBannerProps) {
  if (!items || items.length === 0) return null;

  // We duplicate the items to create a seamless infinite scroll effect.
  // The CSS animation translates the track from 0 to -50%.
  const scrollItems = [...items, ...items];

  return (
    <section 
      className="relative w-full overflow-hidden bg-[image:var(--gradient-gold)] py-2.5 text-primary"
      aria-label="Trust and Guarantees Banner"
    >
      {/* 
        The pr-[4rem] is critical! It perfectly offsets the CSS `gap: 4rem` 
        so that exactly 50% width of this track aligns with the first item 
        of the duplicated set, preventing any jump in the infinite animation.
      */}
      <div 
        className="trust-track flex w-max items-center pr-[4rem]"
        aria-hidden="true"
      >
        {scrollItems.map((item, index) => (
          <div 
            key={`trust-item-${item.id}-${index}`} 
            className="flex items-center gap-2 whitespace-nowrap type-label-lg"
          >
            {item.icon && <span>{item.icon}</span>}
            <span className="font-semibold tracking-wide">{item.text}</span>
          </div>
        ))}
      </div>

      {/* Accessible list for screen readers (hides the animated track) */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={`sr-item-${item.id}`}>
            {item.icon} {item.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
