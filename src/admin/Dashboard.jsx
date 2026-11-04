import { useTranslation } from "react-i18next";
import { useContent } from "../content/ContentContext";

/* Estoque e equipe ainda vivem no navegador (usePersistentState). Leitura só de consulta. */
const stored = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};
const pad = (n) => String(n).padStart(2, "0");
const DAY = 86400000;

/* ---------- Gráficos simples (sem biblioteca) ---------- */
function Donut({ value, total, label }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <div className="donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={`${value} de ${total} ${label}`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--lilac)" strokeWidth="16" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke="var(--brand)" strokeWidth="16"
          strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round" transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="donut-label"><strong>{value}</strong><span>de {total}</span></div>
    </div>
  );
}

function Bars({ rows, unit = "", empty }) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.value, r.mark || 0)));
  if (!rows.length) return <p className="empty">{empty}</p>;
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar-row" key={r.label}>
          <span className="bar-label">{r.label}</span>
          <div className="bar-track">
            <div className={`bar-fill ${r.tone || ""}`} style={{ width: `${(r.value / max) * 100}%` }} />
            {r.mark != null && <i className="bar-mark" style={{ left: `${(r.mark / max) * 100}%` }} title={`Mínimo: ${r.mark}`} />}
          </div>
          <span className="bar-value">{r.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

function Progress({ label, value, total, onClick }) {
  const pct = total ? Math.round((value / total) * 100) : 100;
  return (
    <button type="button" className="progress" onClick={onClick}>
      <span className="progress-top"><span>{label}</span><strong>{value}/{total}</strong></span>
      <span className="progress-track"><span className={pct === 100 ? "done" : ""} style={{ width: `${pct}%` }} /></span>
    </button>
  );
}

/* ---------- Dashboard ---------- */
export default function Dashboard({ go }) {
  const { raw } = useContent();
  const { i18n } = useTranslation();
  const now = new Date();
  const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;

  const has = (table, field, id) => raw[table].some((r) => r[field] === id);
  const hasDescription = (p) => !!p.description_pt || i18n.exists(`products.items.${p.id}.what`, { lng: "pt" });

  // Cardápio
  const active = raw.products.filter((p) => p.active !== false);
  const noPrice = active.filter((p) => p.price == null && !has("product_sizes", "product_id", p.id));
  const noPhoto = active.filter((p) => !p.image_url);
  const noCategory = active.filter((p) => !p.category_id);
  const noDescription = active.filter((p) => !hasDescription(p));
  const soldOut = active.filter((p) => p.badge === "soldout");
  const orphanToppings = raw.toppings.filter((x) => x.active !== false && !has("product_toppings", "topping_id", x.id));

  const byCategory = [...raw.categories]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((c) => ({ label: c.name_pt, value: active.filter((p) => p.category_id === c.id).length }));
  if (noCategory.length) byCategory.push({ label: "Sem categoria", value: noCategory.length, tone: "warn" });

  // Promoções
  const live = raw.promotions.filter((p) => p.active && (!p.starts_at || new Date(p.starts_at) <= now) && (!p.ends_at || new Date(p.ends_at) >= now));
  const endingSoon = live.filter((p) => p.ends_at && new Date(p.ends_at) - now < 3 * DAY);
  const expired = raw.promotions.filter((p) => p.active && p.ends_at && new Date(p.ends_at) < now);

  // Estoque e equipe (navegador)
  const stock = stored("riocup-stock");
  const critical = stock.filter((i) => Number(i.qty) <= Number(i.min));
  const team = stored("riocup-team");
  const logs = stored("riocup-hours");
  const hoursBy = team.map((m) => ({
    label: m.name,
    value: logs.filter((l) => l.memberId === m.id && String(l.date).startsWith(month)).reduce((s, l) => s + Number(l.hours || 0), 0),
  }));
  const totalHours = hoursBy.reduce((s, r) => s + r.value, 0);

  const names = (list) => list.slice(0, 3).map((p) => p.name_pt || p.label || p.name || p.id).join(", ") + (list.length > 3 ? "…" : "");
  const alerts = [
    noPrice.length && { text: `${noPrice.length} produto(s) ativo(s) sem preço: ${names(noPrice)}. Eles não podem ser pedidos.`, to: "menu", cta: "Definir preço" },
    orphanToppings.length && { text: `${orphanToppings.length} topping(s) não aparecem em nenhum produto: ${names(orphanToppings)}.`, to: "options", cta: "Ligar a produtos" },
    expired.length && { text: `${expired.length} promoção(ões) marcada(s) como ativa(s), mas já vencida(s).`, to: "promos", cta: "Revisar" },
    endingSoon.length && { text: `${endingSoon.length} promoção(ões) termina(m) em até 3 dias.`, to: "promos", cta: "Ver promoções" },
    critical.length && { text: `Estoque baixo: ${critical.slice(0, 3).map((i) => i.name).join(", ")}${critical.length > 3 ? "…" : ""}.`, to: "ops", cta: "Ver estoque" },
    soldOut.length && { text: `${soldOut.length} produto(s) com selo “Indisponível”: ${names(soldOut)}.`, to: "menu", cta: "Ver cardápio" },
  ].filter(Boolean);

  return (
    <div className="admin-section dash">
      <h2>Início</h2>

      <div className="dash-alerts">
        {alerts.length === 0 ? (
          <p className="dash-ok">Tudo certo por aqui. Nenhum ajuste pendente.</p>
        ) : (
          <>
            <h3>Precisa de atenção ({alerts.length})</h3>
            <ul>
              {alerts.map((a) => (
                <li key={a.text}>
                  <span>{a.text}</span>
                  <button className="button button-outline small" onClick={() => go(a.to)}>{a.cta}</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="kpis">
        <button className="kpi" onClick={() => go("menu")}><strong>{active.length}</strong><span>produtos à venda</span></button>
        <button className="kpi" onClick={() => go("promos")}><strong>{live.length}</strong><span>promoções no ar</span></button>
        <button className="kpi" onClick={() => go("ops")}><strong className={critical.length ? "bad" : ""}>{critical.length}</strong><span>itens com estoque baixo</span></button>
        <button className="kpi" onClick={() => go("ops")}><strong>{totalHours.toLocaleString("de-DE")} h</strong><span>horas da equipe no mês</span></button>
      </div>

      <div className="charts">
        <section className="chart-card">
          <h3>Cardápio no ar</h3>
          <div className="chart-split">
            <Donut value={active.length} total={raw.products.length} label="produtos ativos" />
            <p className="chart-note">
              {raw.products.length - active.length > 0
                ? `${raw.products.length - active.length} produto(s) desativado(s) ficam guardados e voltam completos quando você reativar.`
                : "Todos os produtos cadastrados estão à venda."}
            </p>
          </div>
        </section>

        <section className="chart-card">
          <h3>Produtos por categoria</h3>
          <Bars rows={byCategory} empty="Cadastre categorias para ver a distribuição." />
        </section>

        <section className="chart-card">
          <h3>Cardápio completo?</h3>
          <div className="progress-list">
            <Progress label="Com foto" value={active.length - noPhoto.length} total={active.length} onClick={() => go("menu")} />
            <Progress label="Com descrição" value={active.length - noDescription.length} total={active.length} onClick={() => go("menu")} />
            <Progress label="Com preço ou tamanho" value={active.length - noPrice.length} total={active.length} onClick={() => go("menu")} />
            <Progress label="Com categoria" value={active.length - noCategory.length} total={active.length} onClick={() => go("menu")} />
          </div>
        </section>

        <section className="chart-card">
          <h3>Estoque (quantidade e mínimo)</h3>
          <Bars
            rows={stock.map((i) => ({ label: i.name, value: Number(i.qty) || 0, mark: Number(i.min) || 0, tone: Number(i.qty) <= Number(i.min) ? "warn" : "" }))}
            empty="Nenhum item de estoque cadastrado ainda."
          />
        </section>

        <section className="chart-card">
          <h3>Horas da equipe neste mês</h3>
          <Bars rows={hoursBy} unit=" h" empty="Cadastre a equipe e lance as horas para ver o gráfico." />
        </section>

        <section className="chart-card">
          <h3>Promoções</h3>
          {raw.promotions.length === 0 ? (
            <p className="empty">Nenhuma promoção criada.</p>
          ) : (
            <ul className="promo-list">
              {raw.promotions.slice(0, 5).map((p) => {
                const isLive = live.includes(p);
                const days = p.ends_at ? Math.ceil((new Date(p.ends_at) - now) / DAY) : null;
                return (
                  <li key={p.id}>
                    <span>{p.title_pt}</span>
                    <em className={isLive ? "on" : ""}>{isLive ? (days != null ? `termina em ${days} dia(s)` : "sem data final") : "fora do ar"}</em>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <p className="fineprint">
        Vendas e pedidos ainda não aparecem aqui porque a página de pedidos não grava nada no banco. Quando existir uma tabela de pedidos, entram gráficos de vendas por produto e por horário.
      </p>
    </div>
  );
}
