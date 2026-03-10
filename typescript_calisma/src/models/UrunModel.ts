import mongoose from "mongoose";

const urunSchema = new mongoose.Schema(
  {
    ad: { type: String, required: true },
    fiyat: { type: Number, required: true },
    stok: { type: Number, required: true, default: 0 },
    kategori: { type: String, required: true },
    ebat: { type: String },
    lokasyon: { type: String, default: "" },
  },
  { toJSON: { virtuals: true } },
);

export const UrunModel = mongoose.model("Urun", urunSchema);
