import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService.ts";

const authService = new AuthService();

export const guvenlikGorevlisi = (
  req: Request,
  res: Response,
  next: NextFunction,
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

export const rolKontrol = (izinVerilenRoller: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const kullanici = (req as any).kullanici;

    if (!kullanici) {
      return res.status(401).send("Önce giriş yapmalısın!");
    }

    if (izinVerilenRoller.includes(kullanici.rol)) {
      next();
    } else {
      res
        .status(403)
        .send(
          `Bu işlem için ${izinVerilenRoller.join(" veya ")} yetkisi lazım!`,
        );
    }
  };
};

// JWT'deki yetkiler dizisine bakarak granüler erişim kontrolü yapar.
// Rol adından bağımsız çalışır; DB'den güncellenmiş yetkiler yeniden giriş
// sonrası JWT'ye yansır.
export const yetkiKontrol = (gerekliYetki: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const kullanici = (req as any).kullanici;

    if (!kullanici) {
      return res.status(401).send("Önce giriş yapmalısın!");
    }

    const yetkiler: string[] = kullanici.yetkiler ?? [];
    if (yetkiler.includes(gerekliYetki)) {
      next();
    } else {
      res.status(403).send(`Bu işlem için "${gerekliYetki}" yetkisi gerekli!`);
    }
  };
};
