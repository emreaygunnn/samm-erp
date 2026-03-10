/**
 * Rolleri ve kullanıcıları MongoDB'ye yükleyen seed scripti.
 * Çalıştırmak için: npm run seed
 *
 * NOT: Ürünler ve siparişler için "npm run migrate" kullanmaya devam edin.
 *      Bu script yalnızca Rol ve Kullanici koleksiyonlarını etkiler.
 */

import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { RolModel } from "./models/RolModel.ts";
import { KullaniciModel } from "./models/KullaniciModel.ts";

const mongoURI =
  "mongodb+srv://emreaygun:emre1905gs@cluster0.wanf2b3.mongodb.net/?appName=Cluster0";

// ---------------------------------------------------------------------------
// 1. ROL VERİSİ
// ---------------------------------------------------------------------------

const rolVerisi = [
  {
    ad: "admin",
    yetkiler: {
      kullanici: { read: true, write: true, delete: true },
      urun: { read: true, write: true, delete: true },
      siparis: { read: true, write: true, delete: true },
    },
  },
  {
    ad: "editor",
    yetkiler: {
      kullanici: { read: false, write: false, delete: false },
      urun: { read: true, write: true, delete: false },
      siparis: { read: true, write: true, delete: false },
    },
  },
  {
    ad: "stajyer",
    yetkiler: {
      kullanici: { read: false, write: false, delete: false },
      urun: { read: true, write: false, delete: false },
      siparis: { read: true, write: false, delete: false },
    },
  },
];

// ---------------------------------------------------------------------------
// 2. KULLANICI VERİSİ (rol adı ile tanımlanır, ObjectId seed sırasında eklenir)
// ---------------------------------------------------------------------------

const kullaniciVerisi = [
  {
    ad: "Emre",
    soyad: "Aygün",
    email: "emre@example.com",
    sifre: "123", // TODO: bcrypt hash kullan!
    rolAd: "admin",
    no: "2212102015",
    aciklama: "Sistem yöneticisi",
  },
  {
    ad: "editör",
    soyad: "Editor",
    email: "editör@example.com",
    sifre: "456",
    rolAd: "editor",
    no: "2212102016",
    aciklama: "İçerik editörü",
  },
];

// ---------------------------------------------------------------------------
// SEED FONKSİYONU
// ---------------------------------------------------------------------------

async function seed() {
  await mongoose.connect(mongoURI);
  console.log("MongoDB bağlantısı kuruldu.\n");

  // --- ROLLER ---
  // Var olan roller dokunulmaz; eksik olanlar eklenir
  const rolIdMap = new Map<string, mongoose.Types.ObjectId>();

  for (const veri of rolVerisi) {
    // lean() ile Mongoose type-casting'i atlıyoruz — raw MongoDB belgesi gelir
    const mevcut = await RolModel.findOne({ ad: veri.ad }).lean();
    if (mevcut) {
      // Eski string-dizi formatındaysa (Mongoose cast etmeden önce array görünür)
      if (Array.isArray(mevcut.yetkiler)) {
        await RolModel.findByIdAndUpdate(mevcut._id, {
          $set: { yetkiler: veri.yetkiler },
        });
        console.log(`  ROL güncellendi (yeni format): ${veri.ad}`);
      } else {
        console.log(`  ROL zaten güncel, atlandı: ${veri.ad}`);
      }
      rolIdMap.set(veri.ad, mevcut._id as mongoose.Types.ObjectId);
    } else {
      const yeni = await RolModel.create(veri);
      rolIdMap.set(veri.ad, yeni._id);
      console.log(`  ROL eklendi: ${veri.ad}`);
    }
  }

  // --- KULLANICILAR ---
  // Email ile kontrol et; varsa atla, yoksa ekle
  console.log();
  for (const { rolAd, ...veri } of kullaniciVerisi) {
    const rolId = rolIdMap.get(rolAd);
    if (!rolId) {
      console.warn(
        `  UYARI: "${rolAd}" adlı rol bulunamadı, atlandı: ${veri.email}`,
      );
      continue;
    }
    const mevcut = await KullaniciModel.findOne({ email: veri.email });
    if (mevcut) {
      console.log(`  KULLANICI zaten var, atlandı: ${veri.email}`);
    } else {
      const hashedSifre = await bcrypt.hash(veri.sifre, 10);
      await KullaniciModel.create({ ...veri, sifre: hashedSifre, rol: rolId });
      console.log(`  KULLANICI eklendi: ${veri.email}  (${rolAd})`);
    }
  }

  console.log("\nSeed tamamlandı! (Mevcut veriler korundu)");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed hatası:", err);
  process.exit(1);
});
