import { useState } from "react";
import OperationSelector from "../components/OperationSelectorComponent";
import ItemIdInput from "../components/ItemIdInputComponent";
import NewValueInput from "../components/NewValueInputCompanent";
import ResultLog from "../components/ResultLogComponent";
import type {
  ProductUpdatableArea,
  UpdateResult,
  UpdateItem,
} from "@shared/types/product";
import { RefreshCw } from "lucide-react";
import { api } from "../api";

export default function ProductUpdatePage() {
  const [operation, setOperation] = useState<ProductUpdatableArea | null>(null);
  const [envId, setEnvId] = useState("");
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOperationChange = (op: ProductUpdatableArea) => {
    setOperation(op);
    setItems((prev) => prev.map((item) => ({ ...item, value: "" }))); // önceki değerler varsa sıfırlar
  };

  const allValuesFilled =
    items.length > 0 &&
    items.every(
      (item) =>
        item.value !== "" && item.value !== undefined && item.value !== null
    );

  const handleUpdate = async () => {
    if (!operation || items.length === 0) return;
    if (!allValuesFilled) return;

    setResults([]); // önceki sonuçları temizle
    setLoading(true); // buton kilitlenir ve spinner gösterilir

    try {
      const payload = items.map((item) => ({
        id: item.id,
        [operation]: item.value,
      }));
      console.log("Gönderilen payload:", payload);

      const res = await api.post("/product/bulk", payload); // axios ile backend'e PATCH isteği gönderilir. payload → [{id: '123', stock: 50}, {id: '456', stock: 30}] gibi bir array olur. operation değişkenine göre stock veya location alanı gelir.
      console.log("API yanıtı:", res.data);

      setResults(res.data); // sonuçlar satet yazılır
    } catch (err: any) {
      setResults([{ id: "-", success: false, message: err.message }]);
    } finally {
      setLoading(false); // spinner durur buton açılır
    }
  };

  const canSubmit =
    operation !== null && items.length > 0 && allValuesFilled && !loading;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Toplu Ürün Güncelleme</h2>
          <p className="page-desc">Birden fazla ürünü aynı anda güncelleyin</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <OperationSelector value={operation} onChange={handleOperationChange} />

        <ItemIdInput
          envId={envId}
          onEnvIdChange={setEnvId}
          items={items}
          onItemsChange={setItems}
          rawText={rawText}
          onRawTextChange={setRawText}
        />

        {operation && items.length > 0 && (
          <NewValueInput
            operation={operation}
            items={items}
            onItemsChange={setItems}
          />
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={!canSubmit}
            style={{ minWidth: 160, gap: 8 }}
          >
            {loading ? (
              <>
                <div className="spinner" /> İşleniyor...
              </>
            ) : (
              <>
                <RefreshCw size={15} />{" "}
                {items.length > 0
                  ? `${items.length} Ürün Güncelle`
                  : "Güncelle"}
              </>
            )}
          </button>
        </div>

        <ResultLog results={results} loading={loading} />
      </div>
    </div>
  );
}
