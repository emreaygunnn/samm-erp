import { Router } from "express";
import { ContactController } from "../controller/ContactController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const contactController = new ContactController();

router.use(securityMiddleware);

router.patch("/bulk", (req, res) => {
  contactController.bulkUpdate(req, res);
});

router.patch("/:partyNumber", (req, res) => {
  contactController.updateContact(req, res);
});

export default router;