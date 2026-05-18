import type { Request, Response } from "express";
import { OrderService } from "../service/OrderService.js";

const orderService = new OrderService();

export class OrderController {
  // Siparişin tüm alanlarını döner (Check sayfası için)
  public async getOrderFull(req: Request, res: Response): Promise<void> {
    const orderHeaderId = req.params.orderHeaderId as string;
    try {
      const result = await orderService.getOrderFull(orderHeaderId);
      if (result === "NOT_FOUND") {
        res.status(404).json({ status: "not_found" });
        return;
      }
      res.json(result);
    } catch (err: any) {
      const oracleStatus: number = (err as any).oracleStatus ?? 0;
      console.error(`[OrderController] getOrderFull hatası: Oracle ${oracleStatus} → ${err.message}`);
      res.status(502).json({
        status: "oracle_error",
        oracleStatus,
        message: err.message,
      });
    }
  }
}
