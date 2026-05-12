import { callSoap } from "./callSoap.js";
import { oracleConfig } from "../config/config.js";

//kimlik etiketleri namespace
const NS_TYP =
  "http://xmlns.oracle.com/apps/financials/receivables/customers/customerProfileService/types/"; //operasyon elementleri
const NS_CUS =
  "http://xmlns.oracle.com/apps/financials/receivables/customers/customerProfileService/"; //veri elementleri

export const updateProfile = async (
  accountNumber: string,
  creditLimit: string | number,
): Promise<boolean> => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope
  xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:typ="${NS_TYP}"
  xmlns:cus="${NS_CUS}">
  <soapenv:Header/>
  <soapenv:Body>
    <typ:updateCustomerProfile>
      <typ:customerProfile>
        <cus:AccountNumber>${accountNumber}</cus:AccountNumber>
        <cus:CreditLimit>${creditLimit}</cus:CreditLimit>
      </typ:customerProfile>
    </typ:updateCustomerProfile>
  </soapenv:Body>
</soapenv:Envelope>`;

  try {
    console.log(
      `[updateProfile] Güncelleniyor: AccountNumber=${accountNumber}, CreditLimit=${creditLimit}`,
    );
    await callSoap(oracleConfig.soap, "updateCustomerProfile", body);
    console.log(`[updateProfile] Başarılı: AccountNumber=${accountNumber}`);
    return true;
  } catch (err: any) {
    console.log(`[updateProfile] Hata:`, err.message || err);
    return false;
  }
};
