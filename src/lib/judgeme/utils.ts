// Helper functions for Judge.me interactions
import { ProductRating } from "./types";

export function getJudgemeEndpoint(productId: string): string {
  const shopDomain = process.env.NEXT_PUBLIC_JUDGEME_SHOP_DOMAIN;
  const apiToken = process.env.NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN;
  
  if (!shopDomain || !apiToken) {
    console.warn("Missing Judge.me environment variables");
    return "";
  }

  // Uses Public API endpoint for average ratings to preserve Private token security on standard requests
  return `https://judge.me/api/v1/reviews/average?shop_domain=${shopDomain}&api_token=${apiToken}&external_id=${productId}`;
}

export function parseRatingResponse(data: unknown, productId: string): ProductRating | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.rating !== "number" || typeof d.count !== "number") return null;
  return { rating: d.rating, count: d.count, productId };
}
