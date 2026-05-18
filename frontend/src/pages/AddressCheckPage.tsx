import { useState } from "react";
import { AlertCircle, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import CheckPageIdInputComponent from "../components/CheckPagesIdInputComponent";

type Status = "idle" | "loading" | "found" | "not_found" | "error";

export default function AddressCheckPage() {
  const { t } = useTranslation();
  const [partyNumber, setPartyNumber] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [errorDetail, setErrorDetail] = useState<string>("");

  const handleFetch = async () => {
    const id = partyNumber.trim();
    if (!id) return;

    setStatus("loading");
    setAddresses([]);
    setErrorDetail("");

    try {
      const res = await api.get(`/address/full/${encodeURIComponent(id)}`);
      setAddresses(res.data);
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">{t("addressCheck.title")}</h2>
          <p className="page-desc">{t("addressCheck.description")}</p>
        </div>
      </div>

      <CheckPageIdInputComponent
        namespace="addressCheck"
        value={partyNumber}
        onChange={setPartyNumber}
        onSearch={handleFetch}
        loading={status === "loading"}
      />

      {/* Not Found */}
      {status === "not_found" && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--warning)" }}>
            <AlertCircle size={18} />
            <span><strong>{partyNumber}</strong> — {t("addressCheck.notFound")}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="card">
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--danger)" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <div>{t("addressCheck.connectionError")}</div>
              {errorDetail && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontFamily: "monospace" }}>
                  {errorDetail}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results — her adres ayrı kart */}
      {status === "found" && addresses.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {addresses.map((addr, idx) => {
            const rows = Object.entries(addr);
            return (
              <div className="card" key={addr.AddressId ?? idx}>
                <div className="card-header">
                  <div>
                    <div className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MapPin size={16} style={{ color: "var(--accent)" }} />
                      {addr.AddressType ?? `${t("addressCheck.address")} ${idx + 1}`}
                    </div>
                    <div className="card-subtitle">
                      {[addr.Address1, addr.City, addr.Country].filter(Boolean).join(", ") || `Party: ${partyNumber}`}
                      {" — "}
                      {t("addressCheck.fieldCount", { count: rows.length })}
                    </div>
                  </div>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th style={{ width: "38%" }}>{t("addressCheck.colField")}</th>
                        <th>{t("addressCheck.colValue")}</th>
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
            );
          })}
        </div>
      )}
    </div>
  );
}
