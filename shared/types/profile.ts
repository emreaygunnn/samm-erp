export interface Profile {
  id: string;
  creditLimit: number;
}

export const PROFILE_AREA_TYPES = {
  creditLimit: "number",
} as const;

export type ProfileUpdatableArea = keyof typeof PROFILE_AREA_TYPES;

export interface ProfileUpdateItem {
  id: string;
  value: number;
}

export interface ProfileUpdateResult {
  id: string;
  success: boolean;
  message: string;
}