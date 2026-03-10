/**
 * JSON verilerini MongoDB'ye aktaran GÜVENLİ migration scripti.
 * Verileri silmez, sadece günceller veya eksikleri ekler (Upsert).
 */
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- MODELLER ---
const urunSchema = new mongoose.Schema({
  ad: { type: String, unique: true }, // 'ad' unique olduğu için upsert yapabiliriz
  fiyat: Number,
  stok: Number,
  kategori: String,
  ebat: String,
});
const kullaniciSchema = new mongoose.Schema({
  email: { type: String, unique: true }, // 'email' unique olduğu için upsert yapabiliriz
  ad: String,
  soyad: String,
  sifre: String,
  rol: String,
  no: String,
  aciklama: String,
});
const siparisSchema = new mongoose.Schema({
  urunId: { type: mongoose.Schema.Types.ObjectId, ref: "Urun" },
  urunAd: String,
  adet: Number,
  birimFiyat: Number,
  toplamTutar: Number,
  olusturan: String,
  tarih: String,
});

const UrunModel = mongoose.model("Urun", urunSchema);
const KullaniciModel = mongoose.model("Kullanici", kullaniciSchema);
const SiparisModel = mongoose.model("Siparis", siparisSchema);

const mongoURI =
  "mongodb+srv://emreaygun:emre1905gs@cluster0.wanf2b3.mongodb.net/?appName=Cluster0";

async function migrate() {
  await mongoose.connect(mongoURI);
  console.log("MongoDB bağlantısı kuruldu.");

  // --- 1. ÜRÜNLER ---
  const urunlerJson = JSON.parse(
    readFileSync(path.join(__dirname, "data", "urunler.json"), "utf-8"),
  );
  const urunIdMap = new Map<number, mongoose.Types.ObjectId>();

  for (const u of urunlerJson) {
    const { id: eskiId, ...veri } = u;
    // Varsa güncelle, yoksa oluştur
    const yeni = await UrunModel.findOneAndUpdate(
      { ad: veri.ad },
      { $set: veri },
      { upsert: true, new: true },
    );
    urunIdMap.set(eskiId, yeni._id as mongoose.Types.ObjectId);
  }
  console.log("Ürünler senkronize edildi.");

  // --- 2. SİPARİŞLER ---
  const siparislerJson = JSON.parse(
    readFileSync(path.join(__dirname, "data", "siparisler.json"), "utf-8"),
  );

  for (const s of siparislerJson) {
    const { id: eskiId, urunId: eskiUrunId, ...veri } = s;
    const yeniUrunId = urunIdMap.get(eskiUrunId);

    // Siparişi ID'ye göre kontrol et (varsa güncelleme, yoksa ekle mantığı)
    // Siparişlerde genelde "tarih" ve "olusturan" gibi benzersiz bir alan yoksa,
    // sadece yeni kayıt eklemek daha güvenli olabilir.
    await SiparisModel.updateOne(
      { tarih: veri.tarih, olusturan: veri.olusturan }, // Siparişi ayırt eden alanlar
      { $set: { ...veri, urunId: yeniUrunId } },
      { upsert: true },
    );
  }
  console.log("Siparişler senkronize edildi.");

  // --- 3. KULLANICILAR ---
  const kullanicilarJson = JSON.parse(
    readFileSync(path.join(__dirname, "data", "kullanicilar.json"), "utf-8"),
  );

  for (const k of kullanicilarJson) {
    // 'rol' alanı JSON'da string ("editor" gibi), DB'de ObjectId referansı.
    // $set'e dahil edilirse ObjectId'yi bozar — bu yüzden çıkarıyoruz.
    const { id: eskiId, rol: _rol, ...veri } = k;
    if (!veri.email) continue; // email olmadan upsert yapılamaz, atla
    await KullaniciModel.findOneAndUpdate(
      { email: veri.email },
      { $set: veri },
      { upsert: true },
    );
  }
  console.log("Kullanıcılar senkronize edildi.");

  console.log("\nMigration tamamlandı! (Veriler korundu)");
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration hatası:", err);
  process.exit(1);
});
