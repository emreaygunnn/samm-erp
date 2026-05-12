import { useState } from "react";
import { useTranslation } from "react-i18next";
import OperationSelector from "../components/OperationSelectorComponent";
import type { SelectorOption } from "../components/OperationSelectorComponent";
import ItemIdInput from "../components/ItemIdInputComponent";
import NewValueInput from "../components/NewValueInputCompanent";
import type { FieldConfig } from "../components/NewValueInputCompanent";
import ResultLog from "../components/ResultLogComponent";
import type { CustomerUpdatableArea, CustomerUpdateResult } from "@shared/types/customer";
import type { ProductUpdateItem } from "@shared/types/product";
import { RefreshCw, Search } from "lucide-react";
import { api } from "../api";

export default function CustomerUpdatePage() {
  const { t } = useTranslation();

  const selectorOptions: SelectorOption<CustomerUpdatableArea>[] = [
    { value: 'email',        label: t('customerUpdate.email'),        group: t('customerUpdate.fieldsGroup') },
    { value: 'phoneNumber',  label: t('customerUpdate.phoneNumber'),  group: t('customerUpdate.fieldsGroup') },
    { value: 'currencyCode', label: t('customerUpdate.currencyCode'), group: t('customerUpdate.fieldsGroup') },
  ];

  const fieldConfigs: Record<CustomerUpdatableArea, FieldConfig> = {
    email: {
      type: 'text',
      label: t('customerUpdate.email'),
      placeholder: t('customerUpdate.enterNewEmail'),
    },
    phoneNumber: {
      type: 'text',
      label: t('customerUpdate.phoneNumber'),
      placeholder: t('customerUpdate.enterNewPhoneNumber'),
    },
    currencyCode: {
      type: 'select',
      label: t('customerUpdate.currencyCode'),
      placeholder: t('customerUpdate.selectCurrencyCode'),
      selectOptions: [
        { value: 'TRY', label: 'TRY — Türk Lirası' },
        { value: 'USD', label: 'USD — Amerikan Doları' },
        { value: 'EUR', label: 'EUR — Euro' },
      ],
    },
  };

  const itemIdLabels = {
    sectionTitle:        t('customerUpdate.selectIds'),
    idsLabel:            t('customerUpdate.customerIds'),
    idsPlaceholder:      t('customerUpdate.customerIdsPlaceholder'),
    uploadHint:          t('common.uploadExcelHint'),
    idCountSuffix:       t('customerUpdate.partyNumberCountSuffix'),
    valueMatchedSuffix:  t('customerUpdate.partyNumberValueMatched'),
  };

  const [operation, setOperation] = useState<CustomerUpdatableArea | null>(null);
  const [items, setItems] = useState<ProductUpdateItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [results, setResults] = useState<CustomerUpdateResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  const handleOperationChange = (op: CustomerUpdatableArea) => {
    setOperation(op);
    setItems((prev) => prev.map((item) => ({ ...item, value: "" })));
  };

  const allValuesFilled =
    items.length > 0 &&
    items.every((item) => item.value !== '' && item.value !== undefined && item.value !== null);

  // Oracle'dan mevcut değerleri çekip input'lara doldurur
  const handleCheck = async () => {
    if (!operation || items.length === 0) return;

    setCheckLoading(true);
    try {
      const payload = {
        items: items.map((item) => ({ id: item.id })),
        operation,
      };
      const res = await api.post("/customer/values", payload);
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
      const payload = items.map((item) => ({
        id: item.id,
        [operation]: item.value,
      }));

      const res = await api.patch("/customer/bulk", payload);
      const raw = Array.isArray(res.data) ? res.data : [res.data];
      setResults(raw.map((r: CustomerUpdateResult) => ({
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
          <h2 className="page-title">{t('customerUpdate.title')}</h2>
          <p className="page-desc">{t('customerUpdate.description')}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <OperationSelector
          options={selectorOptions}
          value={operation}
          onChange={handleOperationChange}
          placeholder={t('customerUpdate.selectOperation')}
        />

        <ItemIdInput
          labels={itemIdLabels}
          items={items}
          onItemsChange={setItems}
          rawText={rawText}
          onRawTextChange={setRawText}
        />

        {operation && items.length > 0 && (
          <NewValueInput
            fieldConfig={fieldConfigs[operation]}
            items={items}
            onItemsChange={setItems}
            idLabel={t('customerUpdate.partyNumberLabel')}
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
              <><div className="spinner" /> {t('customerUpdate.processing')}</>
            ) : (
              <><RefreshCw size={15} /> {items.length > 0 ? `${items.length} ${t('customerUpdate.updateButton')}` : t('customerUpdate.updateButton')}</>
            )}
          </button>
        </div>

        <ResultLog results={results} loading={loading} title={t('customerUpdate.results')} />
      </div>
    </div>
  );
}
