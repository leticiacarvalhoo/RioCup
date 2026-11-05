import { useState } from "react";
import { useTranslation } from "react-i18next";
import { acaiSizes, baseOptions, crunchCup, dayBowlPrice, pickupTimes } from "../data/acai";
import { dayBowls, toppings, toppingGroups } from "../data/toppings";
import { money } from "../utils/money";

// Só estes grupos contam para os toppings incluídos no tamanho
const COUNTED_GROUPS = ["inside", "top"];
const MAX_SAUCES = 2;

export default function Order() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === "pt" ? "pt" : "de";
  const label = (item) => item[lang];

  const [mode, setMode] = useState("custom");
  const [base, setBase] = useState("acai");
  const [size, setSize] = useState("M");
  const [bowlId, setBowlId] = useState(dayBowls[0].id);
  const [selected, setSelected] = useState([]);
  const [sauces, setSauces] = useState([]);
  const [crunch, setCrunch] = useState(null);
  const [lid, setLid] = useState(false);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [pickup, setPickup] = useState(pickupTimes[0]);
  const [note, setNote] = useState("");
  const [allergy, setAllergy] = useState("no");
  const [allergyText, setAllergyText] = useState("");
  const [status, setStatus] = useState(null);

  const byId = (id) => toppings.find((x) => x.id === id);
  const isBowl = mode === "bowl";
  const bowl = dayBowls.find((b) => b.id === bowlId);
  const sizeInfo = acaiSizes.find((s) => s.id === size);

  // Cálculo do preço (modo "montar o meu")
  const countedN = selected.filter((id) => COUNTED_GROUPS.includes(byId(id).group)).length;
  const included = sizeInfo.included;
  const extraN = included === null ? 0 : Math.max(0, countedN - included);
  const extraCost = extraN * (sizeInfo.extraPrice ?? 0);

  const groupPrice = (groupId) => toppingGroups.find((g) => g.id === groupId)?.price ?? 0;
  const paidCost = selected.reduce((sum, id) => sum + groupPrice(byId(id).group), 0);

  const crunchActive = !isBowl && size === crunchCup.size && crunch !== null;
  const crunchCost = crunchActive ? crunchCup.price : 0;

  const unitPrice = isBowl ? dayBowlPrice : sizeInfo.price + extraCost + paidCost + crunchCost;
  const total = unitPrice * qty;

  let countText;
  if (included === null) {
    countText = t("order.toppingsAll", { n: countedN });
  } else if (extraN === 0) {
    countText = t("order.toppingsIncluded", { n: countedN, max: included });
  } else {
    countText = t("order.toppingsOver", {
      n: countedN,
      max: included,
      extra: extraN,
      cost: money(extraCost),
    });
  }

  function changeSize(newSize) {
    setSize(newSize);
    if (newSize !== crunchCup.size) setCrunch(null);
  }

  function toggleTopping(id) {
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  function toggleSauce(id) {
    setSauces((list) => {
      if (list.includes(id)) return list.filter((x) => x !== id);
      return list.length >= MAX_SAUCES ? list : [...list, id];
    });
  }

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) return setStatus("needName");
    if (allergy === "yes" && !allergyText.trim()) return setStatus("needAllergy");
    setStatus("demo");
  }

  const pill = (active) => `topping ${active ? "on" : ""}`;

  return (
    <section className="page">
      <div className="wrap">
        <span className="eyebrow dark">{t("order.eyebrow")}</span>
        <h1>{t("order.title")}</h1>
        <p className="lead">{t("order.intro")}</p>

        <form className="order-layout" onSubmit={submit}>
          <div className="order-form">
            <fieldset>
              <legend>{t("order.modeTitle")}</legend>
              <div className="topping-list">
                {["custom", "bowl"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={pill(mode === m)}
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                  >
                    {t(m === "custom" ? "order.modeCustom" : "order.modeBowl")}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>{t("order.baseTitle")}</legend>
              <div className="topping-list">
                {baseOptions.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={pill(base === b.id)}
                    aria-pressed={base === b.id}
                    onClick={() => setBase(b.id)}
                  >
                    {label(b)}
                  </button>
                ))}
              </div>
            </fieldset>

            {isBowl ? (
              <fieldset>
                <legend>{t("order.bowlTitle")}</legend>
                <p className="hint">{t("order.bowlIntro", { price: money(dayBowlPrice) })}</p>
                <div className="bowl-grid">
                  {dayBowls.map((b) => (
                    <label
                      key={b.id}
                      className={`bowl-card ${bowlId === b.id ? "selected" : ""}`}
                    >
                      <input
                        type="radio"
                        name="bowl"
                        value={b.id}
                        checked={bowlId === b.id}
                        onChange={() => setBowlId(b.id)}
                      />
                      <strong>{b.name}</strong>
                      <span>{b.toppings.map((id) => label(byId(id))).join(", ")}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <>
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
                  <p className="topping-count">{countText}</p>
                  {included !== null && (
                    <p className="hint">
                      {t("order.toppingsHintExtra", { price: money(sizeInfo.extraPrice) })}
                    </p>
                  )}

                  {toppingGroups.map((group) => {
                    const items = toppings.filter((x) => x.group === group.id);
                    if (items.length === 0) return null;
                    const isSauce = group.id === "sauce";
                    const chosen = isSauce ? sauces : selected;

                    return (
                      <div className="topping-group" key={group.id}>
                        <h3>
                          {label(group)}
                          {group.price ? ` (+${money(group.price)})` : ""}
                        </h3>
                        <div className="topping-list">
                          {items.map((item) => {
                            const on = chosen.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                className={pill(on)}
                                aria-pressed={on}
                                disabled={isSauce && !on && sauces.length >= MAX_SAUCES}
                                onClick={() =>
                                  isSauce ? toggleSauce(item.id) : toggleTopping(item.id)
                                }
                              >
                                {label(item)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </fieldset>

                {size === crunchCup.size && (
                  <fieldset>
                    <legend>{t("order.crunchTitle")}</legend>
                    <p className="hint">{t("order.crunchHint", { price: money(crunchCup.price) })}</p>
                    <div className="topping-list">
                      <button
                        type="button"
                        className={pill(crunch === null)}
                        aria-pressed={crunch === null}
                        onClick={() => setCrunch(null)}
                      >
                        {t("order.crunchNone")}
                      </button>
                      {["white", "milk"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={pill(crunch === c)}
                          aria-pressed={crunch === c}
                          onClick={() => setCrunch(c)}
                        >
                          {t(`order.crunch.${c}`)}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
              </>
            )}

            <label className="check-row">
              <input type="checkbox" checked={lid} onChange={(e) => setLid(e.target.checked)} />
              {t("order.lidLabel")}
            </label>

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

            <fieldset>
              <legend>{t("order.allergyTitle")}</legend>
              <div className="topping-list">
                {["no", "yes"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className={pill(allergy === v)}
                    aria-pressed={allergy === v}
                    onClick={() => setAllergy(v)}
                  >
                    {t(v === "no" ? "order.allergyNo" : "order.allergyYes")}
                  </button>
                ))}
              </div>
              {allergy === "yes" && (
                <div className="field spaced">
                  <input
                    value={allergyText}
                    onChange={(e) => setAllergyText(e.target.value)}
                    placeholder={t("order.allergyPlaceholder")}
                    aria-label={t("order.allergyTitle")}
                  />
                </div>
              )}
            </fieldset>

            <label className="field">
              <span>{t("order.noteLabel")}</span>
              <textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </div>

          <aside className="summary">
            <h2>{t("order.summaryTitle")}</h2>
            <dl>
              <div>
                <dt>{t("order.summaryItem", { qty, size: isBowl ? "S" : size })}</dt>
                <dd>{money(total)}</dd>
              </div>
              <div>
                <dt>{t("order.summaryBase")}</dt>
                <dd>{label(baseOptions.find((b) => b.id === base))}</dd>
              </div>

              {isBowl ? (
                <div>
                  <dt>{t("order.summaryBowl")}</dt>
                  <dd>{bowl.name}</dd>
                </div>
              ) : (
                <>
                  <div>
                    <dt>{t("order.summaryToppings")}</dt>
                    <dd>
                      {selected.length
                        ? selected.map((id) => label(byId(id))).join(", ")
                        : t("order.noToppings")}
                    </dd>
                  </div>
                  {sauces.length > 0 && (
                    <div>
                      <dt>{t("order.summarySauces")}</dt>
                      <dd>{sauces.map((id) => label(byId(id))).join(", ")}</dd>
                    </div>
                  )}
                  {crunchActive && (
                    <div>
                      <dt>{t("order.summaryCrunch")}</dt>
                      <dd>{t(`order.crunch.${crunch}`)}</dd>
                    </div>
                  )}
                </>
              )}

              {lid && (
                <div>
                  <dt>{t("order.summaryLid")}</dt>
                  <dd>{t("order.yes")}</dd>
                </div>
              )}
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
            {status === "needAllergy" && (
              <p className="status error" role="alert">{t("order.needAllergy")}</p>
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