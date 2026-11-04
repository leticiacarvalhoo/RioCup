import { useCallback, useEffect, useState } from "react";
import { supabase, uid } from "../lib/supabase";
import { useContent } from "../content/ContentContext";
import { ImageUpload, useToast } from "./ui";

const toLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

/**
 * CRUD genérico sobre uma tabela do Supabase.
 * fields: [{ name, label, type: text|textarea|number|bool|select|image|datetime,
 *            required, min, money, options, list, hint }]
 * textId: campo usado para gerar o id (tabelas com id de texto).
 */
export default function Resource({
  table, title, fields, textId, defaults = {}, sortBy = "position",
  validate, rowActions, prefill, labelOf, hint, newLabel = "Adicionar",
}) {
  const toast = useToast();
  const { refresh } = useContent();
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(table).select("*").order(sortBy, { ascending: true, nullsFirst: false });
    if (error) toast(error.message, "error");
    else setRows(data);
  }, [table, sortBy, toast]);

  useEffect(() => { load(); }, [load]);

  const label = (r) => labelOf?.(r) || r.name_pt || r.title_pt || r.label || r.id;

  function edit(row) {
    const d = { _orig: row, id: row.id };
    for (const f of fields) d[f.name] = f.type === "datetime" ? toLocal(row[f.name]) : (row[f.name] ?? "");
    const pre = prefill?.(row) || {};
    for (const k of Object.keys(pre)) if (!d[k]) d[k] = pre[k];
    setDraft(d);
  }

  async function save(e) {
    e.preventDefault();
    const d = draft;
    const payload = {};
    for (const f of fields) {
      let v = d[f.name];
      if (f.type === "bool") { payload[f.name] = !!v; continue; }
      if (typeof v === "string") v = v.trim();
      const mustHave = f.required && (d._new || d._orig?.[f.name]);
      if (v === "" || v == null) {
        if (mustHave) return toast(`Preencha o campo “${f.label}”.`, "error");
        payload[f.name] = null;
        continue;
      }
      if (f.type === "number") {
        v = Number(String(v).replace(",", "."));
        if (!Number.isFinite(v) || (f.min != null && v < f.min)) return toast(`“${f.label}” tem um valor inválido.`, "error");
      }
      if (f.type === "datetime") v = new Date(v).toISOString();
      payload[f.name] = v;
    }
    const problem = validate?.(payload, d);
    if (problem) return toast(problem, "error");

    setBusy(true);
    let error, data;
    if (d._new) {
      const extra = { ...(textId ? { id: uid(payload[textId] || "item") } : {}), ...(sortBy === "position" ? { position: rows.length } : {}) };
      ({ error } = await supabase.from(table).insert({ ...payload, ...extra }));
      data = [1];
    } else {
      ({ data, error } = await supabase.from(table).update(payload).eq("id", d.id).select());
    }
    setBusy(false);
    if (error) return toast(error.message, "error");
    if (!data?.length) return toast("Nada foi salvo. Entre novamente: sua sessão pode ter expirado.", "error");
    toast(d._new ? "Item criado com sucesso." : "Alterações salvas.");
    setDraft(null);
    await load();
    refresh();
  }

  async function remove(row) {
    if (!window.confirm(`Excluir “${label(row)}”? Esta ação não pode ser desfeita.`)) return;
    const { data, error } = await supabase.from(table).delete().eq("id", row.id).select();
    if (error) return toast(error.message, "error");
    if (!data?.length) return toast("Não foi possível excluir. Entre novamente e tente de novo.", "error");
    toast("Item excluído.");
    await load();
    refresh();
  }

  async function toggle(row) {
    const { data, error } = await supabase.from(table).update({ active: !row.active }).eq("id", row.id).select();
    if (error || !data?.length) return toast(error?.message || "Não foi possível alterar.", "error");
    toast(row.active ? "Desativado: some do site, mas continua salvo." : "Ativado: já aparece no site.");
    await load();
    refresh();
  }

  const cols = fields.filter((f) => f.list);
  const hasActive = fields.some((f) => f.name === "active");

  const cell = (f, r) => {
    const v = r[f.name];
    if (f.type === "image") return v ? <img src={v} alt="" className="thumb" /> : "—";
    if (f.type === "bool") return v ? "Sim" : "Não";
    if (f.type === "select") return f.options.find((o) => o.value === v)?.label ?? (v || "—");
    if (f.type === "number") return v == null ? "—" : f.money ? Number(v).toLocaleString("de-DE", { style: "currency", currency: "EUR" }) : v;
    if (f.type === "datetime") return v ? new Date(v).toLocaleString() : "—";
    return v || "—";
  };

  const input = (f) => {
    const v = draft[f.name] ?? "";
    const set = (x) => setDraft((d) => ({ ...d, [f.name]: x }));
    switch (f.type) {
      case "textarea": return <textarea rows="3" value={v} onChange={(e) => set(e.target.value)} />;
      case "bool": return <input type="checkbox" checked={!!draft[f.name]} onChange={(e) => set(e.target.checked)} />;
      case "image": return <ImageUpload value={v} onChange={set} folder={table} />;
      case "number": return <input type="number" step="0.01" min={f.min} value={v} onChange={(e) => set(e.target.value)} />;
      case "datetime": return <input type="datetime-local" value={v} onChange={(e) => set(e.target.value)} />;
      case "select": return (
        <select value={v} onChange={(e) => set(e.target.value)}>
          {!f.required && <option value="">—</option>}
          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      default: return <input value={v} onChange={(e) => set(e.target.value)} />;
    }
  };

  return (
    <div className="admin-section">
      <div className="res-head">
        <h2>{title}</h2>
        {!draft && <button className="button button-primary small" onClick={() => setDraft({ _new: true, ...defaults })}>{newLabel}</button>}
      </div>
      {hint && <p className="fineprint">{hint}</p>}

      {draft && (
        <form className="res-form" onSubmit={save}>
          <h3>{draft._new ? "Novo item" : `Editar: ${label(draft._orig)}`}</h3>
          <div className="row">
            {fields.map((f) => (
              <label key={f.name} className={`field ${f.type === "bool" ? "check" : ""}`}>
                <span>{f.label}{f.required && " *"}</span>
                {input(f)}
                {f.hint && <small>{f.hint}</small>}
              </label>
            ))}
          </div>
          <div className="actions">
            <button className="button button-primary small" disabled={busy}>{busy ? "Salvando…" : "Salvar"}</button>
            <button type="button" className="button button-outline small" onClick={() => setDraft(null)}>Cancelar</button>
          </div>
        </form>
      )}

      {rows.length === 0 ? <p className="empty">Nada cadastrado ainda. Use “{newLabel}” para criar o primeiro item.</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr>{cols.map((f) => <th key={f.name}>{f.label}</th>)}<th /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={hasActive && !r.active ? "row-off" : ""}>
                  {cols.map((f, i) => <td key={f.name}>{i === 0 && f.type !== "image" ? <strong>{cell(f, r)}</strong> : cell(f, r)}</td>)}
                  <td>
                    <div className="actions">
                      <button className="button button-outline small" onClick={() => edit(r)}>Editar</button>
                      {hasActive && <button className="button button-outline small" onClick={() => toggle(r)}>{r.active ? "Desativar" : "Ativar"}</button>}
                      {rowActions?.(r)}
                      <button className="button button-outline small danger" onClick={() => remove(r)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
