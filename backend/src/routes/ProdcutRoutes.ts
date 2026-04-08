import { Router } from "express";
import { ProductController } from "../controller/ProductController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const productController = new ProductController();

router.use(securityMiddleware); //tüm ürün istekleri token kontrolünden geçer

router.patch("/:id", (req, res) => productController.updateProduct(req, res));
router.patch("/bulk", (req, res) => productController.bulkUpdate(req, res));

export default router;

