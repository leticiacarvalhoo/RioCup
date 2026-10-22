import { useState } from "react";
import { useTranslation } from "react-i18next";
import { acaiSizes, pickupTimes } from "../data/acai";
import { toppings, toppingGroups, toppingLimits } from "../data/toppings";
import { money } from "../utils/money";

export default function Order() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === "pt" ? "pt" : "de";

  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [pickup, setPickup] = useState(pickupTimes[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(null);

  const limit = toppingLimits[size];
  const atLimit = limit !== null && selected.length >= limit;

  const findTopping = (id) => toppings.find((x) => x.id === id);
  const extrasCost = selected.reduce((sum, id) => sum + (findTopping(id)?.extraPrice || 0), 0);
  const unitPrice = acaiSizes.find((s) => s.id === size).price + extrasCost;
  const total = unitPrice * qty;
  const selectedNames = selected.map((id) => findTopping(id)[lang]);

  function changeSize(newSize) {
    setSize(newSize);
    const newLimit = toppingLimits[newSize];
    if (newLimit !== null) setSelected((list) => list.slice(0, newLimit));
  }

  function toggleTopping(id) {
    setSelected((list) => {
      if (list.includes(id)) return list.filter((x) => x !== id);
      if (limit !== null && list.length >= limit) return list;
      return [...list, id];
    });
  }

  function submit(event) {
    event.preventDefault();
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
              <legend>{t("order.sizeTitle")}</legend>
              <div className="size-options">
                {acaiSizes.map((s) => (
                  <label
                    key={s.id}
                    className={`size-option ${size === s.id ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="size"
                      value={s.id}
                      checked={size === s.id}
                      onChange={() => changeSize(s.id)}
                    />
                    <strong>{s.id}</strong>
                    <span>{money(s.price)}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>{t("order.toppingsTitle")}</legend>
              <p className="topping-count">
                {limit === null
                  ? t("order.toppingsUnlimited", { n: selected.length })
                  : t("order.toppingsCount", { n: selected.length, max: limit })}
              </p>

              {toppingGroups.map((group) => {
                const items = toppings.filter((x) => x.group === group.id);
                if (items.length === 0) return null;

                return (
                  <div className="topping-group" key={group.id}>
                    <h3>{group[lang]}</h3>
                    <div className="topping-list">
                      {items.map((item) => {
                        const on = selected.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`topping ${on ? "on" : ""}`}
                            aria-pressed={on}
                            disabled={!on && atLimit}
                            onClick={() => toggleTopping(item.id)}
                          >
                            {item[lang]}
                            {item.extraPrice ? ` +${money(item.extraPrice)}` : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {atLimit && <p className="status">{t("order.toppingsLimit")}</p>}
            </fieldset>

            <fieldset>
              <legend>{t("order.qtyTitle")}</legend>
              <div className="stepper">
                <button type="button" aria-label="−" onClick={() => setQty(Math.max(1, qty - 1))}>
                  −
                </button>
                <output>{qty}</output>
                <button type="button" aria-label="+" onClick={() => setQty(Math.min(20, qty + 1))}>
                  +
                </button>
              </div>
            </fieldset>

            <label className="field">
              <span>{t("order.nameLabel")}</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("order.namePlaceholder")}
              />
            </label>

            <label className="field">
              <span>{t("order.pickupLabel")}</span>
              <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
                {pickupTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>{t("order.noteLabel")}</span>
              <textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>

          <aside className="summary">
            <h2>{t("order.summaryTitle")}</h2>
            <dl>
              <div>
                <dt>{t("order.summaryItem", { qty, size })}</dt>
                <dd>{money(total)}</dd>
              </div>
              <div>
                <dt>{t("order.summaryToppings")}</dt>
                <dd>{selectedNames.length ? selectedNames.join(", ") : t("order.noToppings")}</dd>
              </div>
              <div>
                <dt>{t("order.pickupLabel")}</dt>
                <dd>{pickup}</dd>
              </div>
            </dl>

            <div className="total">
              <span>{t("order.total")}</span>
              <span>{money(total)}</span>
            </div>

            <button className="button button-primary" type="submit">
              {t("order.submit")}
            </button>

            {status === "needName" && (
              <p className="status error" role="alert">{t("order.needName")}</p>
            )}
            {status === "demo" && (
              <p className="status" role="status">
                {t("order.demo", { name: name.trim(), total: money(total), time: pickup })}
              </p>
            )}

            <p className="fineprint">{t("order.fineprint")}</p>
          </aside>
        </form>
      </div>
    </section>
  );
}