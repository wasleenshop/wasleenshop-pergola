"use client";

/**
 * lib/hooks/useCustomer.ts
 *
 * Convenience hook for consuming the CustomerContext.
 *
 * Usage:
 *   const { customer, login, logout } = useCustomer();
 *
 * Must be called inside a component rendered under <CustomerProvider>.
 */

export { useCustomerContext as useCustomer } from "@/contexts/CustomerContext";
