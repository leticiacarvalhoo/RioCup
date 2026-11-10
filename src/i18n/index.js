import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Carrega sozinho os arquivos de texto que existirem nesta pasta.
// Ordem das camadas: base, site, v2, v3, v4... (o último sobrescreve só as chaves repetidas)
const files = import.meta.glob("./*.json", { eager: true, import: "default" });
const LAYERS = ["", ".site", ".v2", ".v3", ".v4", ".v5", ".v6"];

i18n.use(initReactI18next).init({
  resources: { de: { translation: {} }, pt: { translation: {} } },
  lng: localStorage.getItem("lang") || "de",
  fallbackLng: "de",
  interpolation: { escapeValue: false },
});

["de", "pt"].forEach((lng) => {
  LAYERS.forEach((suffix) => {
    const layer = files[`./${lng}${suffix}.json`];
    if (layer) i18n.addResourceBundle(lng, "translation", layer, true, true);
  });
});

document.documentElement.lang = i18n.language;

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  document.documentElement.lang = lng;
});

export default i18n;