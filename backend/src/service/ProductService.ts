import type { UpdateResult } from "@shared/types/product.ts";
import { getItem } from "../utils/getItem.js";
import { updateItem } from "../utils/updateItems.js";

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
  description: "Description", // açıklama (organizasyon koduna göre güncellenecek)
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
      console.log(
        `[ProductService] Item ${id} exists with unique ID: ${itemUniqId}`,
      );

      // fields'tan güncellenecek alanları bul (stock, location, description)
      const fieldKeys = Object.keys(fields);
      if (fieldKeys.length === 0) {
        return {
          id,
          success: false,
          message: "Güncellenecek alan bulunamadı",
        };
      }

      console.log(
        `[ProductService] Güncellenecek alanlar: ${fieldKeys.join(", ")}`,
      );

      // Her alan için güncelleme yap
      const results: string[] = [];
      for (const frontendField of fieldKeys) {
        // organizationCode'u atla, sadece gerçek alanları işle
        if (frontendField === "organizationCode") continue;

        const apiField = ALLOWED_API_FIELDS[frontendField];
        if (!apiField) {
          results.push(`${frontendField}: Geçersiz alan`);
          continue;
        }

        const value = fields[frontendField];
        const organizationCode = fields.organizationCode; // organizationCode'u al

        console.log(
          `[ProductService] Güncelleniyor: ${frontendField}=${value} (Org: ${organizationCode})`,
        );

        const updated = await updateItem(
          itemUniqId,
          apiField,
          value,
          organizationCode,
        );
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
      console.log(`[ProductService] Item ${id} does not exist in Oracle.`);
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
