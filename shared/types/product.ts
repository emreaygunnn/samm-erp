export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  dimensions?: string;
  location: string;
}

// güncellenebilir alanlar
export const PRODUCT_AREA_TYPES = {
  stock: "number",
  location: "string",
  test: "string",
} as const; //değerler tam literal tiplere dönüşür, yani "string" | "number"

export type ProductUpdatableArea = keyof typeof PRODUCT_AREA_TYPES;
// burada önce güncellenebiir alanların keylerini alıyoruz ProductUpdatableArea tipine atıyoruz
//

export interface UpdateItem {
  //güncellenecek ürün bilgisi
  id: string;
  value: string | number;
}

export interface UpdateResult {
  //güncelleme sonucu
  id: string;
  success: boolean;
  message: string;
}
