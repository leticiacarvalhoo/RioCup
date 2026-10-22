import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "./de.json";
import pt from "./pt.json";
import deSite from "./de.site.json";
import ptSite from "./pt.site.json";
import deV2 from "./de.v2.json";
import ptV2 from "./pt.v2.json";

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    pt: { translation: pt },
  },
  lng: localStorage.getItem("lang") || "de",
  fallbackLng: "de",
  interpolation: { escapeValue: false },
});

// Junta os arquivos em camadas: o último sobrescreve só as chaves repetidas
[
  ["de", deSite, deV2],
  ["pt", ptSite, ptV2],
].forEach(([lng, site, v2]) => {
  i18n.addResourceBundle(lng, "translation", site, true, true);
  i18n.addResourceBundle(lng, "translation", v2, true, true);
});

document.documentElement.lang = i18n.language;

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  document.documentElement.lang = lng;
});

export default i18n;