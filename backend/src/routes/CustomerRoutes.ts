import { Router } from "express";
import { CustomerController } from "../controller/CustomerController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const customerController = new CustomerController();

router.use(securityMiddleware); // tüm customer istekleri token kontrolünden geçer

// /full spesifik rota, /:partyNumber'dan ÖNCE tanımlanmalı
router.get("/full/:partyNumber", (req, res) => {
  customerController.getCustomerFull(req, res);
});

// /values spesifik rota, /:partyNumber'dan ÖNCE tanımlanmalı
router.post("/values", (req, res) => {
  customerController.getCustomerValues(req, res);
});

// /bulk spesifik rota, /:partyNumber'dan ÖNCE tanımlanmalı
router.patch("/bulk", (req, res) => {
  customerController.bulkUpdate(req, res);
});

export default router;
