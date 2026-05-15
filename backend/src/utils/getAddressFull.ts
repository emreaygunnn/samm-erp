import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

// Müşterinin adres listesini çeker — Oracle child koleksiyon döndürür: { items: [...] }
// Dönüş: adres dizisi | "NOT_FOUND" → kayıt yok | hata durumunda throw eder
export const getAddressFull = async (
  partyNumber: string,
): Promise<any[] | "NOT_FOUND"> => {
  const url = `${oracleConfig.adress}/${partyNumber}/child/Address`;
  console.log(`[getAddressFull] Sorgu: ${url}`);

  try {
    const token = getToken();
    const res = await axios.get(url, {
      headers: { Authorization: `Basic ${token}` },
    });

    const items: any[] = res.data?.items ?? [];
    if (items.length === 0) {
      console.log(`[getAddressFull] ${partyNumber} → adres bulunamadı`);
      return "NOT_FOUND";
    }
    console.log(`[getAddressFull] ${partyNumber} → ${items.length} adres döndü`);
    return items;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.log(`[getAddressFull] ${partyNumber} → 404 bulunamadı`);
      return "NOT_FOUND";
    }
    const oracleStatus: number = err.response?.status ?? 0;
    const detail: string =
      err.response?.data?.detail || err.response?.data?.title || err.message;
    console.error(
      `[getAddressFull] ${partyNumber} → Oracle ${oracleStatus}: ${detail}`,
    );
    const error = new Error(detail);
    (error as any).oracleStatus = oracleStatus;
    throw error;
  }
};
