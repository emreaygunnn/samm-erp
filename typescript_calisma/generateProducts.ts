import fs from "fs";
import path from "path";

// 200 tane ürün üretecek fonksiyon
function generateProducts(count: number) {
  const kategoriler = [
    "Elektronik",
    "Mobilya",
    "Aksesuar",
    "Aydınlatma",
    "Ev Aletleri",
    "Hırdavat",
  ];
  const ebatlar = ["Küçük", "Orta", "Büyük", "Standart"];
  const products = [];

  for (let i = 1; i <= count; i++) {
    products.push({
      ad: `Ürün-${i}-${Math.random().toString(36).substring(7)}`,
      fiyat: Math.floor(Math.random() * 5000) + 50,
      stok: Math.floor(Math.random() * 500),
      kategori: kategoriler[Math.floor(Math.random() * kategoriler.length)],
      ebat: ebatlar[Math.floor(Math.random() * ebatlar.length)],
    });
  }
  return products;
}

// 1. ADIM: Klasör yoksa oluştur (Hatanın çözümü burası)
const dir = "./data";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
  console.log("data klasörü oluşturuldu.");
}

// 2. ADIM: Veriyi üret ve dosyaya yaz
const data = generateProducts(200);
fs.writeFileSync(path.join(dir, "urunler.json"), JSON.stringify(data, null, 2));

console.log(
  "200 adet ürün başarıyla 'data/urunler.json' dosyasına yazıldı! 🚀",
);
