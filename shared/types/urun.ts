/**
 * Ürün domain'ine ait paylaşılan tipler.
 * Hem backend (urunModel.ts) hem frontend bu dosyadan import eder.
 */

export interface Urun {
  id: string;
  ad: string;
  fiyat: number;
  stok: number;
  kategori: string;
  ebat?: string;
  lokasyon?: string;
}

/**
 * Güncellenebilir alanlar ve değer tipleri.
 * Backend schema (mongoose) ile hizalanmış — burada tanım yapılır, başka yerde tekrar edilmez.
 */
export const URUN_ALAN_TIPLERI = {
  lokasyon: "string",
  stok: "number",
  fiyat: "number",
  durum: "string",
  tutar: "number",
  paraBirimi: "string",
  kur: "number",
  fatura: "string",
} as const;

export type UrunGuncellenebilirAlan = keyof typeof URUN_ALAN_TIPLERI;
