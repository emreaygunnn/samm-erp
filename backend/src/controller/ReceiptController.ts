import type { Request, Response } from "express";
import { ReceiptService } from "../service/ReceiptService.js";

const receiptService = new ReceiptService();

export class ReceiptController {
  // Makbuzun tüm alanlarını döner (Check sayfası için)
  public async getReceiptFull(req: Request, res: Response): Promise<void> {
    const receiptNumber = req.params.receiptNumber as string;
    try {
      const result = await receiptService.getReceiptFull(receiptNumber);
      if (result === "NOT_FOUND") {
        res.status(404).json({ status: "not_found" });
        return;
      }
      res.json(result);
    } catch (err: any) {
      const oracleStatus: number = (err as any).oracleStatus ?? 0;
      console.error(`[ReceiptController] getReceiptFull hatası: Oracle ${oracleStatus} → ${err.message}`);
      res.status(502).json({
        status: "oracle_error",
        oracleStatus,
        message: err.message,
      });
    }
  }
}
