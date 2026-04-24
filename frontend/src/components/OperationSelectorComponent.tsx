import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import type { ProductUpdatableArea } from '@shared/types/product';

interface Option {
  value: ProductUpdatableArea;
  label: string;   // kullanıcının gördüğü metin  
  group: string;
}   

interface Props{//props:fonksiyonlara dışarıdan verilen emirler ve bilgiler paketi.
    value: ProductUpdatableArea | null;// mevcut seçili olan değer hangisi (dışarıdan gelir)
    onChange: (op:ProductUpdatableArea)=>void; // onChange = seçilen değeri yukarı (parent component(ÜRÜNGÜNCELLEPAGE)) yollayacak fonksiyon - void çünkü geri cevap beklemiyor 


} 

export  default function OpeationSelector({value,onChange}:Props){
  const { t } = useTranslation();
  
  const OPTIONS : Option[] =[
    {value:"stock", label: t('productUpdate.stock'), group:'items'},
    {value: 'location', label: t('productUpdate.location'), group:'items'},
    {value: 'description', label: t('productUpdate.description'), group:'items'},
  ]

  // grupları sırayla al
  const GROUPS = Array.from(new Set(OPTIONS.map((o) => o.group))); // options içindeki grupları al tekrarları sil ve array yap

  const [open,setOpen]=useState(false);// dropdown menü açık mı kapalı mı kapalı olsun
  const [hovered,setHovered] = useState <ProductUpdatableArea | null>(null);// Mouse hangi seçeneğin üstünde? Hover efekti için.
  const containerRef = useRef<HTMLDivElement>(null);// dropdown menünün dışına tıklayınca kapanması için
  const selected = OPTIONS.find((o) => o.value === value); //value = "stock" ise secili = { value: "stock", label: "Stok Güncelle", group: "Items" }

  // dışarı tıklayınca kapanması için
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };  
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (op: ProductUpdatableArea) => { // parent'a bildir (onChange) ve dropdown'ı kapat (setOpen(false)).
    onChange(op);
    setOpen(false);
  }; return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
        {t('operationType')}
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
            color: selected ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 14,
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'border-color 0.15s',
          }}
        >
          <span>
            {selected
              ? <><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{selected.group} — </span>{selected.label}</>
              : t('productUpdate.selectOperation')
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
              background: 'black',
              border: '1.5px solid var(--border)',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}
          >
            {GROUPS.map((grup, gi) => (
              <div key={grup}>
                {/* Grup başlığı */}
                {gi > 0 && (
                  <div style={{ height: 1, background: 'var(--border)', margin: '0 12px' }} />
                )}
                <div style={{ padding: '8px 14px 4px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  {grup}
                </div>

                {/* Grup seçenekleri */}
                {OPTIONS.filter((s) => s.group === grup).map((s) => (
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
