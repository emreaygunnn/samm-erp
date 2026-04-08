import type { Request, Response } from "express";
import { ProductService } from "../service/ProductService.js";


const productService = new ProductService();

export class ProductController {
    // tek ürün güncelleme
    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const result = await productService.updateProduct(req.params.id as string, req.body); // req.params.id → Hangi ürün? "PRD-001"
            //req.body → Ne güncellenecek? { stock: 50 }
            res.json(result);// servisten gelen sonucu frontend e gönder                                                                         
        }
        catch (err: any) {
            res.status(400).json({ success: false, message: err.message });

        }

    }

    // toplu güncelleme
    public async bulkUpdate(req: Request, res: Response): Promise<void> {
        const items = req.body; //Body'deki veriyi al. Frontend şöyle bir şey gönderiyor:
        //json[
        //  { "id": "PRD-001", "stock": 50 },
        //  { "id": "PRD-002", "stock": 120 },
        //  { "id": "PRD-003", "stock": 30 }
        //]
        //items artık bu diziyi tutuyo
        if (!Array.isArray(items) || items.length === 0) {
            res.status(400).json({ success: false, message: "Güncellenecek ürün bulunamadı" });
            return;
        }
        try {
            const results = await productService.bulkUpdate(items);
            res.json(results);
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message });
        }
    }


}