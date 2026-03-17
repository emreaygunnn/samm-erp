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
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOperasyonChange = (op: OperationType) => {
    setOperasyon(op);
    setItems((prev) => prev.map((item) => ({ ...item, value: '' })));
  };

  const tumDegerliMi = items.length > 0 && items.every(
    (item) => item.value !== '' && item.value !== undefined && item.value !== null
  );

  const handleGuncelle = async () => {
    if (!operasyon || items.length === 0) return;
    if (!tumDegerliMi) return;

    setResults([]);
    setLoading(true);

    await bulkUpdate(
      items,
      { operasyon, yeniDeger: '', envId: envId || undefined },
      (result) => setResults((prev) => [...prev, result])
    );

    setLoading(false);
  };

  const canSubmit =
    operasyon !== null &&
    items.length > 0 &&
    tumDegerliMi &&
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
        <OperationSelector value={operasyon} onChange={handleOperasyonChange} />

        <ItemIdInput
          envId={envId}
          onEnvIdChange={setEnvId}
          items={items}
          onItemsChange={setItems}
          rawText={rawText}
          onRawTextChange={setRawText}
        />

        {operasyon && items.length > 0 && (
          <NewValueInput
            operasyon={operasyon}
            items={items}
            onItemsChange={setItems}
          />
        )}

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

        <ResultLog results={results} loading={loading} />
      </div>
    </div>
  );
}
