import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import gu from "./locales/gu.json";

i18n
  .use(LanguageDetector) // detects browser language + saves to localStorage
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      gu: { translation: gu },
    },
    fallbackLng: "en", // default language
    detection: {
      order: ["localStorage", "navigator"], // first check localStorage, then browser language
      caches: ["localStorage"], // save preference in localStorage
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
