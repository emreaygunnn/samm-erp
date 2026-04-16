import type { UpdateResult } from "@shared/types/product.ts";
import { getItem } from "../utils/getItem.js";
import { updateItem } from "../utils/updateDescription.js";

// oracle tablo adları
const TABLE_NAME = "PRODUCTS";
const COLUMNS = {
  id: "ID",
  stock: "STOCK",
  location: "LOCATION",
};

// FRONTEND DEN GELEN ALAN ADI  ORACLE API ALAN ADI EŞLEŞMESİ
// Sadece izin verilen alanlar
const ALLOWED_API_FIELDS: Record<string, string> = {
  stock: "Stock", // frontend 'stock' → Oracle API 'Stock'
  location: "Location", // frontend 'location' → Oracle API 'Location'
};

// güncelleme sonucu değerler

//PRODUCT SERVICE

export class ProductService {
  // ── Tek ürün güncelle (stok veya lokasyon) ────────────────────
  // UPDATE PRODUCTS SET STOCK = :stok WHERE ITEM_CODE = :id

  public async updateProduct(
    id: string,
    fields: Record<string, any>,
  ): Promise<UpdateResult> {
    const itemUniqId = await getItem("ItemNumber", id);

    if (itemUniqId) {
      console.log(`Item ${id} exists in Oracle with unique ID: ${itemUniqId}`);

      // fields'tan güncellenecek alanı bul (stock veya location) aynı anda olamaz
      const fieldKeys = Object.keys(fields);
      if (fieldKeys.length !== 1) {
        return {
          id,
          success: false,
          message: "Sadece bir alan güncellenebilir ",
        };
      }

      const frontendField = fieldKeys[0] as string;
      const apiField = ALLOWED_API_FIELDS[frontendField];
      if (!apiField) {
        return {
          id,
          success: false,
          message: `Geçersiz alan: ${frontendField}`,
        };
      }

      const value = fields[frontendField];
      const updated = await updateItem(itemUniqId, apiField, value);
      if (updated) {
        return {
          id,
          success: true,
          message: `${id}  güncellendi`,
        };
      } else {
        return {
          id,
          success: false,
          message: `${id} güncellenirken bir hata oluştu`,
        };
      }
    } else {
      console.log(`Item ${id} does not exist in Oracle.`);
      return {
        id,
        success: false,
        message: `${id}  güncellenemedi`,
      };
    }
  }
  // toplu güncelleme - paralel olarak çalıştır

  public async bulkUpdate(
    items: Array<{ id: string; [key: string]: any }>,
  ): Promise<UpdateResult[]> {
    // Tüm ürünleri paralel olarak işle
    const promises = items.map(async (item) => {
      const { id, ...fields } = item;
      try {
        const result = await this.updateProduct(id, fields);
        return result;
      } catch (err) {
        return {
          id,
          success: false,
          message: (err as Error).message,
        };
      }
    });

    // Tüm promise'leri bekle ve sonuçları döndür
    const results = await Promise.all(promises);
    return results;
  }
}
