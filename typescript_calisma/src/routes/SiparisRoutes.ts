import { Router } from "express";
import { SiparisController } from "../controllers/SiparisController.ts";
import {
  guvenlikGorevlisi,
  yetkiKontrol,
} from "../middlewares/authMiddleware.ts";

const router = Router();
const siparisController = new SiparisController();

router.use(guvenlikGorevlisi);

router.get("/", yetkiKontrol("siparis:okuma"), siparisController.listele);
router.post("/", yetkiKontrol("siparis:yazma"), siparisController.olustur);
router.put("/:id", yetkiKontrol("siparis:yazma"), siparisController.guncelle);
router.delete("/:id", yetkiKontrol("siparis:silme"), siparisController.sil);

export default router;
