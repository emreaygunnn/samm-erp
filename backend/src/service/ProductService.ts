import oracledb from "oracledb";
import { oracleConfig } from "../config/config.js";
import type { UpdateResult } from "@shared/types/product.ts";
import { getItem } from "../utils/getItem.js";
import { updateDescription } from "src/utils/updateDescription.js";

// oracle tablo adları
const TABLE_NAME = "PRODUCTS";
const COLUMNS = {
  id: "ID",
  stock: "STOCK",
  location: "LOCATION",
};

// FRONTEND DEN GELEN ALAN ADI  ORACLE TABLO ALAN ADI EŞLEŞMESİ
// Sadece izin verilen alanlar ö
const ALLOWED_COLUMNS: Record<string, string> = {
  stock: COLUMNS.stock,
  location: COLUMNS.location,
};

// güncelleme sonucu değerler

//PRODUCT SERVICE

export class ProductService {
  // ── Tek ürün güncelle (stok veya lokasyon) ────────────────────
  // UPDATE PRODUCTS SET STOCK = :stok WHERE ITEM_CODE = :id

  public async updateProduct(
    id: string,
    fields: Record<string, any>
  ): Promise<UpdateResult> {
    const itemUniqId = await getItem("ItemNumber", id);

    if (itemUniqId) {
      console.log(`Item ${id} exists in Oracle with unique ID: ${itemUniqId}`);

      const updated = await updateDescription(itemUniqId, fields.description);
      if (updated) {
        return {
          id,
          success: true,
          message: `${id} başarıyla güncellendi`,
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
        message: `${id} başarıyla güncellenemedi`,
      };
    }
  }
  // toplu güncelleme

  public async bulkUpdate(
    items: Array<{ id: string; [key: string]: any }>
  ): Promise<UpdateResult[]> {
    //Array<{ id: string; [key: string]: any }> → "Her elemanında id olan bir dizi" demek. [key: string]: any ise "id dışında başka alanlar da olabilir, ne gelirse gelsin" diyor.
    //Promise<UpdateResult[]> → Her ürün için bir sonuç döner:

    const results: UpdateResult[] = []; // her ürünün sonucunu buraya toplayacağız
    for (const item of items) {
      // dizideki her ürünü tek tek al
      const { id, ...fields } = item; // id yi ayır kalanını fields e at

      try {
        const result = await this.updateProduct(id, fields); // tekli güncelleme metodunu çağır zaten oracle bağlantısını o hallediyor
        results.push(result); // sonucu results arrayine ekle
      } catch (err) {
        results.push({
          id,
          success: false,
          message: (err as Error).message,
        });
      }
    }
    return results;
  }
}
