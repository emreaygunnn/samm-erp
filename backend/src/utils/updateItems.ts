import axios from "axios";
import { oracleConfig } from "../config/config.js";
import getToken from "./getToken.js";

export const updateItem = async (
  uniqId: string,
  field: string, // dinamik alan adı (stock veya location veya description)
  value: string | number, //
  organizationCode?: string, // açıklama güncellemesi için organizasyon kodu
) => {
  try {
    const token = getToken();
    const headers = {
      Authorization: `Basic ${token}`,
    };

    let data: any = {
      [field]: value,
    };

    // Eğer açıklama güncellemesi ise organizasyon kodunu da gönder
    if (field === "Description" && organizationCode) {
      data.ORGANIZATION_CODE = organizationCode;
    }

    console.log(`[updateItem] Gönderiliyor: ${uniqId} - ${field}:`, data);

    const res = await axios.patch(`${oracleConfig.item}/${uniqId}`, data, {
      headers: headers,
      timeout: 10000, // 10 saniye timeout
    });

    console.log(`[updateItem] Başarılı: ${uniqId} - ${field}`);
    return true;
  } catch (err: any) {
    console.log(`[updateItem] Hata ${field}:`, err.message || err);
    return false;
  }
};
