import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import tr from "../locales/tr.json";
import en from "../locales/en.json";

// Kütüphaneleri bağla
i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
    en: { translation: en },
  },
  lng: localStorage.getItem("language") || "tr", // localStorage'dan dil al, yoksa Türkçe varsayılan
  fallbackLng: "tr", // Eksik çeviriler için fallback dil
  interpolation: {
    escapeValue: false, // React zaten XSS koruması yapıyor
  },
  react: {
    useSuspense: false, // Dil dosyası yüklenirken sayfa donmasını önle
  },
});

export default i18n;
