import { Router } from "express";
import { ProfileController } from "../controller/ProfileController.js";
import { securityMiddleware } from "../middleware/AuthMiddleware.js";

const router = Router();
const profileController = new ProfileController();

router.use(securityMiddleware);

router.patch("/bulk", (req, res) => {
  profileController.bulkUpdate(req, res);
});

export default router;