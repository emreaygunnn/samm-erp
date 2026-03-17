import jwt from "jsonwebtoken";

const TUM_YETKILER = [
  "urun:okuma",
  "urun:yazma",
  "urun:silme",
  "kullanici:okuma",
];

interface EnvKullanici {
  id: string;
  email: string;
  password: string;
  ad: string;
}

function envKullanicilariGetir(): EnvKullanici[] {
  return [
    {
      id: "1",
      email: process.env.USER1_EMAIL!,
      password: process.env.USER1_PASSWORD!,
      ad: process.env.USER1_AD!,
    },
    {
      id: "2",
      email: process.env.USER2_EMAIL!,
      password: process.env.USER2_PASSWORD!,
      ad: process.env.USER2_AD!,
    },
  ];
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "gizli_anahtar";

  public tokenOlustur(kullanici: EnvKullanici): string {
    const signFn = (jwt as any).default?.sign || jwt.sign;
    const payload = {
      id: kullanici.id,
      kullanici: kullanici.ad,
      rol: "admin",
      yetkiler: TUM_YETKILER,
      ogrenciNo: null,
      sifreDegistirmesiGerekiyor: false,
    };
    return signFn(payload, this.JWT_SECRET, { expiresIn: "1h" });
  }

  public async login(email: string, sifre: string): Promise<string | null> {
    const kullanicilar = envKullanicilariGetir();
    const kullanici = kullanicilar.find(
      (k) => k.email === email && k.password === sifre,
    );
    if (!kullanici) return null;
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
