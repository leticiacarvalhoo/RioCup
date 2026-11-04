import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useContent } from "../content/ContentContext";
import { useToast } from "./ui";

/**
 * Define como o produto é vendido na página de pedidos:
 * - com tamanhos marcados: o preço vem do tamanho escolhido;
 * - sem tamanhos: vale o preço do próprio produto;
 * - toppings: só aparecem os marcados aqui (nenhum marcado = sem toppings).
 */
export default function ProductOptions({ product, onClose, label }) {
  const { raw, refresh } = useContent();
  const toast = useToast();
  const [tops, setTops] = useState(() => new Set(raw.product_toppings.filter((r) => r.product_id === product.id).map((r) => r.topping_id)));
  const [szs, setSzs] = useState(() => new Set(raw.product_sizes.filter((r) => r.product_id === product.id).map((r) => r.size_id)));

  const flip = (set, setter, id) => { const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); setter(n); };
  const setMany = (ids, on) => setTops((cur) => { const n = new Set(cur); ids.forEach((id) => (on ? n.add(id) : n.delete(id))); return n; });

  async function save() {
    const pid = product.id;
    const del = await Promise.all([
      supabase.from("product_toppings").delete().eq("product_id", pid),
      supabase.from("product_sizes").delete().eq("product_id", pid),
    ]);
    if (del.some((r) => r.error)) return toast(del.find((r) => r.error).error.message, "error");
    const ins = [];
    if (tops.size) ins.push(supabase.from("product_toppings").insert([...tops].map((t) => ({ product_id: pid, topping_id: t }))));
    if (szs.size) ins.push(supabase.from("product_sizes").insert([...szs].map((s) => ({ product_id: pid, size_id: s }))));
    const res = await Promise.all(ins);
    if (res.some((r) => r.error)) return toast(res.find((r) => r.error).error.message, "error");
    toast("Opções salvas. Já valem na página de pedidos.");
    refresh();
    onClose();
  }

  const noPrice = szs.size === 0 && product.price == null;

  return (
    <div className="res-form">
      <h3>Como “{label}” é vendido</h3>

      <fieldset>
        <legend>Tamanhos</legend>
        <p className="fineprint">Marque os tamanhos para vender por tamanho (o preço vem do tamanho). Deixe sem marcar para usar o preço do produto.</p>
        <div className="opt-grid">
          {raw.sizes.map((s) => (
            <label key={s.id}><input type="checkbox" checked={szs.has(s.id)} onChange={() => flip(szs, setSzs, s.id)} /> {s.label || s.id}</label>
          ))}
          {raw.sizes.length === 0 && <span className="empty">Nenhum tamanho cadastrado. Crie em “Tamanhos e toppings”.</span>}
        </div>
      </fieldset>

      {noPrice && <p className="notice">Este produto não tem tamanho nem preço, então não aparece como disponível para pedido. Defina o preço ao editar o produto.</p>}

      <fieldset>
        <legend>Toppings oferecidos</legend>
        <p className="fineprint">Só os toppings marcados aparecem para este produto. Para tapioca, coxinha e bebidas, deixe tudo sem marcar.</p>
      </fieldset>
      {raw.topping_groups.map((g) => {
        const items = raw.toppings.filter((x) => x.group_id === g.id);
        if (!items.length) return null;
        const ids = items.map((x) => x.id);
        const all = ids.every((id) => tops.has(id));
        return (
          <fieldset key={g.id}>
            <legend>
              {g.name_pt}{" "}
              <button type="button" className="link-btn" onClick={() => setMany(ids, !all)}>{all ? "Limpar grupo" : "Marcar grupo"}</button>
            </legend>
            <div className="opt-grid">
              {items.map((x) => (
                <label key={x.id}><input type="checkbox" checked={tops.has(x.id)} onChange={() => flip(tops, setTops, x.id)} /> {x.name_pt}</label>
              ))}
            </div>
          </fieldset>
        );
      })}

      <div className="actions">
        <button className="button button-primary small" onClick={save}>Salvar opções</button>
        <button className="button button-outline small" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
