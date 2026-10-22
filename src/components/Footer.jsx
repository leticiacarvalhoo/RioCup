import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { store } from "../data/store";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div>
          <span className="logo">
            Rio<span>Cup</span> &amp; Co.
          </span>
          <p>{t("footer.tagline")}</p>
        </div>

        <div className="footer-links">
          <a href={store.instagram} target="_blank" rel="noreferrer">Instagram</a>
          <Link to="/impressum">{t("footer.imprint")}</Link>
          <Link to="/datenschutz">{t("footer.privacy")}</Link>
          <Link to="/login">{t("footer.login")}</Link>
        </div>
      </div>
    </footer>
  );
}