import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { products } from "../data/products";
import { acaiSizes } from "../data/acai";
import { store } from "../data/store";

export default function Home() {
  const { t } = useTranslation();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;

  return (
    <>
      <section className="hero-dark">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">{t("home.eyebrow")}</span>
            <h1>{t("home.title")}</h1>
            <p>{t("home.text")}</p>
            <div className="hero-actions">
              <Link to="/bestellen" className="button button-light">
                {t("home.ctaOrder")}
              </Link>
              <Link to="/produkte" className="button button-ghost">
                {t("home.cta")}
              </Link>
            </div>
          </div>
          <div className="hero-photo" aria-hidden="true" />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow dark">{t("home.productsEyebrow")}</span>
            <h2>{t("home.productsTitle")}</h2>
          </div>

          <div className="tile-grid">
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/produkte#${p.id}`}
                className="tile"
                style={{ "--img": `url(/images/${p.id}.jpg)` }}
              >
                <span className="tile-name">{t(`products.items.${p.id}.name`)}</span>
                <span className="tile-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-lilac">
        <div className="wrap order-band">
          <div>
            <span className="eyebrow dark">{t("home.orderEyebrow")}</span>
            <h2>{t("home.orderTitle")}</h2>
            <p>{t("home.orderText")}</p>
            <Link to="/bestellen" className="button button-primary">
              {t("home.ctaOrder")}
            </Link>
          </div>

          <div className="size-row" aria-hidden="true">
            {acaiSizes.map((s, i) => (
              <div key={s.id} className="size-chip" style={{ "--i": i }}>
                {s.id}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div>
            <span className="eyebrow dark">{t("home.aboutEyebrow")}</span>
            <h2>{t("home.aboutTitle")}</h2>
            <p>{t("home.aboutText")}</p>
            <Link to="/ueber-uns" className="button button-outline">
              {t("home.aboutCta")}
            </Link>
          </div>
          <div className="photo-block" aria-hidden="true" />
        </div>
      </section>

      <section className="section visit">
        <div className="wrap visit-inner">
          <div>
            <span className="eyebrow">{t("home.visitEyebrow")}</span>
            <h2>{t("home.visitTitle")}</h2>
            <address>{store.address}</address>
            {store.hours.length > 0 && (
              <ul className="hours">
                {store.hours.map((h) => (
                  <li key={h.days}>
                    {h.days}: {h.time}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="visit-links">
            <a className="button button-light" href={mapsUrl} target="_blank" rel="noreferrer">
              {t("home.visitMaps")}
            </a>
            <a className="button button-ghost" href={store.instagram} target="_blank" rel="noreferrer">
              {t("home.visitInstagram")}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}