import { useState } from "react";
import { useTranslation } from "react-i18next";
import OperationSelector from "../components/OperationSelectorComponent";
import type { SelectorOption } from "../components/OperationSelectorComponent";
import ItemIdInput from "../components/ItemIdInputComponent";
import NewValueInput from "../components/NewValueInputCompanent";
import type { FieldConfig } from "../components/NewValueInputCompanent";
import ResultLog from "../components/ResultLogComponent";
import type {
  ProductUpdatableArea,
  ProductUpdateResult,
  ProductUpdateItem,
} from "@shared/types/product";
import { RefreshCw, Search } from "lucide-react";
import { api } from "../api";

export default function ProductUpdatePage() {
  const { t } = useTranslation();

  const selectorOptions: SelectorOption<ProductUpdatableArea>[] = [
    {
      value: "stock",
      label: t("productUpdate.stock"),
      group: t("productUpdate.fieldsGroup"),
    },
    {
      value: "location",
      label: t("productUpdate.location"),
      group: t("productUpdate.fieldsGroup"),
    },
    {
      value: "description",
      label: t("productUpdate.description"),
      group: t("productUpdate.fieldsGroup"),
    },
    {
      value: "status",
      label: t("productUpdate.status"),
      group: t("productUpdate.fieldsGroup"),
    },
  ];

  const fieldConfigs: Record<ProductUpdatableArea, FieldConfig> = {
    stock: {
      type: "number",
      label: t("productUpdate.stock"),
      placeholder: t("productUpdate.enterNewStock"),
    },
    location: {
      type: "text",
      label: t("productUpdate.location"),
      placeholder: t("productUpdate.enterNewLocation"),
    },
    description: {
      type: "text-with-code",
      label: t("productUpdate.description"),
      placeholder: t("productUpdate.enterNewDescription"),
      codePlaceholder: t("productUpdate.organizationSelect"),
      codeOptions: [
        {
          value: "MALZEME_ANA_KAYDI",
          label: t("productUpdate.MalzemeAnaKaydi"),
        },
        { value: "GEBZE_DEPO", label: t("productUpdate.GebzeDepo") },
        { value: "SAMM2_DEPO", label: t("productUpdate.Samm2Depo") },
      ],
    },
    status: {
      type: "select",
      label: t("productUpdate.status"),
      placeholder: t("productUpdate.enterNewStatus"),
      selectOptions: [
        { value: "Active", label: t("productUpdate.active") },
        { value: "Passive", label: t("productUpdate.passive") },
      ],
    },
  };

  const itemIdLabels = {
    sectionTitle: t("productUpdate.selectIds"),
    idsLabel: t("productUpdate.productIds"),
    idsPlaceholder: t("productUpdate.productIdsPlaceholder"),
    uploadHint: t("productUpdate.uploadExcelHint"),
  };

  const [operation, setOperation] = useState<ProductUpdatableArea | null>(null);
  const [items, setItems] = useState<ProductUpdateItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [results, setResults] = useState<ProductUpdateResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);

  const handleOperationChange = (op: ProductUpdatableArea) => {
    setOperation(op);
    setItems((prev) => prev.map((item) => ({ ...item, value: "" })));
  };

  // Oracle'dan mevcut değerleri çekip input'lara doldurur
  const handleCheck = async () => {
    if (!operation || items.length === 0) return;

    setCheckLoading(true);
    try {
      const payload = {
        items: items.map((item) => ({
          id: item.id,
          ...(item.organizationCode
            ? { organizationCode: item.organizationCode }
            : {}),
        })),
        operation,
      };
      const res = await api.post("/product/check", payload);
      const values: {
        id: string;
        currentValue: string;
        status: "found" | "not_found" | "error";
      }[] = res.data;
      setItems((prev) =>
        prev.map((item) => {
          const found = values.find(
            (v) => v.id === item.id && v.status === "found"
          );
          return found ? { ...item, value: found.currentValue } : item;
        })
      );
      setResults(
        values.map((v) => ({
          id: v.id,
          success: v.status === "found",
          message:
            v.status === "found"
              ? `${t("common.checkFound")}: ${v.currentValue}`
              : v.status === "not_found"
              ? t("common.checkNotFound")
              : t("common.checkError"),
        }))
      );
    } catch (err: any) {
      setResults([{ id: "-", success: false, message: err.message }]);
    } finally {
      setCheckLoading(false);
    }
  };

  const isDescriptionItemFilled = (item: ProductUpdateItem) =>
    item.organizationCode !== undefined &&
    item.value !== "" &&
    item.value !== undefined &&
    item.value !== null;

  const allValuesFilled =
    items.length > 0 &&
    items.every((item) =>
      operation === "description"
        ? isDescriptionItemFilled(item)
        : item.value !== "" && item.value !== undefined && item.value !== null
    );

  const handleUpdate = async () => {
    if (!operation || items.length === 0 || !allValuesFilled) return;

    setResults([]);
    setLoading(true);

    try {
      const payload = items.map((item) =>
        operation === "description"
          ? {
              id: item.id,
              organizationCode: item.organizationCode,
              itemDescription: item.value,
            }
          : { id: item.id, [operation]: item.value }
      );
      // let language: string | null = null;
      // if (operation === "status") {
      //   language = await api.post("/product/language", payload);
      //   if (language == "TR") {
      //     // 111111111111111111111111111111 statusu alıp TR ise payloaddaki status değerlerini Türkçeye çevir
      //     payload.forEach((p) => {
      //       if (p.status === "Active") p.status = "Etkin";
      //       else if (p.status === "Passive") p.status = "Pasif";
      //     });
      //   }
      // }

      const res = await api.post("/product/update", payload);
      const raw = Array.isArray(res.data) ? res.data : [res.data];
      setResults(
        raw.map((r: ProductUpdateResult) => ({
          ...r,
          message: r.success ? t("common.success") : t("common.error"),
        }))
      );
    } catch (err: any) {
      setResults([{ id: "-", success: false, message: t("common.error") }]);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    operation !== null && items.length > 0 && allValuesFilled && !loading;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{t("productUpdate.title")}</h2>
          <p className="page-desc">{t("productUpdate.description")}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <OperationSelector
          options={selectorOptions}
          value={operation}
          onChange={handleOperationChange}
          placeholder={t("productUpdate.selectOperation")}
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
          />
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            className="btn btn-secondary"
            onClick={handleCheck}
            disabled={
              !operation || items.length === 0 || checkLoading || loading
            }
            style={{ minWidth: 140, gap: 8 }}
          >
            {checkLoading ? (
              <>
                <div className="spinner" /> {t("common.checking")}
              </>
            ) : (
              <>
                <Search size={15} /> {t("common.check")}
              </>
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={!canSubmit}
            style={{ minWidth: 160, gap: 8 }}
          >
            {loading ? (
              <>
                <div className="spinner" /> {t("productUpdate.processing")}
              </>
            ) : (
              <>
                <RefreshCw size={15} />{" "}
                {items.length > 0
                  ? `${items.length} ${t("productUpdate.updateButton")}`
                  : t("productUpdate.updateButton")}
              </>
            )}
          </button>
        </div>

        <ResultLog results={results} loading={loading} />
      </div>
    </div>
  );
}
