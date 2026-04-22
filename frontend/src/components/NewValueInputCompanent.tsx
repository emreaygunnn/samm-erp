import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProductUpdatableArea } from '@shared/types';
import type { UpdateItem } from '@shared/types/product';
import { CopyCheck } from 'lucide-react';

interface Props {
    operation: ProductUpdatableArea;
    items: UpdateItem[];
    onItemsChange: (items: UpdateItem[]) => void;

}

export default function NewValueInput({operation,items,onItemsChange}:Props){
    const { t } = useTranslation();
    
    const SITUATION_OPTIONS: Record<ProductUpdatableArea,{label:string; type: 'text' |'number' | 'select' ; placeholder?: string }> = {
        location: {label: t('productUpdate.location'), type:"text", placeholder: t('productUpdate.enterNewLocation')},
        stock: {label: t('productUpdate.stock'), type:"number", placeholder: t('productUpdate.enterNewStock')},
        description: {label: t('productUpdate.description'), type:"text", placeholder: t('productUpdate.enterNewDescription')},
    }
    
    const cfg = SITUATION_OPTIONS[operation];
// tümüne uygula için geçici değer
const[bulkValue,setBulkValue] =useState("");

// ── Tek bir item'ın değerini güncelle ──
const handleItemValueChange = (id: string, newValue: string | number) => {
    const updated = items.map((item) => 
      item.id === id ? { ...item, value: newValue } : item
    );
    onItemsChange(updated);
  };

// ── Açıklama için organizasyon kodu seç ──
const handleOrganizationCodeChange = (id: string, code: "A" | "B" | "C") => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          organizationCode: code,
        };
      }
      return item;
    });
    onItemsChange(updated);
  };

// // ── Tümüne Uygula ──
const handleHandleApply= () => {
    if (bulkValue === '') return;
    const updated = items.map((item) => ({ ...item, value: bulkValue }));
    onItemsChange(updated);
  };
    
  // ── "Tümüne Uygula" satırı için input ──
  const renderBulkInput = () => {
    if (cfg.type === 'select') {

        return null;
        // SELECT henüz implement edilmedi
      /* return (
        {/* <select
          className="form-input"
          value={bulkValue}
          onChange={(e) => setBulkValue(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="">— Seç —</option>
          {SITUATION_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select> }
      ); */
    }

    return (
      <input
        className="form-input"
        type={cfg.type}
        placeholder={`Tümüne uygulanacak ${cfg.label.toLowerCase()}...`}
        value={bulkValue}
        onChange={(e) => setBulkValue(e.target.value)}
        min={cfg.type === 'number' ? 0 : undefined}
        style={{ width: '100%' }}
      />
    );
  };

  // ── Tek satır için input — her item kendi değerini okur ──
  const renderInput = (item: UpdateItem) => {
    if (operation === 'description') {
      // Açıklama için özel UI - organizasyon kodu dropdown seçimi
      const selectedCode = item.organizationCode;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Organizasyon Dropdown Seçimi */}
          <select
            className="form-input"
            value={selectedCode || ''}
            onChange={(e) => handleOrganizationCodeChange(item.id, e.target.value as 'A' | 'B' | 'C')}
            style={{ 
              width: '100%',
              color: 'var(--text-primary)',
              background: 'var(--bg-secondary)',
              colorScheme: 'dark'
            }}
          >
            <option value="">{t('productUpdate.organizationSelect')}</option>
            <option value="A">{t('productUpdate.organizationA')}</option>
            <option value="B">{t('productUpdate.organizationB')}</option>
            <option value="C">{t('productUpdate.organizationC')}</option>
          </select>

          {/* Açıklama Input */}
          <input
            className="form-input"
            type="text"
            placeholder={t('productUpdate.descriptionForOrg')}
            value={String(item.value ?? '')}
            onChange={(e) => handleItemValueChange(item.id, e.target.value)}
            disabled={!selectedCode}
            style={{ width: '100%' }}
          />
        </div>
      );
    }

    const val = String(item.value ?? '');
    return (
      <input
        className="form-input"
        type={cfg.type}
        placeholder={cfg.placeholder}
        value={val}
        onChange={(e) => handleItemValueChange(item.id, e.target.value)}
        min={cfg.type === 'number' ? 0 : undefined}
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
          {renderBulkInput()}
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleHandleApply}
          disabled={bulkValue === ''}
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