import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { OperationType } from '../services/bulkUpdateService';

interface Option {
  value: OperationType;
  label: string;
  group: string;
}

const SECENEKLER: Option[] = [
  { value: 'lokasyon',   label: 'Lokasyon Güncelle',    group: 'Items'             },
  { value: 'stok',       label: 'Stok Güncelle',        group: 'Items'             },
  { value: 'fiyat',      label: 'Fiyat Güncelle',       group: 'Items'             },
  { value: 'durum',      label: 'Durum Güncelle',       group: 'Items'             },
  { value: 'tutar',      label: 'Tutar Güncelle',       group: 'Standard Receipts' },
  { value: 'paraBirimi', label: 'Para Birimi Güncelle', group: 'Standard Receipts' },
  { value: 'kur',        label: 'Kur Güncelle',         group: 'Currency Rates'    },
  { value: 'fatura',     label: 'Fatura Güncelle',      group: 'Invoices'          },
];

// Grupları sırayla al (tekrarsız)
const GRUPLAR = Array.from(new Set(SECENEKLER.map((s) => s.group)));

interface Props {
  value: OperationType | null;
  onChange: (op: OperationType) => void;
}

export default function OperationSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<OperationType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const secili = SECENEKLER.find((s) => s.value === value);

  // Dışarı tıklanınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };  
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (op: OperationType) => {
    onChange(op);
    setOpen(false);
  };

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        İşlem Türü
      </label>

      <div ref={containerRef} style={{ position: 'relative', maxWidth: 360 }}>
        {/* Trigger butonu */}
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 14px',
            borderRadius: 8,
            border: open
              ? '1.5px solid var(--accent)'
              : '1.5px solid var(--border)',
            background: 'var(--surface)',
            color: secili ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 14,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color 0.15s',
          }}
        >
          <span>
            {secili
              ? <><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{secili.group} — </span>{secili.label}</>
              : 'İşlem türü seçiniz...'
            }
          </span>
          <ChevronDown
            size={15}
            style={{
              color: 'var(--text-muted)',
              flexShrink: 0,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </button>

        {/* Dropdown listesi */}
        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}
          >
            {GRUPLAR.map((grup, gi) => (
              <div key={grup}>
                {/* Grup başlığı */}
                {gi > 0 && (
                  <div style={{ height: 1, background: 'var(--border)', margin: '0 12px' }} />
                )}
                <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {grup}
                </div>

                {/* Grup seçenekleri */}
                {SECENEKLER.filter((s) => s.group === grup).map((s) => (
                  <div
                    key={s.value}
                    onMouseEnter={() => setHovered(s.value)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleSelect(s.value)}
                    style={{
                      padding: '8px 14px 8px 24px',
                      fontSize: 14,
                      cursor: 'pointer',
                      color: s.value === value
                        ? 'var(--accent-hover)'
                        : hovered === s.value
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      background: s.value === value
                        ? 'var(--accent-dim)'
                        : hovered === s.value
                          ? 'var(--bg-hover, rgba(255,255,255,0.05))'
                          : 'transparent',
                      fontWeight: s.value === value ? 600 : 400,
                      transition: 'background 0.1s, color 0.1s',
                    }}
                  >
                    {s.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
