import { SiparisModel } from "../models/SiparisModel.ts";
import { UrunModel } from "../models/UrunModel.ts";

export class SiparisService {
  public async siparisEkle(siparisVerisi: any, kullaniciBilgisi: any) {
    // 1. Ürünü MongoDB'den bul
    const urun = await UrunModel.findById(siparisVerisi.urunId);

    if (!urun) {
      throw new Error(
        `ID: ${siparisVerisi.urunId} olan ürün stokta bulunamadı!`,
      );
    }

    // 2. Stok Kontrolü
    if (urun.stok < siparisVerisi.adet) {
      throw new Error(
        `Yetersiz stok! ${urun.ad} için mevcut stok: ${urun.stok}`,
      );
    }

    // 3. Stoktan düş ve kaydet
    urun.stok -= Number(siparisVerisi.adet);
    await urun.save();

    // 4. Siparişi oluştur
    return await SiparisModel.create({
      urunId: urun._id,
      urunAd: urun.ad,
      adet: Number(siparisVerisi.adet),
      birimFiyat: urun.fiyat,
      toplamTutar: Number(siparisVerisi.adet) * urun.fiyat,
      olusturan: kullaniciBilgisi.kullanici,
      tarih: new Date().toLocaleString("tr-TR"),
    });
  }

  public async siparisGuncelle(
    siparisId: string,
    yeniUrunId: string,
    yeniAdet: number,
  ) {
    const siparis = await SiparisModel.findById(siparisId);
    if (!siparis) throw new Error(`ID: ${siparisId} olan sipariş bulunamadı!`);

    // 1. Eski ürünün stokunu iade et
    const eskiUrun = await UrunModel.findById(siparis.urunId);
    if (eskiUrun) {
      eskiUrun.stok += siparis.adet;
      await eskiUrun.save();
    }

    // 2. Yeni ürünü bul ve stok kontrolü yap
    const yeniUrun = await UrunModel.findById(yeniUrunId);
    if (!yeniUrun) throw new Error("Seçilen ürün bulunamadı!");
    if (yeniUrun.stok < yeniAdet)
      throw new Error(
        `Yetersiz stok! ${yeniUrun.ad} için mevcut stok: ${yeniUrun.stok}`,
      );

    // 3. Yeni ürün stokunu düş
    yeniUrun.stok -= yeniAdet;
    await yeniUrun.save();

    // 4. Siparişi güncelle
    siparis.urunId = yeniUrun._id as any;
    siparis.urunAd = yeniUrun.ad;
    siparis.adet = yeniAdet;
    siparis.birimFiyat = yeniUrun.fiyat;
    siparis.toplamTutar = yeniAdet * yeniUrun.fiyat;
    await siparis.save();

    return siparis;
  }

  public async siparisSil(siparisId: string) {
    const siparis = await SiparisModel.findById(siparisId);
    if (!siparis) throw new Error(`ID: ${siparisId} olan sipariş bulunamadı!`);

    // Stoğu iade et
    const urun = await UrunModel.findById(siparis.urunId);
    if (urun) {
      urun.stok += siparis.adet;
      await urun.save();
    }

    await siparis.deleteOne();
    return { mesaj: "Sipariş silindi ve stok iade edildi." };
  }

  public async tumSiparisleriGetir() {
    return await SiparisModel.find();
  }
}
