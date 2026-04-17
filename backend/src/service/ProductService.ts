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
  descriptionA: "DescriptionA", // açıklama A
  descriptionB: "DescriptionB", // açıklama B
  descriptionC: "DescriptionC", // açıklama C
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

      // fields'tan güncellenecek alanları bul (stock, location, descriptionA, B, C)
      const fieldKeys = Object.keys(fields);
      if (fieldKeys.length === 0) {
        return {
          id,
          success: false,
          message: "Güncellenecek alan bulunamadı",
        };
      }

      // Her alan için güncelleme yap
      const results: string[] = [];
      for (const frontendField of fieldKeys) {
        const apiField = ALLOWED_API_FIELDS[frontendField];
        if (!apiField) {
          results.push(`${frontendField}: Geçersiz alan`);
          continue;
        }

        const value = fields[frontendField];
        const updated = await updateItem(itemUniqId, apiField, value);
        if (updated) {
          results.push(`${frontendField}: Başarılı`);
        } else {
          results.push(`${frontendField}: Hata`);
        }
      }

      const successCount = results.filter((r) => r.includes("Başarılı")).length;
      const hasErrors = results.some(
        (r) => r.includes("Hata") || r.includes("Geçersiz"),
      );

      return {
        id,
        success: !hasErrors && successCount > 0,
        message: results.join(", "),
      };
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
