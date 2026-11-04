import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContent } from "../content/ContentContext";
import { pickupTimes } from "../data/acai";
import { money } from "../utils/money";
import "./order-extra.css";

export default function Order() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === "pt" ? "pt" : "de";
  const [params] = useSearchParams();
  const { raw, products, categories, pick, promoPrice, sizes, limits, groups, toppings, flavorsFor, badgeLabel } = useContent();

  /* Como cada produto é vendido: tamanhos e toppings vêm das tabelas de ligação. */
  const setupOf = (p) => {
    const sizeIds = raw.product_sizes.filter((r) => r.product_id === p.id).map((r) => r.size_id);
    const topIds = raw.product_toppings.filter((r) => r.product_id === p.id).map((r) => r.topping_id);
    const pSizes = sizes.filter((s) => sizeIds.includes(s.id));
    const pToppings = toppings.filter((x) => topIds.includes(x.id));
    const promo = promoPrice[p.id];
    const unit = pSizes.length ? null : promo ?? p.price;
    const soldOut = p.badge === "soldout";
    return { pSizes, pToppings, unit, promo, soldOut, orderable: !soldOut && (pSizes.length > 0 || unit != null) };
  };
  const nameOf = (p) => pick(p, "name") || t(`products.items.${p.id}.name`, { defaultValue: p.id });

  const firstParam = params.get("produto");
  const initial = products.find((p) => p.id === firstParam && setupOf(p).orderable)?.id || "";

  const [cat, setCat] = useState("");
  const [productId, setProductId] = useState(initial);
  const [sizeId, setSizeId] = useState(() => (initial ? setupOf(products.find((p) => p.id === initial)).pSizes[0]?.id || "" : ""));
  const [flavorId, setFlavorId] = useState("");
  const [picked, setPicked] = useState([]);
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [pickup, setPickup] = useState(pickupTimes[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const product = products.find((p) => p.id === productId);
  const setup = product ? setupOf(product) : null;
  const flavors = product ? flavorsFor(product.id) : [];
  const limit = setup?.pSizes.length ? limits[sizeId] ?? null : null;
  const atLimit = limit !== null && picked.length >= limit;
  const visible = cat ? products.filter((p) => p.category_id === cat) : products;

  const sizePrice = setup?.pSizes.find((s) => s.id === sizeId)?.price ?? 0;
  const extras = picked.reduce((sum, id) => sum + (toppings.find((x) => x.id === id)?.extraPrice || 0), 0);
  const unitPrice = setup ? (setup.pSizes.length ? sizePrice : setup.unit) + extras : 0;

  function choose(p) {
    const s = setupOf(p);
    if (!s.orderable) return;
    setProductId(p.id);
    setSizeId(s.pSizes[0]?.id || "");
    setFlavorId("");
    setPicked([]);
    setQty(1);
    setError("");
  }

  function changeSize(id) {
    setSizeId(id);
    const l = limits[id];
    if (l != null) setPicked((list) => list.slice(0, l));
  }

  const toggleTopping = (id) =>
    setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : atLimit ? list : [...list, id]));

  function addToCart() {
    if (flavors.length && !flavorId) return setError(t("order.needFlavor", { defaultValue: "Escolha um sabor." }));
    const flavor = flavors.find((f) => f.id === flavorId);
    const size = setup.pSizes.find((s) => s.id === sizeId);
    setCart((c) => [
      ...c,
      {
        key: `${Date.now()}-${c.length}`,
        label: [nameOf(product), size?.label, flavor && pick(flavor, "name")].filter(Boolean).join(" · "),
        toppings: picked.map((id) => toppings.find((x) => x.id === id)?.[lang]).filter(Boolean),
        unit: unitPrice,
        qty,
      },
    ]);
    setProductId("");
    setPicked([]);
    setError("");
    setStatus(null);
  }

  const total = cart.reduce((s, i) => s + i.unit * i.qty, 0);
  const move = (key, d) => setCart((c) => c.map((i) => (i.key === key ? { ...i, qty: Math.max(0, Math.min(20, i.qty + d)) } : i)).filter((i) => i.qty > 0));

  function submit(event) {
    event.preventDefault();
    if (!cart.length) return setStatus("empty");
    setStatus(name.trim() ? "demo" : "needName");
  }

  return (
    <section className="page">
      <div className="wrap">
        <span className="eyebrow dark">{t("order.eyebrow")}</span>
        <h1>{t("order.title")}</h1>
        <p className="lead">{t("order.intro")}</p>

        <form className="order-layout" onSubmit={submit}>
          <div className="order-form">
            <fieldset>
              <legend>{t("order.chooseTitle", { defaultValue: "1. Escolha o que quer pedir" })}</legend>
              {categories.length > 0 && (
                <div className="chips" role="group">
                  <button type="button" className={`chip ${cat === "" ? "active" : ""}`} onClick={() => setCat("")}>{t("products.all", { defaultValue: "Alle / Todos" })}</button>
                  {categories.map((c) => (
                    <button type="button" key={c.id} className={`chip ${cat === c.id ? "active" : ""}`} onClick={() => setCat(c.id)}>{pick(c, "name")}</button>
                  ))}
                </div>
              )}
              <div className="pick-grid">
                {visible.map((p) => {
                  const s = setupOf(p);
                  const from = s.pSizes.length ? Math.min(...s.pSizes.map((x) => x.price)) : s.unit;
                  return (
                    <button
                      type="button" key={p.id} disabled={!s.orderable}
                      className={`pick ${productId === p.id ? "selected" : ""}`} aria-pressed={productId === p.id}
                      onClick={() => choose(p)}
                    >
                      <strong>{nameOf(p)}</strong>
                      <span>
                        {s.soldOut ? badgeLabel("soldout") : from != null ? `${s.pSizes.length ? t("order.from", { defaultValue: "ab / a partir de" }) + " " : ""}${money(from)}` : t("order.noPrice", { defaultValue: "Em breve" })}
                      </span>
                    </button>
                  );
                })}
                {visible.length === 0 && <p className="empty">{t("order.noProducts", { defaultValue: "Nenhum produto disponível agora." })}</p>}
              </div>
            </fieldset>

            {product && (
              <div className="builder">
                <h2>{nameOf(product)}</h2>

                {setup.pSizes.length > 0 && (
                  <fieldset>
                    <legend>{t("order.sizeTitle")}</legend>
                    <div className="size-options">
                      {setup.pSizes.map((s) => (
                        <label key={s.id} className={`size-option ${sizeId === s.id ? "selected" : ""}`}>
                          <input type="radio" name="size" value={s.id} checked={sizeId === s.id} onChange={() => changeSize(s.id)} />
                          <strong>{s.label}</strong>
                          <span>{money(s.price)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}

                {flavors.length > 0 && (
                  <label className="field">
                    <span>{t("order.flavorLabel", { defaultValue: "Sabor" })}</span>
                    <select value={flavorId} onChange={(e) => setFlavorId(e.target.value)}>
                      <option value="">—</option>
                      {flavors.map((f) => <option key={f.id} value={f.id}>{pick(f, "name")}</option>)}
                    </select>
                  </label>
                )}

                {setup.pToppings.length > 0 && (
                  <fieldset>
                    <legend>{t("order.toppingsTitle")}</legend>
                    <p className="topping-count">
                      {limit === null ? t("order.toppingsUnlimited", { n: picked.length }) : t("order.toppingsCount", { n: picked.length, max: limit })}
                    </p>
                    {groups.map((g) => {
                      const items = setup.pToppings.filter((x) => x.group === g.id);
                      if (!items.length) return null;
                      return (
                        <div className="topping-group" key={g.id}>
                          <h3>{g[lang]}</h3>
                          <div className="topping-list">
                            {items.map((item) => {
                              const on = picked.includes(item.id);
                              return (
                                <button key={item.id} type="button" className={`topping ${on ? "on" : ""}`} aria-pressed={on} disabled={!on && atLimit} onClick={() => toggleTopping(item.id)}>
                                  {item[lang]}{item.extraPrice ? ` +${money(item.extraPrice)}` : ""}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {atLimit && <p className="status">{t("order.toppingsLimit")}</p>}
                  </fieldset>
                )}

                <fieldset>
                  <legend>{t("order.qtyTitle")}</legend>
                  <div className="stepper">
                    <button type="button" aria-label="−" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                    <output>{qty}</output>
                    <button type="button" aria-label="+" onClick={() => setQty(Math.min(20, qty + 1))}>+</button>
                  </div>
                </fieldset>

                {error && <p className="status error" role="alert">{error}</p>}
                <button type="button" className="button button-primary" onClick={addToCart}>
                  {t("order.add", { defaultValue: "Adicionar ao pedido" })} · {money(unitPrice * qty)}
                </button>
              </div>
            )}

            <label className="field">
              <span>{t("order.nameLabel")}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("order.namePlaceholder")} />
            </label>

            <label className="field">
              <span>{t("order.pickupLabel")}</span>
              <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
                {pickupTimes.map((time) => <option key={time} value={time}>{time}</option>)}
              </select>
            </label>

            <label className="field">
              <span>{t("order.noteLabel")}</span>
              <textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>

          <aside className="summary">
            <h2>{t("order.summaryTitle")}</h2>
            {cart.length === 0 ? (
              <p className="empty">{t("order.emptyCart", { defaultValue: "Seu pedido está vazio. Escolha um produto ao lado." })}</p>
            ) : (
              <ul className="cart-lines">
                {cart.map((i) => (
                  <li key={i.key}>
                    <div>
                      <strong>{i.label}</strong>
                      {i.toppings.length > 0 && <small>{i.toppings.join(", ")}</small>}
                    </div>
                    <div className="cart-qty">
                      <button type="button" aria-label="−" onClick={() => move(i.key, -1)}>−</button>
                      <output>{i.qty}</output>
                      <button type="button" aria-label="+" onClick={() => move(i.key, 1)}>+</button>
                    </div>
                    <span>{money(i.unit * i.qty)}</span>
                  </li>
                ))}
              </ul>
            )}

            <dl>
              <div><dt>{t("order.pickupLabel")}</dt><dd>{pickup}</dd></div>
            </dl>
            <div className="total"><span>{t("order.total")}</span><span>{money(total)}</span></div>

            <button className="button button-primary" type="submit">{t("order.submit")}</button>

            {status === "empty" && <p className="status error" role="alert">{t("order.needItem", { defaultValue: "Adicione pelo menos um produto." })}</p>}
            {status === "needName" && <p className="status error" role="alert">{t("order.needName")}</p>}
            {status === "demo" && <p className="status" role="status">{t("order.demo", { name: name.trim(), total: money(total), time: pickup })}</p>}
            <p className="fineprint">{t("order.fineprint")}</p>
          </aside>
        </form>
      </div>
    </section>
  );
}