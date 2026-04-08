# SAMM ERP — Uygulama Akış Şeması & Mimari Dokümanı

## 1. Genel Mimari Yapı - grafikler için uzantılardan Markdown Preview Mermaid Support indir

```mermaid
graph TB
    subgraph FRONTEND["🖥️ Frontend (React + Vite)"]
        MAIN["main.tsx"]
        AUTH_CTX["AuthContext.tsx"]
        APP["App.tsx"]
        LOGIN["LoginPage.tsx"]
        UPDATE["UpdateProductPage.tsx"]
        API["api.ts (Axios)"]

        subgraph COMPONENTS["Components"]
            OP_SEL["OperationSelectorComponent"]
            ITEM_ID["ItemIdInputComponent"]
            NEW_VAL["NewValueInputCompanent"]
            RESULT["ResultLogComponent"]
            SIDEBAR["SideBarComponent"]
        end
    end

    subgraph BACKEND["⚙️ Backend (Express + Node.js)"]
        INDEX["index.ts (Express App)"]

        subgraph ROUTES["Routes"]
            AUTH_R["AuthRoutes.ts"]
            PROD_R["ProducutRoutes.ts"]
        end

        subgraph MIDDLEWARE["Middleware"]
            AUTH_MW["AuthMiddleware.ts"]
        end

        subgraph CONTROLLERS["Controllers"]
            AUTH_C["AuthController.ts"]
            PROD_C["ProductController.ts"]
        end

        subgraph SERVICES["Services"]
            AUTH_S["AuthService.ts"]
            PROD_S["ProductService.ts"]
        end
    end

    subgraph DB["🗄️ Oracle Database"]
        PRODUCTS["PRODUCTS Tablosu"]
    end

    subgraph SHARED["📦 Shared Types"]
        TYPES["product.ts, authUser.ts"]
    end

    MAIN --> AUTH_CTX --> APP
    APP --> LOGIN
    APP --> UPDATE
    UPDATE --> OP_SEL & ITEM_ID & NEW_VAL & RESULT
    LOGIN & UPDATE --> API
    API --> INDEX
    INDEX --> AUTH_R & PROD_R
    AUTH_R --> AUTH_C --> AUTH_S
    PROD_R --> AUTH_MW --> PROD_C --> PROD_S
    PROD_S --> PRODUCTS
    SHARED -.-> FRONTEND & BACKEND
```

---

## 2. Uygulama Başlatma ve Routing Akışı

```mermaid
flowchart TD
    START(["🌐 Kullanıcı index.html'i açar"]) --> MAIN["main.tsx<br/>ReactDOM.createRoot()"]
    MAIN --> BROWSER_ROUTER["BrowserRouter sarmalayıcı"]
    BROWSER_ROUTER --> AUTH_PROVIDER["AuthProvider sarmalayıcı<br/>— token & user state oluşturur —"]
    AUTH_PROVIDER --> APP_RENDER["App.tsx render edilir"]

    APP_RENDER --> TOKEN_CHECK{"token var mı?<br/>(useAuth().token)"}

    TOKEN_CHECK -- "❌ token yok" --> NO_AUTH_ROUTES["Routes: Unauthenticated"]
    NO_AUTH_ROUTES --> LOGIN_ROUTE["/login → LoginPage"]
    NO_AUTH_ROUTES --> WILDCARD_1["/* → Navigate to /login"]

    TOKEN_CHECK -- "✅ token var" --> AUTH_ROUTES["Routes: Authenticated + Layout"]
    AUTH_ROUTES --> HEADER["Header: SAMM ERP + user bilgisi + Çıkış Yap butonu"]
    AUTH_ROUTES --> UPDATE_ROUTE["/urun-guncelle → UpdateProductPage"]
    AUTH_ROUTES --> WILDCARD_2["/* → Navigate to /urun-guncelle"]
```

---

## 3. Login Akışı — Adım Adım

Bu diyagram login butonuna basıldığında tüm fonksiyon çağrı zincirini gösterir:

```mermaid
sequenceDiagram
    actor User as 👤 Kullanıcı
    participant LP as LoginPage.tsx
    participant AUTH as AuthContext.tsx
    participant API as api.ts (Axios)
    participant INTC as Axios Interceptor
    participant SRV as Express Server
    participant AR as AuthRoutes.ts
    participant AC as AuthController.ts
    participant AS as AuthService.ts
    participant ENV as .env Dosyası

    Note over User,LP: 1. Kullanıcı formu doldurur
    User->>LP: email & password girer
    LP->>LP: useState ile email, password state güncellenir

    Note over User,LP: 2. "Giriş Yap" butonuna basar
    User->>LP: form onSubmit tetiklenir
    LP->>LP: handleSubmit(e) çağrılır
    LP->>LP: e.preventDefault() — sayfa yenilenmez
    LP->>LP: setError("") — önceki hata temizlenir
    LP->>LP: setLoading(true) — buton kilitlenir

    Note over LP,API: 3. Backend'e istek gönderilir
    LP->>API: api.post('/auther/login', {email, password})
    API->>INTC: Request Interceptor çalışır
    INTC->>INTC: sessionStorage'dan token kontrol
    Note over INTC: İlk login → token yok, header eklenmez
    INTC->>SRV: POST http://localhost:3000/auther/login

    Note over SRV,AR: 4. Backend istek alır
    SRV->>AR: /auther prefix ile eşleşir
    AR->>AC: router.post("/login") → authController.login(req,res)

    Note over AC,AS: 5. Controller → Service
    AC->>AC: req.body'den { email, password } çıkarılır
    AC->>AC: Validasyon: email ve password boş mu?

    alt Eksik alan varsa
        AC-->>SRV: 400 { success: false, message: "eksik alan" }
    end

    AC->>AS: authService.login(email, password)

    Note over AS,ENV: 6. Kullanıcı doğrulama
    AS->>AS: EnvGetUsers() çağrılır
    AS->>ENV: process.env'den USER1_EMAIL, USER1_PASSWORD vb. okunur
    ENV-->>AS: users[] dizisi döner
    AS->>AS: users.find(k => k.email === email && k.password === password)

    alt Kullanıcı bulunamazsa
        AS-->>AC: null döner
        AC-->>SRV: 401 { success: false, message: "yanlış email veya şifre" }
        SRV-->>API: HTTP 401
        API-->>LP: catch bloğu çalışır
        LP->>LP: setError("email veya şifre hatalı")
        LP->>LP: setLoading(false)
    end

    Note over AS: 7. Token üretimi
    AS->>AS: generateToken(user) çağrılır
    AS->>AS: payload = { id: user.id, user: user.name }
    AS->>AS: jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })
    AS-->>AC: token string döner

    Note over AC,LP: 8. Başarılı yanıt
    AC-->>SRV: 200 { success: true, message: "login başarılı", token }
    SRV-->>API: HTTP 200 + JSON body
    API-->>LP: res.data.token alınır

    Note over LP,AUTH: 9. Frontend token'ı kaydetir
    LP->>AUTH: login(res.data.token) çağrılır
    AUTH->>AUTH: sessionStorage.setItem("token", newToken)
    AUTH->>AUTH: setToken(newToken) — state güncellenir
    AUTH->>AUTH: parseToken(newToken) çağrılır
    AUTH->>AUTH: token.split(".")[1] → payload base64
    AUTH->>AUTH: base64UrlDecodetoUtf8(payload) → JSON string
    AUTH->>AUTH: JSON.parse() → { id, user }
    AUTH->>AUTH: setUser({ id, user }) — kullanıcı bilgisi state'e yazılır

    Note over LP: 10. Yönlendirme
    LP->>LP: navigate("/") çağrılır
    LP->>LP: App.tsx re-render → token var → Authenticated Routes
    LP->>LP: /* → Navigate to /urun-guncelle
```

---

## 4. AuthContext — State Yönetimi Detayı

```mermaid
stateDiagram-v2
    [*] --> Init: Uygulama açılır

    state Init {
        [*] --> CheckSession: sessionStorage.getItem("token")
        CheckSession --> TokenFound: token bulundu
        CheckSession --> NoToken: token yok

        TokenFound --> ParseToken: parseToken(token)
        ParseToken --> SetState: setToken(token), setUser(parsed)

        NoToken --> SetNull: setToken(null), setUser(null)
    }

    state LoggedOut {
        [*] --> LoginPage: /login render
    }

    state LoggedIn {
        [*] --> Dashboard: UpdateProductPage render
    }

    Init --> LoggedOut: token === null
    Init --> LoggedIn: token !== null

    LoggedOut --> LoggedIn: login(newToken) çağrılır
    LoggedIn --> LoggedOut: logout() çağrılır

    note right of LoggedIn
        logout():
        1. sessionStorage.removeItem("token")
        2. setToken(null)
        3. setUser(null)
    end note
```

---

## 5. Toplu Ürün Güncelleme — Tam Akış

Bu diyagram "Toplu Güncelleme" butonuna basıldığında neler olduğunu baştan sona gösterir:

```mermaid
sequenceDiagram
    actor User as 👤 Kullanıcı
    participant OP as OperationSelector
    participant ITEM as ItemIdInput
    participant NV as NewValueInput
    participant UPP as UpdateProductPage
    participant API as api.ts (Axios)
    participant INTC as Axios Interceptors
    participant SRV as Express Server
    participant MW as AuthMiddleware
    participant AS as AuthService
    participant PR as ProducutRoutes
    participant PC as ProductController
    participant PS as ProductService
    participant ODB as Oracle DB
    participant RL as ResultLog

    Note over User,OP: ADIM 1 — İşlem Türü Seçimi
    User->>OP: Dropdown'dan "Stok Güncelle" seçer
    OP->>OP: handleSelect("stock") çağrılır
    OP->>OP: setOpen(false) — dropdown kapanır
    OP->>UPP: onChange("stock") → parent'a bildirir
    UPP->>UPP: handleOperationChange("stock")
    UPP->>UPP: setOperation("stock")
    UPP->>UPP: setItems(prev => prev.map(i => ({...i, value:""})))

    Note over User,ITEM: ADIM 2 — Ürün ID'leri Girişi

    alt Manuel Giriş
        User->>ITEM: Textarea'ya "PRD-001\nPRD-002" yazar
        ITEM->>ITEM: handleTextChange(v) çağrılır
        ITEM->>ITEM: onRawTextChange(v) — ham metin kaydedilir
        ITEM->>ITEM: parseIds(v) → ["PRD-001","PRD-002"]
        ITEM->>ITEM: dedupeItems() — tekrar eden ID'ler silinir
        ITEM->>UPP: onItemsChange([{id:"PRD-001",value:""}, {id:"PRD-002",value:""}])
    end

    alt Excel Yükleme
        User->>ITEM: "Excel Yükle" butonuna basar
        ITEM->>ITEM: fileRef.current.click() — gizli input tetiklenir
        User->>ITEM: .xlsx dosya seçer
        ITEM->>ITEM: handleExcel(e) çağrılır
        ITEM->>ITEM: file.arrayBuffer() ile dosya okunur
        ITEM->>ITEM: XLSX.read(buffer) — Excel parse edilir
        ITEM->>ITEM: sheet_to_json(ws, {header:1}) → satır dizisi
        ITEM->>ITEM: A sütunu → ID, B sütunu → value
        ITEM->>ITEM: dedupeItems([...items, ...bulunan])
        ITEM->>UPP: onItemsChange(combined)
        ITEM->>UPP: onRawTextChange(ID'ler newline ile)
    end

    Note over User,NV: ADIM 3 — Yeni Değer Girişi
    Note over NV: operation && items.length > 0 ise render edilir

    alt Tek Tek Giriş
        User->>NV: Her ürünün input'una değer girer
        NV->>NV: handleItemValueChange(id, newValue)
        NV->>NV: items.map(item => item.id===id ? {...item, value:newValue} : item)
        NV->>UPP: onItemsChange(updated)
    end

    alt Tümüne Uygula
        User->>NV: Bulk input'a "50" yazar
        NV->>NV: setBulkValue("50")
        User->>NV: "Tümüne Uygula" butonuna basar
        NV->>NV: handleHandleApply() çağrılır
        NV->>NV: items.map(item => ({...item, value:"50"}))
        NV->>UPP: onItemsChange(updated)
    end

    Note over User,UPP: ADIM 4 — "Güncelle" Butonu
    UPP->>UPP: canSubmit kontrolü
    Note over UPP: operation !== null ✅<br/>items.length > 0 ✅<br/>allValuesFilled ✅<br/>!loading ✅

    User->>UPP: "3 Ürün Güncelle" butonuna basar
    UPP->>UPP: handleUpdate() çağrılır
    UPP->>UPP: setResults([]) — önceki sonuçlar temizlenir
    UPP->>UPP: setLoading(true) — spinner başlar

    Note over UPP,API: ADIM 5 — API İsteği Hazırlama
    UPP->>UPP: payload oluşturulur
    Note over UPP: items.map(item => ({<br/>  id: item.id,<br/>  [operation]: item.value<br/>}))<br/>→ [{id:"PRD-001", stock:"50"}, ...]

    UPP->>API: api.patch('/products/bulk', payload)

    Note over API,INTC: ADIM 6 — Axios Interceptor
    API->>INTC: Request Interceptor çalışır
    INTC->>INTC: sessionStorage.getItem("token")
    INTC->>INTC: config.headers.Authorization = "Bearer <token>"
    INTC->>SRV: PATCH http://localhost:3000/products/bulk<br/>Headers: { Authorization: "Bearer ey..." }

    Note over SRV,MW: ADIM 7 — Middleware Token Kontrolü
    SRV->>PR: /products prefix eşleşir
    PR->>MW: securityMiddleware çalışır (router.use)
    MW->>MW: req.headers["authorization"] okunur
    MW->>MW: "Bearer ey...".split(" ")[1] → token
    MW->>AS: authService.CheckTicket(token)
    AS->>AS: jwt.verify(token, JWT_SECRET)

    alt Token geçersiz/süresi dolmuş
        AS-->>MW: null döner
        MW-->>SRV: 401 "Biletin sahte veya süresi dolmuş!"
        SRV-->>INTC: HTTP 401
        INTC->>INTC: Response Interceptor çalışır
        INTC->>INTC: status 401 → sessionStorage.removeItem("token")
        INTC->>INTC: window.location.href = "/login"
    end

    AS-->>MW: { id, user } payload döner
    MW->>MW: req.user = verification
    MW->>PR: next() → sonraki handler'a geç

    Note over PR,PC: ADIM 8 — Controller
    PR->>PC: router.patch("/bulk") → productController.bulkUpdate(req,res)
    PC->>PC: items = req.body — payload alınır
    PC->>PC: Array.isArray(items) && items.length > 0 kontrolü

    alt Geçersiz payload
        PC-->>SRV: 400 { message: "Güncellenecek ürün bulunamadı" }
    end

    PC->>PS: productService.bulkUpdate(items)

    Note over PS,ODB: ADIM 9 — Service → Oracle DB

    loop Her item için (for...of)
        PS->>PS: { id, ...fields } = item — id ayrılır
        PS->>PS: updateProduct(id, fields) çağrılır

        PS->>PS: ALLOWED_COLUMNS ile alan eşleştirme
        Note over PS: "stock" → "STOCK"<br/>"location" → "LOCATION"
        PS->>PS: SQL oluşturulur
        Note over PS: UPDATE PRODUCTS<br/>SET STOCK = :stock<br/>WHERE ID = :id

        PS->>ODB: getConnection() — Oracle bağlantısı açılır
        PS->>ODB: connection.execute(sql, bind, {autoCommit:true})

        alt rowsAffected === 0
            ODB-->>PS: Ürün bulunamadı hatası
            PS->>PS: results.push({id, success:false, message:...})
        end

        ODB-->>PS: Güncelleme başarılı
        PS->>PS: connection.close() — bağlantı kapatılır
        PS->>PS: results.push({id, success:true, message:"...başarıyla güncellendi"})
    end

    PS-->>PC: UpdateResult[] döner
    PC-->>SRV: res.json(results)
    SRV-->>API: HTTP 200 + JSON

    Note over UPP,RL: ADIM 10 — Sonuçların Gösterimi
    API-->>UPP: res.data alınır
    UPP->>UPP: setResults(res.data)
    UPP->>UPP: setLoading(false) — spinner durur
    UPP->>RL: results prop olarak geçilir
    RL->>RL: basarili = results.filter(r => r.success).length
    RL->>RL: hata = results.filter(r => !r.success).length
    RL->>RL: Her sonuç satırı için ✓/✗ ikonu gösterilir
```

---

## 6. Component Hiyerarşisi ve Prop Akışı

```mermaid
graph TD
    subgraph MAIN_TREE["Component Ağacı"]
        MAIN["main.tsx"] --> BP["BrowserRouter"]
        BP --> AP["AuthProvider<br/>state: token, user<br/>fn: login(), logout()"]
        AP --> APP["App.tsx<br/>uses: useAuth()"]

        APP --> |"token yok"| LP["LoginPage<br/>state: email, password, error, loading<br/>fn: handleSubmit()"]

        APP --> |"token var"| LAYOUT["Layout (div.layout)"]
        LAYOUT --> HEADER["Header<br/>— user.user gösterir —<br/>— Çıkış Yap butonu → logout() —"]
        LAYOUT --> PAGE_BODY["div.page-body"]
        PAGE_BODY --> UPP["UpdateProductPage<br/>state: operation, envId, items,<br/>rawText, results, loading<br/>fn: handleUpdate()"]

        UPP --> OS["OperationSelector<br/>props: value, onChange<br/>state: open, hovered"]
        UPP --> IID["ItemIdInput<br/>props: envId, items, rawText,<br/>+ onChange handlers"]
        UPP --> NVI["NewValueInput<br/>props: operation, items,<br/>onItemsChange<br/>state: bulkValue"]
        UPP --> RLC["ResultLog<br/>props: results, loading"]
    end

    style MAIN_TREE fill:transparent,stroke:#555
```

### Prop Akış Tablosu

| Parent → Child                            | Prop                                            | Açıklama                                             |
| ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `UpdateProductPage` → `OperationSelector` | `value`                                         | Seçili işlem türü (`"stock"` veya `"location"`)      |
| `UpdateProductPage` → `OperationSelector` | `onChange`                                      | `handleOperationChange()` — seçim değişince çağrılır |
| `UpdateProductPage` → `ItemIdInput`       | `envId, items, rawText`                         | Input state'leri                                     |
| `UpdateProductPage` → `ItemIdInput`       | `onEnvIdChange, onItemsChange, onRawTextChange` | State güncelleyiciler                                |
| `UpdateProductPage` → `NewValueInput`     | `operation, items, onItemsChange`               | İşlem türü ve ürün listesi                           |
| `UpdateProductPage` → `ResultLog`         | `results, loading`                              | Sonuçlar ve loading durumu                           |

---

## 7. Backend Katman Mimarisi

```mermaid
flowchart LR
    subgraph REQUEST["HTTP İsteği"]
        REQ["PATCH /products/bulk<br/>Header: Authorization: Bearer ey...<br/>Body: [{id,stock}, ...]"]
    end

    subgraph LAYER1["1️⃣ Route Katmanı"]
        direction TB
        R1["index.ts<br/>app.use('/products', productRoutes)"]
        R2["ProducutRoutes.ts<br/>router.patch('/bulk', ...)"]
    end

    subgraph LAYER2["2️⃣ Middleware Katmanı"]
        M1["AuthMiddleware.ts<br/>securityMiddleware()"]
        M2["Token kontrolü<br/>jwt.verify()"]
    end

    subgraph LAYER3["3️⃣ Controller Katmanı"]
        C1["ProductController.ts<br/>bulkUpdate(req, res)"]
        C2["Validasyon<br/>Array.isArray? length>0?"]
    end

    subgraph LAYER4["4️⃣ Service Katmanı"]
        S1["ProductService.ts<br/>bulkUpdate(items)"]
        S2["updateProduct(id, fields)<br/>SQL oluşturma"]
    end

    subgraph LAYER5["5️⃣ Database"]
        DB["Oracle DB<br/>PRODUCTS tablosu<br/>UPDATE ... SET ... WHERE ..."]
    end

    REQ --> R1 --> R2 --> M1 --> M2 --> C1 --> C2 --> S1 --> S2 --> DB
```

---

## 8. Axios Interceptor Akışı

```mermaid
flowchart TD
    subgraph OUT["Giden İstek (Request)"]
        A["api.post() veya api.patch() çağrılır"]
        B{"sessionStorage'da<br/>token var mı?"}
        C["config.headers.Authorization =<br/>'Bearer ' + token"]
        D["İstek olduğu gibi gider"]

        A --> B
        B -- "Evet" --> C --> E["İstek backend'e ulaşır"]
        B -- "Hayır" --> D --> E
    end

    subgraph IN["Gelen Yanıt (Response)"]
        F{"HTTP status kodu?"}
        G["response olduğu gibi döner"]
        H["sessionStorage.removeItem('token')"]
        I["window.location.href = '/login'"]
        J["Promise.reject(error)"]

        E --> F
        F -- "200 OK" --> G
        F -- "401 / 403" --> H --> I
        F -- "Diğer hatalar" --> J
    end
```

---

## 9. Dosya Bazında Fonksiyon Referansı

### Frontend

| Dosya                                                                                                                          | Fonksiyon                        | Tetikleyici                   | Ne Yapar                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ----------------------------- | ----------------------------------------------- |
| [LoginPage.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/pages/LoginPage.tsx)                                        | `handleSubmit(e)`                | Form submit                   | Email/password → backend POST → login()         |
| [AuthContext.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/context/AuthContext.tsx)                                  | `login(newToken)`                | LoginPage handleSubmit        | Token'ı sessionStorage + state'e yazar          |
| [AuthContext.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/context/AuthContext.tsx)                                  | `logout()`                       | Header çıkış butonu           | sessionStorage temizler, state null yapar       |
| [AuthContext.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/context/AuthContext.tsx)                                  | `parseToken(token)`              | login() içinde                | JWT payload'ı decode eder → {id, user}          |
| [AuthContext.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/context/AuthContext.tsx)                                  | `base64UrlDecodetoUtf8(input)`   | parseToken() içinde           | Base64 URL decode → UTF-8 string                |
| [UpdateProductPage.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/pages/UpdateProductPage.tsx)                        | `handleOperationChange(op)`      | OperationSelector onChange    | İşlem türünü set eder, değerleri sıfırlar       |
| [UpdateProductPage.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/pages/UpdateProductPage.tsx)                        | `handleUpdate()`                 | "Güncelle" button onClick     | Payload oluşturur → api.patch('/products/bulk') |
| [OperationSelectorComponent.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/components/OperationSelectorComponent.tsx) | `handleSelect(op)`               | Dropdown item click           | Parent'a bildirir + dropdown kapatır            |
| [ItemIdInputComponent.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/components/ItemIdInputComponent.tsx)             | `handleTextChange(v)`            | Textarea onChange             | parseIds → dedupeItems → parent'a bildir        |
| [ItemIdInputComponent.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/components/ItemIdInputComponent.tsx)             | `handleExcel(e)`                 | File input onChange           | xlsx parse → ID/value çıkar → parent'a bildir   |
| [ItemIdInputComponent.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/components/ItemIdInputComponent.tsx)             | `parseIds(text)`                 | handleTextChange içinde       | Text → virgül/newline split → string[]          |
| [ItemIdInputComponent.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/components/ItemIdInputComponent.tsx)             | `dedupeItems(items)`             | handleTextChange, handleExcel | Aynı ID'li item'ları tekli yapar                |
| [ItemIdInputComponent.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/components/ItemIdInputComponent.tsx)             | `removeItem(id)`                 | Chip X butonu                 | Listeden tek item siler                         |
| [NewValueInputCompanent.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/components/NewValueInputCompanent.tsx)         | `handleItemValueChange(id, val)` | Satır input onChange          | Tek item'ın value'sunu günceller                |
| [NewValueInputCompanent.tsx](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/components/NewValueInputCompanent.tsx)         | `handleHandleApply()`            | "Tümüne Uygula" butonu        | bulkValue'yu tüm item'lara yazar                |
| [api.ts](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/api.ts)                                                            | Request Interceptor              | Her API çağrısı öncesi        | Token varsa Authorization header ekler          |
| [api.ts](file:///c:/Users/EMRE/Desktop/calisma/frontend/src/api.ts)                                                            | Response Interceptor             | Her API yanıtı sonrası        | 401/403 → login'e yönlendir                     |

### Backend

| Dosya                                                                                                     | Fonksiyon                   | Tetikleyici               | Ne Yapar                                        |
| --------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------- | ----------------------------------------------- |
| [AuthController.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/controller/AuthController.ts)       | `login(req, res)`           | POST /auther/login        | Validasyon → AuthService.login() → token döner  |
| [AuthService.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/service/AuthService.ts)                | `login(email, pass)`        | AuthController            | .env'den kullanıcı bul → token üret             |
| [AuthService.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/service/AuthService.ts)                | `EnvGetUsers()`             | login() içinde            | .env'den USER1*, USER2* vb. okur                |
| [AuthService.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/service/AuthService.ts)                | `generateToken(user)`       | login() içinde            | jwt.sign() ile 1 saatlik token üretir           |
| [AuthService.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/service/AuthService.ts)                | `CheckTicket(token)`        | AuthMiddleware            | jwt.verify() → payload veya null                |
| [AuthMiddleware.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/middleware/AuthMiddleware.ts)       | `securityMiddleware`        | Product route'ları öncesi | Authorization header → token doğrula → next()   |
| [ProductController.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/controller/ProductController.ts) | `updateProduct(req, res)`   | PATCH /products/:id       | Tek ürün güncelleme                             |
| [ProductController.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/controller/ProductController.ts) | `bulkUpdate(req, res)`      | PATCH /products/bulk      | Toplu güncelleme → ProductService               |
| [ProductService.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/service/ProductService.ts)          | `getConnection()`           | updateProduct() içinde    | Oracle'a bağlantı açar                          |
| [ProductService.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/service/ProductService.ts)          | `updateProduct(id, fields)` | bulkUpdate() loop içinde  | SQL oluştur → Oracle execute → connection close |
| [ProductService.ts](file:///c:/Users/EMRE/Desktop/calisma/backend/src/service/ProductService.ts)          | `bulkUpdate(items)`         | ProductController         | Her item için updateProduct() çağırır           |

---

## 10. Veri Akışı Özeti (Data Flow)

```mermaid
flowchart LR
    subgraph FE["Frontend"]
        UI["UI State<br/>operation, items, values"]
        PAYLOAD["Payload<br/>[{id:'PRD-001', stock:50},<br/> {id:'PRD-002', stock:120}]"]
    end

    subgraph NW["Network"]
        REQ["PATCH /products/bulk<br/>+ Bearer Token"]
        RES["Response<br/>[{id,success,message}, ...]"]
    end

    subgraph BE["Backend"]
        CTRL["Controller<br/>req.body parse"]
        SVC["Service<br/>SQL generation"]
    end

    subgraph DB["Oracle"]
        SQL1["UPDATE PRODUCTS<br/>SET STOCK=50<br/>WHERE ID='PRD-001'"]
        SQL2["UPDATE PRODUCTS<br/>SET STOCK=120<br/>WHERE ID='PRD-002'"]
    end

    UI --> PAYLOAD --> REQ --> CTRL --> SVC --> SQL1 & SQL2
    SQL1 & SQL2 --> RES --> UI
```

---

## 11. Token Yaşam Döngüsü

```mermaid
stateDiagram-v2
    [*] --> NoToken: Uygulama ilk açıldı

    NoToken --> HasToken: Login başarılı
    note right of HasToken: sessionStorage + React state

    HasToken --> NoToken: Logout butonuna basıldı
    HasToken --> NoToken: Token süresi doldu (1h)
    HasToken --> NoToken: 401/403 yanıtı geldi

    state HasToken {
        [*] --> Active: Token geçerli
        Active --> Expired: 1 saat geçti
        Active --> Active: Her API call → interceptor token ekler
    }
```

> [!TIP]
> Bu dokümanı Mermaid destekleyen herhangi bir markdown viewer'da (VS Code, GitHub, Notion vb.) açarak diyagramları görsel olarak görebilirsin.
