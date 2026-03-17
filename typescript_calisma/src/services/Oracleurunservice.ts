const IZINLI_SUTUNLAR: Record<string, string> = {
  lokasyon: "LOCATION",
  stok: "STOCK",
};

export class OracleUrunService {
  public async alanGuncelle(id: string, alanlar: Record<string, any>) {
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

      // if (result.rowsAffected === 0)
      //   throw new Error(`Oracle'da "${id}" kodlu ürün bulunamadı!`);

      return {
        id,
        ...alanlar,
        // rowsAffected: result.rowsAffected
      };
    } catch (err) {
      throw new Error(`Oracle güncelleme hatası: ${(err as Error).message}`);
    }
  }

  public async lokasyonGuncelle(eslesmeKodu: string, lokasyon: string) {
    return this.alanGuncelle(eslesmeKodu, { lokasyon });
  }
}
