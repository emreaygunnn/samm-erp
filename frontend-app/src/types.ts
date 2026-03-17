export interface Kullanici {
  id: string;
  ad: string;
  soyad?: string;
  email?: string;
}
export interface AuthUser {
  id: string | null;
  kullanici: string;
}
