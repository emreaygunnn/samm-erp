export interface Contact {
  id: string;
  email: string;
  phoneNumber: string;
  currencyCode: string;
}
export const CONTACT_AREA_TYPES = {
  email: "string",
  phoneNumber: "string",
  currencyCode: "string",
} as const;

export type ContactUpdatableArea = keyof typeof CONTACT_AREA_TYPES;

export interface ContactUpdateItem {
  id: string;
  value: string;
}

export interface ContactUpdateResult {
  id: string;
  success: boolean;
  message: string;
}
