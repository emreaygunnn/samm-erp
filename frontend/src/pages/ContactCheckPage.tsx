import { useState } from "react";
import { Search, AlertCircle, Contact } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../api";

type Status = "idle" | "loading" | "found" | "not_found" | "error";

export default function ContactCheckPage() {
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
      const res = await api.get(`/contact/full/${encodeURIComponent(id)}`);
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

  const rows = data ? Object.entries(data) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{t("contactCheck.title")}</h2>
          <p className="page-desc">{t("contactCheck.description")}</p>
        </div>
      </div>

      {/* Search Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body" style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">{t("contactCheck.inputLabel")}</label>
            <input
              className="form-input"
              placeholder={t("contactCheck.inputPlaceholder")}
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
              <><span className="spinner" /> {t("contactCheck.fetching")}</>
            ) : (
              <><Search size={15} /> {t("contactCheck.fetchButton")}</>
            )}
          </button>
        </div>
      </div>

      {/* Not Found */}
      {status === "not_found" && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--warning)" }}>
            <AlertCircle size={18} />
            <span><strong>{partyNumber}</strong> — {t("contactCheck.notFound")}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--danger)" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <div>{t("contactCheck.connectionError")}</div>
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
                <Contact size={16} style={{ color: "var(--accent)" }} />
                {data.PersonFirstName || data.PersonLastName
                  ? `${data.PersonFirstName ?? ""} ${data.PersonLastName ?? ""}`.trim()
                  : partyNumber}
              </div>
              <div className="card-subtitle">
                Party Number: {data.PartyNumber ?? partyNumber}
                {" — "}
                {t("contactCheck.fieldCount", { count: rows.length })}
              </div>
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "38%" }}>{t("contactCheck.colField")}</th>
                  <th>{t("contactCheck.colValue")}</th>
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
