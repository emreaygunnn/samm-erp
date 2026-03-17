import { Router } from "express";
import { AuthService } from "../services/AuthService.ts";

const router = Router();
const authService = new AuthService();

router.post("/login", async (req, res) => {
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

export default router;
