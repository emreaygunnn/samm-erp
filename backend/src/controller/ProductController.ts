import type { Request, Response } from "express";
import { ProductService } from "../service/ProductService.js";

const productService = new ProductService();

export class ProductController {
  // tek ürün güncelleme
  public async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const result = await productService.updateProduct(
        req.params.id as string,
        req.body,
      ); // req.params.id → Hangi ürün? "PRD-001"
      //req.body → Ne güncellenecek? { stock: 50 }
      res.json(result); // servisten gelen sonucu frontend e gönder
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  // toplu güncelleme
  public async bulkUpdate(req: Request, res: Response): Promise<void> {
    const items = req.body;
    console.log(
      "[ProductController] bulkUpdate çağrıldı. Item sayısı:",
      items?.length,
    );
    console.log("[ProductController] Body:", items);

    if (!Array.isArray(items) || items.length === 0) {
      console.log(
        "[ProductController] Geçersiz request - items array değil veya boş",
      );
      res
        .status(400)
        .json({ success: false, message: "Güncellenecek ürün bulunamadı" });
      return;
    }
    try {
      const results = await productService.bulkUpdate(items);
      console.log("[ProductController] Sonuçlar:", results);
      res.json(results);
    } catch (err: any) {
      console.error("[ProductController] Hata:", err.message);
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
