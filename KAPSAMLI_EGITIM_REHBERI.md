# 🚀 SAMM ERP - Kapsamlı Eğitim Rehberi

**Bu dokümanda projenin her satırı, her adımı, her mimarisi detaylıca açıklanmıştır.**

---

## 📚 İçindekiler

1. [Proje Nedir?](#proje-nedir)
2. [Teknoloji Stack'i](#teknoloji-stacki)
3. [Proje Mimarisi (Genel Görünüm)](#proje-mimarisi-genel-görünüm)
4. [Frontend Detaylı Açıklaması](#frontend-detaylı-açıklaması)
5. [Backend Detaylı Açıklaması](#backend-detaylı-açıklaması)
6. [JSON'dan MongoDB'ye Geçiş Hikayesi](#jsonda-mongodbye-geçiş-hikayesi)
7. [Bir İstek Nasıl İşlenilir?](#bir-istek-nasıl-işlenilir)
8. [Veritabanı Mimarisi](#veritabanı-mimarisi)
9. [Kimlik Doğrulama Sistemi (JWT)](#kimlik-doğrulama-sistemi-jwt)
10. [Her API Endpoint'ini Detaylı Anlama](#her-api-endpointini-detaylı-anlama)

---

## 🎯 Proje Nedir?

**SAMM ERP**, Enterprise Resource Planning (İşletme Kaynakları Planlama) sistemidir. Basitçe:

- 📦 **Ürün Yönetimi**: Ürün ekle, sil, güncelle
- 🛒 **Sipariş Yönetimi**: Müşteri siparişlerini kaydet, stok otomatik düşür
- 👥 **Kullanıcı Yönetimi**: Admin, Editor, Stajyer rolleri
- 📊 **Dashboard**: Istatistikler, stok uyarıları

---

## 🛠️ Teknoloji Stack'i

### **Frontend (Kullanıcı Arayüzü)**

```
React 19.2.0        → UI bileşenleri oluşturmak
TypeScript 5.9      → Güvenli kod yazmak (tip kontrollü)
Vite 7.3.1          → Süper hızlı geliştirme ve derleme
Axios 1.13.5        → Backend'e HTTP istek göndermek
React Router 7.13.0 → Sayfa arası gezinme (/urunler, /siparisler vb)
Lucide React 0.575  → Profesyonel ikonlar
```

**Neden bu teknolojiler?**

- React: Facebook tarafından yapılmış, günümüzün en popüler UI kütüphanesi
- TypeScript: Hataları daha erken yakalamanı sağlar (bug daha az)
- Vite: Webpack'ten 10 kat daha hızlı (geliştirme maliyeti az)
- Axios: Fetch API'den daha yapılandırılabilir

### **Backend (Sunucu Tarafı)**

```
Node.js 18+         → JavaScript'i sunucuda çalıştırmak
Express.js 5.2.1    → Web sunucusu framework'ü
TypeScript 5.9.3    → Sunucu kodunda da tip güvenliği
Mongoose 9.2.2      → MongoDB ile iletişim (ORM)
JWT (jsonwebtoken)  → Güvenli token üretme/doğrulama
CORS 2.8.6          → Frontend'in backend'e istek atmasına izin
```

### **Veritabanı**

```
MongoDB             → NoSQL veritabanı (JSON benzeri belgeler)
MongoDB Atlas       → Cloud'da MongoDB (internette erişilebilir)
```

**Mimari Diyagram**:

```
[Frontend (React)]  ←→  [Backend (Express.js)]  ←→  [MongoDB]
    Browser               Port 3000               Cloud
```

---

## 🗂️ Proje Mimarisi (Genel Görünüm)

```
samm_erp/
├── frontend-app/               ← Frontend (React)
│   ├── src/
│   │   ├── main.tsx           ← React başlangıcı
│   │   ├── App.tsx            ← Routing yapılandırması
│   │   ├── api.ts             ← Backend bağlantısı (axios)
│   │   ├── types.ts           ← TypeScript arayüzleri
│   │   ├── context/
│   │   │   └── AuthContext.tsx ← Global kullanıcı durumu
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      ← Giriş sayfası
│   │   │   ├── DashboardPage.tsx  ← Ana sayfa
│   │   │   ├── UrunlerPage.tsx    ← Ürün yönetimi
│   │   │   ├── SiparislerPage.tsx ← Sipariş yönetimi
│   │   │   └── KullanicilarPage.tsx ← Kullanıcı yönetimi
│   │   └── components/
│   │       ├── Modal.tsx
│   │       └── Sidebar.tsx
│   └── vite.config.ts         ← Vite ayarları
│
└── typescript_calisma/         ← Backend (Express.js)
    ├── src/
    │   ├── index.ts           ← Backend başlangıcı
    │   ├── migrate.ts         ← JSON → MongoDB aktarma
    │   ├── config/
    │   │   ├── config.ts      ← Yapılandırma dosyaları
    │   │   └── database.ts    ← Veritabanı bağlantısı
    │   ├── models/            ← MongoDB şemaları
    │   │   ├── UrunModel.ts
    │   │   ├── KullaniciModel.ts
    │   │   └── SiparisModel.ts
    │   ├── services/          ← İş mantığı
    │   │   ├── AuthService.ts
    │   │   ├── UrunService.ts
    │   │   ├── SiparisService.ts
    │   │   └── KullaniciService.ts
    │   ├── controllers/       ← İstek işleyicileri
    │   │   ├── UrunController.ts
    │   │   ├── SiparisController.ts
    │   │   └── KullaniciController.ts
    │   ├── routes/            ← URL rotaları
    │   │   ├── AuthRoutes.ts
    │   │   ├── UrunRoutes.ts
    │   │   ├── SiparisRoutes.ts
    │   │   └── KullaniciRoutes.ts
    │   ├── middlewares/       ← İstek öncesi kontroller
    │   │   └── authMiddleware.ts
    │   ├── data/              ← JSON dosyaları (eski sistem)
    │   │   ├── urunler.json
    │   │   ├── kullanicilar.json
    │   │   └── siparisler.json
    │   └── types/
    │       └── types.ts       ← TypeScript arayüzleri
    ├── .env                   ← Gizli bilgiler (password vb)
    └── package.json
```

---

## 🎨 Frontend Detaylı Açıklaması

### **1. Başlangıç Noktası: main.tsx**

Tarayıcı uygulamayı açtığında ilk çalışan dosya `main.tsx`'dir.

```typescript
// main.tsx - Uygulama başlatma

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

// Adım 1: React uygulamasını HTML'deki root div'ine "bağla"
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Adım 2: BrowserRouter - URL değişikliklerini dinle */}
    <BrowserRouter>
      {/* Adım 3: AuthProvider - Kullanıcı bilgisini tüm uygulamaya sun */}
      <AuthProvider>
        {/* Adım 4: App bileşeni - Ana uygulama */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**Nedir bu wrapper'lar?**

```
HTML
 ↓
ReactDOM (React'ı HTML'ye bağla)
 ↓
BrowserRouter (URL'deki değişiklikleri takip et)
 ↓
AuthProvider (Kullanıcı oturumu tüm bileşenlere ulaş)
 ↓
App (Ana uygulamayı çekmek)
 ↓
Sayfalar (LoginPage, DashboardPage vb)
```

---

### **2. Routing: App.tsx**

```typescript
// App.tsx - Sayfalar arası navigasyon

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Sayfalara import
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UrunlerPage from './pages/UrunlerPage';
import SiparislerPage from './pages/SiparislerPage';
import KullanicilarPage from './pages/KullanicilarPage';

function App() {
  const { token, isAdmin } = useAuth();

  // Eğer giriş yapılmamışsa (token yoksa) → LoginPage'e gönder
  if (!token) {
    return <LoginPage />;
  }

  // Giriş yapıldıysa sayfaları göster
  return (
    <>
      <Sidebar /> {/* Üst navigasyon menüsü */}
      <Routes>
        {/* Rotalar: /urunler, /siparisler vb URL'lerine karşılık gelir */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/urunler" element={<UrunlerPage />} />
        <Route path="/siparisler" element={<SiparislerPage />} />
        <Route
          path="/kullanicilar"
          element={isAdmin ? <KullanicilarPage /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
```

**Akış:**

```
Tarayıcı URL: http://localhost:5173/urunler
        ↓
React Router bunu yakalar
        ↓
UrunlerPage bileşenini göster
```

---

### **3. API İstemcisi: api.ts**

Backend'le iletişim kurmak için Axios kullanıyoruz. Ancak her seferinde token yazmak zahmetli olurdu. Çözüm: **Interceptor** (ara metin)

```typescript
// api.ts - Backend bağlantısı ve otomatik token ekleme

import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000", // Backend adres
});

// ─ REQUEST İNTERCEPTOR ─
// Her HTTP isteğinden ÖNCEsinde çalışır
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Eğer token varsa, header'a ekle
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ─ RESPONSE İNTERCEPTOR ─
// Her HTTP yanıtından SONRAda çalışır
api.interceptors.response.use(
  (response) => response, // Başarılı yanıt ise olduğu gibi dön
  (error) => {
    // Eğer yanıt 401 (Yetkisiz) ise → Token süresi bitmiş
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Tokeni sil
      window.location.href = "/login"; // Login sayfasına yönlendir
    }
    return Promise.reject(error);
  },
);
```

**Kullanım Örneği:**

```typescript
// LoginPage.tsx içinde
const res = await api.post("/auther/login", { userName, pass });
// ↑ Arka planda interceptor otomatik olarak token ekler (varsa)

// UrunlerPage.tsx içinde
const res = await api.get("/urunler");
// Header'a uygun token kaydedildi
```

---

### **4. Kimlik Doğrulama: AuthContext.tsx**

Kullanıcının giriş yaptığını tüm sayfalara söylemek gerek. Çözüm: **React Context**

```typescript
// AuthContext.tsx - Global kullanıcı durumu

import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;           // JWT token
  user: AuthUser | null;          // Decode edilmiş kullanıcı bilgisi
  login: (token: string) => void; // Token kaydet
  logout: () => void;             // Token sil
  isAdmin: boolean;               // Admin mi?
  isEditor: boolean;              // Editor/Admin mi?
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─ AuthProvider Bileşeni ─
export function AuthProvider({ children }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token') // Sayfayı yenile → Token'ı localStorage'dan al
  );
  const [user, setUser] = useState<AuthUser | null>(
    token ? parseToken(token) : null
  );

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);  // Tarayıcıda sakla
    setToken(newToken);                       // State'e kaydet
    setUser(parseToken(newToken));            // Kullanıcı bilgisini çıkar
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Rol kontrolü
  const isAdmin = user?.rol === 'admin';
  const isEditor = user?.rol === 'admin' || user?.rol === 'editor';

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAdmin, isEditor }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─ useAuth Hook ─ (Herhangi bir bileşende kullanabilirsin)
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

**JWT Token Decode Işlemi:**

JWT token 3 parçadan oluşur: `header.payload.signature`

```typescript
function parseToken(token: string): AuthUser | null {
  try {
    // Token'ın ortasındaki payload kısmını al
    const payload = token.split(".")[1];

    // Base64 dekod et
    const json = atob(payload);

    // JSON olarak parse et
    return JSON.parse(json);
    // Sonuç: { id: 1, kullanici: "emre", rol: "admin", ... }
  } catch {
    return null;
  }
}
```

**Kullanım:**

```typescript
// UrunlerPage.tsx
import { useAuth } from '../context/AuthContext';

export default function UrunlerPage() {
  const { isAdmin, isEditor } = useAuth();

  return (
    <>
      {isEditor && <button>Ürün Ekle</button>}
      {isAdmin && <button>Ürün Sil</button>}
    </>
  );
}
```

---

### **5. Bir Sayfanın Detaylı Çalışması: UrunlerPage.tsx**

```typescript
import { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function UrunlerPage() {
  // ─ STATE (Değişim yönetimi) ─
  const { isAdmin, isEditor } = useAuth();
  const [urunler, setUrunler] = useState<Urun[]>([]);  // Tüm ürünler
  const [filtered, setFiltered] = useState<Urun[]>([]); // Filtrelenmiş ürünler
  const [loading, setLoading] = useState(true);         // Yükleniyor mu?
  const [search, setSearch] = useState('');             // Arama metni
  const [modal, setModal] = useState(null);             // Modal açık/kapalı

  // ─ API'dan verileri çek ─
  const fetchUrunler = async () => {
    try {
      const res = await api.get('/urunler');
      setUrunler(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Hata:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde çalış (dependency array: [])
  useEffect(() => {
    fetchUrunler();
  }, []);

  // Arama metnini değiştir → Listeyi filtrele
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(urunler);
      return;
    }

    const s = search.toLowerCase();
    setFiltered(
      urunler.filter(u =>
        u.ad.toLowerCase().includes(s) ||
        u.kategori.toLowerCase().includes(s)
      )
    );
  }, [search, urunler]);

  // ─ Ürün ekle ─
  const handleSave = async () => {
    try {
      await api.post('/urunler', form); // Backend'e POST
      await fetchUrunler();              // Listeyi yenile
      setModal(null);                    // Modal'ı kapat
    } catch (err) {
      console.error(err);
    }
  };

  // ─ Ürün sil ─
  const handleDelete = async () => {
    try {
      await api.delete(`/urunler/${deleteId}`); // Backend'e DELETE
      await fetchUrunler();                      // Listeyi yenile
    } catch (err) {
      console.error(err);
    }
  };

  // ─ Render ─
  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <h2>Ürün Yönetimi</h2>

      {/* Arama Kutusu */}
      <input
        placeholder="Ürün ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Ürün Tablosu */}
      <table>
        <tbody>
          {filtered.map(u => (
            <tr key={u.id}>
              <td>{u.ad}</td>
              <td>{u.fiyat}</td>
              <td>{u.stok}</td>
              {isEditor && (
                <td>
                  <button onClick={() => openGuncelle(u)}>Düzenle</button>
                </td>
              )}
              {isAdmin && (
                <td>
                  <button onClick={() => handleDelete(u.id)}>Sil</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal: Ürün Ekle/Düzenle */}
      {modal && (
        <Modal>
          <input placeholder="Ürün Adı" value={form.ad} onChange={...} />
          <input placeholder="Fiyat" value={form.fiyat} onChange={...} />
          <button onClick={handleSave}>Kaydet</button>
        </Modal>
      )}
    </div>
  );
}
```

---

## 🔧 Backend Detaylı Açıklaması

### **1. Başlangıç: index.ts**

```typescript
// src/index.ts - Backend sunucusu başlatma

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes";
import urunRoutes from "./routes/UrunRoutes";
import siparisRoutes from "./routes/SiparisRoutes";
import kullaniciRoutes from "./routes/KullaniciRoutes";

// ─ 1. MongoDB'ye bağlan ─
const mongoURI =
  "mongodb+srv://emreaygun:emre1905gs@cluster0.wanf2b3.mongodb.net/?appName=Cluster0";

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB bağlandı"))
  .catch((err) => console.log("❌ MongoDB hatası:", err));

// ─ 2. Express uygulaması oluştur ─
const app = express();

// ─ 3. Middleware'ler ─
app.use(cors()); // Frontend'in istek atmasına izin ver
app.use(express.json()); // JSON body'sini parse et

// ─ 4. Rotaları kaydet (mounting) ─
app.use("/auther", authRoutes); // http://localhost:3000/auther/login
app.use("/urunler", urunRoutes); // http://localhost:3000/urunler
app.use("/siparisler", siparisRoutes);
app.use("/kullanicilar", kullaniciRoutes);

// ─ 5. Sunucu başlat ─
const server = app.listen(3000, () => {
  console.log("🚀 Sunucu running on http://localhost:3000");
});
```

**Akış:**

```
Frontend istek gönder (http://localhost:3000/urunler)
            ↓
Express uygulaması yakalar
            ↓
CORS middleware kontrol (Frontend izinli mi?)
            ↓
express.json middleware (JSON parse et)
            ↓
Uygun rota bulundu (/urunler)
            ↓
UrunRoutes'e yönlendir
            ↓
UrunController'ı çevir
            ↓
UrunService'ten metod çalıştır
            ↓
MongoDB'den verileri al
            ↓
Frontend'e geri gönder
```

---

### **2. Modeller: MongoDB Şemaları**

MongoDB sınırsız, esnek bir veritabanıdır. Ama biz düzen için Mongoose modelleri tanımlıyoruz.

```typescript
// models/UrunModel.ts

import mongoose from "mongoose";

// Şema: Ürün nasıl görünecek (hangi alanları olacak)
const urunSchema = new mongoose.Schema(
  {
    ad: {
      type: String,
      required: true, // Zorunlu alan
    },
    fiyat: {
      type: Number,
      required: true,
    },
    stok: {
      type: Number,
      required: true,
      default: 0, // Varsayılan değer
    },
    kategori: {
      type: String,
      required: true,
    },
    ebat: {
      type: String, // Opsiyonel alan
    },
  },
  { toJSON: { virtuals: true } },
);

// Model: Veritabanıyla iletişim kuran yapı
export const UrunModel = mongoose.model("Urun", urunSchema);
```

**MongoDB'de gerçek veri nasıl görünür:**

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "ad": "Raspberry Pi 5",
  "fiyat": 8500,
  "stok": 42,
  "kategori": "Mikrodenetleyici",
  "ebat": "85mm x 56mm"
}
```

**Diğer Modeller:**

```typescript
// models/KullaniciModel.ts
const kullaniciSchema = new mongoose.Schema({
  ad: String,
  soyad: String,
  email: String,
  sifre: String,
  rol: {
    type: String,
    enum: ["admin", "editor", "stajyer"], // Sadece bu değerler
  },
  no: String,
  aciklama: String,
});

export const KullaniciModel = mongoose.model("Kullanici", kullaniciSchema);
```

```typescript
// models/SiparisModel.ts
const siparisSchema = new mongoose.Schema({
  urunId: {
    type: mongoose.Schema.Types.ObjectId, // Ürün tablosundaki ID
    ref: "Urun", // 'Urun' şemasına referans
    required: true,
  },
  urunAd: String,
  adet: Number,
  birimFiyat: Number,
  toplamTutar: Number,
  olusturan: String, // Kim siparişi oluşturdu
  tarih: String,
});

export const SiparisModel = mongoose.model("Siparis", siparisSchema);
```

---

### **3. Services: İş Mantığı**

Service, sadece database işleri yapan katmanıdır. Burada "1+1=2" tipi hesaplamalar yapılır.

```typescript
// services/UrunService.ts

import { UrunModel } from "../models/UrunModel";

export class UrunService {
  // Tüm ürünleri getir
  public async tumUrunleriGetir() {
    try {
      return await UrunModel.find();
    } catch (error) {
      throw new Error("Ürünler getirilemedi");
    }
  }

  // ID'ye göre ürün getir
  public async IdileUrunGetirme(urunId: string) {
    try {
      return await UrunModel.findById(urunId);
    } catch (error) {
      throw new Error("Ürün bulunamadı");
    }
  }

  // Kategoriye göre ürün getir
  public async kategoriUrunGetirme(kategori: string) {
    try {
      return await UrunModel.find({
        kategori: { $regex: new RegExp(`^${kategori}$`, "i") },
      });
    } catch (error) {
      throw new Error("Kategori ürünleri getirilemedi");
    }
  }

  // Fiyat aralığında ürün getir
  public async fiyatAraligi(min: number, max: number) {
    try {
      return await UrunModel.find({
        fiyat: {
          $gte: min, // greater than or equal (>=)
          $lte: max, // less than or equal (<=)
        },
      });
    } catch (error) {
      throw new Error("Fiyat aralığı sorgusunda hata");
    }
  }

  // Yeni ürün ekle (Validasyon yapıyor!)
  public async urunEkle(yeniUrunVerisi: any) {
    try {
      // Zorunlu alanlar kontrol et
      const zorunluAlanlar = ["ad", "fiyat", "stok", "kategori"];
      const eksikAlanlar = zorunluAlanlar.filter(
        (alan) =>
          yeniUrunVerisi[alan] === undefined ||
          yeniUrunVerisi[alan] === null ||
          yeniUrunVerisi[alan] === "",
      );

      if (eksikAlanlar.length > 0) {
        throw new Error(`Eksik alanlar: ${eksikAlanlar.join(", ")}`);
      }

      // Aynı ürün zaten var mı kontrol et
      const ayniUrunVarMi = await UrunModel.findOne({
        ad: { $regex: new RegExp(`^${yeniUrunVerisi.ad}$`, "i") },
        kategori: { $regex: new RegExp(`^${yeniUrunVerisi.kategori}$`, "i") },
      });

      if (ayniUrunVarMi) {
        throw new Error(`"${yeniUrunVerisi.ad}" zaten bu kategoride var!`);
      }

      // Verileri temizle ve tipleri dönüştür
      return await UrunModel.create({
        ad: String(yeniUrunVerisi.ad),
        fiyat: Number(yeniUrunVerisi.fiyat),
        stok: Number(yeniUrunVerisi.stok || 0),
        kategori: String(yeniUrunVerisi.kategori),
        ...(yeniUrunVerisi.ebat && { ebat: String(yeniUrunVerisi.ebat) }),
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Ürün sil
  public async urunSil(urunId: string): Promise<void> {
    try {
      const silinen = await UrunModel.findByIdAndDelete(urunId);
      if (!silinen) throw new Error(`ID ${urunId} bulunamadı`);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Ürün güncelle (TÜM alanlar)
  public async urunGuncelleTam(id: string, yeniVeri: any) {
    const guncellenen = await UrunModel.findByIdAndUpdate(id, yeniVeri, {
      new: true, // Güncelledikten sonra yeni veriyi dön
      overwrite: true, // Mevcut veriyi tamamen değiştir
    });
    if (!guncellenen) throw new Error("Ürün bulunamadı!");
    return guncellenen;
  }

  // Ürün güncelle (KISMEN)
  public async urunGuncelleKismi(id: string, kismenlVeri: any) {
    const guncellenen = await UrunModel.findByIdAndUpdate(id, kismenlVeri, {
      new: true,
    });
    if (!guncellenen) throw new Error("Ürün bulunamadı!");
    return guncellenen;
  }
}
```

**MongoDB Sorgu Operatörleri:**

```typescript
// $regex: Metin arama
UrunModel.find({ ad: { $regex: "Raspberry", $options: "i" } });
// → "raspberry", "RASPBERRY", "Raspberry" hepsini bulur

// $gte, $lte: Sayı karşılaştırması
UrunModel.find({ fiyat: { $gte: 1000, $lte: 5000 } });
// → 1000 ≤ fiyat ≤ 5000

// $gt, $lt: Kesin karşılaştırma
UrunModel.find({ stok: { $lt: 10 } });
// → stok < 10

// $ne: Not equal
UrunModel.find({ rol: { $ne: "stajyer" } });
// → rol != "stajyer"
```

---

### **4. SiparisService: Stok Mantığı**

Sipariş almak = **Ürün stok azalt** işlemi. Bu kritik!

```typescript
// services/SiparisService.ts

import { SiparisModel } from "../models/SiparisModel";
import { UrunModel } from "../models/UrunModel";

export class SiparisService {
  public async siparisEkle(siparisVerisi: any, kullaniciBilgisi: any) {
    // 1️⃣ Ürünü bul
    const urun = await UrunModel.findById(siparisVerisi.urunId);
    if (!urun) {
      throw new Error(`ID: ${siparisVerisi.urunId} olan ürün bulunamadı!`);
    }

    // 2️⃣ Stok yeterli mi kontrol et
    if (urun.stok < siparisVerisi.adet) {
      throw new Error(`Yetersiz stok! ${urun.ad} için mevcut: ${urun.stok}`);
    }

    // 3️⃣ Stoktan düş ve kaydet 🔴 KRİTİK İŞLEM
    urun.stok -= Number(siparisVerisi.adet);
    await urun.save(); // Veritabanına yazıldı

    // 4️⃣ Siparişi kaydet
    return await SiparisModel.create({
      urunId: urun._id,
      urunAd: urun.ad,
      adet: Number(siparisVerisi.adet),
      birimFiyat: urun.fiyat,
      toplamTutar: Number(siparisVerisi.adet) * urun.fiyat, // Matematik
      olusturan: kullaniciBilgisi.kullanici,
      tarih: new Date().toLocaleString("tr-TR"),
    });
  }

  // Sipariş iptal edilirse stoku iade et
  public async siparisSil(siparisId: string) {
    // 1️⃣ Siparişi bul
    const siparis = await SiparisModel.findById(siparisId);
    if (!siparis) throw new Error(`Sipariş ${siparisId} bulunamadı!`);

    // 2️⃣ Ürünü bul
    const urun = await UrunModel.findById(siparis.urunId);

    // 3️⃣ Stoğu iade et 🔴 KRİTİK İŞLEM
    if (urun) {
      urun.stok += siparis.adet;
      await urun.save();
    }

    // 4️⃣ Siparişi sil
    await siparis.deleteOne();

    return { mesaj: "Sipariş silindi ve stok iade edildi." };
  }

  // Tüm siparişleri listele
  public async tumSiparisleriGetir() {
    return await SiparisModel.find();
  }
}
```

**Stok Mantığı Diyagramı:**

```
Başlangıç: Ürün stok = 50
            ↓
Müşteri sipariş verir: 10 adet
            ↓
Service kontrol:
  - Stok 10'dan fazla mı? ✅ Evet (50 > 10)
            ↓
Stok güncelle: 50 - 10 = 40
            ↓
SiparisModel'de kayıt et
            ↓
Frontend'e cevap: { success: true, toplamTutar: 5000 }
```

---

### **5. Controllers: İstek İşleyicileri**

Controller, Frontend'ten gelen isteği alıp Service'e yönlendirir.

```typescript
// controllers/UrunController.ts

import { Request, Response } from "express";
import { UrunService } from "../services/UrunService";

export class UrunController {
  private urunService = new UrunService();

  // GET /urunler → Tüm ürünleri getir
  public async getTumUrunler(req: Request, res: Response) {
    try {
      // Query parametrelerini al (/urunler?id=1&kat=elektronik)
      const { id, kat, min, max, ara, sadeceStokda } = req.query;

      // Eğer ID varsa, o ürünü getir
      if (id) {
        return res.json(await this.urunService.IdileUrunGetirme(String(id)));
      }

      // Eğer kategori varsa
      if (kat) {
        return res.json(
          await this.urunService.kategoriUrunGetirme(String(kat)),
        );
      }

      // Eğer arama varsa
      if (ara) {
        return res.json(await this.urunService.ismeGoreAra(String(ara)));
      }

      // Eğer fiyat aralığı varsa
      if (min && max) {
        return res.json(
          await this.urunService.fiyatAraligi(Number(min), Number(max)),
        );
      }

      // Hiç filter yoksa tüm ürünleri getir
      let urunler = await this.urunService.tumUrunleriGetir();

      // Stokta olan ürünleri filtrele
      if (sadeceStokda === "true") {
        urunler = urunler.filter((u) => u.stok > 0);
      }

      res.json(urunler);
    } catch (err) {
      res.status(500).json({ mesaj: "Ürünler getirilemedi" });
    }
  }

  // POST /urunler → Yeni ürün ekle
  public async urunEkle(req: Request, res: Response) {
    try {
      // Frontend'ten gelen veri: { ad: "...", fiyat: 100, ... }
      const yeniUrun = await this.urunService.urunEkle(req.body);
      res.status(201).json(yeniUrun); // 201 = Created
    } catch (err: any) {
      res.status(400).json({ mesaj: err.message });
    }
  }

  // DELETE /urunler/:id → Ürünü sil
  public async urunSil(req: Request, res: Response) {
    try {
      await this.urunService.urunSil(req.params.id);
      res.json({ mesaj: "Ürün silindi" });
    } catch (err: any) {
      res.status(404).json({ mesaj: err.message });
    }
  }

  // PUT /urunler/:id → Ürünü tamamen güncelle
  public async urunGuncelleTam(req: Request, res: Response) {
    try {
      const guncellenenUrun = await this.urunService.urunGuncelleTam(
        req.params.id,
        req.body,
      );
      res.json(guncellenenUrun);
    } catch (err: any) {
      res.status(404).json({ mesaj: err.message });
    }
  }

  // PATCH /urunler/:id → Ürünü kısmen güncelle
  public async urunGuncelleKismi(req: Request, res: Response) {
    try {
      const guncellenenUrun = await this.urunService.urunGuncelleKismi(
        req.params.id,
        req.body,
      );
      res.json(guncellenenUrun);
    } catch (err: any) {
      res.status(404).json({ mesaj: err.message });
    }
  }
}
```

**HTTP Status Kodları:**

```
200 OK                → İstek başarılı
201 Created          → Yeni kayıt oluşturuldu
400 Bad Request      → Hata (geçersiz veri)
401 Unauthorized     → Oturum açmanız gerekiyor
403 Forbidden        → Yetki eksik (admin değilsiniz)
404 Not Found        → Kayıt bulunamadı
500 Server Error     → Sunucu hatası
```

---

### **6. Routes: URL Eşleştirmesi**

```typescript
// routes/UrunRoutes.ts

import { Router } from "express";
import { UrunController } from "../controllers/UrunController";
import { guvenlikGorevlisi, rolKontrol } from "../middlewares/authMiddleware";

const router = Router();
const controller = new UrunController();

// 🔒 Tüm ürün rotaları için authentication zorunlu
router.use(guvenlikGorevlisi); // Önce token kontrol
router.use(rolKontrol(["admin", "editor", "stajyer"])); // Sonra yetki kontrol

// Okuma işlemleri herkese açık
router.get("/", controller.getTumUrunler);

// Yazma işlemleri admin/editor'e
router.post("/", rolKontrol(["admin", "editor"]), controller.urunEkle);

// Güncelleme
router.put("/:id", rolKontrol(["admin", "editor"]), controller.urunGuncelleTam);
router.patch(
  "/:id",
  rolKontrol(["admin", "editor"]),
  controller.urunGuncelleKismi,
);

// Silme sadece admin'e
router.delete("/:id", rolKontrol(["admin"]), controller.urunSil);

export default router;
```

**Route Akışı:**

```
Frontend: POST /urunler { ad: "Raspberry Pi", ... }
            ↓
Express: /urunler rotasını buldu
            ↓
Middleware 1: guvenlikGorevlisi
  → Header'da Authorization: Bearer <token> var mı?
  → Var mı? → Devam et, Yoksa? → 403 hata dön
            ↓
Middleware 2: rolKontrol(['admin', 'editor'])
  → Token decode et, rol nedir?
  → rol admin veya editor mi?
  → Evet? → Devam et, Hayır? → 403 hata dön
            ↓
Controller: urunEkle
            ↓
Service: urunEkle (validasyon, DB işlemi)
            ↓
Cevap: { _id: "...", ad: "Raspberry Pi", ... }
```

---

### **7. Middleware: Kapıcı**

Middleware, isteğin controller'a ulaşmadan önce denetleniyor.

```typescript
// middlewares/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService";

const authService = new AuthService();

// ─ Middleware 1: Bilet Kontrolü ─
export const guvenlikGorevlisi = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Header'dan Authorization al
  const bilet = req.headers["authorization"];
  if (!bilet) return res.status(403).json({ mesaj: "Token eksik!" });

  // "Bearer <token>" formatını parse et
  const token = bilet.split(" ")[1];
  if (!token) return res.status(403).json({ mesaj: "Token eksik!" });

  // Token doğrula
  const doğrulama = authService.biletKontrolEt(token);

  if (doğrulama) {
    (req as any).kullanici = doğrulama; // Kullanıcı bilgisini req'e ekle
    next(); // Sonraki middleware'ye geç
  } else {
    res.status(401).json({ mesaj: "Token süresi bitmiş veya sahte!" });
  }
};

// ─ Middleware 2: Rol Kontrolü ─
export const rolKontrol = (izinVerilenRoller: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const kullanici = (req as any).kullanici;

    if (!kullanici) {
      return res.status(401).json({ mesaj: "Giriş yapmalısınız!" });
    }

    // Kullanıcının rolü izin verilen roller arasında mı?
    if (izinVerilenRoller.includes(kullanici.rol)) {
      next(); // Evet, devam et
    } else {
      res.status(403).json({
        mesaj: `Bu işlem için ${izinVerilenRoller.join(" veya ")} yetkisi lazım!`,
      });
    }
  };
};
```

---

### **8. AuthService: Kimlik Doğrulama**

```typescript
// services/AuthService.ts

import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { KullaniciService } from "./KullaniciService";

dotenv.config();

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "gizli_anahtar";
  private kullaniciService = new KullaniciService();

  // ─ Giriş İşlemi ─
  public async login(username: string, pass: string): Promise<string | null> {
    // 1️⃣ .ENV'deki TÜM USER anahtarlarını tara
    const envKeys = Object.keys(process.env);

    // ADMIN1_USER, ADMIN2_USER, EDITOR1_USER vb. bulunur
    const userKey = envKeys.find(
      (key) => key.endsWith("_USER") && process.env[key] === username,
    );

    if (!userKey) {
      console.log(`❌ Kullanıcı bulunamadı: ${username}`);
      return null;
    }

    // 2️⃣ Şifreyi kontrol et
    // userKey = "ADMIN1_USER" → prefix = "ADMIN1"
    const prefix = userKey.replace("_USER", "");
    const envPass = process.env[`${prefix}_PASS`];

    if (pass !== envPass) {
      console.log(`❌ Şifre yanlış: ${username}`);
      return null;
    }

    // 3️⃣ Rolü belirle
    let rol = "stajyer";
    if (prefix.includes("ADMIN")) rol = "admin";
    else if (prefix.includes("EDITOR")) rol = "editor";

    // 4️⃣ Ek bilgileri veritabanından çek
    const allUsers = await this.kullaniciService.tumKullanicilariGetir();
    const isim = process.env[`${prefix}_NAME`];
    const dbUser = allUsers.find((u) => u.ad === isim);

    // 5️⃣ JWT payload oluştur
    const payload = {
      id: dbUser?.id || null,
      kullanici: isim || username,
      rol: rol,
      ogrenciNo: process.env[`${prefix}_NO`] || dbUser?.no || null,
    };

    // 6️⃣ Token imzala (sign)
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: "1h" });
    // → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6bnVsbCwiYmt...
  }

  // ─ Token Doğrulama ─
  public biletKontrolEt(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
      // Token geçerliyse decoded payload dön
    } catch (error) {
      return null; // Token geçersiz/süresi bitmiş
    }
  }
}
```

---

## 🔄 JSON'dan MongoDB'ye Geçiş Hikayesi

### **Eski Sistem: JSON Dosyalar**

Başlangıçta veriler dosyalarda tutuluyordu:

```
data/
├── urunler.json
├── siparisler.json
└── kullanicilar.json
```

**urunler.json örneği:**

```json
[
  {
    "id": 1,
    "ad": "Raspberry Pi 5",
    "fiyat": 8500,
    "stok": 50,
    "kategori": "Mikrodenetleyici"
  },
  {
    "id": 2,
    "ad": "Arduino UNO",
    "fiyat": 2500,
    "stok": 100,
    "kategori": "Mikrodenetleyici"
  }
]
```

**JSON Sorunları:**

```
❌ Sırada öğeler kaybedilebilir (dosya korrüptü olabilir)
❌ Eşzamanlı erişim (2 kişi aynı anda işlem yapsa veri karışır)
❌ Ölçeklenebilirlik (1 milyon ürün tutabilir mi?)
❌ Sorgu yetenekleri sınırlı (filtreleme zor)
❌ Güvenlik (şifreleme yok)
```

---

### **Yeni Sistem: MongoDB**

MongoDB'ye geçiş süreci:

```
JSON dosyalar
     ↓
migrate.ts scripti çalıştırıldı
     ↓
MongoDB'ye yazıldı
     ↓
Models güncellenildi (Mongoose)
     ↓
Service'ler güncellenildi
     ↓
JSON referansları kaldırıldı
```

---

### **Migration Script: migrate.ts**

Bu script, JSON'daki verileri MongoDB'ye "göç ettirir".

```typescript
// src/migrate.ts

import mongoose from "mongoose";
import { readFileSync } from "fs";
import path from "path";

// 1️⃣ Şemaları tanımla
const urunSchema = new mongoose.Schema({
  ad: String,
  fiyat: Number,
  stok: Number,
  kategori: String,
  ebat: String,
});

const kullaniciSchema = new mongoose.Schema({
  ad: String,
  soyad: String,
  email: String,
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

// 2️⃣ Modelleri oluştur
const UrunModel = mongoose.model("Urun", urunSchema);
const KullaniciModel = mongoose.model("Kullanici", kullaniciSchema);
const SiparisModel = mongoose.model("Siparis", siparisSchema);

async function migrate() {
  // 3️⃣ MongoDB'ye bağlan
  await mongoose.connect(
    "mongodb+srv://emreaygun:emre1905gs@cluster0.wanf2b3.mongodb.net",
  );
  console.log("✅ MongoDB bağlandı");

  // 4️⃣ Ürünleri aktar
  console.log("📦 Ürünler aktarılıyor...");

  // JSON dosyasını oku
  const urunlerJson = JSON.parse(
    readFileSync(path.join(__dirname, "data", "urunler.json"), "utf-8"),
  );

  // Eski verileri temizle
  await UrunModel.deleteMany({});

  // ID eşleştirme tablosu (eski ID → yeni MongoDB _id)
  const urunIdMap = new Map();

  // Her ürünü kaydet
  for (const u of urunlerJson) {
    const { id: eskiId, ...veri } = u; // id ayrı al
    const yeniUrun = await UrunModel.create(veri);
    urunIdMap.set(eskiId, yeniUrun._id); // Eşleştir
  }

  console.log(`✅ ${urunlerJson.length} ürün aktarıldı`);

  // 5️⃣ Siparişleri aktar (ürünler aktarıldıktan SONRA)
  console.log("📋 Siparişler aktarılıyor...");

  const siparislerJson = JSON.parse(
    readFileSync(path.join(__dirname, "data", "siparisler.json"), "utf-8"),
  );

  await SiparisModel.deleteMany({});

  for (const s of siparislerJson) {
    const { id: eskiId, urunId: eskiUrunId, ...veri } = s;
    const yeniUrunId = urunIdMap.get(eskiUrunId); // Eşleştirmeyi kullan

    await SiparisModel.create({
      ...veri,
      urunId: yeniUrunId, // Yeni ObjectId
    });
  }

  console.log(`✅ ${siparislerJson.length} sipariş aktarıldı`);

  // 6️⃣ Kullanıcıları aktar
  console.log("👥 Kullanıcılar aktarılıyor...");

  const kullanicilarJson = JSON.parse(
    readFileSync(path.join(__dirname, "data", "kullanicilar.json"), "utf-8"),
  );

  await KullaniciModel.deleteMany({});

  for (const k of kullanicilarJson) {
    const { id: eskiId, ...veri } = k;
    await KullaniciModel.create(veri);
  }

  console.log(`✅ ${kullanicilarJson.length} kullanıcı aktarıldı`);

  console.log("🎉 Migration tamamlandı!");
  await mongoose.disconnect();
}

// Çalıştır
migrate().catch((err) => {
  console.error("❌ Migration hatası:", err);
  process.exit(1);
});
```

**Migration Komutunu Çalıştırmak:**

```bash
npm run migrate
```

**Konsol Çıktısı:**

```
✅ MongoDB bağlandı
📦 Ürünler aktarılıyor...
✅ 10 ürün aktarıldı
📋 Siparişler aktarılıyor...
✅ 5 sipariş aktarıldı
👥 Kullanıcılar aktarılıyor...
✅ 3 kullanıcı aktarıldı
🎉 Migration tamamlandı!
```

---

### **Eski vs Yeni Kod Karşılaştırması**

**Eski: JSON ile**

```typescript
// ❌ ESKI YÖNTEM
import fs from 'fs';

const urunler = JSON.parse(
  fs.readFileSync('data/urunler.json', 'utf-8')
);

// Ürün bul
const urun = urunler.find(u => u.id === 1);

// Ürün ekle
urunler.push({ id: 11, ad: 'Yeni Ürün', ... });
fs.writeFileSync('data/urunler.json', JSON.stringify(urunler));
```

**Yeni: MongoDB ile**

```typescript
// ✅ YENİ YÖNTEM
import { UrunModel } from './models/UrunModel';

// Ürün bul
const urun = await UrunModel.findById('507f1f77bcf86cd799439011');

// Ürün ekle
const yeniUrun = await UrunModel.create({
  ad: 'Yeni Ürün',
  fiyat: 5000,
  ...
});
```

**Avantajlar:**

```
✅ Otomatik ID yönetimi (_id)
✅ Eşzamanlı erişim güvenli
✅ Sorgu işlemleri güçlü ($regex, $gte vb)
✅ Veri doğrulama (required, enum)
✅ İndeksler (hızlı arama)
✅ Backup ve restore (built-in)
```

---

## 📊 Bir İstek Nasıl İşlenilir?

Senaryo: **Kullanıcı "Yeni Sipariş" butonuna tıklar**

### **1️⃣ Frontend: SiparislerPage.tsx**

```typescript
const handleSave = async () => {
  try {
    // Frontend, POST isteği gönder
    await api.post("/siparisler", {
      urunId: "507f1f77bcf86cd799439011", // Ürün seçti
      adet: 5, // 5 adet istedi
    });

    // Backend'den olumlu cevap geldi
    await fetchData(); // Sayfayı yenile
    setModal(false); // Modal'ı kapat
  } catch (err) {
    setError(err.response?.data?.mesaj);
  }
};
```

---

### **2️⃣ Interceptor: api.ts**

```typescript
api.interceptors.request.use((config) => {
  // LocalStorage'dan token al
  const token = localStorage.getItem("token");
  // Token varsa header'a ekle
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// İstek şu hale gelir:
// POST /siparisler HTTP/1.1
// Authorization: Bearer eyJhbGciOiJIUzI1NiI...
// Content-Type: application/json
//
// { "urunId": "507f...", "adet": 5 }
```

---

### **3️⃣ Backend: index.ts**

```typescript
// Express'de POST /siparisler isteği alındı
app.use("/siparisler", siparisRoutes);
```

---

### **4️⃣ Rota: SiparisRoutes.ts**

```typescript
const router = Router();

// Middleware'ler sırayla çalışır
router.use(guvenlikGorevlisi); // Adım 1: Token kontrol
router.use(rolKontrol(["admin", "editor", "stajyer"])); // Adım 2: Rol kontrol

router.post("/", controller.olustur); // Adım 3: Controller çağır
```

---

### **5️⃣ Middleware: authMiddleware.ts**

```typescript
// ─ guvenlikGorevlisi ─
export const guvenlikGorevlisi = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Authorization: Bearer eyJ... burada

  const token = authHeader.split(" ")[1];
  // token = eyJ...

  const doğrulama = authService.biletKontrolEt(token);
  // JWT verify et

  if (doğrulama) {
    // Token geçerli
    req.kullanici = doğrulama;
    // req.kullanici = { id: 1, kullanici: "emre", rol: "admin", ... }
    next(); // Controller'a devam et
  } else {
    res.status(401).json({ mesaj: "Token süresi bitmiş!" });
  }
};

// ─ rolKontrol ─
export const rolKontrol = (izinVerilen) => {
  return (req, res, next) => {
    const userRol = req.kullanici.rol; // "admin"

    if (izinVerilen.includes(userRol)) {
      // ["admin", "editor", "stajyer"]
      next(); // Rol kontrol geçti
    } else {
      res.status(403).json({ mesaj: "Yetkiniz yok!" });
    }
  };
};
```

---

### **6️⃣ Controller: SiparisController.ts**

```typescript
public olustur = async (req: Request, res: Response) => {
  try {
    // req.body = { urunId: "507f...", adet: 5 }
    const authHeader = req.headers.authorization;
    // authHeader = "Bearer eyJ..."

    const token = authHeader.split(' ')[1];
    const biletBilgisi = this.authService.biletKontrolEt(token);
    // biletBilgisi = { id: 1, kullanici: "emre", rol: "admin", ... }

    // Service'e gönder
    const siparis = await this.siparisService.siparisEkle(
      req.body,        // { urunId: "507f...", adet: 5 }
      biletBilgisi     // { id: 1, kullanici: "emre", ... }
    );

    res.status(201).json({
      mesaj: 'Sipariş alındı, stok güncellendi.',
      data: siparis
    });
  } catch (error) {
    res.status(400).json({ mesaj: error.message });
  }
};
```

---

### **7️⃣ Service: SiparisService.ts**

```typescript
public async siparisEkle(siparisVerisi, kullaniciBilgisi) {
  // 1️⃣ Ürünü bul
  const urun = await UrunModel.findById(siparisVerisi.urunId);
  // urun = {
  //   _id: "507f...",
  //   ad: "Raspberry Pi 5",
  //   fiyat: 8500,
  //   stok: 50,   ← Başlangıçta 50
  //   kategori: "Mikrodenetleyici"
  // }

  // 2️⃣ Stok kontrol
  if (urun.stok < siparisVerisi.adet) {
    // urun.stok (50) < siparisVerisi.adet (5)? Hayır
    throw new Error('Yetersiz stok!');
  }

  // 3️⃣ Stok azalt
  urun.stok -= 5;  // 50 - 5 = 45
  await urun.save(); // MongoDB'ye yazıldı: stok = 45

  // 4️⃣ Sipariş kaydet
  return await SiparisModel.create({
    urunId: urun._id,
    urunAd: 'Raspberry Pi 5',
    adet: 5,
    birimFiyat: 8500,
    toplamTutar: 5 * 8500,  // = 42500 TL
    olusturan: 'emre',
    tarih: '26.02.2026 14:30'
  });
  // sonuç = {
  //   _id: "607f...",
  //   urunId: "507f...",
  //   urunAd: "Raspberry Pi 5",
  //   adet: 5,
  //   birimFiyat: 8500,
  //   toplamTutar: 42500,
  //   olusturan: "emre",
  //   tarih: "26.02.2026 14:30"
  // }
}
```

---

### **8️⃣ Cevap: Frontend'e Döndü**

```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "mesaj": "Sipariş alındı, stok güncellendi.",
  "data": {
    "_id": "607f1f77bcf86cd799439011",
    "urunId": "507f1f77bcf86cd799439011",
    "urunAd": "Raspberry Pi 5",
    "adet": 5,
    "birimFiyat": 8500,
    "toplamTutar": 42500,
    "olusturan": "emre",
    "tarih": "26.02.2026 14:30"
  }
}
```

---

### **9️⃣ Frontend: Cevap İşlendi**

```typescript
// SiparislerPage.tsx
const res = await api.post('/siparisler', { ... });
// res.status = 201
// res.data.mesaj = "Sipariş alındı, stok güncellendi."
// res.data.data = { _id: "607f...", ... }

setModal(false);       // Modal kapat
await fetchData();     // Tabloyu yenile
// SiparislerPage şimdi yeni siparişi tabloda gösterir
// Ürün stok: 50 → 45
```

---

## 📋 Veritabanı Mimarisi

### **MongoDB Collections (Tablolar)**

```
samm_erp_db
├── urunler
│   ├── _id (ObjectId)
│   ├── ad (String)
│   ├── fiyat (Number)
│   ├── stok (Number)
│   ├── kategori (String)
│   └── ebat? (String)
│
├── kullanicilar
│   ├── _id (ObjectId)
│   ├── ad (String)
│   ├── soyad? (String)
│   ├── email? (String)
│   ├── sifre? (String)
│   ├── rol (String: admin, editor, stajyer)
│   ├── no? (String)
│   └── aciklama? (String)
│
└── siparisler
    ├── _id (ObjectId)
    ├── urunId (ObjectId) → urunler._id
    ├── urunAd (String)
    ├── adet (Number)
    ├── birimFiyat (Number)
    ├── toplamTutar (Number)
    ├── olusturan (String)
    └── tarih (String)
```

### **Veri Dökümü Örneği**

**urunler Collection:**

```javascript
db.urunler.insertMany([
  {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    ad: "Raspberry Pi 5 - 8GB",
    fiyat: 8500,
    stok: 50,
    kategori: "Mikrodenetleyici",
    ebat: "85mm x 56mm",
  },
  {
    _id: ObjectId("507f1f77bcf86cd799439012"),
    ad: "Arduino UNO",
    fiyat: 2500,
    stok: 100,
    kategori: "Mikrodenetleyici",
    ebat: "68.6mm x 53.3mm",
  },
]);
```

**siparisler Collection:**

```javascript
db.siparisler.insertMany([
  {
    _id: ObjectId("607f1f77bcf86cd799439011"),
    urunId: ObjectId("507f1f77bcf86cd799439011"), // Raspberry Pi 5
    urunAd: "Raspberry Pi 5 - 8GB",
    adet: 5,
    birimFiyat: 8500,
    toplamTutar: 42500,
    olusturan: "emre",
    tarih: "26.02.2026 14:30:00",
  },
  {
    _id: ObjectId("607f1f77bcf86cd799439012"),
    urunId: ObjectId("507f1f77bcf86cd799439012"), // Arduino UNO
    urunAd: "Arduino UNO",
    adet: 10,
    birimFiyat: 2500,
    toplamTutar: 25000,
    olusturan: "ali",
    tarih: "26.02.2026 15:45:00",
  },
]);
```

---

## 🔐 Kimlik Doğrulama Sistemi (JWT)

### **JWT Nedir?**

**JWT** = JSON Web Token

3 parçadan oluşan güvenli şifreleme:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6bnVsbCwia3VsbGFuaWNpIjoiZW1yZSIsInJvbCI6ImFkbWluIiwib2dyZW5jaU5vIjpudWxsLCJpYXQiOjE2ODk5NzY4NzksImV4cCI6MTY4OTk4MDQ3OX0.xyz

↑ HEADER           ↑ PAYLOAD                        ↑ SIGNATURE
```

---

### **JWT Flow**

```
Frontend                  Backend
   |                         |
   | 1. POST /login          |
   | { userName, pass }  ----→
   |                         |
   |                      .env kontrol
   |                      ADMIN1_USER=emre
   |                      ADMIN1_PASS=123
   |                      ✅ Eşleşti!
   |                         |
   |                      JWT token oluştur
   |                      jwt.sign({ ... }, secret)
   |                         |
   | 2. ✅ { token: "eyJ..." }
   |←----
   |
   localStorage.setItem('token', 'eyJ...')
   |
   | 3. GET /urunler         |
   | Header: Authorization: Bearer eyJ...
   |      (otomatik eklenir) ----→
   |                         |
   |                      jwt.verify(token, secret)
   |                      ✅ Geçerli!
   |                         |
   |                      req.kullanici = {
   |                        id: 1,
   |                        kullanici: "emre",
   |                        rol: "admin",
   |                        ...
   |                      }
   |                         |
   |                      ürünleri getir
   |                         |
   | 4. { data: [...] }
   |←----
```

---

### **JWT Token Örnekleri**

**imzalanmış JWT:**

```
Header:
{
  "alg": "HS256",    // Algoritma (HMAC SHA256)
  "typ": "JWT"       // Tip
}

Payload:
{
  "id": null,
  "kullanici": "emre",
  "rol": "admin",
  "ogrenciNo": "2212102015",
  "iat": 1689976879,      // İssuance time (ne zaman verildi)
  "exp": 1689980479       // Expiration time (1 saat sonra)
}

Signature:
HMAC_SHA256(
  base64(header) + "." + base64(payload),
  "gizli_anahtar"
)
```

---

### **Token Doğrulama Mantığı**

```typescript
function verifyToken(token: string, secret: string): any {
  try {
    // 1. Token'ı ayır
    const [header, payload, signature] = token.split(".");

    // 2. Payload'ı decode et
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64").toString(),
    );

    // 3. Exp kontrol et
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < now) {
      throw new Error("Token süresi bitmiş!"); // ❌
    }

    // 4. Imzayı doğrula
    const expectedSignature = HMAC_SHA256(`${header}.${payload}`, secret);

    if (signature !== expectedSignature) {
      throw new Error("Token sahte!"); // ❌
    }

    // 5. Geçerliyse payload dön
    return decodedPayload; // ✅
  } catch (error) {
    return null;
  }
}
```

---

## 🌐 Her API Endpoint'ini Detaylı Anlama

### **Authentication Routes: `/auther`**

#### **POST /auther/login**

```typescript
// İstek
POST http://localhost:3000/auther/login
Content-Type: application/json

{
  "userName": "emre",
  "pass": "123"
}

// Backend İşlemi
1. .env'de ADMIN1_USER=emre bul ✅
2. ADMIN1_PASS=123 kontrol et ✅
3. JWT token oluştur
4. Return token

// Cevap
HTTP/1.1 200 OK
{
  "success": true,
  "message": "Biletiniz hazır!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Frontend
localStorage.setItem('token', 'eyJ...')
navigate('/')
```

---

### **Ürün Routes: `/urunler`**

#### **GET /urunler (Tüm ürünleri getir)**

```typescript
GET http://localhost:3000/urunler
Authorization: Bearer eyJ...

// Backend
1. Token doğrula ✅
2. Rol kontrol et (admin/editor/stajyer) ✅
3. UrunModel.find() → MongoDB sorgusu
4. Tüm ürünleri dön

// Cevap
HTTP/1.1 200 OK
[
  {
    "_id": "507f...",
    "ad": "Raspberry Pi 5",
    "fiyat": 8500,
    "stok": 50,
    "kategori": "Mikrodenetleyici"
  },
  ...
]
```

#### **GET /urunler?ara=Raspberry (Ürün ara)**

```typescript
GET http://localhost:3000/urunler?ara=Raspberry
Authorization: Bearer eyJ...

// Backend
const sonuc = await UrunModel.find({
  ad: { $regex: 'Raspberry', $options: 'i' }
});

// Cevap: Adında "Raspberry" olan ürünler
```

#### **GET /urunler?kat=Mikrodenetleyici (Kategoriye göre)**

```typescript
GET http://localhost:3000/urunler?kat=Mikrodenetleyici

// Backend
const sonuc = await UrunModel.find({
  kategori: { $regex: 'Mikrodenetleyici', $options: 'i' }
});
```

#### **GET /urunler?min=1000&max=9000 (Fiyat aralığı)**

```typescript
GET http://localhost:3000/urunler?min=1000&max=9000

// Backend
const sonuc = await UrunModel.find({
  fiyat: { $gte: 1000, $lte: 9000 }
});

// Cevap: 1000 ≤ fiyat ≤ 9000
```

#### **POST /urunler (Yeni ürün ekle)**

```typescript
POST http://localhost:3000/urunler
Authorization: Bearer eyJ... (admin veya editor)
Content-Type: application/json

{
  "ad": "STM32 Microcontroller",
  "fiyat": 1200,
  "stok": 75,
  "kategori": "Mikrodenetleyici",
  "ebat": "60mm x 40mm"
}

// Backend
1. Token doğrula ✅
2. Rol kontrol: admin veya editor? ✅
3. Zorunlu alanlar kontrol et ✅
4. Aynı ürün var mı kontrol et ✅
5. Veri tiplerini dönüştür (String, Number vb)
6. UrunModel.create() → MongoDB'ye yaz
7. Yeni ürünü dön

// Cevap
HTTP/1.1 201 Created
{
  "_id": "507f...",
  "ad": "STM32 Microcontroller",
  "fiyat": 1200,
  "stok": 75,
  "kategori": "Mikrodenetleyici",
  "ebat": "60mm x 40mm"
}
```

#### **PUT /urunler/:id (Ürünü tamamen güncelle)**

```typescript
PUT http://localhost:3000/urunler/507f1f77bcf86cd799439011
Authorization: Bearer eyJ... (admin veya editor)
Content-Type: application/json

{
  "ad": "Raspberry Pi 5 - 16GB",  // Değişti
  "fiyat": 10500,                 // Değişti
  "stok": 45,                      // Değişti
  "kategori": "Mikrodenetleyici",  // Aynı
  "ebat": "85mm x 56mm"            // Aynı
}

// Backend
1. Token doğrula ✅
2. Rol kontrol ✅
3. ID'nin var olup olmadığını kontrol
4. TÜM verileri yeni verilerle değiştir (overwrite: true)
5. Yeni ürünü dön

// Cevap
HTTP/1.1 200 OK
{
  "_id": "507f...",
  "ad": "Raspberry Pi 5 - 16GB",
  "fiyat": 10500,
  "stok": 45,
  "kategori": "Mikrodenetleyici",
  "ebat": "85mm x 56mm"
}
```

#### **PATCH /urunler/:id (Kısmi güncelleme)**

```typescript
PATCH http://localhost:3000/urunler/507f1f77bcf86cd799439011
Authorization: Bearer eyJ... (admin veya editor)
Content-Type: application/json

{
  "stok": 40  // Sadece stok değişecek
}

// Backend
1. Token doğrula ✅
2. Rol kontrol ✅
3. Sadece stok alanını güncelle
4. Diğer alanlar aynı kalır
5. Güncellenmiş ürünü dön

// Cevap
HTTP/1.1 200 OK
{
  "_id": "507f...",
  "ad": "Raspberry Pi 5",
  "fiyat": 8500,
  "stok": 40,    // ← Değişti
  "kategori": "Mikrodenetleyici"
}
```

#### **DELETE /urunler/:id (Ürünü sil)**

```typescript
DELETE http://localhost:3000/urunler/507f1f77bcf86cd799439011
Authorization: Bearer eyJ... (admin SADECE)

// Backend
1. Token doğrula ✅
2. Rol kontrol (sadece admin)
3. UrunModel.findByIdAndDelete()
4. Başarılı mesaj dön

// Cevap
HTTP/1.1 200 OK
{
  "mesaj": "Ürün silindi."
}
```

---

### **Sipariş Routes: `/siparisler`**

#### **POST /siparisler (Yeni sipariş oluştur)**

```typescript
POST http://localhost:3000/siparisler
Authorization: Bearer eyJ... (admin/editor/stajyer)
Content-Type: application/json

{
  "urunId": "507f1f77bcf86cd799439011",
  "adet": 5
}

// Backend (ÖZET)
1. Token doğrula ✅
2. Rol kontrol ✅
3. Ürünü bul
4. Stok kontrol:
   - Ürün.stok (50) < adet (5)? Hayır ✅
5. Stoğu azalt:
   - Ürün.stok = 50 - 5 = 45
   - await Ürün.save()
6. Siparişi kaydet:
   - toplamTutar = 5 * 8500 = 42500
   - olusturan = request'teen gelen kullanıcı
   - tarih = şu anki tarih-saat
7. Siparişi dön

// Cevap
HTTP/1.1 201 Created
{
  "_id": "607f...",
  "urunId": "507f...",
  "urunAd": "Raspberry Pi 5",
  "adet": 5,
  "birimFiyat": 8500,
  "toplamTutar": 42500,
  "olusturan": "emre",
  "tarih": "26.02.2026 14:30:00"
}

// Frontend State Güncellemesi
siparisler.push(siparis);  // Yeni sipariş ekle
urunler[0].stok = 45;      // Ürün stokunu azalt
```

#### **GET /siparisler (Tüm siparişleri getir)**

```typescript
GET http://localhost:3000/siparisler
Authorization: Bearer eyJ...

// Backend
SiparisModel.find()

// Cevap
[
  {
    "_id": "607f...",
    "urunId": "507f...",
    "urunAd": "Raspberry Pi 5",
    "adet": 5,
    "birimFiyat": 8500,
    "toplamTutar": 42500,
    "olusturan": "emre",
    "tarih": "26.02.2026 14:30:00"
  },
  ...
]
```

#### **DELETE /siparisler/:id (Siparişi iptal et)**

```typescript
DELETE http://localhost:3000/siparisler/607f1f77bcf86cd799439011
Authorization: Bearer eyJ... (admin SADECE)

// Backend
1. Siparişi bul
2. Ürünü bul (sipariş.urunId)
3. Stoğu iade et:
   - Ürün.stok += siparis.adet
   - Ürün.stok = 45 + 5 = 50 ✅
   - await Ürün.save()
4. Siparişi sil
5. Cevap dön

// Cevap
HTTP/1.1 200 OK
{
  "mesaj": "Sipariş silindi ve stok iade edildi."
}
```

---

## 🎯 Bağlantı Özeti

**Frontend → Backend Bağlantı:**

```
App.tsx
  ├─ LoginPage: GİRİŞ
  │   └─ api.post('/auther/login')
  │       └─ AuthContext.login(token) → localStorage
  │
  ├─ DashboardPage: ANASayfa
  │   ├─ api.get('/urunler') → Ürün stats
  │   └─ api.get('/siparisler') → Sipariş stats
  │
  ├─ UrunlerPage: ÜRÜN YÖNETİMİ
  │   ├─ GET /urunler → Tablo doldur
  │   ├─ POST /urunler → Ürün ekle
  │   ├─ PUT /urunler/:id → Güncelle
  │   └─ DELETE /urunler/:id → Sil
  │
  └─ SiparislerPage: SİPARİŞ YÖNETİMİ
      ├─ GET /siparisler → Tablo doldur
      ├─ POST /siparisler → Sipariş oluş (stok azalt)
      └─ DELETE /siparisler/:id → İptal (stok iade)
```

---

## 🚀 Özetle

Bu proje:

1. **React** ile modern, hızlı kullanıcı arayüzü
2. **Express.js** ile sağlam backend
3. **MongoDB** ile ölçeklenebilir veri depolama
4. **JWT** ile güvenli kimlik doğrulama
5. **MVC Mimarisi** ile clean code

Tüm veri işlemleri **asenkron** (async/await) yapılır:

```
Frontend request   → Backend yanıtı → Database işlemi → Cevap
    (promise)        (express)         (mongodb)      (JSON)
        ↓               ↓                   ↓            ↓
   1ms              5ms sürü            10ms sürü     Geri
```

---

**Yazı tarihi: 26 Şubat 2026**
**Versiyon: 1.0**
**Yazar: ERP Eğitim Sistemi**
