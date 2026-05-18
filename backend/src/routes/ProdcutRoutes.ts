import { Router } from "express";
import { ProductController } from "../controller/ProductController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const productController = new ProductController();

router.use(securityMiddleware); //tüm ürün istekleri token kontrolünden geçer

router.post("/check", (req, res) => productController.getProduct(req, res));

router.post("/update", (req, res) => {
  productController.updateProduct(req, res);
});

router.post("/language", (req, res) => {
  productController.getLanguage(req, res);
});

export default router;
