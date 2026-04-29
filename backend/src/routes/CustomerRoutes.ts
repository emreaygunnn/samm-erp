import { Router } from "express";
import { CustomerController } from "../controller/CustomerController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const customerController = new CustomerController();

router.use(securityMiddleware); // tüm customer istekleri token kontrolünden geçer

// /bulk spesifik rota, /:partyNumber'dan ÖNCE tanımlanmalı
router.patch("/bulk", (req, res) => {
  customerController.bulkUpdate(req, res);
});

router.patch("/:partyNumber", (req, res) => {
  customerController.updateCustomer(req, res);
});

export default router;
