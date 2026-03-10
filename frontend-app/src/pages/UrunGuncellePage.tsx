import { useState } from 'react';
import OperationSelector from '../components/OperationSelector';
import ItemIdInput from '../components/ItemIdInput';
import NewValueInput from '../components/NewValueInput';
import ResultLog from '../components/ResultLog';
import { bulkUpdate } from '../services/bulkUpdateService';
import type { OperationType, UpdateResult } from '../services/bulkUpdateService';
import { RefreshCw } from 'lucide-react';

export default function UrunGuncellePage() {
  const [operasyon, setOperasyon] = useState<OperationType | null>(null);
  const [envId, setEnvId] = useState('');
  const [ids, setIds] = useState<string[]>([]);
  const [rawText, setRawText] = useState('');
  const [yeniDeger, setYeniDeger] = useState('');
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOperasyonChange = (op: OperationType) => {
    setOperasyon(op);
    setYeniDeger('');
  };

  const handleGuncelle = async () => {
    if (!operasyon || ids.length === 0 || yeniDeger === '') return;

    setResults([]);
    setLoading(true);

    await bulkUpdate(
      ids,
      { operasyon, yeniDeger, envId: envId || undefined },
      (result) => setResults((prev) => [...prev, result])
    );

    setLoading(false);
  };

  const canSubmit = operasyon !== null && ids.length > 0 && yeniDeger !== '' && !loading;

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
          ids={ids}
          onIdsChange={setIds}
          rawText={rawText}
          onRawTextChange={setRawText}
        />

        {/* 3 — Yeni Değer (sadece operasyon seçiliyse göster) */}
        {operasyon && (
          <NewValueInput
            operasyon={operasyon}
            value={yeniDeger}
            onChange={setYeniDeger}
          />
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
              : <><RefreshCw size={15} /> {ids.length > 0 ? `${ids.length} Ürün Güncelle` : 'Güncelle'}</>
            }
          </button>
        </div>

        {/* 4 — Sonuç Logu */}
        <ResultLog results={results} loading={loading} />
      </div>
    </div>
  );
}
