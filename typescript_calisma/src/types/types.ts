export interface Urun {
  id?: string;
  ad: string;
  stok: number;
  lokasyon?: string;
}

export interface Kullanici {
  id?: string;
  ad: string;
  soyad: string;
  email: string;
  sifre: string;
}
