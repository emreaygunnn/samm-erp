import { getConnection } from "../config/database.ts";

// NOT: Aşağıdaki değerleri kendi Oracle şemanla eşleştir:
//   TABLO_ADI      → Oracle'daki gerçek tablo adı     (örn: URUNLER, STK_URUN vs.)
//   ID_SUTUNU      → Ürünü tanımlayan sütun adı       (örn: PRODUCT_CODE, URUN_ID vs.)
//   IZINLI_SUTUNLAR → Frontend alan adı → Oracle sütun adı eşleşmesi
const TABLO_ADI = "PRODUCTS";
const ID_SUTUNU = "PRODUCT_CODE";
const IZINLI_SUTUNLAR: Record<string, string> = {
  lokasyon: "LOCATION",
  stok: "STOCK",
};

export class OracleUrunService {
  /**
   * Ürünün bir veya birden fazla alanını Oracle'da günceller.
   * Desteklenen alanlar: lokasyon, stok
   */
  public async alanGuncelle(id: string, alanlar: Record<string, any>) {
    const conn = await getConnection();
    try {
      const setClauses: string[] = [];
      const binds: Record<string, any> = { id };

      for (const [alan, deger] of Object.entries(alanlar)) {
        const sutun = IZINLI_SUTUNLAR[alan];
        if (!sutun) continue;
        setClauses.push(`${sutun} = :${alan}`);
        binds[alan] = deger;
      }

      if (setClauses.length === 0)
        throw new Error("Güncellenecek geçerli alan bulunamadı!");

      const result = await conn.execute(
        `UPDATE ${TABLO_ADI} SET ${setClauses.join(", ")} WHERE ${ID_SUTUNU} = :id`,
        binds,
        { autoCommit: true },
      );

      if (result.rowsAffected === 0)
        throw new Error(`Oracle'da "${id}" kodlu ürün bulunamadı!`);

      return { id, ...alanlar, rowsAffected: result.rowsAffected };
    } finally {
      await conn.close();
    }
  }

  public async lokasyonGuncelle(eslesmeKodu: string, lokasyon: string) {
    return this.alanGuncelle(eslesmeKodu, { lokasyon });
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
