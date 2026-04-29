import type { Request, Response } from "express";
import { CustomerService } from "../service/CustomerService.js";

const customerService = new CustomerService();

export class CustomerController {
  // Tek müşteri güncelleme
  public async updateCustomer(req: Request, res: Response): Promise<void> {
    try {
      const result = await customerService.updateCustomer(
        req.params.partyNumber as string,
        req.body,
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // Toplu güncelleme
  public async bulkUpdate(req: Request, res: Response): Promise<void> {
    const items = req.body;
    console.log("[CustomerController] bulkUpdate çağrıldı. Item sayısı:", items?.length);

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "Güncellenecek müşteri bulunamadı" });
      return;
    }

    try {
      const results = await customerService.bulkUpdate(items);
      console.log("[CustomerController] Sonuçlar:", results);
      res.json(results);
    } catch (err: any) {
      console.error("[CustomerController] Hata:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
