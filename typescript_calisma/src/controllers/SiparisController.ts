import type { Request, Response } from "express";
import { SiparisService } from "../services/SiparisService.ts";
import { AuthService } from "../services/AuthService.ts";

export class SiparisController {
  private siparisService = new SiparisService();
  private authService = new AuthService();

  public olustur = async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ mesaj: "Token eksik!" });

      const token = authHeader.split(" ")[1];
      if (!token) return res.status(401).json({ mesaj: "Token eksik!" });
      const biletBilgisi = this.authService.biletKontrolEt(token);

      if (!biletBilgisi)
        return res.status(403).json({ mesaj: "Geçersiz bilet!" });

      // Siparişi servise gönderiyoruz
      const sonuc = await this.siparisService.siparisEkle(
        req.body,
        biletBilgisi,
      );

      res
        .status(201)
        .json({ mesaj: "Sipariş alındı, stok güncellendi.", data: sonuc });
    } catch (error: any) {
      // Buradaki error.message "Yetersiz stok!" gibi bizim throw ettiğimiz mesajlar olacak
      res.status(400).json({ mesaj: error.message });
    }
  };
  public guncelle = async (req: Request, res: Response) => {
    try {
      const { urunId, adet } = req.body;
      if (!urunId || !adet) {
        return res.status(400).json({ mesaj: "urunId ve adet zorunludur!" });
      }
      const sonuc = await this.siparisService.siparisGuncelle(
        String(req.params.id),
        urunId,
        Number(adet),
      );
      res.json({ mesaj: "Sipariş güncellendi, stok düzeltildi.", data: sonuc });
    } catch (error: any) {
      res.status(400).json({ mesaj: error.message });
    }
  };

  // DELETE: /siparisler/:id
  public sil = async (req: Request, res: Response) => {
    try {
      // Güvenlik: Bilet kontrolünü yine yapıyoruz
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ mesaj: "Bilet yok!" });

      const sonuc = await this.siparisService.siparisSil(String(req.params.id));

      res.json(sonuc);
    } catch (error: any) {
      res.status(404).json({ mesaj: error.message });
    }
  };

  public listele = async (req: Request, res: Response) => {
    const veriler = await this.siparisService.tumSiparisleriGetir();
    res.json(veriler);
  };
}
