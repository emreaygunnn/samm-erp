import axios from "axios";
import getToken from "./getToken.js";

export const updateContact = async (
  partyNumber: string,
  field: string,
  value: string | number,
  baseUrl: string,
) => {
  try {
    const token = getToken();
    const headers = {
      Authorization: `Basic ${token}`,
    };

    const data: any = {
      [field]: value,
    };

    console.log(
      `[updateContact] Gönderiliyor: ${partyNumber} - ${field}:`,
      data,
    );

    await axios.patch(`${baseUrl}/${partyNumber}`, data, {
      headers: headers,
      timeout: 10000,
    });

    console.log(`[updateContact] Başarılı: ${partyNumber} - ${field}`);
    return true;
  } catch (err: any) {
    console.log(`[updateContact] Hata ${field}:`, err.message || err);
    return false;
  }
};