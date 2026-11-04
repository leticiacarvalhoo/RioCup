import { Link } from "react-router-dom";
import { useContent } from "../content/ContentContext";
import { money } from "../utils/money";

export default function PromoBanners() {
  const { promos, pick } = useContent();
  const list = promos.filter((p) => p.show_on_home);
  if (!list.length) return null;

  return (
    <section className="section">
      <div className="wrap promo-grid">
        {list.map((p) => {
          const to = p.link || "/bestellen";
          const cta = to.startsWith("/")
            ? <Link to={to} className="button button-light">Ver / Ansehen</Link>
            : <a href={to} className="button button-light" target="_blank" rel="noreferrer">Ver / Ansehen</a>;
          return (
            <article className="promo" key={p.id} style={p.banner_url ? { "--img": `url("${p.banner_url}")` } : undefined}>
              <h3>{pick(p, "title")}</h3>
              {pick(p, "text") && <p>{pick(p, "text")}</p>}
              {p.promo_price != null && <strong>{money(Number(p.promo_price))}</strong>}
              <div>{cta}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
