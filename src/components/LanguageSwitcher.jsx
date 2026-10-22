import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.resolvedLanguage;

  return (
    <div className="lang-switch" role="group" aria-label="Sprache / Idioma">
      {["de", "pt"].map((lng) => (
        <button
          key={lng}
          type="button"
          className={current === lng ? "active" : ""}
          aria-pressed={current === lng}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}