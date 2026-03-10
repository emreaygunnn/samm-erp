import { Router } from "express";
import { AuthService } from "../services/AuthService.ts";
import { guvenlikGorevlisi } from "../middlewares/authMiddleware.ts";

const router = Router();
const authService = new AuthService();

router.post("/login", async (req, res) => {
  // Artık .env değil, MongoDB üzerinden doğrulama yapılıyor.
  // Frontend'den { email, sifre } bekleniyor.
  const { email, sifre } = req.body;

  if (!email || !sifre) {
    res
      .status(400)
      .json({ success: false, message: "Email ve şifre zorunludur!" });
    return;
  }

  const bilet = await authService.login(email, sifre);

  if (bilet) {
    res.json({
      success: true,
      message: "Biletiniz hazır!",
      token: bilet,
    });
  } else {
    res
      .status(401)
      .json({ success: false, message: "Email veya şifre hatalı!" });
  }
});

router.post("/sifreDegistir", guvenlikGorevlisi, async (req, res) => {
  const { yeniSifre } = req.body;
  const kullaniciId = (req as any).kullanici?.id;

  if (
    !yeniSifre ||
    typeof yeniSifre !== "string" ||
    yeniSifre.trim().length < 4
  ) {
    res.status(400).json({
      success: false,
      message: "Yeni şifre en az 4 karakter olmalıdır!",
    });
    return;
  }

  try {
    const token = await authService.sifreDegistir(kullaniciId, yeniSifre);
    res.json({ success: true, token });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
});

export default router;
