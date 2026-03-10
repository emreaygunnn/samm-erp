import { api } from '../api';

export type OperationType =
  | 'lokasyon'
  | 'stok'
  | 'fiyat'
  | 'durum'
  | 'tutar'
  | 'paraBirimi'
  | 'kur'
  | 'fatura';

export interface UpdateResult {
  id: string;
  success: boolean;
  message: string;
}

export interface BulkUpdatePayload {
  operasyon: OperationType;
  yeniDeger: string | number;
  envId?: string;
}

const ALAN_MAP: Record<OperationType, string> = {
  lokasyon:   'lokasyon',
  stok:       'stok',
  fiyat:      'fiyat',
  durum:      'durum',
  tutar:      'tutar',
  paraBirimi: 'paraBirimi',
  kur:        'kur',
  fatura:     'fatura',
};

const NUMERIC_OPS: OperationType[] = ['stok', 'fiyat', 'tutar', 'kur'];

export async function bulkUpdate(
  ids: string[],
  payload: BulkUpdatePayload,
  onResult: (result: UpdateResult) => void
): Promise<void> {
  const alan = ALAN_MAP[payload.operasyon];
  const deger = NUMERIC_OPS.includes(payload.operasyon)
    ? Number(payload.yeniDeger)
    : payload.yeniDeger;

  for (const id of ids) {
    const trimmedId = id.trim();
    if (!trimmedId) continue;

    try {
      await api.patch(`/urunler/${trimmedId}`, { [alan]: deger });
      onResult({ id: trimmedId, success: true, message: 'Güncellendi' });
    } catch (err: any) {
      const mesaj =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Bilinmeyen hata';
      onResult({ id: trimmedId, success: false, message: String(mesaj) });
    }
  }
}
