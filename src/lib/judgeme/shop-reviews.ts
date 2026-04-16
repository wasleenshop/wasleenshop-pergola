/**
 * lib/judgeme/shop-reviews.ts
 *
 * Fetches shop-level customer reviews from Judge.me.
 * Used by the homepage TestimonialsCarousel section.
 *
 * Uses the public API token — silent degradation on failure.
 * Cached for 1 hour via Next.js fetch cache.
 */

export interface ShopReview {
  id: number;
  title: string;
  body: string;
  rating: number;
  reviewerName: string;
  publishedAt: string;
  productTitle: string;
}

/**
 * Fetch the latest high-rating reviews for the shop.
 *
 * @param count - Number of reviews to return (default: 6)
 * @returns     - Array of reviews, empty on error or no data
 */
export async function getShopReviews(count = 6): Promise<ShopReview[]> {
  const shopDomain = process.env.NEXT_PUBLIC_JUDGEME_SHOP_DOMAIN;
  const apiToken = process.env.NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN;

  if (!shopDomain || !apiToken) return [];

  try {
    const url =
      `https://judge.me/api/v1/reviews` +
      `?api_token=${apiToken}` +
      `&shop_domain=${shopDomain}` +
      `&per_page=${count}` +
      `&page=1` +
      `&rating=5`; // Only 5-star reviews for homepage

    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // 1 hour
    });

    if (!res.ok) return [];

    const data = (await res.json()) as {
      reviews?: Array<{
        id: number;
        title?: string;
        body?: string;
        rating?: number;
        reviewer?: { name?: string };
        published_at?: string;
        product_title?: string;
      }>;
    };

    if (!Array.isArray(data.reviews)) return [];

    return data.reviews
      .filter((r) => r.body && r.body.trim().length > 20)
      .map((r) => ({
        id: r.id,
        title: r.title?.trim() ?? "",
        body: r.body?.trim() ?? "",
        rating: r.rating ?? 5,
        reviewerName: r.reviewer?.name?.trim() ?? "Verified Customer",
        publishedAt: r.published_at ?? "",
        productTitle: r.product_title?.trim() ?? "",
      }));
  } catch {
    // Silent degradation — reviews are non-critical
    return [];
  }
}
