# SAMM ERP - Kapsamlı Mimari Dokümantasyonu

## 1. Projenin Genel Amacı ve Yapısı

Bu proje, **ERP (Enterprise Resource Planning) yönetim sistemi** olup:

- **Ürün yönetimi** (CRUD - Create, Read, Update, Delete)
- **Sipariş yönetimi** (sipariş oluşturma, stok otomatik güncelleme)
- **Kullanıcı yönetimi** (rol-tabanlı erişim kontrolü)
- **Dashboard** (istatistikler, kritik stok uyarıları)

Bu işlemleri gerçekleştiren **iki temel bölüme** ayrılmıştır:

### 1.1. **Frontend (Kullanıcı Arayüzü)**

- **Konumu**: `frontend-app/` klasörü
- **Yapı**: Single Page Application (SPA) — Vite + React 19 (TypeScript)
- **Amaç**: Kullanıcıya giriş, veri gösterimi, CRUD işlemleri için UI sunmak

### 1.2. **Backend (Sunucu Tarafı)**

- **Konumu**: `typescript_calisma/` klasörü
- **Yapı**: REST API — Express.js + TypeScript + Node.js
- **Amaç**: İş mantığı, veri doğrulama, yetki kontrolü, veri depolama

---

## 2. FRONTEND İNCELEMESİ (Detaylı)

### 2.1. Genel Teknik Yığın (Tech Stack)

```json
{
  "React 19.2.0": "UI kütüphanesi",
  "TypeScript ~5.9": "Tür güvenliği",
  "Vite 7.3.1": "Build aracı ve dev sunucusu (ışık hızında derleme)",
  "axios 1.13.5": "HTTP istemcisi",
  "react-router-dom 7.13.0": "Client-side routing (sayfalar arası geçiş)",
  "lucide-react 0.575.0": "Profesyonel ikonlar",
  "ESLint + TypeScript-ESLint": "Kod kalitesi ve hata kontrolü"
}
```

### 2.2. Proje Dosya Yapısı ve Her Dosyanın Görevi

```
frontend-app/
├── public/                    # Statik dosyalar (favicon, resimler vb.)
├── src/
│   ├── main.tsx             # 🔴 GIRIŞ NOKTASI - React DOM oluşturma
│   ├── App.tsx              # 🟠 Router yapılandırması, sayfa yönlendirmesi
│   ├── App.css              # Global stiller
│   ├── index.css            # Ana CSS (Tema değişkenleri, responsive tasarım)
│   ├── api.ts               # 🔵 HTTP istemci (axios örneği + interceptor'lar)
│   ├── types.ts             # TypeScript arayüzleri (Urun, Siparis, Kullanici vb.)
│   ├── assets/              # Görseller, fontlar
│   ├── context/
│   │   └── AuthContext.tsx  # 🟢 Global kimlik doğrulama durumu
│   ├── components/
│   │   ├── Modal.tsx        # Ortak modal bileşeni
│   │   └── Sidebar.tsx      # Navigasyon menüsü
│   └── pages/
│       ├── LoginPage.tsx    # Giriş formu
│       ├── DashboardPage.tsx # Ana dashboard (istatistikler)
│       ├── UrunlerPage.tsx  # Ürün yönetimi
│       ├── SiparislerPage.tsx # Sipariş yönetimi
│       └── KullanicilarPage.tsx # Kullanıcı yönetimi (Admin)
├── package.json             # Bağımlılıklar ve scriptler
├── tsconfig.json            # TypeScript konfigürasyonu
├── vite.config.ts           # Vite yapılandırması
└── index.html               # HTML giriş dosyası
```

### 2.3. Uygulama Başlatılması (main.tsx → App)

**`main.tsx` dosyası (giriş noktası):**

```typescript
// 1. React ve ReactDOM kütüphanelerini içe aktar
import React from 'react';
import ReactDOM from 'react-dom/client';
// 2. Router kurulumu (sayfa geçişleri için)
import { BrowserRouter } from 'react-router-dom';
// 3. Kimlik doğrulama context'i
import { AuthProvider } from './context/AuthContext';
// 4. Ana App bileşeni
import App from './App';
import './index.css';

// 5. React uygulamasını div#root'a render et
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* BrowserRouter: URL değişikliklerini izle */}
    <BrowserRouter>
      {/* AuthProvider: Kimlik bilgisini app'ın diğer bölümlerine sun */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**Kilit Noktalar:**

- `BrowserRouter`: URL'de değişiklik olduğunda (örn. `/urunler` → `/siparisler`) sayfayı değiştirir, sayfa yenilenmez.
- `AuthProvider`: Dosyada `useAuth()` hook'u ile kullanıcı bilgisine her yerden erişilebilir.
- `React.StrictMode`: Geliştirme sırasında uyarı ve hataları daha belirgin gösterir.

### 2.4. App.tsx - Routing Yapılandırması

```typescript
function App() {
  // Giriş yapılmışsa sayfaları göster, değilse LoginPage göster
  // Router yapısı:
  // /              → DashboardPage (Ana panel)
  // /urunler       → UrunlerPage (Ürün yönetimi)
  // /siparisler    → SiparislerPage (Sipariş yönetimi)
  // /kullanicilar  → KullanicilarPage (Kullanıcı yönetimi, sadece admin)
  // /login         → LoginPage (Giriş sayfası)
}
```

> **Not**: Tam routing kodu dosyada yoksa, bunun React Router v7 ile yapıldığı anlaşılıyor. Sayfalar dynamic olarak yükleniyor.

### 2.5. api.ts - HTTP İstemcisi ve İstek Yakalayıcıları (Interceptor)

**Dosya amacı**: Backend'e istek göndermek ve yanıtları işlemek.

```typescript
import axios from "axios";

// Axios örneği oluştur, tüm istekler bu örneği kullanacak
export const api = axios.create({
  baseURL: "http://localhost:3000", // Backend URL
});

// ─── REQUEST İNTERCEPTOR ───
// Her istekten ÖNCE çalışır
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Header'a JWT ekle
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── RESPONSE İNTERCEPTOR ───
// Her yanıt geldiğinde çalışır
api.interceptors.response.use(
  (response) => response, // Başarılı ise yanıtı döndür
  (error) => {
    // 401 (Yetkisiz) veya 403 (Yasak) - Token geçersiz/süresi dolmuş
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token"); // Token'ı sil
      window.location.href = "/login"; // Login sayfasına yönlendir
    }
    return Promise.reject(error);
  },
);
```

**Neden interceptor lazım?**

- **Request Interceptor**: Her isteğe otomatik olarak token eklemek (manuel yazmanın yerinden kurtarmak).
- **Response Interceptor**: Token süresi dolmuşsa otomatik logout ve yönlendirme.

**Örnek kullanım:**

```typescript
// LoginPage.tsx içinde
const res = await api.post("/auther/login", { userName, pass });
// ↑ Arka planda interceptor token ekler (varsa)

// UrunlerPage.tsx içinde
const res = await api.get("/urunler");
// ↑ Header: Authorization: Bearer <token> otomatik eklenir
```

### 2.6. AuthContext.tsx - Kimlik Doğrulama Durumu (Global State)

**Amacı**: Uygulamanın her yerinden kullanıcı bilgisine ve login/logout işlevlerine erişebilmek.

```typescript
interface AuthContextType {
  token: string | null; // JWT
  user: AuthUser | null; // Decode edilmiş kullanıcı bilgisi
  login: (token: string) => void; // Token al, user'ı set et
  logout: () => void; // Token sil, user'ı null yap
  isAdmin: boolean; // Kullanıcı admin mi?
  isEditor: boolean; // Kullanıcı editor/admin mi?
}

// AuthUser arayüzü (types.ts'den)
interface AuthUser {
  id: number | null;
  kullanici: string; // Kullanıcı adı
  rol: "admin" | "editor" | "stajyer";
  ogrenciNo: string | null; // Öğrenci/sicil no
}
```

**Kilit Fonksiyon: parseToken()**

```typescript
function base64UrlDecodeToUtf8(input: string) {
  // Base64URL'i Base64'e dönüştür
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  // Padding ekle
  while (str.length % 4) str += "=";
  // atob ile binary string'e çevir
  const binary = atob(str);
  // Binary'i Türkçe karakterleri kaybetmeden UTF-8'e çevir
  const percentEncoded = binary
    .split("")
    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
    .join("");
  return decodeURIComponent(percentEncoded);
}

function parseToken(token: string): AuthUser | null {
  try {
    const payload = token.split(".")[1]; // JWT: header.payload.signature
    const json = base64UrlDecodeToUtf8(payload); // Düzgün UTF-8 decode
    return JSON.parse(json); // Kullanıcı bilgisini çıkart
  } catch {
    return null;
  }
}
```

**Neden `base64UrlDecodeToUtf8` gerekli?**

- JWT payload Base64URL ile encode edilir (özel karakter işlemesi).
- Türkçe karakterler (ü, ğ, ş, ı, ö, ç) çok-baytlı UTF-8 olduğundan doğru decode edilmezse "mojibake" (bozuk yazı) ortaya çıkar.
- Örn: "Aygün" → "AygÃ¼n" gibi.

**Nasıl kullanılır?**

```typescript
// LoginPage.tsx içinde
const res = await api.post("/auther/login", { userName, pass });
if (res.data.token) {
  login(res.data.token); // ← parseToken otomatik çalışır, user set edilir
}

// Başka bir sayfada
const { user, isAdmin } = useAuth();
if (isAdmin) {
  // Sadece admin görsün
}
```

### 2.7. pages/ - Sayfalar ve İş Mantığı

#### **LoginPage.tsx**

```typescript
export default function LoginPage() {
  const [userName, setUserName] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Kullanıcı adı ve şifre ile backend'e istek yap
      const res = await api.post('/auther/login', { userName, pass });
      if (res.data.token) {
        // 2. Token alındı, AuthContext'e kaydet
        login(res.data.token);
        // 3. Dashboard'a yönlendir
        navigate('/');
      }
    } catch (err: any) {
      // Backend'den gelen hata mesajını göster
      setError(err.response?.data?.message || 'Kullanıcı adı veya şifre hatalı!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Form UI */}
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        {/* input alanları */}
      </form>
      {/* Test hesapları göster */}
      <p><code>emre</code> / <code>123</code> — Admin</p>
      <p><code>mehmet</code> / <code>456</code> — Editör</p>
      <p><code>can</code> / <code>789</code> — Stajyer</p>
    </div>
  );
}
```

**İş akışı:**

1. Kullanıcı formu doldurur → handleSubmit çalışır.
2. API'ye POST isteği → Backend login kontrolü yapar.
3. Token yanıt gelirse → `AuthContext.login()` kullanıcıyı set eder.
4. `navigate('/')` → Dashboard sayfasına yönlendir.

#### **DashboardPage.tsx**

```typescript
export default function DashboardPage() {
  const { user } = useAuth(); // Kimdi giriş yapan?
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [siparisler, setSiparisler] = useState<Siparis[]>([]);

  useEffect(() => {
    // 1. Tüm ürünleri al
    const urunRes = await api.get('/urunler');
    // 2. Tüm siparişleri al
    const sipRes = await api.get('/siparisler');
    setUrunler(urunRes.data);
    setSiparisler(sipRes.data);
  }, []);

  // İstatistikler hesapla
  const toplamStokDegeri = urunler.reduce((acc, u) => acc + u.fiyat * u.stok, 0);
  const toplamSiparisTutar = siparisler.reduce((acc, s) => acc + s.toplamTutar, 0);
  const kritikStok = urunler.filter((u) => u.stok <= 10).length;

  return (
    <div>
      <h2>Hoş geldin, {user?.kullanici?.normalize?.('NFC')} 👋</h2>
      {/* Stat kartları: toplam ürün, stok değeri, sipariş sayısı, gelir */}
      {/* Kritik stok tablosu (stok ≤ 10) */}
      {/* Son 10 sipariş tablosu */}
    </div>
  );
}
```

**İş mantığı:**

- `user?.kullanici?.normalize?.('NFC')` — Türkçe karakterleri normalize eder (bozulma önlemi).
- Ürün ve sipariş verilerini fetch eder.
- İstatistikleri hesaplar (stok değeri = fiyat × adet).
- Kritik stok (≤ 10) ürünlerini uyarı tablsuyla gösterir.

#### **UrunlerPage.tsx**

```typescript
export default function UrunlerPage() {
  const { isAdmin, isEditor } = useAuth();
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [filtered, setFiltered] = useState<Urun[]>([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | 'ekle' | 'guncelle'>(null);

  // İş akışı:
  // 1. Uygulama açılırsa tüm ürünleri fetch et
  useEffect(() => {
    fetchUrunler();
  }, []);

  // 2. Ürün ekle
  const handleSave = async () => {
    if (modal === 'ekle') {
      await api.post('/urunler', form); // Backend'e gönder
    } else if (modal === 'guncelle' && secili) {
      await api.put(`/urunler/${secili.id}`, form); // Güncelle
    }
    // Listeyi yenile
    fetchUrunler();
  };

  // 3. Ürün sil (sadece admin)
  const handleDelete = async () => {
    if (isAdmin) {
      await api.delete(`/urunler/${deleteId}`);
    }
  };

  // 4. Arama filtresi
  useEffect(() => {
    const filtered = urunler.filter(u =>
      u.ad.toLowerCase().includes(search.toLowerCase()) ||
      u.kategori.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filtered);
  }, [search, urunler]);

  return (
    <div>
      <input placeholder="Ürün veya kategori ara..." onChange={e => setSearch(e.target.value)} />
      {isEditor && <button onClick={openEkle}>Ürün Ekle</button>}
      <table>
        {/* Ürün tablosu */}
        {isEditor && <th>İşlemler</th>}
      </table>
      {/* Ekleme/Güncelleme Modal */}
      {/* Silme Onay Modal */}
    </div>
  );
}
```

**Yetki kontrolü:**

- `isEditor` → Ürün ekle/güncelle butonları görünsün.
- `isAdmin` → Silme butonları görünsün.

#### **SiparislerPage.tsx**

```typescript
export default function SiparislerPage() {
  const [form, setForm] = useState({ urunId: "", adet: "1" });

  const handleSave = async () => {
    // Backend'e JWT token ve sipariş verisi gönder
    await api.post("/siparisler", {
      urunId: Number(form.urunId),
      adet: Number(form.adet),
    });
    // ← Backend: stok kontrolü, stoktan düşme, sipariş kaydı
  };

  const seciliUrun = urunler.find((u) => u.id === Number(form.urunId));
  // Seçilen ürün varsa, toplam tutar hesapla
  const toplamTutar = seciliUrun?.fiyat * Number(form.adet);
}
```

**İş akışı:**

1. Kullanıcı ürün seçer ve adet girişi yapar.
2. "Sipariş Oluştur" → Backend'e POST gönderilir.
3. Backend stoktan düşer ve sipariş kaydını tutar.
4. Frontend liste güncelenir.

#### **KullanicilarPage.tsx**

```typescript
export default function KullanicilarPage() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <div>Erişim Yetkiniz Yok</div>; // Sadece admin
  }

  const handleSave = async () => {
    // Yeni kullanıcı ekle (sadece veritabanına)
    await api.post('/kullanicilar', form);
    // Not: .env dosyasına kullanıcı adı/şifre eklenmesi gerekiyor
  };

  const handleDelete = async () => {
    await api.delete(`/kullanicilar/${deleteId}`);
  };
}
```

**Neden önemli:** Kullanıcı sisteme eklense bile, giriş yapabilmesi için `.env` dosyasına kullanıcı adı/şifre tanımlanması gerekiyor.

### 2.8. types.ts - TypeScript Arayüzleri

```typescript
export interface Urun {
  id: number;
  ad: string; // Ürün adı
  fiyat: number; // Birim fiyat (₺)
  stok: number; // Stok miktarı
  kategori: string; // Kategori
  ebat?: string; // Ebat (opsiyonel, örn: 85mm x 56mm)
}

export interface Siparis {
  id: number;
  urunId: number; // Hangi ürün
  urunAd: string; // Ürün adı (hızlı erişim için)
  adet: number; // Kaç adet
  birimFiyat: number; // O zamanki birim fiyat
  toplamTutar: number; // adet × birimFiyat
  olusturan: string; // Sipariş oluşturan kişi
  tarih: string; // Oluşturulma tarihi
}

export interface Kullanici {
  id: number;
  ad: string; // Ad soyad
  rol: string; // admin, editor, stajyer
  no: string; // Sicil/öğrenci no
  email?: string;
  aciklama?: string;
}

export interface AuthUser {
  id: number | null;
  kullanici: string; // Kullanıcı adı (JWT payload'dan)
  rol: "admin" | "editor" | "stajyer";
  ogrenciNo: string | null;
}
```

### 2.9. components/ - Yeniden Kullanılabilir Bileşenler

#### **Modal.tsx**

```typescript
interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ title, onClose, children, footer }: ModalProps) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* ↑ Arka plana tıklandığında kapat */}
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
```

**Kullanım örneği:**

```typescript
{modal && (
  <Modal
    title="Yeni Ürün Ekle"
    onClose={() => setModal(null)}
    footer={
      <>
        <button onClick={() => setModal(null)}>İptal</button>
        <button onClick={handleSave}>Kaydet</button>
      </>
    }
  >
    <input name="ad" placeholder="Ürün adı" />
    <input name="fiyat" type="number" placeholder="Fiyat" />
  </Modal>
)}
```

#### **Sidebar.tsx**

```typescript
export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/urunler', label: 'Ürünler' },
    { to: '/siparisler', label: 'Siparişler' },
    ...(isAdmin ? [{ to: '/kullanicilar', label: 'Kullanıcılar' }] : []),
    // ↑ Sadece admin "Kullanıcılar" sayfasını görsün
  ];

  return (
    <aside className="sidebar">
      <div className="brand">SAMM ERP</div>
      <nav>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={logout} style={{ color: 'red' }}>
        Çıkış Yap
      </button>
    </aside>
  );
}
```

---

## 3. BACKEND İNCELEMESİ (Detaylı)

### 3.1. Genel Teknik Yığın (Tech Stack)

```json
{
  "Node.js 18+": "JavaScript runtime",
  "Express.js 5.2.1": "Web framework",
  "TypeScript ~5.9": "Tür güvenliği",
  "jsonwebtoken 9.0.3": "JWT üretim/doğrulama",
  "cors 2.8.6": "Cross-Origin Resource Sharing (frontend'den istek alabilmek)",
  "dotenv 17.3.1": "Ortam değişkenleri (.env dosyasından)",
  "ts-node 10.9.2": "TypeScript'i doğrudan çalıştır"
}
```

### 3.2. Proje Dosya Yapısı

```
typescript_calisma/
├── src/
│   ├── index.ts               # 🔴 GIRIŞ NOKTASI - Express sunucusu başlat
│   ├── config/
│   │   ├── config.ts          # Oracle bağlantı ayarları
│   │   └── database.ts        # Oracle bağlantı fonksiyonu (şu an placeholder)
│   ├── controllers/
│   │   ├── KullaniciController.ts   # Kullanıcı HTTP işleyicisi
│   │   ├── UrunController.ts        # Ürün HTTP işleyicisi
│   │   └── SiparisController.ts     # Sipariş HTTP işleyicisi
│   ├── services/
│   │   ├── AuthService.ts     # 🟢 JWT oluştur/doğrula
│   │   ├── KullaniciService.ts    # Kullanıcı işlemleri (JSON dosyası)
│   │   ├── UrunService.ts         # Ürün işlemleri (JSON dosyası)
│   │   └── SiparisService.ts      # Sipariş işlemleri + stok yönetimi
│   ├── middlewares/
│   │   └── authMiddleware.ts  # 🔵 Token doğrulama, rol kontrolü
│   ├── routes/
│   │   ├── AuthRoutes.ts      # POST /auther/login
│   │   ├── KullaniciRoutes.ts # GET/POST/DELETE /kullanicilar
│   │   ├── UrunRoutes.ts      # GET/POST/PUT/PATCH/DELETE /urunler
│   │   └── SiparisRoutes.ts   # GET/POST/DELETE /siparisler
│   ├── types/
│   │   └── types.ts           # TypeScript arayüzleri
│   └── data/
│       ├── kullanicilar.json  # Kullanıcı verileri (persistency)
│       ├── urunler.json       # Ürün verileri
│       └── siparisler.json    # Sipariş verileri
├── .env                       # ⚙️ Test hesapları (ADMIN_USER, ADMIN_PASS vb.)
└── package.json
```

### 3.3. Server Başlatılması (index.ts)

```typescript
import express from "express";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.ts";
import KullaniciRoutes from "./routes/KullaniciRoutes.ts";
import UrunRoutes from "./routes/UrunRoutes.ts";
import SiparisRoutes from "./routes/SiparisRoutes.ts";

const app = express();

// Middleware'ler
app.use(cors()); // Frontend'den istek almaya izin ver
app.use(express.json()); // JSON body'yi parse et

// Routes
app.use("/auther", AuthRoutes); // POST /auther/login
app.use("/kullanicilar", KullaniciRoutes); // /kullanicilar/*
app.use("/urunler", UrunRoutes); // /urunler/*
app.use("/siparisler", SiparisRoutes); // /siparisler/*

// Sunucu dinle
app.listen(3000, () => {
  console.log("Server http://localhost:3000 adresinde çalışıyor");
});
```

**Özet:**

- Express uygulaması 3000. portta dinler.
- CORS açıktır → Frontend (farklı porttan) istek atabilir.
- Dört ana route grubu.

### 3.4. Kimlik Doğrulama: AuthService ve AuthRoutes

#### **AuthService.ts - JWT Üretim/Doğrulama**

```typescript
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || "gizli_anahtar";

  /**
   * Login işlemi: .env içindeki test hesaplarını kontrol et
   *
   * .env dosyası örneği:
   * ADMIN_USER=emre
   * ADMIN_PASS=123
   * ADMIN_NAME=Emre Kullanıcı
   * ADMIN_NO=12345
   *
   * JWT payload:
   * {
   *   id: 1,
   *   kullanici: "Emre Kullanıcı",
   *   rol: "admin",
   *   ogrenciNo: "12345"
   * }
   */
  public async login(username: string, pass: string): Promise<string | null> {
    // 1. .env içindeki tüm anahtar/değer çiftlerini tara
    const envKeys = Object.keys(process.env);

    // 2. Girilen kullanıcı adı ile eşleşen *_USER anahtarı ara
    const userKey = envKeys.find(
      (key) => key.endsWith("_USER") && process.env[key] === username,
    );

    if (!userKey) {
      return null; // Kullanıcı bulunamadı
    }

    // 3. Prefix bulma (örn: "ADMIN_USER" → prefix: "ADMIN")
    const prefix = userKey.replace("_USER", "");

    // 4. Şifre kontrolü
    const envPass = process.env[`${prefix}_PASS`];
    if (pass !== envPass) {
      return null; // Şifre eşleşmedi
    }

    // 5. Rolü belirle
    let rol = "stajyer";
    if (prefix.includes("ADMIN")) rol = "admin";
    else if (prefix.includes("EDITOR")) rol = "editor";

    // 6. JWT payload'ı oluştur
    const payload = {
      id: null,
      kullanici: process.env[`${prefix}_NAME`] || username,
      rol: rol,
      ogrenciNo: process.env[`${prefix}_NO`] || null,
    };

    // 7. JWT üret (1 saat geçerli)
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: "1h" });
  }

  /**
   * Token doğrulama
   */
  public biletKontrolEt(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      return null; // Token geçersiz/süresi dolmuş
    }
  }
}
```

**Neden .env'de saklıyoruz?**

- Gerçek uygulamada kütüphane/veritabanından kullanıcı bilgilerini alırız.
- Ornek için basit ve hızlı test.
- `.env` dosyası source control'da paylaşılmaz (güvenlik).

#### **AuthRoutes.ts - Login Endpoint'i**

```typescript
import { Router } from "express";
import { AuthService } from "../services/AuthService.ts";

const router = Router();
const authService = new AuthService();

// POST /auther/login
router.post("/login", async (req, res) => {
  console.log("Gelen istek:", req.body); // { userName: "emre", pass: "123" }

  const { userName, pass } = req.body;

  // AuthService ile login işlemi
  const token = await authService.login(userName, pass);

  if (token) {
    res.json({
      success: true,
      message: "Biletiniz hazır!",
      token: token, // ← Frontend localStorage'a kaydedecek
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Hatalı giriş!",
    });
  }
});

export default router;
```

**İş akışı:**

1. Frontend `api.post('/auther/login', { userName: 'emre', pass: '123' })` gönderir.
2. Backend AuthService.login() çağrısı yapar.
3. Başarılıysa → JWT döner.
4. Frontend token localStorage'a kaydeder.

### 3.5. Middleware: Kimlik Doğrulama ve Yetki Kontrolü

#### **authMiddleware.ts**

```typescript
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/AuthService.ts";

const authService = new AuthService();

/**
 * Middleware 1: guvenlikGorevlisi (Security Guard)
 * Tüm korumalı route'lar bu middleware'den geçer.
 * Görev: Authorization header'dan token al ve doğrula.
 */
export const guvenlikGorevlisi = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Header'dan token al
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).send("Biletin yok, giremezsin!");
  }

  // 2. "Bearer <token>" formatını ayır
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(403).send("Biletin yok, giremezsin!");
  }

  // 3. Token doğrula
  const kullanici = authService.biletKontrolEt(token);
  if (!kullanici) {
    return res.status(401).send("Biletin sahte veya süresi dolmuş!");
  }

  // 4. request nesnesine kullanıcı bilgisini ekle (sonraki middleware/controller için)
  (req as any).kullanici = kullanici;
  next(); // ✅ Geçi!
};

/**
 * Middleware 2: rolKontrol
 * İzin verilen roller listesine göre erişim kontrolü.
 */
export const rolKontrol = (izinVerilenRoller: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const kullanici = (req as any).kullanici;

    // Geçersiz token (guvenlikGorevlisi geçmişse bu olmamalı ama kontrol et)
    if (!kullanici) {
      return res.status(401).send("Önce giriş yapmalısın!");
    }

    // Rolü kontrol et
    if (izinVerilenRoller.includes(kullanici.rol)) {
      next(); // ✅ İznin var, geçi!
    } else {
      res
        .status(403)
        .send(
          `Bu işlem için ${izinVerilenRoller.join(" veya ")} yetkisi lazım!`,
        );
    }
  };
};
```

**Önemli nokta:** `(req as any).kullanici` ile route'a kadar kullanıcı bilgisini taşırız.

### 3.6. Routes - API Endpoint'leri ve Yetki Kontrolü

#### **UrunRoutes.ts - Ürün Endpoint'leri**

```typescript
import { Router } from "express";
import { UrunController } from "../controllers/UrunController.ts";
import {
  guvenlikGorevlisi,
  rolKontrol,
} from "../middlewares/authMiddleware.ts";

const router = Router();
const controller = new UrunController();

// Tüm ürün endpoint'leri token gerektirir
router.use(guvenlikGorevlisi);

// Listeleme: herkes görebilir (token yeterli)
router.get("/", controller.getTumUrunler);

// Ekleme: sadece admin/editor
router.post("/", rolKontrol(["admin", "editor"]), controller.urunEkle);

// Güncelleme: sadece admin/editor
router.put("/:id", rolKontrol(["admin", "editor"]), controller.urunGuncelleTam);
router.patch(
  "/:id",
  rolKontrol(["admin", "editor"]),
  controller.urunGuncelleKismi,
);

// Silme: sadece admin
router.delete("/:id", rolKontrol(["admin"]), controller.urunSil);

export default router;
```

**Middleware sırası önemli:**

```
İstek → guvenlikGorevlisi (token var mı?) → rolKontrol (yetki var mı?) → Controller (işlem yap)
```

#### **KullaniciRoutes.ts**

```typescript
import { Router } from "express";
import { KullaniciController } from "../controllers/KullaniciController.ts";
import {
  guvenlikGorevlisi,
  rolKontrol,
} from "../middlewares/authMiddleware.ts";

const router = Router();
const controller = new KullaniciController();

// Tüm işlemlerde token + ADMIN yetki gerekli
router.use(guvenlikGorevlisi);
router.use(rolKontrol(["admin"])); // Tüm alt route'lar admin gerektirir

router.get("/", controller.listele); // GET /kullanicilar
router.post("/", controller.ekle); // POST /kullanicilar
router.delete("/:id", controller.sil); // DELETE /kullanicilar/:id
router.get("/:id", controller.detayGetir); // GET /kullanicilar/:id

export default router;
```

**Not:** Müdür veya güvenlik görevlisi (admin) olmayan biri `/kullanicilar`'a erişirse 403 (Yasak) hata alır.

#### **SiparisRoutes.ts**

```typescript
import { Router } from "express";
import { SiparisController } from "../controllers/SiparisController.ts";
import {
  guvenlikGorevlisi,
  rolKontrol,
} from "../middlewares/authMiddleware.ts";

const router = Router();
const siparisController = new SiparisController();

// Tüm sipariş işlemleri token gerektirir
router.use(guvenlikGorevlisi);

// Sipariş oluşturma: herkes
router.post("/", siparisController.olustur);

// Listeleme: herkes
router.get("/", siparisController.listele);

// Silme: sadece admin
router.delete("/:id", rolKontrol(["admin"]), siparisController.sil);

export default router;
```

### 3.7. Controllers - HTTP İşleyicileri

#### **UrunController.ts örneği**

```typescript
import { Request, Response } from "express";
import { UrunService } from "../services/UrunService.ts";

const urunService = new UrunService();

export class UrunController {
  // GET /urunler?id=5&kategori=elektronik&ara=raspberry&min=100&max=5000
  public async getTumUrunler(req: Request, res: Response) {
    try {
      const { id, kat, ara, min, max, sadeceStokda } = req.query;

      // Filtreleme seçenekleri
      if (id) return res.json(await urunService.IdileUrunGetirme(Number(id)));
      if (kat)
        return res.json(await urunService.kategoriUrunGetirme(String(kat)));
      if (ara) return res.json(await urunService.ismeGoreAra(String(ara)));
      if (min && max) {
        return res.json(
          await urunService.fiyatAraligi(Number(min), Number(max)),
        );
      }

      // Tüm ürünleri al
      let urunler = await urunService.tumUrunleriGetir();
      if (sadeceStokda === "true") {
        urunler = urunler.filter((u) => u.stok > 0); // Sadece stokta olanlar
      }
      res.json(urunler);
    } catch (err) {
      res.status(500).json({ message: "Ürünler listelenirken hata!" });
    }
  }

  // POST /urunler
  public async urunEkle(req: Request, res: Response) {
    try {
      const yeniUrun = await urunService.urunEkle(req.body);
      res.status(201).json(yeniUrun); // 201 = Oluşturuldu
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  // PUT /urunler/:id (Tam güncelleme)
  public async urunGuncelleTam(req: Request, res: Response) {
    try {
      const guncellenmiş = await urunService.urunGuncelleTam(
        Number(req.params.id),
        req.body,
      );
      res.json(guncellenmiş);
    } catch (err: any) {
      res.status(404).json({ message: err.message });
    }
  }

  // DELETE /urunler/:id
  public async urunSil(req: Request, res: Response) {
    try {
      await urunService.urunSil(Number(req.params.id));
      res.json({ message: "Ürün silindi." });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
```

**Önemli HTTP durum kodları:**

- 200: Başarılı GET/PUT
- 201: Başarılı POST (Oluşturuldu)
- 400: İstek hatalı (veri eksik/geçersiz)
- 401: Yetkisiz (token yok/geçersiz)
- 403: Yasak (rol yetkilendirmesi başarısız)
- 404: Bulunamadı
- 500: Sunucu hatası

#### **SiparisController.ts örneği**

```typescript
export class SiparisController {
  private siparisService = new SiparisService();
  private authService = new AuthService();

  public olustur = async (req: Request, res: Response) => {
    try {
      // 1. Token'dan kullanıcı bilgisini al (middleware eklemişti)
      const biletBilgisi = (req as any).kullanici;

      // 2. Sipariş servisine gönder
      const sonuc = await this.siparisService.siparisEkle(
        req.body, // { urunId: 5, adet: 10 }
        biletBilgisi, // { id: 1, kullanici: "Emre", rol: "admin", ... }
      );

      // 3. Başarılıysa sipariş ve stok güncellenmiş demektir
      res.status(201).json({
        mesaj: "Sipariş alındı, stok güncellendi.",
        data: sonuc,
      });
    } catch (error: any) {
      // Hata: "Yetersiz stok!" gibi
      res.status(400).json({ mesaj: error.message });
    }
  };

  public sil = async (req: Request, res: Response) => {
    try {
      const siparisId = Number(req.params.id);
      const sonuc = await this.siparisService.siparisSil(siparisId);

      // Sipariş silindiyse stok iade edilmiş demektir
      res.json(sonuc);
    } catch (error: any) {
      res.status(404).json({ mesaj: error.message });
    }
  };
}
```

### 3.8. Services - İş Mantığı ve Veri Kaynağı

Servisler **JSON dosyaları ile çalışır** — bu nedense kurulum basit ama gerçek uygulamada veritabanı (PostgreSQL, MySQL, Oracle) kullanılır.

#### **UrunService.ts** (Detaylı)

```typescript
import fs from "fs";
import path from "path";

export class UrunService {
  private dosyaYolu = path.join(__dirname, "..", "data", "urunler.json");

  // Dosyayı oku
  private async veriOku(): Promise<Urun[]> {
    const hamVeri = await fs.promises.readFile(this.dosyaYolu, "utf-8");
    return JSON.parse(hamVeri) as Urun[];
  }

  // Dosyaya yaz
  private async veriYaz(urunler: Urun[]): Promise<void> {
    // JSON'u güzel formatlı yaz (2 boşluk indent)
    await fs.promises.writeFile(
      this.dosyaYolu,
      JSON.stringify(urunler, null, 2),
      "utf-8",
    );
  }

  // ─── SORGU METODU ────────────────────────────────

  /**
   * Tüm ürünleri getir
   *
   * Gerçek uygulamada:
   *   SELECT * FROM urunler;
   */
  public async tumUrunleriGetir(): Promise<Urun[]> {
    try {
      await connectToOracle(); // Oracle bağlantısı simülasyonu
      const tumUrunler = await this.veriOku();
      return tumUrunler;
    } catch (error) {
      throw new Error("Ürünler alınamadı");
    }
  }

  /**
   * ID ile ürün getir
   *
   * Gerçek uygulamada:
   *   SELECT * FROM urunler WHERE id = ?;
   */
  public async IdileUrunGetirme(urunId: number): Promise<Urun | undefined> {
    const tumUrunler = await this.veriOku();
    return tumUrunler.find((u) => u.id === urunId);
  }

  /**
   * Kategoriye göre ara
   *
   * Gerçek uygulamada:
   *   SELECT * FROM urunler WHERE kategori = ?;
   */
  public async kategoriUrunGetirme(kategori: string): Promise<Urun[]> {
    const tumUrunler = await this.veriOku();
    return tumUrunler.filter(
      (u) => u.kategori.toLowerCase() === kategori.toLowerCase(),
    );
  }

  /**
   * İsme göre ara
   *
   * Gerçek uygulamada:
   *   SELECT * FROM urunler WHERE ad LIKE ?;
   */
  public async ismeGoreAra(kelime: string): Promise<Urun[]> {
    const tumUrunler = await this.veriOku();
    return tumUrunler.filter((u) =>
      u.ad.toLowerCase().includes(kelime.toLowerCase()),
    );
  }

  /**
   * Fiyat aralığında ürün ara
   *
   * Gerçek uygulamada:
   *   SELECT * FROM urunler WHERE fiyat BETWEEN ? AND ?;
   */
  public async fiyatAraligi(min: number, max: number): Promise<Urun[]> {
    const tumUrunler = await this.veriOku();
    return tumUrunler.filter((u) => min <= u.fiyat && u.fiyat <= max);
  }

  // ─── EKLEME ─────────────────────────────────────

  /**
   * Yeni ürün ekle
   *
   * Gerçek uygulamada:
   *   INSERT INTO urunler (ad, fiyat, stok, kategori, ebat)
   *   VALUES (?, ?, ?, ?, ?);
   *   COMMIT;
   */
  public async urunEkle(yeniUrunVerisi: any): Promise<Urun> {
    const tumUrunler = await this.veriOku();

    // Zorunlu alanlar kontrol et
    const zorunluAlanlar = ["ad", "fiyat", "stok", "kategori"];
    const eksikAlanlar = zorunluAlanlar.filter((alan) => !yeniUrunVerisi[alan]);
    if (eksikAlanlar.length > 0) {
      throw new Error(`Eksik alanlar: ${eksikAlanlar.join(", ")}`);
    }

    // Aynı ürün zaten varsa hata
    const ayniUrunVarMi = tumUrunler.some(
      (u) =>
        u.ad.toLowerCase() === yeniUrunVerisi.ad.toLowerCase() &&
        u.kategori.toLowerCase() === yeniUrunVerisi.kategori.toLowerCase(),
    );
    if (ayniUrunVarMi) {
      throw new Error(`"${yeniUrunVerisi.ad}" zaten kayıtlı!`);
    }

    // Yeni ID oluştur
    const yeniId =
      tumUrunler.length > 0 ? Math.max(...tumUrunler.map((u) => u.id)) + 1 : 1;

    const eklenecekUrun: Urun = {
      id: yeniId,
      ad: String(yeniUrunVerisi.ad),
      fiyat: Number(yeniUrunVerisi.fiyat),
      stok: Number(yeniUrunVerisi.stok || 0),
      kategori: String(yeniUrunVerisi.kategori),
      ...(yeniUrunVerisi.ebat && { ebat: String(yeniUrunVerisi.ebat) }),
    };

    // Listeye ekle ve dosyaya yaz
    tumUrunler.push(eklenecekUrun);
    await this.veriYaz(tumUrunler);

    return eklenecekUrun;
  }

  // ─── GÜNCELLEME ─────────────────────────────────

  /**
   * Tam güncelleme (PUT)
   * Tüm alanları veritabanında yeni değerlerle değiştir
   */
  public async urunGuncelleTam(
    id: number,
    yeniVeri: Omit<Urun, "id">,
  ): Promise<Urun> {
    const tumUrunler = await this.veriOku();
    const index = tumUrunler.findIndex((u) => u.id === id);

    if (index === -1) throw new Error("Güncellenecek ürün bulunamadı!");

    tumUrunler[index] = { id, ...yeniVeri };
    await this.veriYaz(tumUrunler);
    return tumUrunler[index];
  }

  /**
   * Kısmi güncelleme (PATCH)
   * Sadece gönderilen alanları güncelle, diğerlerini koru
   */
  public async urunGuncelleKismi(
    id: number,
    guncellenecekAlanlar: Partial<Urun>,
  ): Promise<Urun> {
    const tumUrunler = await this.veriOku();
    const index = tumUrunler.findIndex((u) => u.id === id);

    if (index === -1) throw new Error("Ürün bulunamadı!");

    // Mevcut ürün + yeni alanlar
    const yeniHali = Object.assign({}, tumUrunler[index], guncellenecekAlanlar);
    tumUrunler[index] = yeniHali;

    await this.veriYaz(tumUrunler);
    return tumUrunler[index];
  }

  // ─── SİLME ──────────────────────────────────────

  /**
   * Ürün sil
   *
   * Gerçek uygulamada:
   *   DELETE FROM urunler WHERE id = ?;
   *   COMMIT;
   */
  public async urunSil(urunId: number): Promise<void> {
    const tumUrunler = await this.veriOku();

    // Ürün var mı?
    const urunVarMi = tumUrunler.some((u) => u.id === urunId);
    if (!urunVarMi) {
      throw new Error(`"${urunId}" id'li ürün bulunamadı`);
    }

    // Sil
    const yeniListe = tumUrunler.filter((u) => u.id !== urunId);
    await this.veriYaz(yeniListe);
  }
}
```

#### **SiparisService.ts** (Kritik İş Mantığı)

```typescript
export class SiparisService {
  private siparisYolu = path.join(__dirname, "..", "data", "siparisler.json");
  private urunYolu = path.join(__dirname, "..", "data", "urunler.json");

  /**
   * Sipariş oluştur
   *
   * 1. Ürünü kontrol et
   * 2. Stok yeterli mi kontrol et
   * 3. Stoktan düş
   * 4. Sipariş kaydını oluştur
   * 5. Dosyalara yaz
   */
  public async siparisEkle(siparisVerisi: any, kullaniciBilgisi: any) {
    const urunler = this.verileriOku(this.urunYolu);
    const siparisler = this.verileriOku(this.siparisYolu);

    // 1. Ürünü bulunca index'ini al
    const urunIndex = urunler.findIndex(
      (u) => u.id === Number(siparisVerisi.urunId),
    );
    if (urunIndex === -1) {
      throw new Error(
        `ID: ${siparisVerisi.urunId} olan ürün stokta bulunamadı!`,
      );
    }

    const stoktakiUrun = urunler[urunIndex];

    // 2. Stok yeterliliğini kontrol et
    if (stoktakiUrun.stok < siparisVerisi.adet) {
      throw new Error(
        `Yetersiz stok! ${stoktakiUrun.ad} için mevcut stok: ${stoktakiUrun.stok}`,
      );
    }

    // 3. ‼️ KRİTİK: Stoktan düş
    urunler[urunIndex].stok -= siparisVerisi.adet;

    // 4. Sipariş nesnesini oluştur
    const yeniSiparis = {
      id:
        siparisler.length > 0
          ? Math.max(...siparisler.map((s: any) => s.id)) + 1
          : 1,
      urunId: stoktakiUrun.id,
      urunAd: stoktakiUrun.ad, // Hızlı erişim için
      adet: Number(siparisVerisi.adet),
      birimFiyat: stoktakiUrun.fiyat, // O zamanki fiyat
      toplamTutar: siparisVerisi.adet * stoktakiUrun.fiyat,
      olusturan: kullaniciBilgisi.kullanici, // Kim sipariş açtı?
      tarih: new Date().toLocaleString("tr-TR"), // Türkçe tarih
    };

    // 5. Listeye ekle ve dosyalara yaz
    siparisler.push(yeniSiparis);
    this.verileriKaydet(this.siparisYolu, siparisler);
    this.verileriKaydet(this.urunYolu, urunler); // ‼️ Stok güncellemesi!

    return yeniSiparis;
  }

  /**
   * Sipariş sil
   *
   * Sipariş silinirse stoğu iade et
   */
  public async siparisSil(siparisId: number) {
    const siparisler = this.verileriOku(this.siparisYolu);
    const urunler = this.verileriOku(this.urunYolu);

    // Siparişi bulunca index'ini al
    const siparisIndex = siparisler.findIndex((s) => s.id === siparisId);
    if (siparisIndex === -1) {
      throw new Error(`ID: ${siparisId} olan sipariş bulunamadı!`);
    }

    const silinecekSiparis = siparisler[siparisIndex];

    // ‼️ KRİTİK: Stoku geri ver
    const urunIndex = urunler.findIndex(
      (u) => u.ad === silinecekSiparis.urunAd,
    );
    if (urunIndex !== -1) {
      urunler[urunIndex].stok += silinecekSiparis.adet;
    }

    // Siparişi sil
    siparisler.splice(siparisIndex, 1);

    // Dosyalara yaz
    this.verileriKaydet(this.siparisYolu, siparisler);
    this.verileriKaydet(this.urunYolu, urunler);

    return { mesaj: "Sipariş silindi ve stok iade edildi." };
  }
}
```

#### **KullaniciService.ts**

```typescript
export class KullaniciService {
  private dosyaYolu = path.join(__dirname, "..", "data", "kullanicilar.json");
  private readonly GECERLI_ROLLER = ["admin", "editor", "stajyer"];

  /**
   * Kullanıcı ekle
   *
   * Not: Sisteme eklense bile, GIRIŞ yapabilmesi için
   * .env dosyasına kullanıcı adı/şifre tanımlanmalı
   */
  public async kullaniciEkle(yeniKullanici: any) {
    // Rol kontrolü
    if (!this.GECERLI_ROLLER.includes(yeniKullanici.rol)) {
      throw new Error(
        `Geçersiz rol! Geçerli roller: ${this.GECERLI_ROLLER.join(", ")}`,
      );
    }

    const kullanicilar = this.verileriOku();
    const maxId =
      kullanicilar.length > 0 ? Math.max(...kullanicilar.map((u) => u.id)) : 0;

    const eklenecek = {
      ...yeniKullanici,
      id: maxId + 1,
    };

    kullanicilar.push(eklenecek);
    this.verileriKaydet(kullanicilar);
    return eklenecek;
  }

  /**
   * Kullanıcı sil
   */
  public async kullaniciSil(id: number) {
    const kullanicilar = this.verileriOku();
    const yeniListe = kullanicilar.filter((u) => u.id !== id);

    if (kullanicilar.length === yeniListe.length) {
      throw new Error("Kullanıcı bulunamadı!");
    }

    this.verileriKaydet(yeniListe);
    return true;
  }
}
```

### 3.9. Veri Dosyaları (data/\*.json)

#### **urunler.json örneği**

```json
[
  {
    "id": 1,
    "ad": "Raspberry Pi 5 - 8GB",
    "fiyat": 2500,
    "stok": 25,
    "kategori": "Mikrodenetleyici",
    "ebat": "85mm x 56mm"
  },
  {
    "id": 2,
    "ad": "Arduino Mega",
    "fiyat": 800,
    "stok": 50,
    "kategori": "Mikrodenetleyici"
  }
]
```

#### **siparisler.json örneği**

```json
[
  {
    "id": 1,
    "urunId": 1,
    "urunAd": "Raspberry Pi 5 - 8GB",
    "adet": 5,
    "birimFiyat": 2500,
    "toplamTutar": 12500,
    "olusturan": "Emre Kullanıcı",
    "tarih": "25.02.2026 14:30:45"
  }
]
```

#### **kullanicilar.json örneği**

```json
[
  {
    "id": 1,
    "ad": "Emre Kullanıcı",
    "rol": "admin",
    "no": "12345",
    "email": "emre@example.com",
    "aciklama": "Sistem Yöneticisi"
  },
  {
    "id": 2,
    "ad": "Mehmet Editör",
    "rol": "editor",
    "no": "12346",
    "email": "mehmet@example.com"
  }
]
```

---

## 4. VERİ AKIŞI: UÇTAN UÇA ÖRNEKLER

### 4.1. Login Akışı

```
┌─────────────────────────────────────────────────────────────────┐
│  1. FRONTEND: LoginPage.tsx                                     │
├─────────────────────────────────────────────────────────────────┤
│  Kullanıcı giriş formunu doldurur:                              │
│  - Kullanıcı Adı: emre                                          │
│  - Şifre: 123                                                   │
│                                                                  │
│  handleSubmit() çağrılır → api.post('/auther/login', ...)      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. FRONTEND: api.ts (axios)                                    │
├─────────────────────────────────────────────────────────────────┤
│  - baseURL: http://localhost:3000                               │
│  - POST /auther/login                                           │
│  - Body: { userName: "emre", pass: "123" }                      │
│  - Header: (henüz token yok)                                    │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP POST (ağ isteği)
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. BACKEND: AuthRoutes.ts                                      │
├─────────────────────────────────────────────────────────────────┤
│  router.post('/login', async (req, res) => {                   │
│    const { userName, pass } = req.body;                        │
│    const token = await authService.login(userName, pass);      │
│  })                                                             │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. BACKEND: AuthService.ts                                     │
├─────────────────────────────────────────────────────────────────┤
│  loginOrta):                                           │
│  1. .env'de ADMIN_USER, ADMIN_PASS bulma              │
│     ADMIN_USER=emre → match!                          │
│     ADMIN_PASS=123 → match!                           │
│  2. Rol belirle: "admin"                              │
│  3. JWT payload oluştur:                              │
│     {                                                  │
│       id: null,                                        │
│       kullanici: "Emre Kullanıcı",                    │
│       rol: "admin",                                    │
│       ogrenciNo: "12345"                              │
│     }                                                  │
│  4. jwt.sign() ile encode et                          │
│     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. BACKEND: HTTP Yanıt                                         │
├─────────────────────────────────────────────────────────────────┤
│  Status: 200 OK                                                 │
│  Body: {                                                        │
│    success: true,                                               │
│    message: "Biletiniz hazır!",                                │
│    token: "eyJhbGciOiJIUzI1..."                                │
│  }                                                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP Yanıt (ağ)
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. FRONTEND: LoginPage.tsx (yanıt işle)                        │
├─────────────────────────────────────────────────────────────────┤
│  if (res.data.token) {                                          │
│    login(res.data.token);  ← AuthContext.login() çağrısı       │
│    navigate('/');          ← Dashboard'a yönlendir              │
│  }                                                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. FRONTEND: AuthContext.tsx (login metodu)                    │
├─────────────────────────────────────────────────────────────────┤
│  const login = (newToken: string) => {                          │
│    localStorage.setItem('token', newToken);  ← Tarayıcıda kaydet│
│    setToken(newToken);                      ← State güncellemeleri
│    setUser(parseToken(newToken));           ← Payload çıkart    │
│  }                                                              │
│                                                                  │
│  parseToken() çalışır:                                          │
│  1. Token split: header.payload.signature                       │
│  2. payload base64url decode (UTF-8 bile!)                      │
│  3. JSON.parse()                                                │
│  4. user object = { kullanici: "Emre Kullanıcı", rol: "admin" }│
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. FRONTEND: UI Güncellemesi                                   │
├─────────────────────────────────────────────────────────────────┤
│  - Sidebar görünür olur (menü)                                  │
│  - DashboardPage yüklenir                                       │
│  - useAuth() → user bilgisi mevcut                              │
│  - localStorage'dan alınan token, API isteklerine otomatik      │
│    eklenir (interceptor)                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2. Sipariş Oluşturma Akışı

```
┌─────────────────────────────────────────────────────────────────┐
│  1. FRONTEND: SiparislerPage.tsx                                │
├─────────────────────────────────────────────────────────────────┤
│  Kullanıcı form doldurur:                                       │
│  - Ürün: Raspberry Pi 5 (ID: 1)                                │
│  - Adet: 5                                                      │
│                                                                  │
│  "Sipariş Oluştur" = handleSave() çağrılır                     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. FRONTEND: api.ts (axios)                                    │
├─────────────────────────────────────────────────────────────────┤
│  api.post('/siparisler', {                                      │
│    urunId: 1,                                                   │
│    adet: 5                                                       │
│  })                                                             │
│                                                                  │
│  Request Interceptor ÇALIŞIR:                                   │
│  - localStorage.getItem('token')                                │
│    → "eyJhbGciOiJIUzI1..."                                      │
│  - Header ekle: Authorization: Bearer eyJhbGciOiJIUzI1...      │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP POST
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. BACKEND: SiparisRoutes.ts                                   │
├─────────────────────────────────────────────────────────────────┤
│  router.post('/', siparisController.olustur)                   │
│                                                                  │
│  Middleware'ler:                                                │
│  - guvenlikGorevlisi ÇALIŞIR                                    │
│    • Header: Authorization: Bearer eyJhbGciOiJIUzI1...   │
│    • Token çıkart ve doğrula                                    │
│    • AuthService.biletKontrolEt(token)                         │
│    • JWT valid? → (req as any).kullanici = payload             │
│  - rolKontrol gerekli değil (tüm roller sipariş yapabilir)     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. BACKEND: SiparisController.ts                               │
├─────────────────────────────────────────────────────────────────┤
│  olustur = async (req: Request, res: Response) => {            │
│    const biletBilgisi = (req as any).kullanici;               │
│    // biletBilgisi = { id: null, kullanici: "Emre", rol: "admin" }
│                                                                  │
│    const sonuc = await this.siparisService.siparisEkle(        │
│      req.body, // { urunId: 1, adet: 5 }                       │
│      biletBilgisi // { kullanici: "Emre", rol: "admin" }       │
│    );                                                           │
│  }                                                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. BACKEND: SiparisService.siparisEkle()                       │
├─────────────────────────────────────────────────────────────────┤
│  public async siparisEkle(siparisVerisi, kullaniciBilgisi) {   │
│                                                                  │
│    // 1. urunler.json oku                                       │
│    const urunler = verileriOku(urunYolu);                      │
│    // [{ id: 1, ad: "Raspberry Pi", stok: 25, fiyat: 2500 }] │
│                                                                  │
│    // 2. Ürünü bul                                              │
│    const urunIndex = urunler.findIndex(u => u.id === 1);      │
│    // urunIndex = 0                                             │
│                                                                  │
│    const stoktakiUrun = urunler[0];                            │
│    // { id: 1, stok: 25, fiyat: 2500 }                        │
│                                                                  │
│    // 3. Stok kontrolü                                          │
│    if (25 < 5) → FALSE (yeterli stok var)                     │
│                                                                  │
│    // 4. ‼️ KRİTİK: Stoktan düş                                │
│    urunler[0].stok = 25 - 5 = 20;                             │
│                                                                  │
│    // 5. Sipariş objesi oluştur                                 │
│    const yeniSiparis = {                                        │
│      id: 1,                                                     │
│      urunId: 1,                                                 │
│      urunAd: "Raspberry Pi 5 - 8GB",                           │
│      adet: 5,                                                   │
│      birimFiyat: 2500,                                          │
│      toplamTutar: 5 * 2500 = 12500,                           │
│      olusturan: "Emre Kullanıcı",                              │
│      tarih: "25.02.2026 14:35:20"                              │
│    };                                                           │
│                                                                  │
│    // 6. Listeye ekle                                           │
│    siparisler.push(yeniSiparis);                               │
│                                                                  │
│    // 7. ‼️ DOSYALARA YAZ                                      │
│    verileriKaydet(siparisYolu, siparisler);  // siparisler.json│
│    verileriKaydet(urunYolu, urunler);        // urunler.json   │
│                                                                  │
│    return yeniSiparis;                                          │
│  }                                                              │
│                                                                  │
│  SONUÇ: urunler.json'da Raspberry Pi stoku 25 → 20'ye düştü!  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. BACKEND: SiparisController HTTP Yanıt                       │
├─────────────────────────────────────────────────────────────────┤
│  Status: 201 Created                                            │
│  Body: {                                                        │
│    mesaj: "Sipariş alındı, stok güncellendi.",                │
│    data: {                                                      │
│      id: 1,                                                     │
│      urunId: 1,                                                 │
│      urunAd: "Raspberry Pi 5 - 8GB",                           │
│      adet: 5,                                                   │
│      birimFiyat: 2500,                                          │
│      toplamTutar: 12500,                                        │
│      olusturan: "Emre Kullanıcı",                              │
│      tarih: "25.02.2026 14:35:20"                              │
│    }                                                            │
│  }                                                              │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP Yanıt
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. FRONTEND: SiparislerPage (yanıt işle)                       │
├─────────────────────────────────────────────────────────────────┤
│  catch bloku başarılı, yapılır:                                 │
│  - Modal kapat                                                  │
│  - Form temizle                                                │
│  - fetchData() → API'den yeni listeyi al                       │
│    • GET /siparisler → Backend sipariş listesini döner         │
│    • GET /urunler → Backend ürün listesini döner (stok:20)    │
│  - setSiparisler() ile UI güncelle                             │
│  - Tablo yenilenir                                              │
│  - Ürün stok dişarıya gösterilir (20)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Teknoloji Seçimleri ve Neden?

### Frontend

| Teknoloji            | Neden?                                                  |
| -------------------- | ------------------------------------------------------- |
| **React 19**         | Component-tabanlı UI, state yönetimi kolay              |
| **TypeScript**       | Tür güvenliği, IDE otomatik tamamlama, hata erken bulma |
| **Vite**             | Çok hızlı hot module reloading, small bundle size       |
| **axios**            | Fetch API'den daha basit, interceptor desteği           |
| **react-router-dom** | Sayfalar arası geçiş, URL yönetimi                      |
| **lucide-react**     | Modern, hafif ikonlar                                   |

### Backend

| Teknoloji              | Neden?                                         |
| ---------------------- | ---------------------------------------------- |
| **Node.js + Express**  | JavaScript ecosystem, hızlı prototipleme       |
| **TypeScript**         | Frontend ile aynı dil ailesinde, tip güvenliği |
| **jsonwebtoken (JWT)** | Stateless kimlik doğrulama, scalable           |
| **JSON dosyaları**     | Hızlı geliştirme, DB setup yok (prototip)      |
| **.env dosyası**       | Test verileri güvenli (source control'da yok)  |
| **Middleware pattern** | Kimlik doğrulama, yetki kontrolü düzenli       |

---

## 6. Önemli Konseptler ve Desenler

### 6.1. Middleware Pattern

```
HTTP İstek
    ↓
guvenlikGorevlisi (Token doğrulama)
    ↓
    ├─ Geçerli mi? → (req as any).kullanici = payload
    │
    ↓
rolKontrol (Yetki kontrolü)
    ↓
    ├─ İzin var mı?
    │
    ↓
Controller (İş yapma)
    ↓
Response (Yanıt)
```

### 6.2. State Management (Frontend)

```
localStorage (Persistent)
    ↑
    ├─ Token
    │
    ↓
AuthContext (React Context API)
    └─ user (parsed JWT)
       ├─ login()
       ├─ logout()
       └─ useAuth() hook
           ↓
       Uygulamadaki herhangi bir bileşen
```

### 6.3. Veri Flow

```
Frontend (React) ↔ HTTP (axios) ↔ Backend (Express) ↔ JSON Files
```

### 6.4. Rol Tabanlı Erişim Kontrol (RBAC)

```
JWT Payload
├─ rol: "admin"
│  └─ /kullanicilar, /urunler (DELETE)
├─ rol: "editor"
│  └─ /urunler (POST/PUT), /siparisler
└─ rol: "stajyer"
   └─ /urunler (GET), /siparisler (GET)
```

---

## 7. Sık Sorulan Sorular

### S: Neden localStorage token'ı karmaşık bir şekilde decode ediyoruz?

**C:** JWT payload UTF-8'i içerebilir (Türkçe karakterler). `atob()` binary string döner. Binary'yi doğru UTF-8'e çevirmek lazım, yoksa mojibake (bozuk yazı) ortaya çıkar.

### S: Sipariş oluştururken neden her seferinde tüm ürün listesini okuyor?

**C:** JSON dosyası kullanıldığı için. Database konkurrenci (eş zamanlı erişim) yönetiyor, ama JSON dosyası lock mekanizması yok. Üretimde DB kullanılmalı.

### S: Admin bir ürünü sildiyse, onu referans alan siparişler ne oluyor?

**C:** Sistemde validasyon yok — siparişler brokenreference alır. Üretimde `foreign key` ile çözülür.

### S: Token ne zaman geçerliliğini yitiriyor?

**C:** `jwt.sign(..., { expiresIn: '1h' })` — 1 saat. Sonra response interceptor 401 dönüp logout yapar.

### S: .env dosyası versiyonlandırılmıyor (güvenlik), o halde test hesaplarını nasıl biliyoruz?

**C:** Ekip üyeleri memo alan. Üretimde `.env.example` veya dokümantasyon tutulur.

---

## 8. Kaynaklar

- **React Router v7**: https://reactrouter.com
- **Express.js**: https://expressjs.com
- **JWT.io**: https://jwt.io
- **Vite**: https://vitejs.dev
- **Axios**: https://axios-http.com

---

**Son güncelleme**: 25 Şubat 2026
