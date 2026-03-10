import { useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X } from 'lucide-react';

interface Props {
  envId: string;
  onEnvIdChange: (v: string) => void;
  ids: string[];
  onIdsChange: (ids: string[]) => void;
  rawText: string;
  onRawTextChange: (v: string) => void;
}

function parseIds(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ItemIdInput({
  envId,
  onEnvIdChange,
  ids,
  onIdsChange,
  rawText,
  onRawTextChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (v: string) => {
    onRawTextChange(v);
    onIdsChange(parseIds(v));
  };

  const handleExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

    const bulunan: string[] = [];
    rows.forEach((row: any[]) => {
      row.forEach((cell) => {
        const val = String(cell ?? '').trim();
        if (val) bulunan.push(val);
      });
    });

    const combined = [...ids, ...bulunan].filter(Boolean);
    const unique = [...new Set(combined)];
    onIdsChange(unique);
    onRawTextChange(unique.join('\n'));
  };

  const removeId = (id: string) => {
    const next = ids.filter((i) => i !== id);
    onIdsChange(next);
    onRawTextChange(next.join('\n'));
  };

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
        Ürün ID Listesi
      </h3>

      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Env ID */}
        <div style={{ flexShrink: 0 }}>
          <label style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Env ID</label>
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
            title="Excel veya CSV'den ID yükle"
          >
            <Upload size={14} /> Excel Yükle
          </button>
        </div>
      </div>

      {/* Chip listesi */}
      {ids.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ids.map((id) => (
            <span
              key={id}
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
              {id}
              <button
                onClick={() => removeId(id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit', opacity: 0.7 }}
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        {ids.length} ID girildi
      </div>
    </div>
  );
}
