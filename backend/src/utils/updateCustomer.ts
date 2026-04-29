import axios from "axios";
import getToken from "./getToken.js";

export const updateCustomer = async (
  partyNumber: string, // product'ta uniqId, customer'da partyNumber — her ikisi de URL'de /{id} olarak kullanılır
  field: string,
  value: string | number,
  baseUrl: string // zorunlu — hangi Oracle endpoint'i kullanılacağı açıkça belirtilmeli
) => {
  try {
    const token = getToken();
    const headers = {
      Authorization: `Basic ${token}`,
    };

    let data: any = {
      [field]: value,
    };

    console.log(
      `[updateCustomer] Gönderiliyor: ${partyNumber} - ${field}:`,
      data
    );

    await axios.patch(`${baseUrl}/${partyNumber}`, data, {
      headers: headers,
      timeout: 10000,
    });

    console.log(`[updateCustomer] Başarılı: ${partyNumber} - ${field}`);
    return true;
  } catch (err: any) {
    console.log(`[updateCustomer] Hata ${field}:`, err.message || err);
    return false;
  }
};
