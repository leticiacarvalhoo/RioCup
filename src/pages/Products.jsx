import { useTranslation } from "react-i18next";
import { products } from "../data/products";

function Badge({ kind, value }) {
  const { t } = useTranslation();
  return <span className={`badge badge-${value}`}>{t(`diet.${kind}.${value}`)}</span>;
}

export default function Products() {
  const { t } = useTranslation();

  return (
    <section className="page">
      <div className="wrap">
        <span className="eyebrow dark">{t("products.eyebrow")}</span>
        <h1>{t("products.title")}</h1>
        <p className="lead">{t("products.intro")}</p>

        <div className="chips">
          {products.map((p) => (
            <a key={p.id} className="chip" href={`#${p.id}`}>
              {t(`products.items.${p.id}.name`)}
            </a>
          ))}
        </div>

        <div className="notice">{t("products.notice")}</div>

        <div className="product-list">
          {products.map((p) => {
            const base = `products.items.${p.id}`;
            const facts = t(`${base}.facts`, { returnObjects: true });
            const careful = t(`${base}.careful`, { returnObjects: true });

            return (
              <article className="product-block" key={p.id} id={p.id}>
                <div className="product-head">
                  <h2>{t(`${base}.name`)}</h2>
                  <div className="badges">
                    <Badge kind="gluten" value={p.gluten} />
                    <Badge kind="lactose" value={p.lactose} />
                  </div>
                </div>

                <p>{t(`${base}.what`)}</p>

                <div className="product-cols">
                  <div>
                    <h3>{t("products.factsTitle")}</h3>
                    <ul>
                      {facts.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>{t("products.carefulTitle")}</h3>
                    <ul>
                      {careful.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}