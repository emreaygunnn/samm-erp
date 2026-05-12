import { Router } from "express";
import { ProfileController } from "../controller/ProfileController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const profileController = new ProfileController();

router.use(securityMiddleware);

// /values spesifik rota, /bulk'tan ÖNCE tanımlanmalı
router.post("/values", (req, res) => {
  profileController.getProfileValues(req, res);
});

router.patch("/bulk", (req, res) => {
  profileController.bulkUpdate(req, res);
});

export default router;