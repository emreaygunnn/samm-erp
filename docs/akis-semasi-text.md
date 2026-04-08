# SAMM ERP — Uygulama Akış Şeması (Metin Anlatım)

---

## BAŞLANGIÇ — Uygulama Açılışı

Kullanıcı tarayıcıda uygulamayı açar.

`main.tsx` dosyası çalışır → `ReactDOM.createRoot()` ile React uygulaması başlatılır.

Sırasıyla şu sarmalayıcılar yüklenir:
  - `BrowserRouter` → URL yönetimi için
  - `AuthProvider` → Kullanıcı oturum bilgisini tüm uygulamaya dağıtmak için

`AuthProvider` ilk yüklendiğinde:
  - `sessionStorage.getItem("token")` ile tarayıcı hafızasından token okunur
  - Token varsa `parseToken()` ile decode edilip `user` state'ine yazılır
  - Token yoksa `token = null`, `user = null` olarak kalır

Ardından `App.tsx` render edilir.

---

## KARAR NOKTASI — Token Kontrolü

`App.tsx` içinde `useAuth()` hook'u çağrılır ve `token` değeri kontrol edilir.

**İki yol var:**

- Token YOK → Login sayfasına yönlendir
- Token VAR → Ana sayfayı (layout) göster

---

## YOL 1: TOKEN YOK → LOGIN SAYFASI

### Sayfa Açılışı

`/login` route'u eşleşir → `LoginPage.tsx` render edilir.

LoginPage şu state'leri oluşturur:
  - `email` → kullanıcının girdiği e-posta
  - `password` → kullanıcının girdiği şifre
  - `error` → hata mesajı (başlangıçta boş)
  - `loading` → buton kilitli mi? (başlangıçta false)

### Kullanıcı Formu Doldurur

Kullanıcı e-posta alanına yazar → `setEmail()` tetiklenir, state güncellenir.
Kullanıcı şifre alanına yazar → `setPassword()` tetiklenir, state güncellenir.

### "Giriş Yap" Butonuna Basılır

Form'un `onSubmit` eventi tetiklenir → `handleSubmit(e)` fonksiyonu çalışır.

`handleSubmit` şunları yapar:
  1. `e.preventDefault()` → sayfanın yenilenmesini engeller
  2. `setError("")` → önceki hata mesajını temizler
  3. `setLoading(true)` → butonu kilitler, "Giriş yapılıyor..." yazısı gösterilir

### API İsteği Gönderilir

`api.post('/auther/login', { email, password })` çağrılır.

Bu `api` nesnesi `api.ts` dosyasındaki Axios instance'ıdır.
Base URL: `http://localhost:3000`

**Axios Request Interceptor devreye girer:**
  - `sessionStorage.getItem("token")` ile token kontrol edilir
  - İlk login olduğu için token yoktur, Authorization header eklenmez

Sonuç olarak şu HTTP isteği gönderilir:
  - Method: POST
  - URL: `http://localhost:3000/auther/login`
  - Body: `{ "email": "emre@example.com", "password": "1234" }`

---

### Backend — İstek Karşılanır

**index.ts (Express Server):**
  - `app.use("/auther", authRoutes)` satırı sayesinde `/auther` ile başlayan istekler `AuthRoutes.ts`'e yönlendirilir.

**AuthRoutes.ts:**
  - `router.post("/login", ...)` satırı eşleşir
  - `authController.login(req, res)` çağrılır

**AuthController.ts — login() fonksiyonu:**
  1. `req.body`'den `{ email, password }` çıkarılır
  2. Validasyon yapılır: email veya password boşsa → `res.status(400).json({ message: "eksik alan" })` döner ve işlem biter
  3. Boş değilse → `authService.login(email, password)` çağrılır

**AuthService.ts — login() fonksiyonu:**
  1. `EnvGetUsers()` fonksiyonu çağrılır
  2. `EnvGetUsers()` → `.env` dosyasından `USER1_EMAIL`, `USER1_PASSWORD`, `USER1_NAME`, `USER1_ID` gibi değişkenleri okur
  3. Tüm kullanıcıları bir diziye toplar
  4. `users.find(k => k.email === email && k.password === password)` ile eşleşen kullanıcı aranır

**İki sonuç var:**

#### Kullanıcı BULUNAMADI:
  - `login()` → `null` döner
  - `AuthController` → `res.status(401).json({ message: "yanlış email veya şifre" })` döner
  - Frontend'de `catch` bloğu çalışır
  - `setError("email veya şifre hatalı")` → hata mesajı gösterilir
  - `setLoading(false)` → buton açılır
  - Kullanıcı tekrar deneyebilir → LoginPage'de kalır

#### Kullanıcı BULUNDU:
  - `generateToken(user)` çağrılır
  - Payload oluşturulur: `{ id: user.id, user: user.name }`
  - `jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })` ile 1 saatlik token üretilir
  - `AuthController` → `res.json({ success: true, message: "login başarılı", token: "ey..." })` döner

---

### Frontend — Token Kaydedilir

`LoginPage`'de `res.data.token` alınır.

`login(res.data.token)` çağrılır → Bu fonksiyon `AuthContext.tsx`'ten gelir.

**AuthContext — login() fonksiyonu şunları yapar:**
  1. `sessionStorage.setItem("token", newToken)` → Token tarayıcı hafızasına yazılır
  2. `setToken(newToken)` → React state güncellenir
  3. `parseToken(newToken)` çağrılır:
     - Token üç parçaya ayrılır: `"header.payload.signature".split(".")`
     - Ortadaki payload kısmı alınır (index 1)
     - `base64UrlDecodetoUtf8()` ile decode edilir
     - `JSON.parse()` ile JavaScript objesine çevrilir → `{ id: "1", user: "admin" }`
  4. `setUser({ id: "1", user: "admin" })` → Kullanıcı bilgisi state'e yazılır

Ardından `LoginPage`'de `navigate("/")` çağrılır → App.tsx yeniden render edilir.

Token artık var olduğu için → karar noktasında "Token VAR" yoluna gidilir.

---

## YOL 2: TOKEN VAR → ANA SAYFA

### Layout Render Edilir

`App.tsx` token olduğunu görünce authenticated layout'u render eder:

**Header bölümü:**
  - "SAMM ERP" başlığı
  - "Yönetim Paneli" alt başlığı
  - Kullanıcı adının ilk harfi (avatar) + kullanıcı adı (`user.user`)
  - "Çıkış Yap" butonu

**Çıkış Yap butonuna basılırsa:**
  - `logout()` fonksiyonu çağrılır (AuthContext'ten)
  - `sessionStorage.removeItem("token")` → token tarayıcıdan silinir
  - `setToken(null)` → token state null olur
  - `setUser(null)` → user state null olur
  - App.tsx yeniden render → token yok → LoginPage'e yönlendirilir

**Route eşleşmesi:**
  - `/urun-guncelle` → `UpdateProductPage.tsx` render edilir
  - Diğer tüm URL'ler → `/urun-guncelle`'ye yönlendirilir

---

## TOPLU ÜRÜN GÜNCELLEME AKIŞI

`UpdateProductPage.tsx` render edilir. Şu state'ler oluşturulur:
  - `operation` → seçili işlem türü (null)
  - `envId` → ortam ID'si ("")
  - `items` → ürün listesi ([])
  - `rawText` → textarea'daki ham metin ("")
  - `results` → güncelleme sonuçları ([])
  - `loading` → işlem devam ediyor mu? (false)

---

### ADIM 1 — İşlem Türü Seçimi (OperationSelectorComponent)

Kullanıcı "İşlem Türü" dropdown'una tıklar.

`OperationSelectorComponent` içinde:
  - `setOpen(true)` → dropdown açılır
  - İki seçenek gösterilir: "Stok Güncelle" (stock) ve "Lokasyon Güncelle" (location)

Kullanıcı "Stok Güncelle" seçeneğine tıklar:
  - `handleSelect("stock")` çağrılır
  - `onChange("stock")` → parent component'a (UpdateProductPage) bildirilir
  - `setOpen(false)` → dropdown kapanır

`UpdateProductPage`'de:
  - `handleOperationChange("stock")` çağrılır
  - `setOperation("stock")` → işlem türü kaydedilir
  - `setItems(prev => prev.map(item => ({ ...item, value: "" })))` → varsa önceki değerler sıfırlanır

---

### ADIM 2 — Ürün ID'leri Girişi (ItemIdInputComponent)

Kullanıcının iki yolu var: Manuel giriş veya Excel yükleme.

#### Manuel Giriş:

Kullanıcı textarea'ya şunu yazar:
```
PRD-001
PRD-002
PRD-003
```

Her tuş vuruşunda `handleTextChange(v)` çalışır:
  1. `onRawTextChange(v)` → ham metin parent'a gönderilir
  2. `parseIds(v)` çağrılır → metin virgül veya yeni satırla bölünür → `["PRD-001", "PRD-002", "PRD-003"]`
  3. Her ID için mevcut items'da eşleşme aranır, yoksa `{ id, value: "" }` oluşturulur
  4. `dedupeItems()` → aynı ID'den birden fazla varsa tekrarlar silinir
  5. `onItemsChange([{ id: "PRD-001", value: "" }, { id: "PRD-002", value: "" }, ...])` → parent'a bildirilir

#### Excel Yükleme:

Kullanıcı "Excel Yükle" butonuna basar → gizli file input tetiklenir → dosya seçilir.

`handleExcel(e)` çalışır:
  1. `file.arrayBuffer()` ile dosya binary olarak okunur
  2. `XLSX.read(buffer)` ile Excel dosyası parse edilir
  3. İlk sayfa alınır → `sheet_to_json(ws, { header: 1 })` ile satır dizisine çevrilir
  4. A sütunu → ID, B sütunu → Değer olarak okunur
  5. Mevcut items ile birleştirilir → `dedupeItems([...items, ...bulunan])`
  6. `onItemsChange(combined)` → parent'a bildirilir
  7. `onRawTextChange(...)` → textarea da güncellenir

**Sonuç:** Ekranda chip'ler görünür: `PRD-001`, `PRD-002`, `PRD-003`
Her chip'in yanında X butonu var → `removeItem(id)` ile tek tek silinebilir.
Alt kısımda "3 ID girildi" yazısı gösterilir.

---

### ADIM 3 — Yeni Değer Girişi (NewValueInputCompanent)

Bu component sadece `operation !== null` VE `items.length > 0` ise render edilir.

İşlem türüne göre konfigürasyon belirlenir:
  - `stock` → label: "Stok", type: "number", placeholder: "Yeni stok adedi girin"
  - `location` → label: "Lokasyon", type: "text", placeholder: "Yeni lokasyon girin"

Kullanıcının iki yolu var: Tek tek giriş veya toplu giriş.

#### Tek Tek Giriş:

Her ürün için bir satır gösterilir (tablo formatında):
  - Sol sütun: ID (PRD-001)
  - Sağ sütun: Input alanı

Kullanıcı her input'a ayrı değer girer → `handleItemValueChange(id, newValue)` çalışır:
  - `items.map(item => item.id === id ? { ...item, value: newValue } : item)`
  - `onItemsChange(updated)` → parent'a bildirilir

#### Toplu Giriş (Tümüne Uygula):

Kullanıcı üstteki bulk input'a "50" yazar → `setBulkValue("50")`
"Tümüne Uygula" butonuna basar → `handleHandleApply()` çalışır:
  - `items.map(item => ({ ...item, value: "50" }))` → tüm item'ların değeri "50" olur
  - `onItemsChange(updated)` → parent'a bildirilir

**Sonuç:** Tüm değerler girildi → `allValuesFilled = true`

---

### ADIM 4 — "Güncelle" Butonuna Basılır

Butonun aktif olması için `canSubmit` kontrolü yapılır:
  - `operation !== null` → ✅ ("stock" seçili)
  - `items.length > 0` → ✅ (3 ürün var)
  - `allValuesFilled` → ✅ (tüm değerler girildi)
  - `!loading` → ✅ (şu an işlem yok)

Kullanıcı "3 Ürün Güncelle" butonuna basar → `handleUpdate()` çalışır:
  1. `setResults([])` → önceki sonuçlar temizlenir
  2. `setLoading(true)` → buton kilitlenir, spinner gösterilir

### Payload Oluşturulur

```javascript
items.map(item => ({
    id: item.id,
    [operation]: item.value
}))
```

Sonuç:
```json
[
    { "id": "PRD-001", "stock": "50" },
    { "id": "PRD-002", "stock": "50" },
    { "id": "PRD-003", "stock": "50" }
]
```

### API İsteği Gönderilir

`api.patch('/products/bulk', payload)` çağrılır.

**Axios Request Interceptor devreye girer:**
  - `sessionStorage.getItem("token")` → token bulunur
  - `config.headers.Authorization = "Bearer ey..."` → header'a eklenir

Sonuç olarak şu HTTP isteği gönderilir:
  - Method: PATCH
  - URL: `http://localhost:3000/products/bulk`
  - Headers: `Authorization: Bearer ey...`
  - Body: `[{ "id": "PRD-001", "stock": "50" }, ...]`

---

### Backend — Middleware (Token Kontrolü)

**index.ts:**
  - `app.use("/products", productRoutes)` → `/products` ile başlayan istekler `ProducutRoutes.ts`'e yönlendirilir

**ProducutRoutes.ts:**
  - `router.use(securityMiddleware)` → TÜM product istekleri önce middleware'den geçer

**AuthMiddleware.ts — securityMiddleware() fonksiyonu:**
  1. `req.headers["authorization"]` okunur → `"Bearer ey..."`
  2. `"Bearer ey...".split(" ")[1]` → sadece token kısmı alınır → `"ey..."`
  3. `authService.CheckTicket(token)` çağrılır

**AuthService.ts — CheckTicket() fonksiyonu:**
  - `jwt.verify(token, JWT_SECRET)` ile token doğrulanır

**İki sonuç var:**

#### Token GEÇERSİZ veya süresi dolmuş:
  - `CheckTicket()` → `null` döner
  - Middleware → `res.status(401).send("Biletin sahte veya süresi dolmuş!")` döner
  - Frontend'de Axios Response Interceptor devreye girer:
    - Status 401 yakalanır
    - `sessionStorage.removeItem("token")` → token silinir
    - `window.location.href = "/login"` → login sayfasına yönlendirilir

#### Token GEÇERLİ:
  - `CheckTicket()` → `{ id: "1", user: "admin" }` döner
  - `req.user = verification` → kullanıcı bilgisi request'e eklenir
  - `next()` çağrılır → sonraki handler'a (controller'a) geçilir

---

### Backend — Controller

**ProducutRoutes.ts:**
  - `router.patch("/bulk", ...)` eşleşir
  - `productController.bulkUpdate(req, res)` çağrılır

**ProductController.ts — bulkUpdate() fonksiyonu:**
  1. `items = req.body` → gönderilen payload alınır
  2. Validasyon: `Array.isArray(items) && items.length > 0` kontrolü yapılır
     - Geçersizse → `res.status(400).json({ message: "Güncellenecek ürün bulunamadı" })` döner
  3. Geçerliyse → `productService.bulkUpdate(items)` çağrılır

---

### Backend — Service & Oracle DB

**ProductService.ts — bulkUpdate() fonksiyonu:**

Boş bir `results` dizisi oluşturulur.

Her item için `for...of` döngüsü başlar:

```
Döngü item: { id: "PRD-001", stock: "50" }
```

  1. `{ id, ...fields } = item` → id ayrılır ("PRD-001"), fields ayrılır ({ stock: "50" })
  2. `updateProduct(id, fields)` çağrılır

**ProductService.ts — updateProduct() fonksiyonu:**

  1. `ALLOWED_COLUMNS` ile frontend alan adları Oracle sütun adlarına eşleştirilir:
     - `"stock"` → `"STOCK"`
     - `"location"` → `"LOCATION"`
  2. İzin verilmeyen alanlar atlanır
  3. SQL SET kısmı oluşturulur: `STOCK = :stock`
  4. Bind parametreleri hazırlanır: `{ id: "PRD-001", stock: "50" }`
  5. Son SQL: `UPDATE PRODUCTS SET STOCK = :stock WHERE ID = :id`

  6. `getConnection()` çağrılır:
     - `oracledb.getConnection(oracleConfig)` → Oracle veritabanına bağlantı açılır
     - Bağlantı bilgileri `.env`'den okunur: `ORACLE_USER`, `ORACLE_PASSWORD`, `ORACLE_CONNECT_STRING`

  7. `connection.execute(sql, bind, { autoCommit: true })` → SQL çalıştırılır

  **İki sonuç var:**

  - `rowsAffected === 0` → Ürün Oracle'da bulunamadı
    - Error fırlatılır: `"PRD-001 kodlu ürün Oracle'da bulunamadı"`
    - `results.push({ id: "PRD-001", success: false, message: "..." })`

  - `rowsAffected > 0` → Güncelleme başarılı
    - `results.push({ id: "PRD-001", success: true, message: "PRD-001 başarıyla güncellendi" })`

  8. `connection.close()` → Oracle bağlantısı kapatılır

Döngü sonraki item'a geçer (PRD-002, PRD-003...) ve aynı adımlar tekrarlanır.

Tüm item'lar işlendikten sonra `results[]` dizisi döner.

---

### Backend → Frontend — Yanıt Dönüşü

**ProductController:**
  - `res.json(results)` → sonuçlar JSON olarak frontend'e gönderilir

HTTP yanıtı:
```json
[
    { "id": "PRD-001", "success": true, "message": "PRD-001 başarıyla güncellendi" },
    { "id": "PRD-002", "success": true, "message": "PRD-002 başarıyla güncellendi" },
    { "id": "PRD-003", "success": false, "message": "PRD-003 kodlu ürün Oracle'da bulunamadı" }
]
```

**Axios Response Interceptor:**
  - Status 200 → response olduğu gibi geçer (müdahale etmez)

---

### Frontend — Sonuçların Gösterimi

**UpdateProductPage:**
  - `setResults(res.data)` → sonuçlar state'e yazılır
  - `setLoading(false)` → spinner durur, buton açılır

**ResultLogComponent render edilir:**
  - `results` ve `loading` prop olarak alınır
  - `basarili = results.filter(r => r.success).length` → 2
  - `hata = results.filter(r => !r.success).length` → 1

Ekranda gösterilir:
```
İşlem Sonuçları                    ✓ 2 başarılı  ✗ 1 hata

  ✅ PRD-001 — PRD-001 başarıyla güncellendi
  ✅ PRD-002 — PRD-002 başarıyla güncellendi
  ❌ PRD-003 — PRD-003 kodlu ürün Oracle'da bulunamadı
```

---

## İŞLEM TAMAMLANDI

Kullanıcı isterse:
  - Yeni bir işlem türü seçebilir (ADIM 1'e döner)
  - Yeni ID'ler girebilir (ADIM 2'ye döner)
  - "Çıkış Yap" butonuna basabilir (Login sayfasına döner)

---

## ÖZET — Fonksiyon Çağrı Zinciri

### Login Akışı:
```
LoginPage.handleSubmit()
  → api.post('/auther/login')
    → Axios Request Interceptor (token kontrolü)
      → Express Server (index.ts)
        → AuthRoutes (router.post('/login'))
          → AuthController.login(req, res)
            → AuthService.login(email, password)
              → EnvGetUsers() (.env'den okuma)
              → users.find() (eşleşme arama)
              → generateToken(user) (jwt.sign)
            ← token döner
          ← res.json({ token })
        ← HTTP 200
      ← Axios Response (başarılı)
    ← res.data.token
  → AuthContext.login(token)
    → sessionStorage.setItem("token")
    → setToken(token)
    → parseToken(token) → base64UrlDecodetoUtf8() → JSON.parse()
    → setUser({ id, user })
  → navigate("/")
  → App.tsx re-render → token var → Layout göster
```

### Toplu Güncelleme Akışı:
```
UpdateProductPage.handleUpdate()
  → payload = items.map(item => ({ id, [operation]: value }))
  → api.patch('/products/bulk', payload)
    → Axios Request Interceptor (Authorization header ekler)
      → Express Server (index.ts)
        → ProducutRoutes (router.use(securityMiddleware))
          → AuthMiddleware.securityMiddleware()
            → AuthService.CheckTicket(token)
              → jwt.verify(token, JWT_SECRET)
            ← payload veya null
          ← next() veya 401
        → ProductController.bulkUpdate(req, res)
          → ProductService.bulkUpdate(items)
            → for each item:
              → ProductService.updateProduct(id, fields)
                → ALLOWED_COLUMNS eşleştirme
                → SQL oluşturma
                → getConnection() (Oracle bağlantısı)
                → connection.execute(sql, bind)
                → connection.close()
              ← { id, success, message }
            ← results[]
          ← res.json(results)
        ← HTTP 200
      ← Axios Response (başarılı)
    ← res.data
  → setResults(res.data)
  → setLoading(false)
  → ResultLogComponent render → sonuçlar gösterilir
```
