import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X } from 'lucide-react';

export interface UpdateItem {
  id: string;
  value: string | number;
}

interface Props {
  envId: string;
  onEnvIdChange: (v: string) => void;
  items: UpdateItem[];
  onItemsChange: (items: UpdateItem[]) => void;
  rawText: string;
  onRawTextChange: (v: string) => void;
}

/**
 * Textarea'dan sadece ID parse eder (elle girişte değer yok).
 * Kullanıcı elle yazarsa sadece ID listesi girer,
 * değer bilgisi Excel'den gelir.
 */
function parseIds(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * items dizisinden tekrarsız, sıralı bir liste üretir.
 * Aynı ID birden fazla kez varsa son gelen kazanır.
 */
function dedupeItems(items: UpdateItem[]): UpdateItem[] {
  const map = new Map<string, UpdateItem>();
  for (const item of items) {
    map.set(item.id, item); // aynı ID gelirse üstüne yazar
  }
  return Array.from(map.values());
}

export default function ItemIdInput({
  envId,
  onEnvIdChange,
  items,
  onItemsChange,
  rawText,
  onRawTextChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Elle textarea'ya yazınca ──
  // Elle girişte sadece ID var, değer yok → value boş string
  const handleTextChange = (v: string) => {
    onRawTextChange(v);
    const ids = parseIds(v);
    const newItems = ids.map((id) => {
      // Eğer bu ID daha önce Excel'den geldiyse mevcut değerini koru
      const existing = items.find((item) => item.id === id);
      return existing ?? { id, value: '' };
    });
    onItemsChange(dedupeItems(newItems));
  };

  // ── Excel / CSV yüklenince ──
  // A sütunu = ID, B sütunu = Değer
  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const bulunan: UpdateItem[] = [];

    rows.forEach((row) => {
      // A sütunu (index 0) → ID
      const id = String(row[0] ?? '').trim();
      if (!id) return; // ID yoksa bu satırı atla

      // B sütunu (index 1) → Değer (yoksa boş string)
      const val = row[1] !== undefined && row[1] !== null
        ? (typeof row[1] === 'number' ? row[1] : String(row[1]).trim())
        : '';

      bulunan.push({ id, value: val });
    });

    // Mevcut items + yeni bulunanları birleştir, tekrarları at
    const combined = dedupeItems([...items, ...bulunan]);
    onItemsChange(combined);
    onRawTextChange(combined.map((item) => item.id).join('\n'));
  };

  // ── Tek bir item'ı sil ──
  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    onItemsChange(next);
    onRawTextChange(next.map((item) => item.id).join('\n'));
  };

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 14,
        }}
      >
        Ürün ID Listesi
      </h3>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Env ID */}
        <div style={{ flexShrink: 0 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            Env ID
          </label>
          <input
            className="form-input"
            style={{ width: 90 }}
            placeholder="ORG-01"
            value={envId}
            onChange={(e) => onEnvIdChange(e.target.value)}
          />
        </div>

        {/* Textarea */}
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
            Ürün ID'leri (her satıra veya virgülle ayırın)
          </label>
          <textarea
            className="form-input"
            rows={4}
            style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }}
            placeholder={'ID-001\nID-002\nveya ID-001, ID-002'}
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
            style={{ display: 'none' }}
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
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {items.map((item) => (
            <span
              key={item.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 10px',
                borderRadius: 20,
                background: 'var(--accent-dim)',
                border: '1px solid var(--border-active)',
                color: 'var(--accent-hover)',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              {/* Değer varsa "ID: Değer", yoksa sadece "ID" */}
              {item.value !== '' ? `${item.id}: ${item.value}` : item.id}
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  color: 'inherit',
                  opacity: 0.7,
                }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        {items.length} ID girildi
        {items.filter((item) => item.value !== '').length > 0 && (
          <span> · {items.filter((item) => item.value !== '').length} değer eşleştirildi</span>
        )}
      </div>
    </div>
  );
} 