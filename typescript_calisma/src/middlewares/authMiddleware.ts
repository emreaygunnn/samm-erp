import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService.ts";

const authService = new AuthService();

export const guvenlikGorevlisi = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bilet = req.headers["authorization"];
  if (!bilet) return res.status(403).send("Biletin yok, giremezsin!");

  const token = bilet.split(" ")[1];
  if (!token) return res.status(403).send("Biletin yok , giremezsin!");
  const doğrulama = authService.biletKontrolEt(token);

  if (doğrulama) {
    (req as any).kullanici = doğrulama;
    next();
  } else {
    res.status(401).send("Biletin sahte veya süresi dolmuş!");
  }
};
