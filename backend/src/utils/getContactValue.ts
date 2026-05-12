import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

// Frontend operasyon adı → Oracle CRM contacts API alan adı
const CONTACT_FIELDS: Record<string, string> = {
  email:          "EmailAddress",
  rawPhoneNumber: "RawPhoneNumber",
  currencyCode:   "CurrencyCode",
};

// Tek bir kişinin mevcut değerini Oracle'dan çeker
// Dönüş: string → değer bulundu | "NOT_FOUND" → kayıt yok (404) | false → bağlantı/auth hatası
export const getContactValue = async (
  partyNumber: string,
  operation: string
): Promise<string | "NOT_FOUND" | false> => {
  const oracleField = CONTACT_FIELDS[operation];
  if (!oracleField) {
    console.log(`[getContactValue] Geçersiz operasyon: ${operation}`);
    return false;
  }

  const url = `${oracleConfig.contact}/${partyNumber}?fields=${oracleField}`;
  console.log(`[getContactValue] Sorgu: ${url}`);

  try {
    const token = getToken();
    const res = await axios.get(url, {
      headers: { Authorization: `Basic ${token}` },
    });

    const value = String(res.data[oracleField] ?? "");
    console.log(`[getContactValue] ${partyNumber} → ${oracleField}: ${value}`);
    return value;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.log(`[getContactValue] ${partyNumber} Oracle'da bulunamadı`);
      return "NOT_FOUND";
    }
    console.log(`[getContactValue] ${partyNumber} HATA:`, err.response?.status, err.response?.data?.detail || err.message);
    return false;
  }
};
