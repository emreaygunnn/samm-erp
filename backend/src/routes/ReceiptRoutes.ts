import { Router } from "express";
import { ReceiptController } from "../controller/ReceiptController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const receiptController = new ReceiptController();

router.use(securityMiddleware);

router.get("/full/:receiptNumber", (req, res) => receiptController.getReceiptFull(req, res));

export default router;
