import type { OperationType } from '../services/bulkUpdateService';

interface Props {
  operasyon: OperationType;
  value: string;
  onChange: (v: string) => void;
}

const DURUM_SECENEKLER = ['Aktif', 'Pasif', 'Beklemede', 'Arşivlendi'];

const CONFIG: Record<OperationType, { label: string; tip: 'text' | 'number' | 'select'; placeholder?: string }> = {
  lokasyon:   { label: 'Yeni Lokasyon Adı',         tip: 'text',   placeholder: 'Raf A-12'   },
  stok:       { label: 'Yeni Stok Miktarı',         tip: 'number', placeholder: '0'           },
  fiyat:      { label: 'Yeni Fiyat (₺)',            tip: 'number', placeholder: '0'           },
  durum:      { label: 'Yeni Durum',                tip: 'select'                             },
  tutar:      { label: 'Yeni Tutar (₺)',            tip: 'number', placeholder: '0.00'        },
  paraBirimi: { label: 'Para Birimi',               tip: 'text',   placeholder: 'USD, EUR, TRY...' },
  kur:        { label: 'Kur Değeri',                tip: 'number', placeholder: '0.0000'      },
  fatura:     { label: 'Fatura No / Açıklama',      tip: 'text',   placeholder: 'INV-2024-001' },
};

export default function NewValueInput({ operasyon, value, onChange }: Props) {
  const cfg = CONFIG[operasyon];

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
        Yeni Değer
      </h3>

      <div className="form-group" style={{ maxWidth: 340 }}>
        <label className="form-label">{cfg.label}</label>
        {cfg.tip === 'select' ? (
          <select
            className="form-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">— Seçiniz —</option>
            {DURUM_SECENEKLER.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        ) : (
          <input
            className="form-input"
            type={cfg.tip}
            placeholder={cfg.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={cfg.tip === 'number' ? 0 : undefined}
            step={operasyon === 'kur' ? '0.0001' : undefined}
          />
        )}
      </div>
    </div>
  );
}
