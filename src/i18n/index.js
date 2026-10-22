import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "./de.json";
import pt from "./pt.json";
import deSite from "./de.site.json";
import ptSite from "./pt.site.json";

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: { ...de, ...deSite } },
    pt: { translation: { ...pt, ...ptSite } },
  },
  lng: localStorage.getItem("lang") || "de",
  fallbackLng: "de",
  interpolation: { escapeValue: false },
});

document.documentElement.lang = i18n.language;

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  document.documentElement.lang = lng;
});

export default i18n;