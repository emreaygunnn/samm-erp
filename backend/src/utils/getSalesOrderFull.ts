import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

// Sipariş başlığının tüm Oracle alanlarını çeker (fields filtresi yok)
// Dönüş: obje → bulundu | "NOT_FOUND" → 404 | hata durumunda throw eder
export const getSalesOrderFull = async (
  orderHeaderId: string
): Promise<Record<string, any> | "NOT_FOUND"> => {
  const url = `${oracleConfig.salesOrders}/${orderHeaderId}`;
  console.log(`[getSalesOrderFull] Sorgu: ${url}`);

  try {
    const token = getToken();
    const res = await axios.get(url, {
      headers: { Authorization: `Basic ${token}` },
    });
    console.log(`[getSalesOrderFull] ${orderHeaderId} → ${Object.keys(res.data).length} alan döndü`);
    return res.data;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.log(`[getSalesOrderFull] ${orderHeaderId} → 404 bulunamadı`);
      return "NOT_FOUND";
    }
    const oracleStatus: number = err.response?.status ?? 0;
    const detail: string = err.response?.data?.detail || err.response?.data?.title || err.message;
    console.error(`[getSalesOrderFull] ${orderHeaderId} → Oracle ${oracleStatus}: ${detail}`);
    const error = new Error(detail);
    (error as any).oracleStatus = oracleStatus;
    throw error;
  }
};
