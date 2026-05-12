import { useState } from "react";
import { useTranslation } from "react-i18next";
import OperationSelector from "../components/OperationSelectorComponent";
import type { SelectorOption } from "../components/OperationSelectorComponent";
import ItemIdInput from "../components/ItemIdInputComponent";
import NewValueInput from "../components/NewValueInputCompanent";
import type { FieldConfig } from "../components/NewValueInputCompanent";
import ResultLog from "../components/ResultLogComponent";
import type { ProfileUpdatableArea, ProfileUpdateResult } from "@shared/types/profile";
import type { ProductUpdateItem } from "@shared/types/product";
import { RefreshCw, Search } from "lucide-react";
import { api } from "../api";

export default function ProfileUpdatePage() {
  const { t } = useTranslation();

  // Güncelleme operasyonları — şu an sadece creditLimit mevcut
  const selectorOptions: SelectorOption<ProfileUpdatableArea>[] = [
    { value: 'creditLimit', label: t('profileUpdate.creditLimit'), group: t('profileUpdate.fieldsGroup') },
  ];

  // Her operasyon için input türü — creditLimit sayısal değer alır
  const fieldConfigs: Record<ProfileUpdatableArea, FieldConfig> = {
    creditLimit: {
      type: 'number',
      label: t('profileUpdate.creditLimit'),
      placeholder: t('profileUpdate.enterNewCreditLimit'),
    },
  };

  // ItemIdInput componentine geçilen etiketler — Account Number'a özgü metinler
  const itemIdLabels = {
    sectionTitle:       t('profileUpdate.selectIds'),
    idsLabel:           t('profileUpdate.accountIds'),
    idsPlaceholder:     t('profileUpdate.accountIdsPlaceholder'),
    uploadHint:         t('common.uploadExcelHint'),
    idCountSuffix:      t('profileUpdate.accountCountSuffix'),
    valueMatchedSuffix: t('profileUpdate.valueMatchedSuffix'),
  };

  const [operation, setOperation] = useState<ProfileUpdatableArea | null>(null);
  const [items, setItems] = useState<ProductUpdateItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [results, setResults] = useState<ProfileUpdateResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  // Operasyon değişince mevcut değerleri sıfırla
  const handleOperationChange = (op: ProfileUpdatableArea) => {
    setOperation(op);
    setItems((prev) => prev.map((item) => ({ ...item, value: "" })));
  };

  // Güncelle butonunun aktif olması için tüm item'ların değer girilmiş olması gerekir
  const allValuesFilled =
    items.length > 0 &&
    items.every((item) => item.value !== '' && item.value !== undefined && item.value !== null);

  // Oracle'dan mevcut kredi limitini SOAP üzerinden çekip input'lara doldurur
  const handleCheck = async () => {
    if (!operation || items.length === 0) return;

    setCheckLoading(true);
    try {
      const payload = {
        items: items.map((item) => ({ id: item.id })),
        operation,
      };
      const res = await api.post("/profile/values", payload);
      const values: { id: string; currentValue: string; status: "found" | "not_found" | "error" }[] = res.data;
      setItems((prev) =>
        prev.map((item) => {
          const found = values.find((v) => v.id === item.id && v.status === "found");
          return found ? { ...item, value: found.currentValue } : item;
        })
      );
      setResults(
        values.map((v) => ({
          id: v.id,
          success: v.status === "found",
          message:
            v.status === "found"     ? `${t("common.checkFound")}: ${v.currentValue}` :
            v.status === "not_found" ? t("common.checkNotFound") :
                                       t("common.checkError"),
        }))
      );
    } catch (err: any) {
      setResults([{ id: "-", success: false, message: err.message }]);
    } finally {
      setCheckLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!operation || items.length === 0 || !allValuesFilled) return;

    setResults([]);
    setLoading(true);

    try {
      // Payload: [{ id: "ACC-001", creditLimit: 5000 }, ...]
      // Backend → SOAP XML oluşturur → Oracle ReceivablesCustomerProfileService'e POST atar
      const payload = items.map((item) => ({
        id: item.id,
        [operation]: item.value,
      }));

      const res = await api.patch("/profile/bulk", payload);
      const raw = Array.isArray(res.data) ? res.data : [res.data];
      setResults(raw.map((r: ProfileUpdateResult) => ({
        ...r,
        message: r.success ? t("common.success") : t("common.error"),
      })));
    } catch (err: any) {
      setResults([{ id: "-", success: false, message: t("common.error") }]);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = operation !== null && items.length > 0 && allValuesFilled && !loading;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{t('profileUpdate.title')}</h2>
          <p className="page-desc">{t('profileUpdate.description')}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/*  Operasyon seç (creditLimit) */}
        <OperationSelector
          options={selectorOptions}
          value={operation}
          onChange={handleOperationChange}
          placeholder={t('profileUpdate.selectOperation')}
        />

        {/* Account Number listesi gir veya Excel yükle */}
        <ItemIdInput
          labels={itemIdLabels}
          items={items}
          onItemsChange={setItems}
          rawText={rawText}
          onRawTextChange={setRawText}
        />

        {/*  Her Account Number için yeni kredi limiti gir */}
        {operation && items.length > 0 && (
          <NewValueInput
            fieldConfig={fieldConfigs[operation]}
            items={items}
            onItemsChange={setItems}
            idLabel={t('profileUpdate.accountNumberLabel')}
          />
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={handleCheck}
            disabled={!operation || items.length === 0 || checkLoading || loading}
            style={{ minWidth: 140, gap: 8 }}
          >
            {checkLoading ? (
              <><div className="spinner" /> {t("common.checking")}</>
            ) : (
              <><Search size={15} /> {t("common.check")}</>
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={!canSubmit}
            style={{ minWidth: 160, gap: 8 }}
          >
            {loading ? (
              <><div className="spinner" /> {t('profileUpdate.processing')}</>
            ) : (
              <><RefreshCw size={15} /> {items.length > 0 ? `${items.length} ${t('profileUpdate.updateButton')}` : t('profileUpdate.updateButton')}</>
            )}
          </button>
        </div>

        {/* Güncelleme sonuçları — başarılı/hatalı listesi */}
        <ResultLog results={results} loading={loading} title={t('profileUpdate.results')} />
      </div>
    </div>
  );
}
