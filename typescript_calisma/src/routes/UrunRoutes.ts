import { Router } from "express";
import { UrunController } from "../controllers/UrunController.ts";
import {
  guvenlikGorevlisi,
  yetkiKontrol,
} from "../middlewares/authMiddleware.ts";

const router = Router();
const controller = new UrunController();

router.use(guvenlikGorevlisi);

router.get("/", yetkiKontrol("urun:okuma"), controller.getTumUrunler);
router.post("/", yetkiKontrol("urun:yazma"), controller.urunEkle);
router.post(
  "/bulk-import",
  yetkiKontrol("urun:yazma"),
  controller.topluIcerAktar,
);
router.put("/:id", yetkiKontrol("urun:yazma"), controller.urunGuncelleTam);
router.patch(
  "/:id/lokasyon",
  yetkiKontrol("urun:yazma"),
  controller.lokasyonGuncelle,
);
router.patch("/:id", yetkiKontrol("urun:yazma"), controller.urunGuncelleKismi);
router.delete("/:id", yetkiKontrol("urun:silme"), controller.urunSil);

export default router;
