import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContent } from "../content/ContentContext";

export default function Footer() {
  const { t } = useTranslation();
  const { store } = useContent();

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
          {store.instagram && <a href={store.instagram} target="_blank" rel="noreferrer">Instagram</a>}
          {store.phone && <a href={`tel:${store.phone}`}>{store.phone}</a>}
          {store.email && <a href={`mailto:${store.email}`}>{store.email}</a>}
          <Link to="/impressum">{t("footer.imprint")}</Link>
          <Link to="/datenschutz">{t("footer.privacy")}</Link>
          <Link to="/login">{t("footer.login")}</Link>
        </div>
      </div>
    </footer>
  );
}
