export interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  currencyCode: string;
}

export const CUSTOMER_AREA_TYPES = {
  email: "string",
  phoneNumber: "string",
  currencyCode: "string",
} as const;

export type CustomerUpdatableArea = keyof typeof CUSTOMER_AREA_TYPES;

export interface CustomerUpdateItem {
  id: string;
  value: string;
}

export interface CustomerUpdateResult {
  id: string;
  success: boolean;
  message: string;
}
