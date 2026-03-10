import { RolModel } from "../models/RolModel.ts";
import { KullaniciModel } from "../models/KullaniciModel.ts";
import { AuthService } from "../services/AuthService.ts";

const authService = new AuthService();

// DB'deki nested obje → virgüllü string
// { kullanici: { read: true } } → "kullanici:okuma"
function yetkileriStreDonustur(yetkiler: any): string {
  if (!yetkiler || typeof yetkiler !== "object") return "";
  const eylemMap: Record<string, string> = {
    read: "okuma",
    write: "yazma",
    delete: "silme",
  };
  const parcalar: string[] = [];
  for (const [kaynak, izinler] of Object.entries(yetkiler)) {
    for (const [eylem, deger] of Object.entries(
      izinler as Record<string, boolean>,
    )) {
      if (deger === true && eylem in eylemMap) {
        parcalar.push(`${kaynak}:${eylemMap[eylem]}`);
      }
    }
  }
  return parcalar.join(",");
}

// Virgüllü string → DB'deki nested obje
// "kullanici:okuma,urun:yazma" → { kullanici: { read:true, ... }, ... }
function strdenYetkiOlustur(yetkilerStr: string): object {
  const sonuc: Record<string, Record<string, boolean>> = {
    kullanici: { read: false, write: false, delete: false },
    urun: { read: false, write: false, delete: false },
    siparis: { read: false, write: false, delete: false },
  };
  const eylemTersMap: Record<string, string> = {
    okuma: "read",
    yazma: "write",
    silme: "delete",
  };
  const dizi = yetkilerStr
    ? yetkilerStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  for (const yetki of dizi) {
    const [kaynak, eylemTr] = yetki.split(":");
    if (!kaynak || !eylemTr) continue;
    const eylemEn = eylemTersMap[eylemTr];
    if (eylemEn && kaynak in sonuc) (sonuc[kaynak] as any)[eylemEn] = true;
  }
  return sonuc;
}

// JWT token doğrula → { gecerli, rol, id }
function tokenKontrol(token: string): {
  gecerli: boolean;
  rol?: string;
  id?: string;
} {
  if (!token?.trim()) return { gecerli: false };
  const payload = authService.biletKontrolEt(token.trim());
  if (!payload) return { gecerli: false };
  return { gecerli: true, rol: payload.rol, id: payload.id };
}

// soap paketi bu nesneyi bekler:
// { <service/@name>: { <port/@name>: { <operasyon>: fn } } }
export const rolSoapService = {
  RolService: {
    RolServicePort: {
      // ─── TÜM ROLLERİ GETİR ──────────────────────────────────────
      TumRolleriGetir: async (_args: unknown) => {
        try {
          const roller = await RolModel.find().lean();
          const data = roller.map((r) => ({
            id: r._id.toString(),
            ad: r.ad,
            yetkiler: yetkileriStreDonustur(r.yetkiler),
          }));
          return { durum: "basarili", roller: JSON.stringify(data) };
        } catch {
          return { durum: "hata", roller: "" };
        }
      },

      // ─── TEK ROL GETİR ──────────────────────────────────────────
      RolGetir: async (args: { id: string }) => {
        try {
          const rol = await RolModel.findById(args.id).lean();
          if (!rol) return { durum: "hata", mesaj: "Rol bulunamadı!" };
          return {
            durum: "basarili",
            id: rol._id.toString(),
            ad: rol.ad,
            yetkiler: yetkileriStreDonustur(rol.yetkiler),
          };
        } catch {
          return { durum: "hata", mesaj: "Geçersiz ID!" };
        }
      },

      // ─── ROL EKLE (sadece admin) ─────────────────────────────────
      RolEkle: async (args: {
        token: string;
        ad: string;
        yetkiler?: string;
      }) => {
        const auth = tokenKontrol(args.token);
        if (!auth.gecerli)
          return { durum: "hata", mesaj: "Geçersiz veya eksik token!" };
        if (auth.rol !== "admin")
          return { durum: "hata", mesaj: "Sadece admin rol ekleyebilir!" };
        if (!args.ad?.trim())
          return { durum: "hata", mesaj: "Rol adı zorunludur!" };

        try {
          const nestedYetkiler = strdenYetkiOlustur(args.yetkiler ?? "");
          const yeni = await RolModel.create({
            ad: args.ad.trim(),
            yetkiler: nestedYetkiler,
          });
          return {
            durum: "basarili",
            mesaj: `"${yeni.ad}" rolü oluşturuldu.`,
            id: yeni._id.toString(),
          };
        } catch (err: any) {
          if (err.code === 11000)
            return {
              durum: "hata",
              mesaj: `"${args.ad}" adında bir rol zaten mevcut!`,
            };
          return { durum: "hata", mesaj: err.message };
        }
      },

      // ─── ROL GÜNCELLE (sadece admin) ────────────────────────────
      RolGuncelle: async (args: {
        token: string;
        id: string;
        yetkiler?: string;
      }) => {
        const auth = tokenKontrol(args.token);
        if (!auth.gecerli)
          return { durum: "hata", mesaj: "Geçersiz veya eksik token!" };
        if (auth.rol !== "admin")
          return { durum: "hata", mesaj: "Sadece admin rol güncelleyebilir!" };

        try {
          const nestedYetkiler = strdenYetkiOlustur(args.yetkiler ?? "");
          const guncellendi = await RolModel.findByIdAndUpdate(
            args.id,
            { yetkiler: nestedYetkiler },
            { new: true },
          );
          if (!guncellendi) return { durum: "hata", mesaj: "Rol bulunamadı!" };
          return {
            durum: "basarili",
            mesaj: `"${guncellendi.ad}" rolü güncellendi.`,
          };
        } catch {
          return { durum: "hata", mesaj: "Geçersiz ID!" };
        }
      },

      // ─── ROL SİL (sadece admin) ──────────────────────────────────
      RolSil: async (args: { token: string; id: string }) => {
        const auth = tokenKontrol(args.token);
        if (!auth.gecerli)
          return { durum: "hata", mesaj: "Geçersiz veya eksik token!" };
        if (auth.rol !== "admin")
          return { durum: "hata", mesaj: "Sadece admin rol silebilir!" };

        try {
          const rol = await RolModel.findById(args.id);
          if (!rol) return { durum: "hata", mesaj: "Rol bulunamadı!" };
          if (rol.ad === "admin")
            return { durum: "hata", mesaj: "Admin rolü silinemez!" };

          const kullananSayisi = await KullaniciModel.countDocuments({
            rol: rol._id,
          });
          if (kullananSayisi > 0) {
            return {
              durum: "hata",
              mesaj: `Bu rol ${kullananSayisi} kullanıcıya atanmış. Önce kullanıcıların rolünü değiştirin.`,
            };
          }

          await rol.deleteOne();
          return { durum: "basarili", mesaj: `"${rol.ad}" rolü silindi.` };
        } catch {
          return { durum: "hata", mesaj: "Geçersiz ID!" };
        }
      },
    },
  },
};
