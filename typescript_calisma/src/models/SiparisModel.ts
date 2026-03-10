import mongoose from "mongoose";

const siparisSchema = new mongoose.Schema(
  {
    urunId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Urun",
      required: true,
    },
    urunAd: { type: String, required: true },
    adet: { type: Number, required: true },
    birimFiyat: { type: Number, required: true },
    toplamTutar: { type: Number, required: true },
    olusturan: { type: String, required: true },
    tarih: { type: String },
  },
  { toJSON: { virtuals: true } },
);

export const SiparisModel = mongoose.model("Siparis", siparisSchema);
