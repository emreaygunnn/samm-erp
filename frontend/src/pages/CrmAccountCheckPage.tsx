import { useState } from "react";
import { Search, AlertCircle, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../api";

type Status = "idle" | "loading" | "found" | "not_found" | "error";

export default function CrmAccountCheckPage() {       
  const { t } = useTranslation();
  const [partyNumber, setPartyNumber] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [errorDetail, setErrorDetail] = useState<string>("");

  const handleFetch = async () => {
    const id = partyNumber.trim();
    if (!id) return;

    setStatus("loading");
    setData(null);
    setErrorDetail("");

    try {
      const res = await api.get(`/customer/full/${encodeURIComponent(id)}`); // URL'de sorun çıkaracak karakterleri güvenli hale getirir.
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleFetch();
  };

  const rows = data ? Object.entries(data) : []; // Veri varsa, anahtar-değer çiftlerini içeren bir dizi oluşturur. Yoksa boş dizi.""

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">{t("crmAccountCheck.title")}</h2>
          <p className="page-desc">{t("crmAccountCheck.description")}</p>
        </div>
      </div>

      {/* Search Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">{t("crmAccountCheck.inputLabel")}</label>
            <input
              className="form-input"
              placeholder={t("crmAccountCheck.inputPlaceholder")}
              value={partyNumber}
              onChange={(e) => setPartyNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={status === "loading"}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleFetch}
            disabled={!partyNumber.trim() || status === "loading"}
            style={{ height: 42 }}
          >
            {status === "loading" ? (
              <><span className="spinner" /> {t("crmAccountCheck.fetching")}</>
            ) : (
              <><Search size={15} /> {t("crmAccountCheck.fetchButton")}</>
            )}
          </button>
        </div>
      </div>

      {/* Not Found */}
      {status === "not_found" && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--warning)" }}>
            <AlertCircle size={18} />
            <span>
              <strong>{partyNumber}</strong> — {t("crmAccountCheck.notFound")}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--danger)" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <div>{t("crmAccountCheck.connectionError")}</div>
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
                <User size={16} style={{ color: "var(--accent)" }} />
                {data.PartyName ?? partyNumber}
              </div>
              <div className="card-subtitle">
                Party Number: {data.PartyNumber ?? partyNumber}
                {" — "}
                {t("crmAccountCheck.fieldCount", { count: rows.length })}
              </div>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>{t("crmAccountCheck.colField")}</th>
                  <th>{t("crmAccountCheck.colValue")}</th>
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
