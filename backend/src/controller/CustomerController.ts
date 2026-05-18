import type { Request, Response } from "express";
import { CustomerService } from "../service/CustomerService.js";

const customerService = new CustomerService();

export class CustomerController {
  // Mevcut değerleri Oracle'dan çeker (Check butonu için)
  public async getCustomerValues(req: Request, res: Response): Promise<void> {
    const { items, operation } = req.body;
    try {
      const results = await customerService.getCustomerValues(items, operation);
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Müşterinin tüm alanlarını döner (Check sayfası için)
  public async getCustomerFull(req: Request, res: Response): Promise<void> {
    const partyNumber = req.params.partyNumber as string;
    try {
      const result = await customerService.getCustomerFull(partyNumber);
      if (result === "NOT_FOUND") {
        res.status(404).json({ status: "not_found" });
        return;
      }
      res.json(result);
    } catch (err: any) {
      const oracleStatus: number = (err as any).oracleStatus ?? 0;
      console.error(`[CustomerController] getCustomerFull hatası: Oracle ${oracleStatus} → ${err.message}`);
      res.status(502).json({
        status: "oracle_error",
        oracleStatus,
        message: err.message,
      });
    }
  }

  // Toplu güncelleme
  public async bulkUpdate(req: Request, res: Response): Promise<void> {
    const items = req.body;
    console.log(
      "[CustomerController] bulkUpdate çağrıldı. Item sayısı:",
      items?.length,
    );

    if (!Array.isArray(items) || items.length === 0) {
      res
        .status(400)
        .json({ success: false, message: "Güncellenecek müşteri bulunamadı" });
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
