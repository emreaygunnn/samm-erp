import { Router } from "express";
import { KullaniciController } from "../controllers/KullaniciController.ts";
import {
  guvenlikGorevlisi,
  yetkiKontrol,
  rolKontrol,
} from "../middlewares/authMiddleware.ts";

const router = Router();
const controller = new KullaniciController();

router.use(guvenlikGorevlisi);

router.get("/", yetkiKontrol("kullanici:okuma"), controller.listele);
router.get("/:id", yetkiKontrol("kullanici:okuma"), controller.detayGetir);
router.post("/", yetkiKontrol("kullanici:yazma"), controller.ekle);
router.put("/:id", yetkiKontrol("kullanici:yazma"), controller.guncelle);
router.delete("/:id", yetkiKontrol("kullanici:silme"), controller.sil);

// Rol yönetimi her zaman sadece adminde kalır (yetkiKontrol dışında)
export { rolKontrol };
export default router;
