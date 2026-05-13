import type { Request, Response } from "express";
import { ProfileService } from "../service/ProfileService.js";

const profileService = new ProfileService();

export class ProfileController {
  // Mevcut değerleri SOAP üzerinden Oracle'dan çeker (Check butonu için)
  public async getProfileValues(req: Request, res: Response): Promise<void> {
    const { items, operation } = req.body;
    try {
      const results = await profileService.getProfileValues(items, operation);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Profilin tüm alanlarını döner (Check sayfası için)
  public async getProfileFull(req: Request, res: Response): Promise<void> {
    const accountNumber = req.params.accountNumber as string;
    try {
      const result = await profileService.getProfileFull(accountNumber);
      if (result === "NOT_FOUND") {
        res.status(404).json({ status: "not_found" });
        return;
      }
      res.json(result);
    } catch (err: any) {
      const oracleStatus: number = (err as any).oracleStatus ?? 0;
      console.error(`[ProfileController] getProfileFull hatası: Oracle ${oracleStatus} → ${err.message}`);
      res.status(502).json({ status: "oracle_error", oracleStatus, message: err.message });
    }
  }

  public async bulkUpdate(req: Request, res: Response): Promise<void> {
    const items = req.body;
    console.log("[ProfileController] bulkUpdate çağrıldı. Item sayısı:", items?.length);

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "Güncellenecek profil bulunamadı" });
      return;
    }

    try {
      const results = await profileService.bulkUpdate(items);
      console.log("[ProfileController] Sonuçlar:", results);
      res.json(results);
    } catch (err: any) {
      console.error("[ProfileController] Hata:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}