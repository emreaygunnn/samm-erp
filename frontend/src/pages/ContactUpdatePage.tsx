import { useState } from "react";
import { useTranslation } from "react-i18next";
import OperationSelector from "../components/OperationSelectorComponent";
import type { SelectorOption } from "../components/OperationSelectorComponent";
import ItemIdInput from "../components/ItemIdInputComponent";
import NewValueInput from "../components/NewValueInputCompanent";
import type { FieldConfig } from "../components/NewValueInputCompanent";
import ResultLog from "../components/ResultLogComponent";
import type { ContactUpdatableArea, ContactUpdateResult } from "@shared/types/contact";
import type { ProductUpdateItem } from "@shared/types/product";
import { RefreshCw } from "lucide-react";
import { api } from "../api";

export default function ContactUpdatePage() {
  const { t } = useTranslation();

  const selectorOptions: SelectorOption<ContactUpdatableArea>[] = [
    { value: 'email',        label: t('contactUpdate.email'),        group: t('contactUpdate.fieldsGroup') },
    { value: 'phoneNumber',  label: t('contactUpdate.phoneNumber'),  group: t('contactUpdate.fieldsGroup') },
    { value: 'currencyCode', label: t('contactUpdate.currencyCode'), group: t('contactUpdate.fieldsGroup') },
  ];

  const fieldConfigs: Record<ContactUpdatableArea, FieldConfig> = {
    email: {
      type: 'text',
      label: t('contactUpdate.email'),
      placeholder: t('contactUpdate.enterNewEmail'),
    },
    phoneNumber: {
      type: 'text',
      label: t('contactUpdate.phoneNumber'),
      placeholder: t('contactUpdate.enterNewPhoneNumber'),
    },
    currencyCode: {
      type: 'select',
      label: t('contactUpdate.currencyCode'),
      placeholder: t('contactUpdate.selectCurrencyCode'),
      selectOptions: [
        { value: 'TRY', label: 'TRY — Türk Lirası' },
        { value: 'USD', label: 'USD — Amerikan Doları' },
        { value: 'EUR', label: 'EUR — Euro' },
      ],
    },
  };

  const itemIdLabels = {
    sectionTitle:        t('contactUpdate.selectIds'),
    idsLabel:            t('contactUpdate.contactIds'),
    idsPlaceholder:      t('contactUpdate.contactIdsPlaceholder'),
    uploadHint:          t('common.uploadExcelHint'),
    idCountSuffix:       t('contactUpdate.partyNumberCountSuffix'),
    valueMatchedSuffix:  t('contactUpdate.partyNumberValueMatched'),
  };

  const [operation, setOperation] = useState<ContactUpdatableArea | null>(null);
  const [items, setItems] = useState<ProductUpdateItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [results, setResults] = useState<ContactUpdateResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOperationChange = (op: ContactUpdatableArea) => {
    setOperation(op);
    setItems((prev) => prev.map((item) => ({ ...item, value: "" })));
  };

  const allValuesFilled =
    items.length > 0 &&
    items.every((item) => item.value !== '' && item.value !== undefined && item.value !== null);

  const handleUpdate = async () => {
    if (!operation || items.length === 0 || !allValuesFilled) return;

    setResults([]);
    setLoading(true);

    try {
      const payload = items.map((item) => ({
        id: item.id,
        [operation]: item.value,
      }));

      const res = await api.patch("/contact/bulk", payload);
      const results = Array.isArray(res.data) ? res.data : [res.data];
      setResults(results);
    } catch (err: any) {
      setResults([{ id: "-", success: false, message: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = operation !== null && items.length > 0 && allValuesFilled && !loading;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{t('contactUpdate.title')}</h2>
          <p className="page-desc">{t('contactUpdate.description')}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <OperationSelector
          options={selectorOptions}
          value={operation}
          onChange={handleOperationChange}
          placeholder={t('contactUpdate.selectOperation')}
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
            idLabel={t('contactUpdate.partyNumberLabel')}
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
              <><div className="spinner" /> {t('contactUpdate.processing')}</>
            ) : (
              <><RefreshCw size={15} /> {items.length > 0 ? `${items.length} ${t('contactUpdate.updateButton')}` : t('contactUpdate.updateButton')}</>
            )}
          </button>
        </div>

        <ResultLog results={results} loading={loading} title={t('contactUpdate.results')} />
      </div>
    </div>
  );
}