import type { Request, Response } from "express";
import { KullaniciService } from "../services/KullaniciService.ts";
import { AuthService } from "../services/AuthService.ts";

const kullaniciService = new KullaniciService();
const authService = new AuthService();

export class KullaniciController {
  public async listele(req: Request, res: Response) {
    try {
      const liste = await kullaniciService.tumKullanicilariGetir();
      res.json(liste);
    } catch (err: any) {
      res.status(500).json({
        message: "Kullanıcılar getirilemedi kanka",
        error: err.message,
      });
    }
  }

  public async ekle(req: Request, res: Response) {
    const { email, sifre } = req.body;
    if (!email || !email.trim()) {
      res.status(400).json({ success: false, message: "E-posta zorunludur!" });
      return;
    }
    if (!sifre || !sifre.trim()) {
      res.status(400).json({ success: false, message: "Şifre zorunludur!" });
      return;
    }
    try {
      const yeni = await kullaniciService.kullaniciEkle(req.body);
      res.status(201).json({
        success: true,
        message: "Kullanıcı başarıyla eklendi",
        data: yeni,
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || "Kullanıcı eklenirken bir hata oluştu",
      });
    }
  }

  public async guncelle(req: Request, res: Response) {
    try {
      const guncellendi = await kullaniciService.kullaniciGuncelle(
        String(req.params.id),
        req.body,
      );

      // Kişi kendi profilini güncelliyorsa yeni token dön
      // (header'daki rol/isim bilgisi anında güncellensin)
      const mevcutKullanici = (req as any).kullanici;
      const kendiProfil =
        mevcutKullanici?.id?.toString() === guncellendi._id.toString();

      const yanit: any = {
        success: true,
        message: "Kullanıcı güncellendi",
        data: guncellendi,
      };
      if (kendiProfil) {
        yanit.yeniToken = authService.tokenOlustur(guncellendi);
      }

      res.json(yanit);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public async sil(req: Request, res: Response) {
    try {
      await kullaniciService.kullaniciSil(String(req.params.id));
      res.json({
        message: `${String(req.params.id)} ID'li kullanıcı başarıyla sistemden silindi.`,
      });
    } catch (err: any) {
      res
        .status(404)
        .json({ message: err.message || "Silme işlemi başarısız!" });
    }
  }

  public async detayGetir(req: Request, res: Response) {
    try {
      const kullanici = await kullaniciService.idIleKullaniciGetir(
        String(req.params.id),
      );
      res.json(kullanici);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  }
}
