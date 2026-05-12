import { Router } from "express";
import { ContactController } from "../controller/ContactController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const contactController = new ContactController();

router.use(securityMiddleware);

// /values spesifik rota, /:partyNumber'dan ÖNCE tanımlanmalı
router.post("/values", (req, res) => {
  contactController.getContactValues(req, res);
});

router.patch("/bulk", (req, res) => {
  contactController.bulkUpdate(req, res);
});

router.patch("/:partyNumber", (req, res) => {
  contactController.updateContact(req, res);
});

export default router;