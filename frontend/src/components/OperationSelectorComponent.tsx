import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';

// T extends string → bu component hangi tip üzerinde çalışacağını dışarıdan öğrenir.
// Örnek: ProductUpdatableArea, CustomerUpdatableArea, ContactUpdatableArea...
// Sayfa kendi tipini belirler, component hiçbir şey bilmek zorunda değil.
export interface SelectorOption<T extends string> {
  value: T;      // seçenek seçildiğinde onChange'e gönderilecek ham değer  (örn. "stock", "email")
  label: string; // kullanıcının dropdown'da gördüğü metin — t() ile çevrilmiş gelir
  group: string; // dropdown içinde bölüm başlığı         — t() ile çevrilmiş gelir
}

// Props da generic: hangi sayfa kullanırsa kendi T tipini enjekte eder.
// Böylece onChange callback'i de doğru tiple type-safe olur.
interface Props<T extends string> {
  options: SelectorOption<T>[];  // seçenek listesi — sayfadan gelir, burada hardcode yok
  value: T | null;               // seçili olan değer (null = hiçbir şey seçilmedi)
  onChange: (op: T) => void;     // seçim değişince üst bileşene bildir
  placeholder?: string;          // seçim yapılmamışken gösterilen yazı — t() ile çevrilmiş gelir
}

// <T extends string> → TSX'de <T> tek başına JSX tag'iyle karışır, bu yüzden "extends string" eklenir
export default function OperationSelector<T extends string>({ options, value, onChange, placeholder }: Props<T>) {
  const { t } = useTranslation();

  // Seçeneklerin group alanlarından benzersiz grup listesi çıkar (sırayı korur)
  const groups = Array.from(new Set(options.map((o) => o.group)));

  const [open, setOpen] = useState(false);           // dropdown açık mı?
  const [hovered, setHovered] = useState<T | null>(null); // hover efekti için hangi seçenek
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value); // seçili option objesi (label'a ulaşmak için)

  // Dropdown dışına tıklanınca kapat
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (op: T) => {
    onChange(op);   // üst bileşene seçilen değeri ilet
    setOpen(false); // dropdown'ı kapat
  };

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      {/* Sabit etiket — "İşlem Türü" / "Operation Type" */}
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        {t('operationType')}
      </label>

      <div ref={containerRef} style={{ position: 'relative', maxWidth: 360 }}>
        {/* Trigger butonu: seçili option'ı gösterir, yoksa placeholder */}
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 14px',
            borderRadius: 8,
            border: open ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
            background: 'var(--surface)',
            color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 14,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color 0.15s',
          }}
        >
          <span>
            {selected
              // Seçili varsa: "Ürün Alanları — Stok" formatında göster
              ? <><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{selected.group} — </span>{selected.label}</>
              // Seçili yoksa: prop'tan gelen placeholder ya da ortak fallback
              : (placeholder ?? t('common.selectOperation'))
            }
          </span>
          {/* Ok ikonu — açıkken 180° döner */}
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

        {/* Dropdown listesi — sadece open=true iken render edilir */}
        {open && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 50,
              background: 'black',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}
          >
            {/* Her grubu ayrı blok olarak render et */}
            {groups.map((group, gi) => (
              <div key={group}>
                {/* Gruplar arası ince ayırıcı çizgi (ilk gruptan önce çizgi yok) */}
                {gi > 0 && (
                  <div style={{ height: 1, background: 'var(--border)', margin: '0 12px' }} />
                )}
                {/* Grup başlığı */}
                <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {group}
                </div>

                {/* O gruba ait seçenekler */}
                {options.filter((o) => o.group === group).map((o) => (
                  <div
                    key={o.value}
                    onMouseEnter={() => setHovered(o.value)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => handleSelect(o.value)}
                    style={{
                      padding: '8px 14px 8px 24px',
                      fontSize: 14,
                      cursor: 'pointer',
                      // Seçili > hover > normal sıralamasıyla renk belirle
                      color: o.value === value
                        ? 'var(--accent-hover)'
                        : hovered === o.value
                          ? 'var(--text-primary)'
                          : 'var(--text-secondary)',
                      background: o.value === value
                        ? 'var(--accent-dim)'
                        : hovered === o.value
                          ? 'var(--bg-hover, rgba(255,255,255,0.05))'
                          : 'transparent',
                      fontWeight: o.value === value ? 600 : 400,
                      transition: 'background 0.1s, color 0.1s',
                    }}
                  >
                    {o.label}
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
