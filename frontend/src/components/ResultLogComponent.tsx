import { CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProductUpdateResult } from '@shared/types/product';

interface Props {
  results: ProductUpdateResult[];
  loading: boolean;
  title?: string; // belirtilmezse productUpdate.results anahtarı kullanılır
}

export default function ResultLog({ results, loading, title }: Props) {
  const { t } = useTranslation();
  
  if (results.length === 0 && !loading) return null;

  const basarili = results.filter((r) => r.success).length;// sonuçlar içinde success olanların sayısı
  const hata = results.filter((r) => !r.success).length;// sonuçlar içinde success olmayanların sayısı

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title ?? t('productUpdate.results')}
        </h3>
        {results.length > 0 && (
          <div style={{ display: 'flex', gap: 10, fontSize: 13 }}>
            <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ {basarili} {t('productUpdate.successful')}</span>
            {hata > 0 && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>✗ {hata} {t('productUpdate.failed')}</span>}
          </div>
        )}
      </div>

      {loading && results.length === 0 && (
        <div className="loading-page" style={{ padding: '20px 0' }}>
          <div className="spinner" />
          <span>{t('productUpdate.processing')}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
        {results.map((r, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              background: r.success
                ? 'color-mix(in srgb, #22c55e 8%, transparent)'
                : 'color-mix(in srgb, var(--danger) 8%, transparent)',
              border: `1px solid ${r.success ? '#22c55e33' : 'color-mix(in srgb, var(--danger) 35%, transparent)'}`,
            }}
          >
            {r.success
              ? <CheckCircle size={15} color="#22c55e" style={{ flexShrink: 0 }} />
              : <XCircle size={15} color="var(--danger)" style={{ flexShrink: 0 }} />
            }
            <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0 }}>
              {r.id}
            </span>
            <span style={{ fontSize: 13, color: r.success ? '#22c55e' : 'var(--danger)' }}>
              {r.message}
            </span>
          </div>
        ))}

        {/* Aktif işlem spinner'ı (sonuçlar gelirken altta göster) */}
        {loading && results.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', color: 'var(--text-muted)', fontSize: 13 }}>
            <div className="spinner" style={{ width: 14, height: 14 }} />
            {t('productUpdate.processing')}
          </div>
        )}
      </div>
    </div>
  );
}
