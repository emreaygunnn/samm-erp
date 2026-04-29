import axios from "axios";
import getToken from "./getToken.js";

export const updateItem = async (
  resourceId: string, // product'ta uniqId, customer'da partyNumber — her ikisi de URL'de /{id} olarak kullanılır
  field: string,
  value: string | number,
  organizationCode: string | undefined,
  baseUrl: string, // zorunlu — hangi Oracle endpoint'i kullanılacağı açıkça belirtilmeli
) => {
  try {
    const token = getToken();
    const headers = {
      Authorization: `Basic ${token}`,
    };

    let data: any = {
      [field]: value,
    };

    // Description güncellemesinde organizasyon kodu gerekli (product'a özgü)
    if (field === "Description" && organizationCode) {
      data.ORGANIZATION_CODE = organizationCode;
    }

    console.log(`[updateItem] Gönderiliyor: ${resourceId} - ${field}:`, data);

    await axios.patch(`${baseUrl}/${resourceId}`, data, {
      headers: headers,
      timeout: 10000,
    });

    console.log(`[updateItem] Başarılı: ${resourceId} - ${field}`);
    return true;
  } catch (err: any) {
    console.log(`[updateItem] Hata ${field}:`, err.message || err);
    return false;
  }
};