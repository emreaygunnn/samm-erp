import { XMLParser } from "fast-xml-parser";
import { callSoap } from "./callSoap.js";
import { oracleConfig } from "../config/config.js";

const NS_TYP =
  "http://xmlns.oracle.com/apps/financials/receivables/customers/customerProfileService/types/";
const NS_CUS =
  "http://xmlns.oracle.com/apps/financials/receivables/customers/customerProfileService/";

// AccountNumber ile tüm profil alanlarını SOAP üzerinden çeker (fields filtresi yok)
// Dönüş: obje → bulundu | "NOT_FOUND" → profil yok | hata durumunda throw eder
export const getProfileFull = async (
  accountNumber: string
): Promise<Record<string, any> | "NOT_FOUND"> => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:typ="${NS_TYP}"
  xmlns:cus="${NS_CUS}">
  <soapenv:Header/>
  <soapenv:Body>
    <typ:getCustomerProfile>
      <typ:customerProfile>
        <cus:AccountNumber>${accountNumber}</cus:AccountNumber>
      </typ:customerProfile>
    </typ:getCustomerProfile>
  </soapenv:Body>
</soapenv:Envelope>`;

  console.log(`[getProfileFull] Sorgu: AccountNumber=${accountNumber}`);

  try {
    const rawXml = await callSoap(oracleConfig.soap, "getCustomerProfile", body);

    const parser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true });
    const parsed = parser.parse(rawXml);

    const response = parsed?.Envelope?.Body?.getCustomerProfileResponse;

    if (!response) {
      console.log(`[getProfileFull] ${accountNumber} → yanıtta profil bulunamadı`);
      return "NOT_FOUND";
    }

    const result = response?.result;

    if (!result || typeof result !== "object") {
      console.log(`[getProfileFull] ${accountNumber} → result boş veya geçersiz`);
      return "NOT_FOUND";
    }

    console.log(`[getProfileFull] ${accountNumber} → ${Object.keys(result).length} alan döndü`);
    return result;
  } catch (err: any) {
    const detail: string = err.response?.data?.detail || err.response?.data?.title || err.message;
    console.error(`[getProfileFull] ${accountNumber} HATA: ${detail}`);
    const error = new Error(detail);
    (error as any).oracleStatus = err.response?.status ?? 0;
    throw error;
  }
};
