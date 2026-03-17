import { useState } from 'react';
import type { OperationType } from '../services/bulkUpdateService';
import type { UpdateItem } from './ItemIdInput';
import { CopyCheck } from 'lucide-react';

interface Props {
  operasyon: OperationType;
  items: UpdateItem[];
  onItemsChange: (items: UpdateItem[]) => void;
}

const DURUM_SECENEKLER = ['Aktif', 'Pasif', 'Beklemede', 'Arşivlendi'];

const CONFIG: Record<OperationType, { label: string; tip: 'text' | 'number' | 'select'; placeholder?: string }> = {
  lokasyon:   { label: 'Lokasyon',       tip: 'text',   placeholder: 'Raf A-12'      },
  stok:       { label: 'Stok',           tip: 'number', placeholder: '0'              },
  fiyat:      { label: 'Fiyat (₺)',      tip: 'number', placeholder: '0'              },
  durum:      { label: 'Durum',          tip: 'select'                                },
  tutar:      { label: 'Tutar (₺)',      tip: 'number', placeholder: '0.00'           },
  paraBirimi: { label: 'Para Birimi',    tip: 'text',   placeholder: 'USD, EUR, TRY...' },
  kur:        { label: 'Kur',            tip: 'number', placeholder: '0.0000'         },
  fatura:     { label: 'Fatura No',      tip: 'text',   placeholder: 'INV-2024-001'   },
};

export default function NewValueInput({ operasyon, items, onItemsChange }: Props) {
  const cfg = CONFIG[operasyon];

  // ── "Tümüne Uygula" için geçici değer ──
  const [topluDeger, setTopluDeger] = useState('');

  // ── Tek bir item'ın değerini güncelle ──
  const handleItemValueChange = (id: string, newValue: string | number) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, value: newValue } : item
    );
    onItemsChange(updated);
  };

  // ── Tüm item'lara aynı değeri yaz ──
  const handleTopluUygula = () => {
    if (topluDeger === '') return;
    const updated = items.map((item) => ({ ...item, value: topluDeger }));
    onItemsChange(updated);
  };

  // ── Tek bir satır için input renderla ──
  const renderInput = (item: UpdateItem) => {
    const val = String(item.value ?? '');

    if (cfg.tip === 'select') {
      return (
        <select
          className="form-input"
          value={val}
          onChange={(e) => handleItemValueChange(item.id, e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="">— Seç —</option>
          {DURUM_SECENEKLER.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        className="form-input"
        type={cfg.tip}
        placeholder={cfg.placeholder}
        value={val}
        onChange={(e) => handleItemValueChange(item.id, e.target.value)}
        min={cfg.tip === 'number' ? 0 : undefined}
        step={operasyon === 'kur' ? '0.0001' : undefined}
        style={{ width: '100%' }}
      />
    );
  };

  // ── "Tümüne Uygula" satırı için input ──
  const renderTopluInput = () => {
    if (cfg.tip === 'select') {
      return (
        <select
          className="form-input"
          value={topluDeger}
          onChange={(e) => setTopluDeger(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="">— Seç —</option>
          {DURUM_SECENEKLER.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        className="form-input"
        type={cfg.tip}
        placeholder={`Tümüne uygulanacak ${cfg.label.toLowerCase()}...`}
        value={topluDeger}
        onChange={(e) => setTopluDeger(e.target.value)}
        min={cfg.tip === 'number' ? 0 : undefined}
        step={operasyon === 'kur' ? '0.0001' : undefined}
        style={{ width: '100%' }}
      />
    );
  };

  if (items.length === 0) return null;

  // ── Kaç tanesinin değeri dolu? ──
  const doluSayisi = items.filter((item) => item.value !== '' && item.value !== undefined && item.value !== null).length;

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Yeni Değerler
        </h3>
        {doluSayisi > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {doluSayisi}/{items.length} değer girildi
          </span>
        )}
      </div>

      {/* ── Tümüne Uygula Satırı ── */}
      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        marginBottom: 16,
        padding: '10px 12px',
        borderRadius: 8,
        background: 'var(--bg-hover, rgba(255,255,255,0.03))',
        border: '1px dashed var(--border)',
      }}>
        <div style={{ flex: 1 }}>
          {renderTopluInput()}
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleTopluUygula}
          disabled={topluDeger === ''}
          style={{ flexShrink: 0, gap: 6 }}
          title="Girilen değeri tüm satırlara uygula"
        >
          <CopyCheck size={14} /> Tümüne Uygula
        </button>
      </div>

      {/* ── Tablo ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
              <th style={{
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                width: '40%',
              }}>
                ID
              </th>
              <th style={{
                textAlign: 'left',
                padding: '8px 12px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {cfg.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <td style={{
                  padding: '8px 12px',
                  fontFamily: 'monospace',
                  color: 'var(--text-secondary)',
                }}>
                  {item.id}
                  {/* Excel'den değer geldiyse küçük bir işaret */}
                  {item.value !== '' && (
                    <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent-hover)', opacity: 0.7 }}>
                      ●
                    </span>
                  )}
                </td>
                <td style={{ padding: '6px 12px' }}>
                  {renderInput(item)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}