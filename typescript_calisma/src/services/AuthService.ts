import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { KullaniciModel } from "../models/KullaniciModel.ts";
import type { IRol } from "../models/RolModel.ts";

dotenv.config();

// DB'deki nested yetkiler objesini → frontend/JWT string dizisine çevirir
// Örn: { urun: { read: true, write: false } } → ["urun:okuma"]
function yetkileriDiziyeDonustur(yetkiler: any): string[] {
  if (!yetkiler || typeof yetkiler !== "object" || Array.isArray(yetkiler))
    return [];
  const eylemMap: Record<string, string> = {
    read: "okuma",
    write: "yazma",
    delete: "silme",
  };
  const sonuc: string[] = [];
  for (const [kaynak, izinler] of Object.entries(yetkiler)) {
    for (const [eylem, deger] of Object.entries(
      izinler as Record<string, boolean>,
    )) {
      if (deger === true && eylem in eylemMap) {
        sonuc.push(`${kaynak}:${eylemMap[eylem]}`);
      }
    }
  }
  return sonuc;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "gizli_anahtar";

  // Kullanıcı nesnesinden doğrudan JWT üretir (populate edilmiş rol gerekir)
  public tokenOlustur(kullanici: any): string {
    const signFn = (jwt as any).default?.sign || jwt.sign;
    const rol = kullanici.rol as IRol;
    // Mongoose subdocument'ı plain objeye çevir — Object.entries çalışsın
    const rolPlain =
      typeof (rol as any).toJSON === "function" ? (rol as any).toJSON() : rol;
    const payload = {
      id: kullanici._id,
      kullanici: `${kullanici.ad} ${kullanici.soyad ?? ""}`.trim(),
      rol: rolPlain.ad,
      // DB'deki nested objeyi string diziye çevir — frontend ve middleware bu formatı bekliyor
      yetkiler: yetkileriDiziyeDonustur(rolPlain.yetkiler),
      ogrenciNo: kullanici.no ?? null,
      sifreDegistirmesiGerekiyor: kullanici.sifreDegistirmesiGerekiyor ?? false,
    };
    return signFn(payload, this.JWT_SECRET, { expiresIn: "1h" });
  }

  public async login(email: string, sifre: string): Promise<string | null> {
    const kullanici = await KullaniciModel.findOne({ email }).populate<{
      rol: IRol;
    }>("rol");

    if (!kullanici) return null;
    const compareFn = (bcrypt as any).default?.compare ?? bcrypt.compare;
    const sifreEslesiyor = await compareFn(sifre, kullanici.sifre);
    if (!sifreEslesiyor) return null;

    return this.tokenOlustur(kullanici);
  }

  public async sifreDegistir(
    kullaniciId: string,
    yeniSifre: string,
  ): Promise<string> {
    const hashFn = (bcrypt as any).default?.hash ?? bcrypt.hash;
    const hashedSifre = await hashFn(yeniSifre, 10);
    const kullanici = await KullaniciModel.findByIdAndUpdate(
      kullaniciId,
      { sifre: hashedSifre, sifreDegistirmesiGerekiyor: false },
      { new: true },
    ).populate<{ rol: IRol }>("rol");
    if (!kullanici) throw new Error("Kullanıcı bulunamadı!");
    return this.tokenOlustur(kullanici);
  }

  public biletKontrolEt(token: string): any {
    const verifyFn = (jwt as any).default?.verify || jwt.verify;
    try {
      return verifyFn(token, this.JWT_SECRET);
    } catch {
      return null;
    }
  }
}
