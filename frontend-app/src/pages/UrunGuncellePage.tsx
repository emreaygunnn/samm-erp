import { useState } from 'react';
import OperationSelector from '../components/OperationSelector';
import ItemIdInput from '../components/ItemIdInput';
import NewValueInput from '../components/NewValueInput';
import ResultLog from '../components/ResultLog';
import { bulkUpdate } from '../services/bulkUpdateService';
import type { OperationType, UpdateResult, UpdateItem } from '../services/bulkUpdateService';
import { RefreshCw } from 'lucide-react';

export default function UrunGuncellePage() {
  const [operasyon, setOperasyon] = useState<OperationType | null>(null);
  const [envId, setEnvId] = useState('');
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [rawText, setRawText] = useState('');
  const [yeniDeger, setYeniDeger] = useState('');
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOperasyonChange = (op: OperationType) => {
    setOperasyon(op);
    setYeniDeger('');
  };

  // ── Değeri olmayan item var mı? ──
  // Excel'den gelenler dolu, elle girilenler boş olabilir
  const tumDegerliMi = items.length > 0 && items.every(
    (item) => item.value !== '' && item.value !== undefined && item.value !== null
  );

  // ── Genel değer gerekli mi? ──
  // Tüm item'ların kendi değeri varsa genel değer gerekmez
  // En az bir tanesinin değeri boşsa genel değer zorunlu
  const genelDegerGerekli = !tumDegerliMi;

  const handleGuncelle = async () => {
    if (!operasyon || items.length === 0) return;

    // Genel değer gerekli ama girilmemişse çık
    if (genelDegerGerekli && yeniDeger === '') return;

    setResults([]);
    setLoading(true);

    await bulkUpdate(
      items,
      { operasyon, yeniDeger, envId: envId || undefined },
      (result) => setResults((prev) => [...prev, result])
    );

    setLoading(false);
  };

  // ── Buton aktiflik kontrolü ──
  // Operasyon seçili + en az 1 item var + (tüm değerler doluysa VEYA genel değer girilmişse) + loading değil
  const canSubmit =
    operasyon !== null &&
    items.length > 0 &&
    (tumDegerliMi || yeniDeger !== '') &&
    !loading;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Toplu Ürün Güncelleme</h2>
          <p className="page-desc">Birden fazla ürünü aynı anda güncelleyin</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 1 — İşlem Türü */}
        <OperationSelector value={operasyon} onChange={handleOperasyonChange} />

        {/* 2 — ID Listesi */}
        <ItemIdInput
          envId={envId}
          onEnvIdChange={setEnvId}
          items={items}
          onItemsChange={setItems}
          rawText={rawText}
          onRawTextChange={setRawText}
        />

        {/* 3 — Yeni Değer */}
        {/* Operasyon seçiliyse göster, ama tüm değerler Excel'den geldiyse opsiyonel olduğunu belirt */}
        {operasyon && (
          <div>
            <NewValueInput
              operasyon={operasyon}
              value={yeniDeger}
              onChange={setYeniDeger}
            />
            {tumDegerliMi && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)', paddingLeft: 4 }}>
                ℹ Tüm ürünlerin değeri Excel'den geldi. Genel değer girerseniz sadece değeri boş olanlara uygulanır.
              </div>
            )}
          </div>
        )}

        {/* Güncelle Butonu */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btn-primary"
            onClick={handleGuncelle}
            disabled={!canSubmit}
            style={{ minWidth: 160, gap: 8 }}
          >
            {loading
              ? <><div className="spinner" /> İşleniyor...</>
              : <><RefreshCw size={15} /> {items.length > 0 ? `${items.length} Ürün Güncelle` : 'Güncelle'}</>
            }
          </button>
        </div>

        {/* 4 — Sonuç Logu */}
        <ResultLog results={results} loading={loading} />
      </div>
    </div>
  );
}