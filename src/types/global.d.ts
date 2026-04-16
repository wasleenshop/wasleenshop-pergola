declare global {
  interface Window {
    Shopify?: unknown;
    tidioChatApi?: unknown;
    JudgeMe?: unknown;

    /** Klaviyo async queue — push tracking calls before the SDK loads */
    _learnq?: Array<unknown[]>;

    /**
     * Google Tag Manager / GA4 dataLayer.
     * Typed loosely so both GTM event objects and GA4 ecommerce
     * objects can be pushed without additional casting.
     */
    dataLayer?: Array<Record<string, unknown>>;

    /**
     * GA4 global site tag function.
     * Available after the gtag.js snippet has loaded.
     */
    gtag?: (...args: unknown[]) => void;
  }
}

export {};
