import { XMLParser } from "fast-xml-parser";
import { callSoap } from "./callSoap.js";
import { oracleConfig } from "../config/config.js";

const NS_TYP =
  "http://xmlns.oracle.com/apps/financials/receivables/customers/customerProfileService/types/";
const NS_CUS =
  "http://xmlns.oracle.com/apps/financials/receivables/customers/customerProfileService/";

// Frontend operasyon adı → SOAP XML element adı
const PROFILE_FIELDS: Record<string, string> = {
  creditLimit: "CreditLimit",
};

// AccountNumber ile mevcut profil değerini SOAP üzerinden çeker
// Dönüş: string → değer bulundu | "NOT_FOUND" → profil yok | false → bağlantı/auth hatası
export const getProfileValue = async (
  accountNumber: string,
  operation: string
): Promise<string | "NOT_FOUND" | false> => {
  const oracleField = PROFILE_FIELDS[operation];
  if (!oracleField) {
    console.log(`[getProfileValue] Geçersiz operasyon: ${operation}`);
    return false;
  }

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

  console.log(`[getProfileValue] Sorgu: AccountNumber=${accountNumber}, Alan=${oracleField}`);

  try {
    const rawXml = await callSoap(oracleConfig.soap, "getCustomerProfile", body);
    console.log(`[getProfileValue] Ham yanıt:`, rawXml);

    const parser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true });
    const parsed = parser.parse(rawXml);

    // Envelope > Body > getCustomerProfileResponse > result
    const responseBody = parsed?.Envelope?.Body;
    const response = responseBody?.getCustomerProfileResponse;

    if (!response) {
      console.log(`[getProfileValue] ${accountNumber} yanıtta profil bulunamadı`);
      return "NOT_FOUND";
    }

    const result = response?.result;
    const value = result?.[oracleField];

    if (value === undefined || value === null) {
      console.log(`[getProfileValue] ${accountNumber} → ${oracleField} değeri yok`);
      return "NOT_FOUND";
    }

    console.log(`[getProfileValue] ${accountNumber} → ${oracleField}: ${value}`);
    return String(value);
  } catch (err: any) {
    console.log(
      `[getProfileValue] ${accountNumber} HATA:`,
      err.response?.status,
      err.response?.data || err.message
    );
    return false;
  }
};
