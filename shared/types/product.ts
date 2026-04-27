export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  dimensions?: string;
  location: string;
  description?: string;
}

// güncellenebilir alanlar

export const PRODUCT_AREA_TYPES = {
  stock: "number",
  location: "string",
  description: "string",
  status: "string", // yeni eklenen alan
} as const; //değerler tam literal tiplere dönüşür, yani "string" | "number"

export type ProductUpdatableArea = keyof typeof PRODUCT_AREA_TYPES;
// burada önce güncellenebiir alanların keylerini alıyoruz ProductUpdatableArea tipine atıyoruz
//

export interface UpdateItem {
  id: string;
  value: string | number;
  organizationCode?: "A" | "B" | "C";
  // statü güncellemesi için
  statusValue?: "Aktif" | "Pasif" | "Active" | "Passive";
}

export interface UpdateResult {
  //güncelleme sonucu
  id: string;
  success: boolean;
  message: string;
}
