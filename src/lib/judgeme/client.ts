import type { ProductRating } from "./types";
import { getJudgemeEndpoint, parseRatingResponse } from "./utils";

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function getProductRating(
  productId: string,
  attempt = 0
): Promise<ProductRating | null> {
  const endpoint = getJudgemeEndpoint(productId);

  // getJudgemeEndpoint returns "" when env vars are missing
  if (!endpoint) return null;

  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (res.status === 429) {
      if (attempt < MAX_RETRIES) {
        const backoff = BASE_RETRY_DELAY * Math.pow(2, attempt);
        await delay(backoff);
        return getProductRating(productId, attempt + 1);
      }
      return null;
    }

    // 404 = product has no reviews yet — not an error
    if (res.status === 404) return null;

    if (!res.ok) {
      throw new Error(`Judge.me API error: ${res.status}`);
    }

    const data: unknown = await res.json();
    return parseRatingResponse(data, productId);
  } catch {
    // Silent degradation — ratings are non-critical
    return null;
  }
}
