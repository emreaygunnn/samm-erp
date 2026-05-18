import { useState } from "react";
import { AlertCircle, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import CheckPageIdInputComponent from "../components/CheckPagesIdInputComponent";

type Status = "idle" | "loading" | "found" | "not_found" | "error";

export default function ReceiptCheckPage() {
  const { t } = useTranslation();
  const [receiptNumber, setReceiptNumber] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [errorDetail, setErrorDetail] = useState<string>("");

  const handleFetch = async () => {
    const id = receiptNumber.trim();
    if (!id) return;

    setStatus("loading");
    setData(null);
    setErrorDetail("");

    try {
      const res = await api.get(`/receipt/full/${encodeURIComponent(id)}`);
      setData(res.data);
      setStatus("found");
    } catch (err: any) {
      if (err.response?.status === 404) {
        setStatus("not_found");
      } else {
        const body = err.response?.data;
        const detail = body?.message || body?.detail || err.message || "Bilinmeyen hata";
        const oracleStatus: number = body?.oracleStatus ?? err.response?.status ?? 0;
        setErrorDetail(`Oracle ${oracleStatus}: ${detail}`);
        setStatus("error");
      }
    }
  };

  const rows = data ? Object.entries(data) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{t("receiptCheck.title")}</h2>
          <p className="page-desc">{t("receiptCheck.description")}</p>
        </div>
      </div>

      <CheckPageIdInputComponent
        namespace="receiptCheck"
        value={receiptNumber}
        onChange={setReceiptNumber}
        onSearch={handleFetch}
        loading={status === "loading"}
      />

      {/* Not Found */}
      {status === "not_found" && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--warning)" }}>
            <AlertCircle size={18} />
            <span><strong>{receiptNumber}</strong> — {t("receiptCheck.notFound")}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--danger)" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <div>{t("receiptCheck.connectionError")}</div>
              {errorDetail && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontFamily: "monospace" }}>
                  {errorDetail}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      {status === "found" && data && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Receipt size={16} style={{ color: "var(--accent)" }} />
                {receiptNumber}
              </div>
              <div className="card-subtitle">
                Receipt Number: {receiptNumber}
                {" — "}
                {t("receiptCheck.fieldCount", { count: rows.length })}
              </div>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>{t("receiptCheck.colField")}</th>
                  <th>{t("receiptCheck.colValue")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([key, value]) => (
                  <tr key={key}>
                    <td className="td-muted" style={{ fontFamily: "monospace", fontSize: 12 }}>
                      {key}
                    </td>
                    <td>
                      {value === null || value === undefined || value === "" ? (
                        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>—</span>
                      ) : typeof value === "object" ? (
                        <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-secondary)" }}>
                          {JSON.stringify(value)}
                        </span>
                      ) : (
                        String(value)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
