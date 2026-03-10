export interface Urun {
  id?: string;
  ad: string;
  fiyat: number;
  stok: number;
  kategori: string;
  ebat?: string;
}

export interface Kullanici {
  id?: string;
  ad: string;
  soyad: string;
  email: string;
  sifre: string;
  rol: string;
}

export interface Siparis {
  id?: string;
  urunId: string;
  urunAd: string;
  adet: number;
  birimFiyat: number;
  toplamTutar: number;
  olusturan: string;
  tarih: string;
}
