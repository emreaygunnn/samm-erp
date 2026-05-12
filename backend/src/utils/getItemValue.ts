import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

// Frontend operasyon adı → Oracle API alan adı
const ORACLE_FIELDS: Record<string, string> = {
  stock:       "Stock",
  location:    "Location",
  status:      "Status",
  description: "ItemDescription",
};

// Tek bir ürünün mevcut değerini Oracle'dan çeker
// Description için organizationCode gerekli, diğerleri için isteğe bağlı
// Dönüş: string → değer bulundu | "NOT_FOUND" → kayıt yok | false → bağlantı/auth hatası
export const getItemValue = async (
  itemNumber: string,
  operation: string,
  organizationCode?: string,
): Promise<string | "NOT_FOUND" | false> => {
  const oracleField = ORACLE_FIELDS[operation];
  if (!oracleField) {
    console.log(`[getItemValue] Geçersiz operasyon: ${operation}`);
    return false;
  }

  const query = organizationCode
    ? `${oracleConfig.item}?q=ItemNumber=${itemNumber};OrganizationCode=${organizationCode}&fields=ItemNumber,${oracleField}`
    : `${oracleConfig.item}?q=ItemNumber=${itemNumber}&fields=ItemNumber,${oracleField}`;

  console.log(`[getItemValue] Sorgu: ${query}`);

  try {
    const token = getToken();
    const res = await axios.get(query, {
      headers: { Authorization: `Basic ${token}` },
    });

    if (!res.data.items || res.data.items.length === 0) {
      console.log(`[getItemValue] ${itemNumber} Oracle'da bulunamadı`);
      return "NOT_FOUND";
    }

    const value = String(res.data.items[0][oracleField] ?? "");
    console.log(`[getItemValue] ${itemNumber} → ${oracleField}: ${value}`);
    return value;
  } catch (err: any) {
    console.log(`[getItemValue] ${itemNumber} HATA:`, err.response?.status, err.response?.data?.detail || err.message);
    return false;
  }
};
