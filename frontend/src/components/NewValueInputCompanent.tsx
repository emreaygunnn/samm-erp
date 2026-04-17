import { useState } from 'react';
import type { ProductUpdatableArea } from '@shared/types';
import type { UpdateItem } from '@shared/types/product';
import { CopyCheck } from 'lucide-react';

interface Props {
    operation: ProductUpdatableArea;
    items: UpdateItem[];
    onItemsChange: (items: UpdateItem[]) => void;

}

const SITUATION_OPTIONS: Record<ProductUpdatableArea,{label:string; type: 'text' |'number' | 'select' ; placeholder?: string }> = {
location: {label:"Lokasyon", type:"text", placeholder:"Yeni lokasyon girin"},/* Record<ProductUpdatableArea, ...> → Her operasyon için ayar tanımla.
                                                                                Her ayar üç şey tutuyor:
                                                                                label → Tablo başlığında ne yazsın? "Stok" veya "Lokasyon"
                                                                                type → Input tipi. "number" olursa sadece sayı girilebilir, "text" olursa her şey
                                                                                placeholder → Input boşken görünen soluk yazı*/
stock: {label:"Stok", type:"number", placeholder:"Yeni stok adedi girin"},
description: {label:"Açıklama", type:"text", placeholder:"Yeni açıklama girin"},
}


export default function NewValueInput({operation,items,onItemsChange}:Props){
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

// ── Açıklama için checkbox ve değer güncelle ──
const handleDescriptionChange = (id: string, key: 'a' | 'b' | 'c', checked: boolean, value: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const selectedDescriptions = item.selectedDescriptions || { a: false, b: false, c: false };
        const descriptionValues = item.descriptionValues || { a: '', b: '', c: '' };
        return {
          ...item,
          selectedDescriptions: { ...selectedDescriptions, [key]: checked },
          descriptionValues: { ...descriptionValues, [key]: value },
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
      // Açıklama için özel UI
      const selected = item.selectedDescriptions || { a: false, b: false, c: false };
      const values = item.descriptionValues || { a: '', b: '', c: '' };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(['a', 'b', 'c'] as const).map((key) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={selected[key]}
                onChange={(e) => handleDescriptionChange(item.id, key, e.target.checked, values[key])}
              />
              <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                {key.toUpperCase()}
              </label>
              <input
                className="form-input"
                type="text"
                placeholder={`Açıklama ${key.toUpperCase()} için yeni değer`}
                value={values[key]}
                onChange={(e) => handleDescriptionChange(item.id, key, selected[key], e.target.value)}
                disabled={!selected[key]}
                style={{ flex: 1 }}
              />
            </div>
          ))}
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