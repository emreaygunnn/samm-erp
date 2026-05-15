import type { Request, Response } from "express";
import { AddressService } from "../service/AddressService.js";

const addressService = new AddressService();

export class AddressController {
  // Müşterinin tüm alanlarını döner (Check sayfası için)
  public async getAddressFull(req: Request, res: Response): Promise<void> {
    const partyNumber = req.params.partyNumber as string;
    try {
      const result = await addressService.getAddressFull(partyNumber);
      if (result === "NOT_FOUND") {
        res.status(404).json({ status: "not_found" });
        return;
      }
      res.json(result);
    } catch (err: any) {
      const oracleStatus: number = (err as any).oracleStatus ?? 0;
      console.error(
        `[AddressController] getAddressFull hatası: Oracle ${oracleStatus} → ${err.message}`,
      );
      res.status(502).json({
        status: "oracle_error",
        oracleStatus,
        message: err.message,
      });
    }
  }
}
