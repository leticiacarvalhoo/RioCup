import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="wrap navbar-inner">
        <Link className="logo" to="/" onClick={close}>
          Rio<span>Cup</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={t("nav.menu")}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
        </button>

        <nav className={open ? "open" : ""}>
          <NavLink to="/produkte" onClick={close}>{t("nav.products")}</NavLink>
          <NavLink to="/ueber-uns" onClick={close}>{t("nav.about")}</NavLink>
          <LanguageSwitcher />
          <Link to="/bestellen" className="nav-cta" onClick={close}>
            {t("nav.order")}
          </Link>
        </nav>
      </div>
    </header>
  );
}