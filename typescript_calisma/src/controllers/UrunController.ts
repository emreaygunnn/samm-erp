import type { Request, Response } from "express";
import { OracleUrunService } from "../services/Oracleurunservice.ts";

const oracleService = new OracleUrunService();

export class UrunController {
  public async stokGuncelle(req: Request, res: Response) {
    try {
      res.json(
        await oracleService.alanGuncelle(String(req.params.id), req.body)
      );
    } catch (err: any) {
      res.status(404).send(err.message);
    }
  }

  public async lokasyonGuncelle(req: Request, res: Response) {
    try {
      const { lokasyon } = req.body;
      if (!lokasyon) {
        res.status(400).send("lokasyon gerekli");
        return;
      }

      const sonuc = await oracleService.lokasyonGuncelle(
        String(req.params.id),
        lokasyon
      );

      res.json(sonuc);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }
}
