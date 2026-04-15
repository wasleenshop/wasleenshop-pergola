/**
 * lib/shopify/mutations/customer.ts
 *
 * Customer authentication + account management mutations.
 *
 * NOTE: This project uses Shopify Customer Account API (OAuth)
 * for the primary auth flow (PKCE). These legacy Storefront API
 * mutations are retained for:
 *   - Email/password account creation (fallback)
 *   - Address management
 *   - Order mutations
 *
 * For OAuth login/logout use: NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_URL
 */

import "server-only";

import { shopifyQuery } from "../client";
import type {
  CustomerAccessToken,
  CustomerUserError,
  CustomerAddress,
  Maybe,
} from "../types";

// ─────────────────────────────────────────────────────────────
// Error handling
// ─────────────────────────────────────────────────────────────

export class CustomerMutationError extends Error {
  public readonly userErrors: CustomerUserError[];

  constructor(userErrors: CustomerUserError[]) {
    const msg = userErrors.map((e) => e.message).join("; ");
    super(`[Shopify Customer] ${msg}`);
    this.name = "CustomerMutationError";
    this.userErrors = userErrors;
  }
}

function throwIfCustomerErrors(userErrors: CustomerUserError[]): void {
  if (userErrors.length > 0) {
    throw new CustomerMutationError(userErrors);
  }
}

// ─────────────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────────────

const CUSTOMER_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerAccessTokenCreate(
    $input: CustomerAccessTokenCreateInput!
  ) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_RENEW_MUTATION = /* GraphQL */ `
  mutation CustomerAccessTokenRenew($customerAccessToken: String!) {
    customerAccessTokenRenew(customerAccessToken: $customerAccessToken) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      userErrors {
        code: field
        field
        message
      }
    }
  }
`;

const CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION = /* GraphQL */ `
  mutation CustomerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      deletedCustomerAccessTokenId
      userErrors {
        field
        message
      }
    }
  }
`;

const CUSTOMER_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerUpdate(
    $customerAccessToken: String!
    $customer: CustomerUpdateInput!
  ) {
    customerUpdate(
      customerAccessToken: $customerAccessToken
      customer: $customer
    ) {
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_RECOVER_MUTATION = /* GraphQL */ `
  mutation CustomerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_RESET_MUTATION = /* GraphQL */ `
  mutation CustomerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customer {
        id
        email
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_CREATE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressCreate(
    $customerAccessToken: String!
    $address: MailingAddressInput!
  ) {
    customerAddressCreate(
      customerAccessToken: $customerAccessToken
      address: $address
    ) {
      customerAddress {
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
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressUpdate(
    $customerAccessToken: String!
    $id: ID!
    $address: MailingAddressInput!
  ) {
    customerAddressUpdate(
      customerAccessToken: $customerAccessToken
      id: $id
      address: $address
    ) {
      customerAddress {
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
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_ADDRESS_DELETE_MUTATION = /* GraphQL */ `
  mutation CustomerAddressDelete(
    $customerAccessToken: String!
    $id: ID!
  ) {
    customerAddressDelete(
      customerAccessToken: $customerAccessToken
      id: $id
    ) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION = /* GraphQL */ `
  mutation CustomerDefaultAddressUpdate(
    $customerAccessToken: String!
    $addressId: ID!
  ) {
    customerDefaultAddressUpdate(
      customerAccessToken: $customerAccessToken
      addressId: $addressId
    ) {
      customer {
        id
        defaultAddress { id }
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// Mutation functions
// ─────────────────────────────────────────────────────────────

export interface CreateCustomerInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing?: boolean;
}

/**
 * Register a new customer account.
 */
export async function createCustomer(
  input: CreateCustomerInput
): Promise<{ id: string; email: string }> {
  interface ApiResponse {
    customerCreate: {
      customer: { id: string; email: string } | null;
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(CUSTOMER_CREATE_MUTATION, {
    input,
  });

  throwIfCustomerErrors(data.customerCreate.customerUserErrors);

  if (!data.customerCreate.customer) {
    throw new CustomerMutationError([
      { code: null, field: null, message: "Account creation failed." },
    ]);
  }

  return data.customerCreate.customer;
}

/**
 * Create a customer access token (email + password login).
 * Use the Customer Account API OAuth flow for the primary login UX.
 */
export async function createCustomerAccessToken(credentials: {
  email: string;
  password: string;
}): Promise<CustomerAccessToken> {
  interface ApiResponse {
    customerAccessTokenCreate: {
      customerAccessToken: CustomerAccessToken | null;
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CUSTOMER_ACCESS_TOKEN_CREATE_MUTATION,
    { input: credentials }
  );

  throwIfCustomerErrors(
    data.customerAccessTokenCreate.customerUserErrors
  );

  if (!data.customerAccessTokenCreate.customerAccessToken) {
    throw new CustomerMutationError([
      { code: "INVALID_CREDENTIALS", field: null, message: "Invalid email or password." },
    ]);
  }

  return data.customerAccessTokenCreate.customerAccessToken;
}

/**
 * Renew an access token before it expires.
 * Call this on app boot if stored token is within 1 hour of expiry.
 */
export async function renewCustomerAccessToken(
  customerAccessToken: string
): Promise<CustomerAccessToken | null> {
  interface ApiResponse {
    customerAccessTokenRenew: {
      customerAccessToken: CustomerAccessToken | null;
      userErrors: Array<{ field: string; message: string }>;
    };
  }

  try {
    const data = await shopifyQuery<ApiResponse>(
      CUSTOMER_ACCESS_TOKEN_RENEW_MUTATION,
      { customerAccessToken }
    );
    return data.customerAccessTokenRenew.customerAccessToken;
  } catch {
    return null;
  }
}

/**
 * Delete (invalidate) a customer access token on logout.
 */
export async function deleteCustomerAccessToken(
  customerAccessToken: string
): Promise<boolean> {
  interface ApiResponse {
    customerAccessTokenDelete: {
      deletedAccessToken: Maybe<string>;
      deletedCustomerAccessTokenId: Maybe<string>;
      userErrors: Array<{ field: string; message: string }>;
    };
  }

  try {
    const data = await shopifyQuery<ApiResponse>(
      CUSTOMER_ACCESS_TOKEN_DELETE_MUTATION,
      { customerAccessToken }
    );
    return !!data.customerAccessTokenDelete.deletedAccessToken;
  } catch {
    return false;
  }
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  acceptsMarketing?: boolean;
}

/**
 * Update customer profile information.
 * Returns a new access token if email/password changed.
 */
export async function updateCustomer(
  customerAccessToken: string,
  customer: UpdateCustomerInput
): Promise<{ newToken: CustomerAccessToken | null }> {
  interface ApiResponse {
    customerUpdate: {
      customer: { id: string } | null;
      customerAccessToken: CustomerAccessToken | null;
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CUSTOMER_UPDATE_MUTATION,
    { customerAccessToken, customer },
    { customerAccessToken }
  );

  throwIfCustomerErrors(data.customerUpdate.customerUserErrors);

  return {
    newToken: data.customerUpdate.customerAccessToken,
  };
}

/**
 * Send a password-reset email to the given address.
 */
export async function recoverCustomerPassword(
  email: string
): Promise<void> {
  interface ApiResponse {
    customerRecover: {
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(CUSTOMER_RECOVER_MUTATION, {
    email,
  });

  throwIfCustomerErrors(data.customerRecover.customerUserErrors);
}

export type AddressInput = Omit<CustomerAddress, "id">;

/**
 * Add a new delivery address to the customer's account.
 */
export async function createCustomerAddress(
  customerAccessToken: string,
  address: AddressInput
): Promise<CustomerAddress> {
  interface ApiResponse {
    customerAddressCreate: {
      customerAddress: CustomerAddress | null;
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CUSTOMER_ADDRESS_CREATE_MUTATION,
    { customerAccessToken, address },
    { customerAccessToken }
  );

  throwIfCustomerErrors(data.customerAddressCreate.customerUserErrors);

  if (!data.customerAddressCreate.customerAddress) {
    throw new CustomerMutationError([
      { code: null, field: null, message: "Address creation failed." },
    ]);
  }

  return data.customerAddressCreate.customerAddress;
}

/**
 * Update an existing address.
 */
export async function updateCustomerAddress(
  customerAccessToken: string,
  id: string,
  address: AddressInput
): Promise<CustomerAddress> {
  interface ApiResponse {
    customerAddressUpdate: {
      customerAddress: CustomerAddress | null;
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CUSTOMER_ADDRESS_UPDATE_MUTATION,
    { customerAccessToken, id, address },
    { customerAccessToken }
  );

  throwIfCustomerErrors(data.customerAddressUpdate.customerUserErrors);

  if (!data.customerAddressUpdate.customerAddress) {
    throw new CustomerMutationError([
      { code: null, field: null, message: "Address update failed." },
    ]);
  }

  return data.customerAddressUpdate.customerAddress;
}

/**
 * Delete an address from the customer's account.
 */
export async function deleteCustomerAddress(
  customerAccessToken: string,
  id: string
): Promise<boolean> {
  interface ApiResponse {
    customerAddressDelete: {
      deletedCustomerAddressId: Maybe<string>;
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CUSTOMER_ADDRESS_DELETE_MUTATION,
    { customerAccessToken, id },
    { customerAccessToken }
  );

  throwIfCustomerErrors(data.customerAddressDelete.customerUserErrors);
  return !!data.customerAddressDelete.deletedCustomerAddressId;
}

/**
 * Set the customer's default delivery address.
 */
export async function setDefaultCustomerAddress(
  customerAccessToken: string,
  addressId: string
): Promise<void> {
  interface ApiResponse {
    customerDefaultAddressUpdate: {
      customer: { id: string } | null;
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(
    CUSTOMER_DEFAULT_ADDRESS_UPDATE_MUTATION,
    { customerAccessToken, addressId },
    { customerAccessToken }
  );

  throwIfCustomerErrors(data.customerDefaultAddressUpdate.customerUserErrors);
}

export interface ResetCustomerInput {
  password?: string;
  resetToken: string;
}

/**
 * Reset a customer's password.
 */
export async function resetCustomerPassword(
  id: string,
  input: ResetCustomerInput
): Promise<{ customerId: string }> {
  interface ApiResponse {
    customerReset: {
      customer: { id: string } | null;
      customerUserErrors: CustomerUserError[];
    };
  }

  const data = await shopifyQuery<ApiResponse>(CUSTOMER_RESET_MUTATION, {
    id,
    input,
  });

  throwIfCustomerErrors(data.customerReset.customerUserErrors);

  if (!data.customerReset.customer) {
    throw new CustomerMutationError([
      { code: null, field: null, message: "Password reset failed." },
    ]);
  }

  return { customerId: data.customerReset.customer.id };
}
