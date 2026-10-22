import { useState } from "react";
import { useTranslation } from "react-i18next";
import usePersistentState from "../hooks/usePersistentState";

// Dados de exemplo (teste). Troque pelos itens reais pelo próprio painel.
const initialStock = [
  { id: 1, name: "Granola", qty: 10, min: 6, unit: "" },
  { id: 2, name: "Morango", qty: 4, min: 6, unit: "caixas" },
  { id: 3, name: "Oreo", qty: 5, min: 2, unit: "" },
];

// Crítico quando a quantidade é igual ou menor que o nível definido
const getStatus = (item) => {
  if (item.qty <= 0) return "empty";
  return item.qty <= item.min ? "critical" : "ok";
};

export default function AdminStock() {
  const { t } = useTranslation();
  const [items, setItems] = usePersistentState("riocup-stock", initialStock);
  const [form, setForm] = useState({ name: "", qty: "", min: "", unit: "" });

  const alerts = items.filter((item) => getStatus(item) !== "ok");

  function update(id, changes) {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  function addItem(event) {
    event.preventDefault();
    if (!form.name.trim()) return;
    setItems((list) => [
      ...list,
      {
        id: Date.now(),
        name: form.name.trim(),
        qty: Number(form.qty) || 0,
        min: Number(form.min) || 0,
        unit: form.unit.trim(),
      },
    ]);
    setForm({ name: "", qty: "", min: "", unit: "" });
  }

  function removeItem(id) {
    if (!window.confirm(t("admin.confirmRemove"))) return;
    setItems((list) => list.filter((item) => item.id !== id));
  }

  return (
    <div>
      {alerts.length > 0 && (
        <div className="alert-box" role="alert">
          <strong>{t("admin.alertTitle", { n: alerts.length })}</strong>
          <ul>
            {alerts.map((item) => (
              <li key={item.id}>
                {t(`admin.alertLine.${getStatus(item)}`, {
                  name: item.name,
                  qty: item.qty,
                  unit: item.unit,
                  min: item.min,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.item")}</th>
              <th>{t("admin.amount")}</th>
              <th>{t("admin.minLabel")}</th>
              <th>{t("admin.statusLabel")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const status = getStatus(item);
              return (
                <tr key={item.id} className={status !== "ok" ? "row-alert" : ""}>
                  <td>{item.name}</td>
                  <td>
                    <div className="stepper">
                      <button
                        type="button"
                        aria-label="−"
                        onClick={() => update(item.id, { qty: Math.max(0, item.qty - 1) })}
                      >
                        −
                      </button>
                      <output>{item.qty}</output>
                      <button
                        type="button"
                        aria-label="+"
                        onClick={() => update(item.id, { qty: item.qty + 1 })}
                      >
                        +
                      </button>
                      {item.unit && <span className="unit">{item.unit}</span>}
                    </div>
                  </td>
                  <td>
                    <input
                      className="num-input"
                      type="number"
                      min="0"
                      value={item.min}
                      aria-label={t("admin.minLabel")}
                      onChange={(e) => update(item.id, { min: Math.max(0, Number(e.target.value)) })}
                    />
                  </td>
                  <td>
                    <span className={`status-pill status-${status}`}>
                      {t(`admin.status.${status}`)}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="chip" onClick={() => removeItem(item.id)}>
                      {t("admin.remove")}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="admin-sub">{t("admin.addItemTitle")}</h3>
      <form className="inline-form" onSubmit={addItem}>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t("admin.namePlaceholder")}
          aria-label={t("admin.namePlaceholder")}
        />
        <input
          type="number"
          min="0"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
          placeholder={t("admin.qtyPlaceholder")}
          aria-label={t("admin.qtyPlaceholder")}
        />
        <input
          type="number"
          min="0"
          value={form.min}
          onChange={(e) => setForm({ ...form, min: e.target.value })}
          placeholder={t("admin.minPlaceholder")}
          aria-label={t("admin.minPlaceholder")}
        />
        <input
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
          placeholder={t("admin.unitPlaceholder")}
          aria-label={t("admin.unitPlaceholder")}
        />
        <button className="button button-primary" type="submit">
          {t("admin.add")}
        </button>
      </form>
    </div>
  );
}