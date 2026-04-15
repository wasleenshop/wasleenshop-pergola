/**
 * lib/shopify/queries/customer.ts
 *
 * Customer-related GraphQL queries.
 *
 * Note: Customer data is personal and per-user — NEVER cached
 * globally. Use React.cache() for per-request memoisation only.
 */

import "server-only";

import { cache } from "react";
import { shopifyQuery } from "../client";
import type {
  Customer,
  Order,
  CustomerAddress,
  Connection,
  PaginatedResult,
} from "../types";

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

const GET_CUSTOMER_QUERY = /* GraphQL */ `
  query GetCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      email
      firstName
      lastName
      displayName
      phone
      createdAt
      defaultAddress {
        id
        firstName
        lastName
        company
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    image {
                      url
                      altText
                      width
                      height
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
        }
      }
    }
  }
`;

const GET_CUSTOMER_ORDERS_QUERY = /* GraphQL */ `
  query GetCustomerOrders(
    $customerAccessToken: String!
    $first: Int!
    $after: String
  ) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(
        first: $first
        after: $after
        sortKey: PROCESSED_AT
        reverse: true
      ) {
        edges {
          cursor
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            currentTotalPrice {
              amount
              currencyCode
            }
            lineItems(first: 3) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    id
                    title
                    price { amount currencyCode }
                    image { url altText width height }
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
        }
      }
    }
  }
`;

const GET_CUSTOMER_ADDRESSES_QUERY = /* GraphQL */ `
  query GetCustomerAddresses(
    $customerAccessToken: String!
    $first: Int!
  ) {
    customer(customerAccessToken: $customerAccessToken) {
      defaultAddress { id }
      addresses(first: $first) {
        edges {
          node {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// Normalise helpers (local — customer data is snake_case free)
// ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseCustomer(raw: any): Customer {
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName ?? null,
    lastName: raw.lastName ?? null,
    displayName: raw.displayName,
    phone: raw.phone ?? null,
    createdAt: raw.createdAt,
    defaultAddress: raw.defaultAddress ?? null,
    addresses: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      edges: (raw.addresses?.edges ?? []).map((e: any) => ({
        node: e.node,
        cursor: e.cursor ?? "",
      })),
      pageInfo: raw.addresses?.pageInfo ?? {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    orders: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      edges: (raw.orders?.edges ?? []).map((e: any) => ({
        node: {
          id: e.node.id,
          orderNumber: e.node.orderNumber,
          processedAt: e.node.processedAt,
          financialStatus: e.node.financialStatus ?? null,
          fulfillmentStatus: e.node.fulfillmentStatus,
          currentTotalPrice: e.node.currentTotalPrice,
          lineItems: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            edges: (e.node.lineItems?.edges ?? []).map((li: any) => ({
              node: li.node,
              cursor: li.cursor ?? "",
            })),
            pageInfo: e.node.lineItems?.pageInfo ?? {
              hasNextPage: false,
              hasPreviousPage: false,
            },
          },
        },
        cursor: e.cursor ?? "",
      })),
      pageInfo: raw.orders?.pageInfo ?? {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Query functions
// ─────────────────────────────────────────────────────────────

/**
 * Fetch full customer profile.
 * Wrapped in React.cache() for per-request memoisation.
 * NEVER use 'use cache' here — this data is personal.
 */
export const getCustomer = cache(
  async (customerAccessToken: string): Promise<Customer | null> => {
    interface ApiResponse {
      customer: unknown | null;
    }

    try {
      const data = await shopifyQuery<ApiResponse>(
        GET_CUSTOMER_QUERY,
        { customerAccessToken },
        { customerAccessToken }
      );

      if (!data.customer) return null;
      return normaliseCustomer(data.customer);
    } catch {
      // Token may be expired — return null for graceful logout
      return null;
    }
  }
);

/**
 * Fetch paginated customer orders.
 * NEVER cached — always fresh, per-user data.
 */
export async function getCustomerOrders(options: {
  customerAccessToken: string;
  first?: number;
  after?: string;
}): Promise<PaginatedResult<Order>> {
  const { customerAccessToken, first = 10, after } = options;

  interface ApiResponse {
    customer: {
      orders: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        edges: Array<{ node: any; cursor: string }>;
        pageInfo: {
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          endCursor?: string;
        };
      };
    } | null;
  }

  const data = await shopifyQuery<ApiResponse>(
    GET_CUSTOMER_ORDERS_QUERY,
    { customerAccessToken, first, after: after ?? null },
    { customerAccessToken }
  );

  if (!data.customer) {
    return {
      items: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
    };
  }

  return {
    items: data.customer.orders.edges.map((e) => ({
      id: e.node.id,
      orderNumber: e.node.orderNumber,
      processedAt: e.node.processedAt,
      financialStatus: e.node.financialStatus ?? null,
      fulfillmentStatus: e.node.fulfillmentStatus,
      currentTotalPrice: e.node.currentTotalPrice,
      lineItems: {
        edges: e.node.lineItems.edges.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (li: any) => ({ node: li.node, cursor: "" })
        ),
        pageInfo: { hasNextPage: false, hasPreviousPage: false },
      },
    })),
    pageInfo: data.customer.orders.pageInfo,
  };
}

/**
 * Fetch all saved addresses for the customer.
 */
export async function getCustomerAddresses(
  customerAccessToken: string
): Promise<{
  addresses: CustomerAddress[];
  defaultAddressId: string | null;
}> {
  interface ApiResponse {
    customer: {
      defaultAddress: { id: string } | null;
      addresses: Connection<CustomerAddress>;
    } | null;
  }

  const data = await shopifyQuery<ApiResponse>(
    GET_CUSTOMER_ADDRESSES_QUERY,
    { customerAccessToken, first: 20 },
    { customerAccessToken }
  );

  if (!data.customer) {
    return { addresses: [], defaultAddressId: null };
  }

  return {
    addresses: data.customer.addresses.edges.map((e) => e.node),
    defaultAddressId: data.customer.defaultAddress?.id ?? null,
  };
}
