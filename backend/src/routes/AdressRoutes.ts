import { Router } from "express";
import { AddressController } from "../controller/AdressController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const addressController = new AddressController();

router.use(securityMiddleware); // tüm customer istekleri token kontrolünden geçer

// /full spesifik rota, /:partyNumber'dan ÖNCE tanımlanmalı
router.get("/full/:partyNumber", (req, res) => {
  addressController.getAddressFull(req, res);
});

export default router;
