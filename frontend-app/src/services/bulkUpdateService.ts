import { api } from "../api";
import {
  URUN_ALAN_TIPLERI,
  type UrunGuncellenebilirAlan,
} from "@shared/types/urun";

export type OperationType = UrunGuncellenebilirAlan;

export interface UpdateItem {
  id: string;
  value: string | number;
}

export interface UpdateResult {
  id: string;
  success: boolean;
  message: string;
}

export interface BulkUpdatePayload {
  operasyon: OperationType;
  yeniDeger: string | number; // Excel'den değer gelmeyenler için fallback
  envId?: string;
}

function degerCevir(
  operasyon: OperationType,
  raw: string | number,
): string | number {
  if (URUN_ALAN_TIPLERI[operasyon] === "number") {
    return Number(raw);
  }
  return raw;
}

/**
 * Toplu güncelleme fonksiyonu.
 *
 * items: her birinin kendi id ve value'su olan liste
 * payload: operasyon türü + fallback değer + opsiyonel envId
 * onResult: her ürün işlendiğinde çağrılan callback
 *
 * Mantık:
 *   - item.value boş DEĞİLSE → item.value kullanılır (Excel'den gelen)
 *   - item.value boşsa → payload.yeniDeger kullanılır (kullanıcının elle girdiği genel değer)
 */
export async function bulkUpdate(
  items: UpdateItem[],
  payload: BulkUpdatePayload,
  onResult: (result: UpdateResult) => void,
): Promise<void> {
  for (const item of items) {
    const trimmedId = item.id.trim();
    if (!trimmedId) continue;

    // Hangi değeri kullanacağız?
    // item.value doluysa onu kullan, boşsa genel yeniDeger'i kullan
    const hamDeger =
      item.value !== "" && item.value !== undefined && item.value !== null
        ? item.value
        : payload.yeniDeger;

    // Operasyon tipine göre sayıya çevir veya string bırak
    const deger = degerCevir(payload.operasyon, hamDeger);

    try {
      await api.patch(`/urunler/${trimmedId}`, { [payload.operasyon]: deger });
      onResult({
        id: trimmedId,
        success: true,
        message: `Güncellendi → ${deger}`,
      });
    } catch (err: any) {
      const mesaj =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Bilinmeyen hata";
      onResult({ id: trimmedId, success: false, message: String(mesaj) });
    }
  }
}
