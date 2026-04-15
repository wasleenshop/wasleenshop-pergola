/**
 * lib/shopify/client.ts
 *
 * Core GraphQL client for the Shopify Storefront API.
 *
 * Architecture:
 *  - Uses native `fetch` (available in Next.js / Node 18+) for
 *    full compatibility with Next.js 16's `'use cache'` directive.
 *  - Caching is NOT applied here — it is applied at the query-
 *    function level using `'use cache'` + `cacheLife()`.
 *  - Includes retry logic with exponential back-off for rate limits.
 *  - Validates env vars at module load time (server-only).
 */

import { SHOPIFY_API_VERSION } from "./constants";
import type { ShopifyResponse, ShopifyError } from "./types";

// ── Env validation ───────────────────────────────────────────

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Shopify Client] Missing required environment variable: ${key}. ` +
        `Check your .env.local file.`
    );
  }
  return value;
}

// ── Client-safe endpoint builder ────────────────────────────

function getStorefrontEndpoint(): string {
  const domain = getEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
  return `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

function getStorefrontToken(): string {
  return getEnv("NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN");
}

// ── Error types ──────────────────────────────────────────────

export class ShopifyClientError extends Error {
  public readonly errors: ShopifyError[];
  public readonly status: number;

  constructor(message: string, errors: ShopifyError[], status: number) {
    super(message);
    this.name = "ShopifyClientError";
    this.errors = errors;
    this.status = status;
  }
}

export class ShopifyRateLimitError extends Error {
  public readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super(`[Shopify Client] Rate limited. Retry after ${retryAfterMs}ms.`);
    this.name = "ShopifyRateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

export class ShopifyNetworkError extends Error {
  constructor(cause: unknown) {
    super(`[Shopify Client] Network error: ${String(cause)}`);
    this.name = "ShopifyNetworkError";
    this.cause = cause;
  }
}

// ── Retry helper ─────────────────────────────────────────────

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 500;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Core GraphQL fetch ────────────────────────────────────────

interface FetchOptions {
  query: string;
  variables?: Record<string, unknown>;
  /** Optional: add tags to the underlying fetch for CDN cache-busting */
  tags?: string[];
  /** Pass the buyer's access token for protected Storefront API endpoints */
  customerAccessToken?: string;
}

/**
 * Low-level Shopify Storefront GraphQL fetch.
 *
 * DO NOT call this directly from pages/components.
 * Use the typed query functions in `queries/` instead.
 *
 * Caching is handled at the query-function level via `'use cache'`.
 */
export async function shopifyFetch<T>(
  options: FetchOptions
): Promise<ShopifyResponse<T>> {
  const { query, variables, customerAccessToken } = options;

  const endpoint = getStorefrontEndpoint();
  const token = getStorefrontToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Shopify-Storefront-Access-Token": token,
    "X-SDK-Variant": "javascript",
    "X-SDK-Version": "storefront-api-2024-10",
  };

  if (customerAccessToken) {
    headers["X-Shopify-Customer-Access-Token"] = customerAccessToken;
  }

  const body = JSON.stringify({
    query,
    variables: variables ?? {},
  });

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
        // NOTE: Do NOT set cache options here.
        // Caching is managed at the query-function level with 'use cache'.
      });

      // Handle 429 rate limit
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get("Retry-After");
        const retryAfterMs = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : BASE_RETRY_DELAY_MS * 2 ** attempt;

        if (attempt < MAX_RETRIES - 1) {
          await sleep(retryAfterMs);
          continue;
        }
        throw new ShopifyRateLimitError(retryAfterMs);
      }

      // Handle unexpected status codes
      if (!response.ok && response.status !== 200) {
        const text = await response.text().catch(() => "");
        throw new ShopifyClientError(
          `[Shopify Client] HTTP ${response.status}: ${response.statusText}. ${text}`,
          [],
          response.status
        );
      }

      const json = (await response.json()) as ShopifyResponse<T>;

      // Surface GraphQL-level errors
      if (json.errors && json.errors.length > 0) {
        const messages = json.errors.map((e) => e.message).join("; ");
        throw new ShopifyClientError(
          `[Shopify Client] GraphQL errors: ${messages}`,
          json.errors,
          response.status
        );
      }

      // Warn about high query cost in development
      if (
        process.env.NODE_ENV === "development" &&
        json.extensions?.cost?.actualQueryCost !== undefined
      ) {
        const { actualQueryCost, throttleStatus } = json.extensions.cost;
        if (actualQueryCost > 500) {
          console.warn(
            `[Shopify] High query cost: ${actualQueryCost} points. ` +
              `Available: ${throttleStatus.currentlyAvailable}`
          );
        }
      }

      return json;
    } catch (error) {
      // Don't retry on GraphQL errors or client errors — only network errors
      if (
        error instanceof ShopifyClientError ||
        error instanceof ShopifyRateLimitError
      ) {
        throw error;
      }

      lastError = error;

      if (attempt < MAX_RETRIES - 1) {
        const delay = BASE_RETRY_DELAY_MS * 2 ** attempt;
        await sleep(delay);
      }
    }
  }

  throw new ShopifyNetworkError(lastError);
}

// ── Typed fetch wrapper ───────────────────────────────────────

/**
 * Typed Shopify fetch that extracts data and throws on errors.
 * Use this in all query/mutation functions.
 */
export async function shopifyQuery<TData, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  variables?: TVariables,
  options?: { customerAccessToken?: string }
): Promise<TData> {
  const response = await shopifyFetch<TData>({
    query,
    variables,
    customerAccessToken: options?.customerAccessToken,
  });

  if (!response.data) {
    throw new ShopifyClientError(
      "[Shopify Client] No data returned from API.",
      response.errors ?? [],
      500
    );
  }

  return response.data;
}

// ── Admin API client (server-only, never expose to client) ───

/**
 * For Admin API calls (webhooks, metafield writes, etc).
 * MUST only be called from:
 *  - Next.js Route Handlers (app/api/)
 *  - Server Actions
 * NEVER import in Client Components.
 */
export async function shopifyAdminFetch<T>(options: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<ShopifyResponse<T>> {
  const domain = getEnv("NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN");
  const token = getEnv("SHOPIFY_ADMIN_ACCESS_TOKEN");
  const endpoint = `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({
        query: options.query,
        variables: options.variables ?? {},
      }),
    });

    if (!response.ok) {
      throw new ShopifyClientError(
        `[Shopify Admin] HTTP ${response.status}`,
        [],
        response.status
      );
    }

    return response.json() as Promise<ShopifyResponse<T>>;
  } catch (error) {
    if (error instanceof ShopifyClientError) throw error;
    throw new ShopifyNetworkError(error);
  }
}
