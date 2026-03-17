import { Router } from "express";
import { UrunController } from "../controllers/UrunController.ts";
import { guvenlikGorevlisi } from "../middlewares/authMiddleware.ts";

const router = Router();
const controller = new UrunController();

router.use(guvenlikGorevlisi);

router.patch("/:id/lokasyon", controller.lokasyonGuncelle);
router.patch("/:id/stok", controller.stokGuncelle);

export default router;
