import { getConnection } from "../config/database.ts";

export class OracleUrunService {
  /**
   * Oracle'daki ürünün lokasyonunu günceller.
   *
   * NOT: Şirketin Oracle tablosundaki gerçek tablo ve sütun adlarını
   * buraya yazman lazım. Aşağıdakiler örnek:
   *   - Tablo adı: PRODUCTS (gerçek adı farklı olabilir)
   *   - Lokasyon sütunu: LOCATION (gerçek adı farklı olabilir)
   *   - Eşleştirme sütunu: PRODUCT_CODE (iki sistemi bağlayan alan)
   */
  public async lokasyonGuncelle(eslesmeKodu: string, lokasyon: string) {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `UPDATE PRODUCTS SET LOCATION = :lokasyon WHERE PRODUCT_CODE = :kod`,
        { lokasyon, kod: eslesmeKodu },
        { autoCommit: true },
      );

      if (result.rowsAffected === 0) {
        throw new Error(`Oracle'da "${eslesmeKodu}" kodlu ürün bulunamadı!`);
      }

      return { eslesmeKodu, lokasyon, rowsAffected: result.rowsAffected };
    } finally {
      await conn.close();
    }
  }

  /**
   * Oracle'dan tüm ürünleri getirir.
   * İleride lazım olursa diye hazır.
   */
  public async tumUrunleriGetir() {
    const conn = await getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM PRODUCTS`,
        [],
        { outFormat: 2 }, // 2 = oracledb.OUT_FORMAT_OBJECT → satırları obje olarak döner
      );
      return result.rows;
    } finally {
      await conn.close();
    }
  }
}
