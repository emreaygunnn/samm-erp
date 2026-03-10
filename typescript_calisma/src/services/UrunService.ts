import type { Urun } from "../types/types.ts";
import { UrunModel } from "../models/UrunModel.ts";

export class UrunService {
  public async tumUrunleriGetir() {
    try {
      return await UrunModel.find();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async filtreliUrun(minFiyat: number) {
    try {
      return await UrunModel.find({ fiyat: { $gt: minFiyat } });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async IdileUrunGetirme(urunId: string) {
    try {
      return await UrunModel.findById(urunId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async kategoriUrunGetirme(kategori: string) {
    try {
      return await UrunModel.find({
        kategori: { $regex: new RegExp(`^${kategori}$`, "i") },
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async stokDurumuGetir(sadeceStokta: boolean, kritikSeviye?: number) {
    try {
      if (kritikSeviye) {
        return await UrunModel.find({ stok: { $lt: kritikSeviye } });
      }
      if (sadeceStokta) {
        return await UrunModel.find({ stok: { $gt: 0 } });
      }
      return await UrunModel.find();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async fiyatAraligi(min: number, max: number) {
    try {
      return await UrunModel.find({ fiyat: { $gte: min, $lte: max } });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async ismeGoreAra(kelime: string) {
    try {
      return await UrunModel.find({ ad: { $regex: kelime, $options: "i" } });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async urunEkle(yeniUrunVerisi: any) {
    try {
      const zorunluAlanlar = ["ad", "fiyat", "stok", "kategori"];
      const eksikAlanlar = zorunluAlanlar.filter(
        (alan) =>
          yeniUrunVerisi[alan] === undefined ||
          yeniUrunVerisi[alan] === null ||
          yeniUrunVerisi[alan] === "",
      );

      if (eksikAlanlar.length > 0) {
        throw new Error(`Eksik alanlar: ${eksikAlanlar.join(", ")}`);
      }

      const ayniUrunVarMi = await UrunModel.findOne({
        ad: { $regex: new RegExp(`^${yeniUrunVerisi.ad}$`, "i") },
        kategori: { $regex: new RegExp(`^${yeniUrunVerisi.kategori}$`, "i") },
      });

      if (ayniUrunVarMi) {
        throw new Error(
          `Kanka "${yeniUrunVerisi.ad}" zaten bu kategoride kayıtlı. Aynısını niye ekliyon?`,
        );
      }

      return await UrunModel.create({
        ad: String(yeniUrunVerisi.ad),
        fiyat: Number(yeniUrunVerisi.fiyat),
        stok: Number(yeniUrunVerisi.stok || 0),
        kategori: String(yeniUrunVerisi.kategori),
        ...(yeniUrunVerisi.ebat && { ebat: String(yeniUrunVerisi.ebat) }),
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async urunSil(urunId: string): Promise<void> {
    try {
      const silinen = await UrunModel.findByIdAndDelete(urunId);
      if (!silinen) throw new Error(`"${urunId} id'li ürün bulunamadı"`);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }

  public async urunGuncelleTam(id: string, yeniVeri: Omit<Urun, "id">) {
    const guncellenen = await UrunModel.findByIdAndUpdate(id, yeniVeri, {
      new: true,
      overwrite: true,
    });
    if (!guncellenen) throw new Error("Güncellenecek ürün bulunamadı!");
    return guncellenen;
  }

  public async urunGuncelleKismi(
    id: string,
    guncellenecekAlanlar: Partial<Urun>,
  ) {
    const guncellenen = await UrunModel.findByIdAndUpdate(
      id,
      { $set: guncellenecekAlanlar },
      { new: true },
    );
    if (!guncellenen) throw new Error("Ürün bulunamadı!");
    return guncellenen;
  }

  public async topluIcerAktar(
    urunler: any[],
  ): Promise<{ eklenen: number; guncellenen: number; hatalar: string[] }> {
    let eklenen = 0;
    let guncellenen = 0;
    const hatalar: string[] = [];

    for (const u of urunler) {
      try {
        if (
          !u.ad ||
          u.fiyat === undefined ||
          u.stok === undefined ||
          !u.kategori
        ) {
          hatalar.push(`Eksik alan: ${JSON.stringify(u)}`);
          continue;
        }
        const veri = {
          fiyat: Number(u.fiyat),
          stok: Number(u.stok),
          kategori: String(u.kategori),
          ...(u.ebat ? { ebat: String(u.ebat) } : {}),
        };
        const mevcut = await UrunModel.findOne({
          ad: { $regex: new RegExp(`^${u.ad}$`, "i") },
        });
        if (mevcut) {
          await UrunModel.findByIdAndUpdate(mevcut._id, { $set: veri });
          guncellenen++;
        } else {
          await UrunModel.create({ ad: String(u.ad), ...veri });
          eklenen++;
        }
      } catch (e: any) {
        hatalar.push(`"${u.ad}": ${e.message}`);
      }
    }

    return { eklenen, guncellenen, hatalar };
  }
}
