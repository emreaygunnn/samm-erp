import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

// Frontend operasyon adı → Oracle CRM accounts API alan adı
const CUSTOMER_FIELDS: Record<string, string> = {
  email:        "EmailAddress",
  phoneNumber:  "PhoneNumber",
  currencyCode: "CurrencyCode",
};

// Tek bir müşterinin mevcut değerini Oracle'dan çeker
// Dönüş: string → değer bulundu | "NOT_FOUND" → kayıt yok (404) | false → bağlantı/auth hatası
export const getCustomerValue = async (
  partyNumber: string,
  operation: string
): Promise<string | "NOT_FOUND" | false> => {
  const oracleField = CUSTOMER_FIELDS[operation];
  if (!oracleField) {
    console.log(`[getCustomerValue] Geçersiz operasyon: ${operation}`);
    return false;
  }

  const url = `${oracleConfig.customer}/${partyNumber}?fields=${oracleField}`;
  console.log(`[getCustomerValue] Sorgu: ${url}`);

  try {
    const token = getToken();
    const res = await axios.get(url, {
      headers: { Authorization: `Basic ${token}` },
    });

    const value = String(res.data[oracleField] ?? "");
    console.log(`[getCustomerValue] ${partyNumber} → ${oracleField}: ${value}`);
    return value;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.log(`[getCustomerValue] ${partyNumber} Oracle'da bulunamadı`);
      return "NOT_FOUND";
    }
    console.log(`[getCustomerValue] ${partyNumber} HATA:`, err.response?.status, err.response?.data?.detail || err.message);
    return false;
  }
};
