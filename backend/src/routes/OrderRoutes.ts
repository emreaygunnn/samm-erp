import { Router } from "express";
import { OrderController } from "../controller/OrderController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const orderController = new OrderController();

router.use(securityMiddleware);

router.get("/full/:orderHeaderId", (req, res) => orderController.getOrderFull(req, res));

export default router;
