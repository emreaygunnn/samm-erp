import { Router } from "express";
import { RolModel } from "../models/RolModel.ts";
import { KullaniciModel } from "../models/KullaniciModel.ts";
import {
  guvenlikGorevlisi,
  rolKontrol,
} from "../middlewares/authMiddleware.ts";

const router = Router();

// DB'deki nested yetkiler → frontend string dizisi
// { urun: { read: true } } → ["urun:okuma"]
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

// Frontend string dizisi → DB'ye yazılacak nested yetkiler objesi
// ["urun:okuma", "urun:yazma"] → { kullanici: {...false}, urun: {read:true, write:true, delete:false}, siparis: {...false} }
function dizidenYetkiOlustur(yetkilerDizi: string[]): object {
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
  for (const yetki of yetkilerDizi) {
    const parcalar = yetki.split(":");
    const kaynak = parcalar[0];
    const eylem = parcalar[1];
    if (!kaynak || !eylem) continue;
    const alan = eylemTersMap[eylem];
    if (alan && kaynak in sonuc) sonuc[kaynak]![alan] = true;
  }
  return sonuc;
}

// Auth gerektirmez — dropdown için kullanılır
router.get("/", async (_req, res) => {
  try {
    const roller = await RolModel.find().lean();
    // DB'deki nested objeyi frontend'in beklediği string dizisine çevir
    const frontendRoller = roller.map((r) => ({
      ...r,
      yetkiler: yetkileriDiziyeDonustur(r.yetkiler),
    }));
    res.json(frontendRoller);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Yeni rol oluştur — sadece admin
router.post("/", guvenlikGorevlisi, rolKontrol(["admin"]), async (req, res) => {
  try {
    const { ad, yetkiler } = req.body;
    if (!ad?.trim()) {
      res.status(400).json({ message: "Rol adı zorunludur!" });
      return;
    }
    // Frontend'den gelen string dizi → nested obje
    const nestedYetkiler = dizidenYetkiOlustur(
      Array.isArray(yetkiler) ? yetkiler : [],
    );
    const yeni = await RolModel.create({
      ad: ad.trim(),
      yetkiler: nestedYetkiler,
    });
    res.status(201).json({
      success: true,
      data: {
        ...yeni.toJSON(),
        yetkiler: yetkileriDiziyeDonustur(yeni.toJSON().yetkiler),
      },
    });
  } catch (err: any) {
    // MongoDB unique index ihlali
    if (err.code === 11000) {
      res
        .status(409)
        .json({ message: `"${req.body.ad}" adında bir rol zaten mevcut!` });
      return;
    }
    res.status(400).json({ message: err.message });
  }
});

// Rol yetkilerini güncelle — sadece admin
router.put(
  "/:id",
  guvenlikGorevlisi,
  rolKontrol(["admin"]),
  async (req, res) => {
    try {
      const { yetkiler } = req.body;
      // Frontend'den gelen string dizi → nested obje olarak kaydet
      const nestedYetkiler = dizidenYetkiOlustur(
        Array.isArray(yetkiler) ? yetkiler : [],
      );
      const guncellendi = await RolModel.findByIdAndUpdate(
        req.params.id,
        { yetkiler: nestedYetkiler },
        { new: true, runValidators: true, lean: true },
      );
      if (!guncellendi) {
        res.status(404).json({ message: "Rol bulunamadı!" });
        return;
      }
      res.json({
        success: true,
        data: {
          ...guncellendi,
          yetkiler: yetkileriDiziyeDonustur((guncellendi as any).yetkiler),
        },
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  },
);

// Rol sil — sadece admin; admin rolü ve kullanıcısı olan roller silinemez
router.delete(
  "/:id",
  guvenlikGorevlisi,
  rolKontrol(["admin"]),
  async (req, res) => {
    try {
      const rol = await RolModel.findById(req.params.id);
      if (!rol) {
        res.status(404).json({ message: "Rol bulunamadı!" });
        return;
      }

      if (rol.ad === "admin") {
        res.status(403).json({ message: "Admin rolü silinemez!" });
        return;
      }

      const kullananSayisi = await KullaniciModel.countDocuments({
        rol: rol._id,
      });
      if (kullananSayisi > 0) {
        res.status(409).json({
          message: `Bu rol ${kullananSayisi} kullanıcıya atanmış. Önce bu kullanıcıların rolünü değiştirin.`,
        });
        return;
      }

      await rol.deleteOne();
      res.json({ success: true, message: `"${rol.ad}" rolü silindi.` });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  },
);

export default router;
