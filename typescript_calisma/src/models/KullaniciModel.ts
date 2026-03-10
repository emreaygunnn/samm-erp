import mongoose from "mongoose";
import type { IRol } from "./RolModel.ts";

// populate("rol") çağrısından sonra tip güvenliği için
export interface IKullanici {
  _id: mongoose.Types.ObjectId;
  ad: string;
  soyad?: string;
  email: string;
  sifre: string;
  rol: mongoose.Types.ObjectId | IRol; // populate öncesi ObjectId, sonra IRol
  no?: string;
  aciklama?: string;
  sifreDegistirmesiGerekiyor: boolean;
}

const kullaniciSchema = new mongoose.Schema<IKullanici>(
  {
    ad: { type: String, required: true },
    soyad: { type: String },
    email: { type: String, required: true, unique: true },
    sifre: { type: String, required: true },
    // Artık string değil; Rol koleksiyonuna ObjectId referansı
    rol: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rol",
      required: true,
    },
    no: { type: String },
    aciklama: { type: String },
    sifreDegistirmesiGerekiyor: { type: Boolean, default: false },
  },
  { toJSON: { virtuals: true } },
);

export const KullaniciModel = mongoose.model<IKullanici>(
  "Kullanici",
  kullaniciSchema,
);
