/**
 * Tek seferlik şifre hash migration scripti.
 * DB'deki tüm plain-text şifreleri bulur ve bcrypt ile hashler.
 * Çalıştırmak için: npm run hashSifreleri
 */
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { KullaniciModel } from "./models/KullaniciModel.ts";

const mongoURI =
  "mongodb+srv://emreaygun:emre1905gs@cluster0.wanf2b3.mongodb.net/?appName=Cluster0";

async function hashSifreleri() {
  await mongoose.connect(mongoURI);
  console.log("MongoDB bağlantısı kuruldu.\n");

  const kullanicilar = await KullaniciModel.find();
  let guncellenenSayisi = 0;

  for (const kullanici of kullanicilar) {
    // Bcrypt hash'leri her zaman $2b$ veya $2a$ ile başlar
    const zatenHashli =
      kullanici.sifre.startsWith("$2b$") || kullanici.sifre.startsWith("$2a$");
    if (zatenHashli) {
      console.log(`  Atlandı (zaten hashli): ${kullanici.email}`);
      continue;
    }

    const hashliSifre = await bcrypt.hash(kullanici.sifre, 10);
    await KullaniciModel.findByIdAndUpdate(kullanici._id, {
      sifre: hashliSifre,
    });
    console.log(
      `  Güncellendi: ${kullanici.email}  (eski: "${kullanici.sifre}")`,
    );
    guncellenenSayisi++;
  }

  console.log(
    `\nTamamlandı! ${guncellenenSayisi} kullanıcının şifresi hashlendi.`,
  );
  await mongoose.disconnect();
}

hashSifreleri().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
