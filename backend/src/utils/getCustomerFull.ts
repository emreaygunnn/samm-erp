import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

// Müşterinin tüm Oracle alanlarını çeker (fields filtresi yok)
// Dönüş: obje → bulundu | "NOT_FOUND" → 404 | hata durumunda throw eder
export const getCustomerFull = async (
  partyNumber: string
): Promise<Record<string, any> | "NOT_FOUND"> => {
  const url = `${oracleConfig.customer}/${partyNumber}`;
  console.log(`[getCustomerFull] Sorgu: ${url}`);

  try {
    const token = getToken();
    const res = await axios.get(url, {
      headers: { Authorization: `Basic ${token}` },
    });
    console.log(`[getCustomerFull] ${partyNumber} → ${Object.keys(res.data).length} alan döndü`);
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.log(`[getCustomerFull] ${partyNumber} → 404 bulunamadı`);
      return "NOT_FOUND";
    }
    const oracleStatus: number = err.response?.status ?? 0;
    const detail: string = err.response?.data?.detail || err.response?.data?.title || err.message;
    console.error(`[getCustomerFull] ${partyNumber} → Oracle ${oracleStatus}: ${detail}`);
    const error = new Error(detail);
    (error as any).oracleStatus = oracleStatus;
    throw error;
  }
};
