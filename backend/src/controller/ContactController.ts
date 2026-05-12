import type { Request, Response } from "express";
import { ContactService } from "../service/ContactService.js";

const contactService = new ContactService();

export class ContactController {
  public async updateContact(req: Request, res: Response): Promise<void> {
    try {
      const result = await contactService.updateContact(
        req.params.partyNumber as string,
        req.body,
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Mevcut değerleri Oracle'dan çeker (Check butonu için)
  public async getContactValues(req: Request, res: Response): Promise<void> {
    const { items, operation } = req.body;
    try {
      const results = await contactService.getContactValues(items, operation);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public async bulkUpdate(req: Request, res: Response): Promise<void> {
    const items = req.body;
    console.log("[ContactController] bulkUpdate çağrıldı. Item sayısı:", items?.length);

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "Güncellenecek kişi bulunamadı" });
      return;
    }

    try {
      const results = await contactService.bulkUpdate(items);
      console.log("[ContactController] Sonuçlar:", results);
      res.json(results);
    } catch (err: any) {
      console.error("[ContactController] Hata:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
