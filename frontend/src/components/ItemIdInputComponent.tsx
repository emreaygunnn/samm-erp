import { useRef } from "react";
import { useTranslation } from "react-i18next";
import * as XLSX from "xlsx";
import { Upload, X } from "lucide-react";
import type { ProductUpdateItem } from '@shared/types/product';

// ItemIdLabels → component içindeki entity-spesifik metinleri dışarıdan enjekte etmeye yarar.
// Böylece aynı component product, customer, contact sayfalarında
// farklı metinlerle çalışabilir. Verilmeyen alanlar common.* fallback'e düşer.
export interface ItemIdLabels {
  sectionTitle?: string;      // kartın başlığı
  idsLabel?: string;          // textarea üstündeki etiket
  idsPlaceholder?: string;    // textarea placeholder
  uploadHint?: string;        // Excel butonunun tooltip'i
  idCountSuffix?: string;     // "3 ID girildi" yerine "3 Party Number girildi" gibi
  valueMatchedSuffix?: string; // "2 değer eşleşti" metninin son kısmı
}

// ProductUpdateItem: { id, value, organizationCode?, statusValue? }
// Customer için opsiyonel alanlar kullanılmaz ama tip uyumludur.
interface Props {
  labels?: ItemIdLabels;
  items: ProductUpdateItem[];
  onItemsChange: (items: ProductUpdateItem[]) => void;
  rawText: string;                          // textarea'daki ham metin (parent yönetir)
  onRawTextChange: (v: string) => void;
}

// Textarea'daki metni ID dizisine çevir: newline veya virgülle ayır, boşlukları temizle
function parseIds(text: string): string[] {
  return text.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
}

// Aynı ID'den birden fazla varsa sonuncuyu tut (Map sayesinde)
function dedupeItems(items: ProductUpdateItem[]): ProductUpdateItem[] {
  const map = new Map<string, ProductUpdateItem>();
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

export default function ItemIdInputComponent({ labels, items, onItemsChange, rawText, onRawTextChange }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null); // gizli file input'a programatik tıklamak için

  // labels prop'tan gelirse onu kullan, yoksa common.* anahtarına düş
  const sectionTitle       = labels?.sectionTitle       ?? t('common.idList');
  const idsLabel           = labels?.idsLabel           ?? t('common.idsLabel');
  const idsPlaceholder     = labels?.idsPlaceholder     ?? t('common.idsPlaceholder');
  const uploadHint         = labels?.uploadHint         ?? t('common.uploadExcelHint');
  const idCountSuffix      = labels?.idCountSuffix      ?? t('common.idEntered');
  const valueMatchedSuffix = labels?.valueMatchedSuffix ?? t('common.valueMatched');

  // ── Elle ID yazma ──
  // Kullanıcı textarea'ya yazınca: metni parse et → item listesine dönüştür
  // Daha önce girilmiş item'ların value'larını koru (mevcut varsa)
  const handleTextChange = (v: string) => {
    onRawTextChange(v);
    const ids = parseIds(v);
    const newItems = ids.map((id) => {
      const existing = items.find((item) => item.id === id);
      return existing ?? { id, value: "" }; // yeni ID'ye boş value ver
    });
    onItemsChange(dedupeItems(newItems));
  };

  // ── Excel / CSV yükleme ──
  // A sütunu = ID, B sütunu = Değer (B opsiyonel)
  // Mevcut listeyle birleştirir, aynı ID'ler tekrarlanmaz
  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // aynı dosya tekrar seçilebilsin diye sıfırla

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]]; // ilk sayfa
    const rows: (string | number | null | undefined)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const found: ProductUpdateItem[] = [];
    rows.forEach((row) => {
      const id = String(row[0] ?? "").trim();
      if (!id) return;
      // B sütunu varsa ve sayıysa sayı olarak al, string ise string; yoksa boş string
      const val =
        row[1] !== undefined && row[1] !== null
          ? typeof row[1] === "number" ? row[1] : String(row[1]).trim()
          : "";
      found.push({ id, value: val });
    });

    const combined = dedupeItems([...items, ...found]); // mevcut + Excel'den gelen
    onItemsChange(combined);
    onRawTextChange(combined.map((item) => item.id).join("\n")); // textarea'yı güncelle
  };

  // Chip'teki × butonuna tıklanınca o item'ı listeden çıkar
  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    onItemsChange(next);
    onRawTextChange(next.map((item) => item.id).join("\n"));
  };

  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
        {sectionTitle}
      </h3>

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Textarea: elle ID girişi */}
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>
            {idsLabel}
          </label>
          <textarea
            className="form-input"
            rows={4}
            style={{ resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
            placeholder={idsPlaceholder}
            value={rawText}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>

        {/* Excel yükleme butonu — tıklanınca gizli file input'u tetikler */}
        <div style={{ flexShrink: 0, paddingTop: 22 }}>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleExcel} />
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} title={uploadHint}>
            <Upload size={14} /> {t('common.uploadExcel')}
          </button>
        </div>
      </div>

      {/* Chip listesi — her item için "ID: değer" formatında küçük badge */}
      {items.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {items.map((item) => (
            <span
              key={item.id}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "var(--accent-dim)", border: "1px solid var(--border-active)", color: "var(--accent-hover)", fontSize: 12, fontFamily: "monospace" }}
            >
              {/* Değer varsa "ID: değer", yoksa sadece "ID" */}
              {item.value !== "" ? `${item.id}: ${item.value}` : item.id}
              <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "inherit", opacity: 0.7 }}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Alt bilgi satırı: kaç ID girildi, kaçının değeri eşleşti */}
      <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
        {items.length} {idCountSuffix}
        {items.filter((item) => item.value !== "").length > 0 && (
          <span> · {items.filter((item) => item.value !== "").length} {valueMatchedSuffix}</span>
        )}
      </div>
    </div>
  );
}
