import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  const [operation, setOperation] = useState<ProductUpdatableArea | null>(null);
  const [items, setItems] = useState<UpdateItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [results, setResults] = useState<UpdateResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOperationChange = (op: ProductUpdatableArea) => {
    setOperation(op);
    setItems((prev) => prev.map((item) => ({ ...item, value: "" }))); // önceki değerler varsa sıfırlar
  };

  const isDescriptionItemFilled = (item: UpdateItem) => {
    // organizationCode seçili mi ve description dolu mu
    return item.organizationCode !== undefined && item.value !== '' && item.value !== undefined && item.value !== null;
  };

  const allValuesFilled = // tüm item'ların değerlerinin dolu olup olmadığını kontrol eder
    items.length > 0 &&
    items.every((item) => {
      if (operation === 'description') {
        return isDescriptionItemFilled(item);
      }
      return item.value !== '' && item.value !== undefined && item.value !== null;
    });

  const handleUpdate = async () => {
    if (!operation || items.length === 0) return;
    if (!allValuesFilled) return;

    console.log("[UpdateProductPage] Items state:", items);
    console.log("[UpdateProductPage] Operation:", operation);

    setResults([]); // önceki sonuçları temizle
    setLoading(true); // buton kilitlenir ve spinner gösterilir

    try {
      const payload = items.map((item) => {
        if (operation === 'description') {
          // Açıklama için payload - organizationCode + description
          return {
            id: item.id,
            organizationCode: item.organizationCode,
            description: item.value,
          };
        } else {
          // Normal payload
          return {
            id: item.id,
            [operation]: item.value,
          };
        }
      });
      console.log("[UpdateProductPage] Gönderilen payload:", payload);

      const res = await api.patch("/product/bulk", payload);
      console.log("[UpdateProductPage] API yanıtı:", res.data);

      // Eğer backend object dönmüşse array'e dönüştür
      const results = Array.isArray(res.data) ? res.data : [res.data];
      setResults(results);
      console.log("[UpdateProductPage] Results state güncelleştirildi");
    } catch (err: any) {
      console.error("[UpdateProductPage] Hata:", err.message, err);
      setResults([{ id: "-", success: false, message: err.message }]);
    } finally {
      setLoading(false);
      console.log("[UpdateProductPage] Loading false ayarlandı");
    }
  };

  const canSubmit =
    operation !== null && items.length > 0 && allValuesFilled && !loading;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{t('productUpdate.title')}</h2>
          <p className="page-desc">{t('productUpdate.description')}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <OperationSelector value={operation} onChange={handleOperationChange} />

        <ItemIdInput
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
                <div className="spinner" /> {t('productUpdate.processing')}
              </>
            ) : (
              <>
                <RefreshCw size={15} />{" "}
                {items.length > 0
                  ? `${items.length} ${t('productUpdate.updateButton')}`
                  : t('productUpdate.updateButton')}
              </>
            )}
          </button>
        </div>

        <ResultLog results={results} loading={loading} />
      </div>
    </div>
  );
}
