import type { Request, Response } from "express";
import { UrunService } from "../services/UrunService.ts";
import { OracleUrunService } from "../services/Oracleurunservice.ts";

const urunService = new UrunService();
const oracleService = new OracleUrunService();

export class UrunController {
  public async getTumUrunler(req: Request, res: Response) {
    try {
      const { id, kat, sadeceStokda, min, max, ara } = req.query;
      if (id)
        return res.json(
          (await urunService.IdileUrunGetirme(String(id))) || "Ürün yok",
        );
      if (kat)
        return res.json(await urunService.kategoriUrunGetirme(String(kat)));
      if (ara) return res.json(await urunService.ismeGoreAra(String(ara)));
      if (min && max)
        return res.json(
          await urunService.fiyatAraligi(Number(min), Number(max)),
        );

      let urunler = await urunService.tumUrunleriGetir();
      if (sadeceStokda === "true") urunler = urunler.filter((u) => u.stok > 0);
      res.json(urunler);
    } catch (err) {
      res.status(500).send("Ürünler listelenirken hata!");
    }
  }

  public async urunEkle(req: Request, res: Response) {
    try {
      res.status(201).json(await urunService.urunEkle(req.body));
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  public async urunSil(req: Request, res: Response) {
    try {
      await urunService.urunSil(String(req.params.id));
      res.send("Ürün silindi.");
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }

  public async urunGuncelleTam(req: Request, res: Response) {
    try {
      res.json(
        await urunService.urunGuncelleTam(String(req.params.id), req.body),
      );
    } catch (err: any) {
      res.status(404).send(err.message);
    }
  }

  public async urunGuncelleKismi(req: Request, res: Response) {
    try {
      res.json(
        await urunService.urunGuncelleKismi(String(req.params.id), req.body),
      );
    } catch (err: any) {
      res.status(404).send(err.message);
    }
  }

  public async topluIcerAktar(req: Request, res: Response) {
    try {
      const { urunler } = req.body;
      if (!Array.isArray(urunler) || urunler.length === 0) {
        res
          .status(400)
          .json({ message: "Geçerli bir ürün listesi gönderilmedi." });
        return;
      }
      const sonuc = await urunService.topluIcerAktar(urunler);
      res.json({ success: true, ...sonuc });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
  public async lokasyonGuncelle(req: Request, res: Response) {
    try {
      const { lokasyon } = req.body;
      if (!lokasyon) {
        res.status(400).send("lokasyon gerekli");
        return;
      }

      // 1. MongoDB'de güncelle
      const urun = await urunService.urunGuncelleKismi(String(req.params.id), {
        lokasyon,
      });

      // 2. Oracle'da güncelle
      await oracleService.lokasyonGuncelle(urun.ad, lokasyon);
      // urun.ad yerine iki sistemi bağlayan gerçek alan ne ise onu koy

      res.json(urun);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }
}
