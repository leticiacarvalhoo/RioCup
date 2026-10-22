import { useState } from "react";
import { useTranslation } from "react-i18next";
import { acaiSizes, pickupTimes } from "../data/acai";
import { money } from "../utils/money";

export default function Order() {
  const { t } = useTranslation();
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [pickup, setPickup] = useState(pickupTimes[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(null);

  const unitPrice = acaiSizes.find((s) => s.id === size).price;
  const total = unitPrice * qty;

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
                      onChange={() => setSize(s.id)}
                    />
                    <strong>{s.id}</strong>
                    <span>{money(s.price)}</span>
                  </label>
                ))}
              </div>
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

            <fieldset>
              <legend>{t("order.toppingsTitle")}</legend>
              <div className="soon-box">{t("order.toppingsSoon")}</div>
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