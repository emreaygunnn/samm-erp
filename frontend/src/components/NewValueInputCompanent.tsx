import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProductUpdateItem } from '@shared/types/product';
import { CopyCheck } from 'lucide-react';

// FieldConfig → hangi tür input gösterileceğini tanımlayan union tip.
// Sayfa, seçili operasyon için doğru config'i oluşturup prop olarak gönderir.
// Component bu config'e bakarak hangi input'u render edeceğine karar verir.
//
//   'text'          → düz metin kutusu        (email, location, currencyCode...)
//   'number'        → sayı kutusu             (stock...)
//   'select'        → açılır liste            (status: Active/Passive...)
//   'text-with-code'→ dropdown + metin kutusu (description + organizasyon kodu...)
//
// Yeni bir entity eklendiğinde (Contact, Profile...) sadece sayfada
// doğru FieldConfig'i tanımlamak yeterli — bu component'e dokunulmaz.
export type FieldConfig =
  | { type: 'text';           label: string; placeholder?: string }
  | { type: 'number';         label: string; placeholder?: string }
  | { type: 'select';         label: string; placeholder?: string; selectOptions: { value: string; label: string }[] }
  | { type: 'text-with-code'; label: string; placeholder?: string; codeOptions: { value: string; label: string }[]; codePlaceholder?: string };

// ProductUpdateItem: { id, value, organizationCode?, statusValue? }
// Hem product hem customer için kullanılır. Customer'da opsiyonel alanlar boş kalır.
interface Props {
  fieldConfig: FieldConfig;
  items: ProductUpdateItem[];
  onItemsChange: (items: ProductUpdateItem[]) => void;
  idLabel?: string; // ID sütunu başlığı — belirtilmezse "ID" yazar
}

export default function NewValueInput({ fieldConfig, items, onItemsChange, idLabel = 'ID' }: Props) {
  const { t } = useTranslation();
  const [bulkValue, setBulkValue] = useState(''); // "Tümüne Uygula" satırındaki geçici değer

  // Tek bir item'ın value alanını güncelle
  const handleItemValueChange = (id: string, newValue: string | number) => {
    onItemsChange(items.map((item) => item.id === id ? { ...item, value: newValue } : item));
  };

  // 'text-with-code' tipinde: item'ın organizationCode alanını güncelle
  // code: string gelir, ProductUpdateItem'daki "A"|"B"|"C" union tipine cast edilir
  const handleCodeChange = (id: string, code: string) => {
    onItemsChange(items.map((item) =>
      item.id === id ? { ...item, organizationCode: code as 'A' | 'B' | 'C' } : item
    ));
  };

  // "Tümüne Uygula" → bulkValue'yu tüm item'lara yaz
  const handleApply = () => {
    if (bulkValue === '') return;
    onItemsChange(items.map((item) => ({ ...item, value: bulkValue })));
  };

  // ── "Tümüne Uygula" satırı için input ──
  // fieldConfig.type'a göre hangi input render edileceğine karar verir
  const renderBulkInput = () => {
    if (fieldConfig.type === 'select') {
      // select tipinde: aynı dropdown seçeneklerini göster
      return (
        <select
          className="form-input"
          value={bulkValue}
          onChange={(e) => setBulkValue(e.target.value)}
          style={{ width: '100%', color: 'var(--text-primary)', background: 'var(--bg-secondary)' }}
        >
          <option value="">{fieldConfig.placeholder ?? ''}</option>
          {fieldConfig.selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    // text, number ve text-with-code → düz input (text-with-code'da sadece değer kısmı uygulanır)
    return (
      <input
        className="form-input"
        type={fieldConfig.type === 'text-with-code' ? 'text' : fieldConfig.type}
        placeholder={t('common.applyAll')}
        value={bulkValue}
        onChange={(e) => setBulkValue(e.target.value)}
        min={fieldConfig.type === 'number' ? 0 : undefined}
        style={{ width: '100%' }}
      />
    );
  };

  // ── Her satır için input ──
  // fieldConfig.type'a göre o satıra özel input render eder
  const renderInput = (item: ProductUpdateItem) => {
    if (fieldConfig.type === 'text-with-code') {
      // Önce kod seçilir, sonra metin yazılır; metin kutusu kod seçilmeden disabled
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <select
            className="form-input"
            value={item.organizationCode ?? ''}
            onChange={(e) => handleCodeChange(item.id, e.target.value)}
            style={{ width: '100%', color: 'var(--text-primary)', background: 'var(--bg-secondary)', colorScheme: 'dark' }}
          >
            <option value="">{fieldConfig.codePlaceholder ?? ''}</option>
            {fieldConfig.codeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            className="form-input"
            type="text"
            placeholder={fieldConfig.placeholder}
            value={String(item.value ?? '')}
            onChange={(e) => handleItemValueChange(item.id, e.target.value)}
            disabled={!item.organizationCode} // kod seçilmeden metin yazılamaz
            style={{ width: '100%' }}
          />
        </div>
      );
    }
    if (fieldConfig.type === 'select') {
      return (
        <select
          className="form-input"
          value={item.value ?? ''}
          onChange={(e) => handleItemValueChange(item.id, e.target.value)}
          style={{ width: '100%', color: 'var(--text-primary)', background: 'var(--bg-secondary)', colorScheme: 'dark' }}
        >
          <option value="">{fieldConfig.placeholder ?? ''}</option>
          {fieldConfig.selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    }
    // text ve number → tek satır input
    return (
      <input
        className="form-input"
        type={fieldConfig.type}
        placeholder={fieldConfig.placeholder}
        value={String(item.value ?? '')}
        onChange={(e) => handleItemValueChange(item.id, e.target.value)}
        min={fieldConfig.type === 'number' ? 0 : undefined}
        style={{ width: '100%' }}
      />
    );
  };

  // Hiç item yoksa component'i render etme
  if (items.length === 0) return null;

  // Kaç item'ın değeri dolu?
  const filledCount = items.filter((item) => item.value !== '' && item.value !== undefined && item.value !== null).length;

  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {t('common.newValues')}
        </h3>
        {/* Kaç değer girildiğini göster — hiç girilmediyse gizle */}
        {filledCount > 0 && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {filledCount}/{items.length} {t('common.valueEntered')}
          </span>
        )}
      </div>

      {/* ── Tümüne Uygula satırı ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: 'var(--bg-hover, rgba(255,255,255,0.03))', border: '1px dashed var(--border)' }}>
        <div style={{ flex: 1 }}>{renderBulkInput()}</div>
        <button
          className="btn btn-secondary"
          onClick={handleApply}
          disabled={bulkValue === ''}
          style={{ flexShrink: 0, gap: 6 }}
        >
          <CopyCheck size={14} /> {t('common.applyToAll')}
        </button>
      </div>

      {/* ── ID — Değer tablosu ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', width: '40%' }}>
                {idLabel}
              </th>
              {/* Sütun başlığı fieldConfig'den gelir: "Stok", "E-posta", "Telefon"... */}
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {fieldConfig.label}
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                  {item.id}
                  {/* Değer girilmişse küçük bir nokta işareti göster */}
                  {item.value !== '' && (
                    <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent-hover)', opacity: 0.7 }}>●</span>
                  )}
                </td>
                <td style={{ padding: '6px 12px' }}>{renderInput(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
