import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContent } from "../content/ContentContext";
import { money } from "../utils/money";

function Badge({ kind, value }) {
  const { t } = useTranslation();
  return <span className={`badge badge-${value}`}>{t(`diet.${kind}.${value}`)}</span>;
}

const list = (v) => (Array.isArray(v) ? v : []);

export default function Products() {
  const { t } = useTranslation();
  const { products: all, categories, pick, promoPrice, badgeLabel } = useContent();
  const [cat, setCat] = useState("");
  const products = cat ? all.filter((p) => p.category_id === cat) : all;
  const nameOf = (p) => pick(p, "name") || t(`products.items.${p.id}.name`, { defaultValue: p.id });

  return (
    <section className="page">
      <div className="wrap">
        <span className="eyebrow dark">{t("products.eyebrow")}</span>
        <h1>{t("products.title")}</h1>
        <p className="lead">{t("products.intro")}</p>

        {categories.length > 0 && (
          <div className="chips" role="group">
            <button className={`chip ${cat === "" ? "active" : ""}`} onClick={() => setCat("")}>
              {t("products.all", { defaultValue: "Alle / Todos" })}
            </button>
            {categories.map((c) => (
              <button key={c.id} className={`chip ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>
                {pick(c, "name")}
              </button>
            ))}
          </div>
        )}

        <div className="chips">
          {products.map((p) => (
            <a key={p.id} className="chip" href={`#${p.id}`}>{nameOf(p)}</a>
          ))}
        </div>

        <div className="notice">{t("products.notice")}</div>

        <div className="product-list">
          {products.map((p) => {
            const base = `products.items.${p.id}`;
            const facts = list(t(`${base}.facts`, { returnObjects: true, defaultValue: [] }));
            const careful = list(t(`${base}.careful`, { returnObjects: true, defaultValue: [] }));
            const description = pick(p, "description") || t(`${base}.what`, { defaultValue: "" });
            const soldOut = p.badge === "soldout";
            const promo = promoPrice[p.id];

            return (
              <article className="product-block" key={p.id} id={p.id}>
                <div className="product-head">
                  <h2>{nameOf(p)}</h2>
                  <div className="badges">
                    {p.badge && <span className="pill">{badgeLabel(p.badge)}</span>}
                    <Badge kind="gluten" value={p.gluten} />
                    <Badge kind="lactose" value={p.lactose} />
                  </div>
                </div>

                {p.image_url && <img className="product-photo" src={p.image_url} alt={nameOf(p)} loading="lazy" />}
                {description && <p>{description}</p>}
                {p.price != null && (
                  <p>
                    {promo != null ? <><s>{money(p.price)}</s> <strong>{money(promo)}</strong></> : <strong>{money(p.price)}</strong>}
                  </p>
                )}

                {(facts.length > 0 || careful.length > 0) && (
                  <div className="product-cols">
                    <div>
                      <h3>{t("products.factsTitle")}</h3>
                      <ul>{facts.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                    <div>
                      <h3>{t("products.carefulTitle")}</h3>
                      <ul>{careful.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                  </div>
                )}

                <p>
                  <Link to={`/bestellen?produto=${p.id}`} className="button button-primary small" aria-disabled={soldOut}>
                    {soldOut ? badgeLabel("soldout") : t("home.ctaOrder")}
                  </Link>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
