export interface Urun {
  id: string;
  ad: string;
  fiyat: number;
  stok: number;
  kategori: string;
  ebat?: string;
}

export interface Rol {
  _id: string;
  ad: string;
  yetkiler: string[];
}

export interface Kullanici {
  id: string;
  ad: string;
  soyad?: string;
  email?: string;
  rol: Rol;
  no?: string;
  aciklama?: string;
}

export interface Siparis {
  id: string;
  urunId: string;
  urunAd: string;
  adet: number;
  birimFiyat: number;
  toplamTutar: number;
  olusturan: string;
  tarih: string;
}

export interface AuthUser {
  id: string | null;
  kullanici: string;
  rol: "admin" | "editor" | "stajyer";
  yetkiler: string[];
  ogrenciNo: string | null;
  sifreDegistirmesiGerekiyor?: boolean;
}
