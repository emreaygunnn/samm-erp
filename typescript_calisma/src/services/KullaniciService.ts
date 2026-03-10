import bcrypt from "bcrypt";
import { KullaniciModel } from "../models/KullaniciModel.ts";
import type { IRol } from "../models/RolModel.ts";

const SALT_ROUNDS = 10;

export class KullaniciService {
  // Artık string rol doğrulaması yok; rol geçerliliği MongoDB (RolModel) garantiliyor.

  public async tumKullanicilariGetir() {
    const liste = await KullaniciModel.find().populate<{ rol: IRol }>("rol");
    // Rol populate edilemeyen (eski migrate'ten kalan bozuk kayıtlar) kullanıcıları filtrele
    return liste.filter((k) => k.rol && typeof (k.rol as any).ad === "string");
  }

  public async kullaniciEkle(yeniKullanici: any) {
    // yeniKullanici.rol bir ObjectId string olmalı (RolModel'den alınan _id)
    const hashedSifre = await bcrypt.hash(yeniKullanici.sifre, SALT_ROUNDS);
    return await KullaniciModel.create({
      ...yeniKullanici,
      sifre: hashedSifre,
      sifreDegistirmesiGerekiyor: true,
    });
  }

  public async kullaniciSil(id: string) {
    const silinen = await KullaniciModel.findByIdAndDelete(id);
    if (!silinen) throw new Error("Kullanıcı bulunamadı!");
    return true;
  }

  public async kullaniciGuncelle(id: string, veri: any) {
    if (veri.sifre) {
      veri = { ...veri, sifre: await bcrypt.hash(veri.sifre, SALT_ROUNDS) };
    }
    const guncellendi = await KullaniciModel.findByIdAndUpdate(id, veri, {
      new: true,
      runValidators: true,
    }).populate<{ rol: IRol }>("rol");
    if (!guncellendi) throw new Error("Kullanıcı bulunamadı!");
    return guncellendi;
  }

  public async idIleKullaniciGetir(id: string) {
    const kullanici = await KullaniciModel.findById(id).populate<{
      rol: IRol;
    }>("rol");
    if (!kullanici) throw new Error("Aranan kullanıcı bulunamadı!");
    return kullanici;
  }
}
