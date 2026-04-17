import { useRef } from "react"; // useRef → Gizli file input'a erişmek için.
import * as XLSX from "xlsx"; // excelden veri okumak için
import { Upload, X } from "lucide-react"; // İkonlar.
import type { UpdateItem } from '@shared/types/product';


// Parent component'ten gelen props
interface Props {
  title?: string;                              // Başlık. ? opsiyonel, varsayılan "ID Listesi"
  items: UpdateItem[];                         // Ürün listesi güncellenecek olan ürünler (id ve value içerir)
  onItemsChange: (items: UpdateItem[]) => void; // Liste değişince parent'a bildir
  rawText: string;                             // Textarea'daki ham metin
  onRawTextChange: (v: string) => void;        // Metin değişince parent'a bildir
}

function parseIds(text: string): string[] { // parseIds → Textarea'daki metni virgül veya yeni satırla ayırıp ID'leri array olarak döndürür.
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function dedupeItems(items: UpdateItem[]): UpdateItem[] {// dedupeItems → Aynı ID'leri siler, her ID'den sadece bir tane tutar.
  const map = new Map<string, UpdateItem>();
  for (const item of items) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}

export default function ItemIdInputComponent({// bu fonksiyon  fonksiyonlara dışarıdan veri aktarmak için kullanılır
  title = "ID Listesi",
  items,
  onItemsChange,
  rawText,
  onRawTextChange,
}: Props) { 
  const fileRef = useRef<HTMLInputElement>(null); // Gizli file input'u kontrol etmek için ref. yani fileRef.current ile bu inputa erişebiliriz. Excel yükle butonuna tıklandığında bu inputa tıklanır ve dosya seçme penceresi açılır. Dosya seçildikten sonra handleExcel fonksiyonu çalışır.

  // ── Elle yazma ──
  const handleTextChange = (v: string) => {
    onRawTextChange(v);
    const ids = parseIds(v);  
    const newItems = ids.map((id) => {//daha önce bu id lere karşılık gelen value'ler varsa onları koru, yoksa value boş string olsun
      const existing = items.find((item) => item.id === id);// existing → mevcut demek 
      return existing ?? { id, value: "" };// eğer existing varsa onu kullan, yoksa yeni bir item oluştur {id: id, value: ""} şeklinde
    }); 
    onItemsChange(dedupeItems(newItems));
  };

  // ── Excel / CSV yüklenince ──
  // A sütunu = ID, B sütunu = Değer
  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {// Excel dosyası seçildikten sonra çalışır. Dosyayı okuyup ID ve değerleri çıkarır, mevcut listeye ekler ve parent'a bildirir.
    const file = e.target.files?.[0];// file inputundan seçilen dosyayı alır. [0] ilk dosyayı alır çünkü tek dosya seçmeye izin veriyoruz birden fazla dosya seçilmesi halinde
    if (!file) return; // dosya seçilmediyse çık aşağıdaki kodları çalıştırma
    e.target.value = ""; //burada aslında value ları sıfırlıyoruz çünkü aynı dosyayı tekrar yüklersek tarayıcı aynı dosya seçili der ve onChange tetiklenmez

    const buffer = await file.arrayBuffer(); // arrayBuffer ile dosyayı okuyup bellekte bir buffer oluştururuz.  Dosyayı ham binary veri olarak oku.
    const wb = XLSX.read(buffer);// bianry veriyi excel olarak oku 
    const ws = wb.Sheets[wb.SheetNames[0]]; // ilk sayfayı al. SheetNames → çalışma kitabındaki sayfa isimlerini içeren bir arraydir. [0] ile ilk sayfayı alırız.
    const rows: (string | number | null | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 }); // sayfayı satır satır oku. header: 1 → her satırı array olarak döndürür. Yani rows → 2 boyutlu array olur. rows[0] ilk satır, rows[0][0] ilk satırın ilk hücresi (A1), rows[0][1] ilk satırın ikinci hücresi (B1) gibi erişilir. bu şekilde bir javaScript arrayine fönüşürürüz. her hücre string, number, null veya undefined olabilir bu yüzden tip olarak belirttik. satır dizisine çevirir sheet_to_json

    const bulunan: UpdateItem[] = []; // Excel'den bulunan ID ve değerler burada tutulacak. UpdateItem → {id: string, value: string | number} şeklinde bir tiptir.

    rows.forEach((row) => { //.forEach() → Dizideki her eleman için fonksiyon çalıştır. .map()'ten farkı: .map() yeni dizi döner, .forEach() dönmez — sadece her eleman üzerinde iş yapar.
      const id = String(row[0] ?? "").trim();
      if (!id) return; //ıd null veya undefined ise ""

      const val =
        row[1] !== undefined && row[1] !== null
          ? typeof row[1] === "number"
            ? row[1]                  //b sütunu varsa sayıysa sayıyı olduğu gibi kullan string ise boşlukları temizle
            : String(row[1]).trim()   //b sütunu yoksa undefined yada null ise boş string ""
          : "";

      bulunan.push({ id, value: val }); // sonra value ve idleri buraya pushla
    });

    const combined = dedupeItems([...items, ...bulunan]); // mevcut liste ile bulunanları birleştir ve aynı ID'leri sil. aynı ıd ler varsa son geleni kullanır çünkü dedupeItems içinde Map kullanıyoruz ve Map'te aynı key varsa son eklenen value'yu tutar.
    onItemsChange(combined);
    onRawTextChange(combined.map((item) => item.id).join("\n"));// textarea'daki metni güncelle. sadece ID'leri gösterelim, değerleri göstermeyelim. her ID yeni satırda olacak şekilde join("\n") ile birleştiriyoruz.
  };

  // ── Tek bir item'ı sil ──
  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    onItemsChange(next);
    onRawTextChange(next.map((item) => item.id).join("\n"));
  };

  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      
      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 14,
        }}
      >
        {title}
      </h3>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        

        {/* Textarea */}
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
            Ürün ID'leri (her satıra veya virgülle ayırın)
          </label>
          <textarea
            className="form-input"
            rows={4}
            style={{ resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
            placeholder={"ID-001\nID-002\nveya ID-001, ID-002"}
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>

        {/* Excel Yükle */}
        <div style={{ flexShrink: 0, paddingTop: 22 }}>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            onChange={handleExcel}
          />
          <button
            className="btn btn-secondary"
            onClick={() => fileRef.current?.click()}
            title="Excel'den ID ve Değer yükle (A sütunu: ID, B sütunu: Değer)"
          >
            <Upload size={14} /> Excel Yükle
          </button>
        </div>
      </div>

      {/* Chip listesi — ID: Değer şeklinde */}
      {items.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {items.map((item) => (
            <span
              key={item.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 10px",
                borderRadius: 20,
                background: "var(--accent-dim)",
                border: "1px solid var(--border-active)",
                color: "var(--accent-hover)",
                fontSize: 12,
                fontFamily: "monospace",
              }}
            >
              {item.value !== "" ? `${item.id}: ${item.value}` : item.id}
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  color: "inherit",
                  opacity: 0.7,
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
        {items.length} ID girildi
        {items.filter((item) => item.value !== "").length > 0 && (
          <span> · {items.filter((item) => item.value !== "").length} değer eşleştirildi</span>
        )}
      </div>
    </div>
  );
}
