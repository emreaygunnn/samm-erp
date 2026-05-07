import type { Request, Response } from "express";
import { ProfileService } from "../service/ProfileService.js";

const profileService = new ProfileService();

export class ProfileController {
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