import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { useContent } from "../content/ContentContext";
import { ImageUpload, useToast } from "./ui";

/* ---------- Dashboard ---------- */
export function Dashboard({ go }) {
  const { raw } = useContent();
  const on = (l) => l.filter((x) => x.active !== false).length;
  const now = new Date();
  const live = raw.promotions.filter((p) => p.active && (!p.ends_at || new Date(p.ends_at) >= now) && (!p.starts_at || new Date(p.starts_at) <= now));
  const noPhoto = raw.products.filter((p) => p.active && !p.image_url);
  const cards = [
    ["Produtos no ar", `${on(raw.products)} de ${raw.products.length}`, "products"],
    ["Categorias", raw.categories.length, "categories"],
    ["Tamanhos ativos", on(raw.sizes), "sizes"],
    ["Toppings ativos", on(raw.toppings), "toppings"],
    ["Promoções no ar", live.length, "promos"],
  ];
  return (
    <div className="admin-section">
      <h2>Visão geral</h2>
      <div className="cards">
        {cards.map(([label, n, to]) => (
          <button key={label} className="stat" onClick={() => go(to)}><strong>{n}</strong>{label}</button>
        ))}
      </div>
      {noPhoto.length > 0 && (
        <p className="notice">{noPhoto.length} produto(s) ativo(s) sem foto própria enviada. Abra “Produtos” e use “Editar” para enviar uma imagem.</p>
      )}
    </div>
  );
}

/* ---------- Opções por produto ---------- */
export function ProductOptions({ product, onClose, label }) {
  const { raw, refresh } = useContent();
  const toast = useToast();
  const [tops, setTops] = useState(() => new Set(raw.product_toppings.filter((r) => r.product_id === product.id).map((r) => r.topping_id)));
  const [szs, setSzs] = useState(() => new Set(raw.product_sizes.filter((r) => r.product_id === product.id).map((r) => r.size_id)));
  const flip = (set, setter, id) => { const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); setter(n); };

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
    toast("Opções do produto salvas.");
    refresh();
    onClose();
  }

  return (
    <div className="res-form">
      <h3>Opções disponíveis: {label}</h3>
      <p className="fineprint">Se nenhuma opção de um grupo estiver marcada, todas ficam disponíveis para este produto.</p>
      <fieldset>
        <legend>Tamanhos</legend>
        <div className="opt-grid">
          {raw.sizes.map((s) => (
            <label key={s.id}><input type="checkbox" checked={szs.has(s.id)} onChange={() => flip(szs, setSzs, s.id)} /> {s.label || s.id}</label>
          ))}
        </div>
      </fieldset>
      {raw.topping_groups.map((g) => {
        const items = raw.toppings.filter((x) => x.group_id === g.id);
        if (!items.length) return null;
        return (
          <fieldset key={g.id}>
            <legend>{g.name_pt}</legend>
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

/* ---------- Textos do site ---------- */
const TEXT_KEYS = [
  "home.eyebrow", "home.title", "home.text", "home.ctaOrder", "home.cta",
  "home.productsEyebrow", "home.productsTitle",
  "home.autumnEyebrow", "home.autumnTitle", "home.autumnText",
  "home.orderEyebrow", "home.orderTitle", "home.orderText",
  "home.aboutEyebrow", "home.aboutTitle", "home.aboutText", "home.aboutCta",
  "home.visitEyebrow", "home.visitTitle", "home.visitMaps", "home.visitInstagram",
  "about.eyebrow", "about.title", "about.intro", "about.storyTitle",
  "products.eyebrow", "products.title", "products.intro", "products.notice",
  "order.eyebrow", "order.title", "order.intro", "order.submit",
];

export function Texts() {
  const { i18n } = useTranslation();
  const { raw, refresh } = useContent();
  const toast = useToast();
  const [draft, setDraft] = useState({});
  const edited = useMemo(() => new Set(raw.site_texts.map((r) => r.key)), [raw]);
  const get = (lang, key) => draft[`${lang}|${key}`] ?? i18n.getFixedT(lang)(key);
  const set = (lang, key, v) => setDraft((d) => ({ ...d, [`${lang}|${key}`]: v }));

  async function save(key) {
    const rows = ["pt", "de"].map((lang) => ({ key, lang, value: String(get(lang, key) || "").trim() }));
    if (rows.some((r) => !r.value)) return toast("O texto não pode ficar vazio, nem em português nem em alemão.", "error");
    const { error } = await supabase.from("site_texts").upsert(rows, { onConflict: "key,lang" });
    if (error) return toast(error.message, "error");
    toast("Texto salvo. Já aparece no site.");
    refresh();
  }

  async function restore(key) {
    if (!window.confirm("Voltar ao texto original deste campo?")) return;
    const { error } = await supabase.from("site_texts").delete().eq("key", key);
    if (error) return toast(error.message, "error");
    setDraft((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !k.endsWith(`|${key}`))));
    toast("Texto original restaurado.");
    refresh();
  }

  return (
    <div className="admin-section">
      <h2>Textos do site</h2>
      {TEXT_KEYS.map((key) => (
        <div key={key} className="text-edit">
          <small>{key}{edited.has(key) && " · editado"}</small>
          <div className="row">
            <label className="field"><span>Português</span><textarea rows="2" value={get("pt", key)} onChange={(e) => set("pt", key, e.target.value)} /></label>
            <label className="field"><span>Deutsch</span><textarea rows="2" value={get("de", key)} onChange={(e) => set("de", key, e.target.value)} /></label>
          </div>
          <div className="actions">
            <button className="button button-primary small" onClick={() => save(key)}>Salvar texto</button>
            {edited.has(key) && <button className="button button-outline small" onClick={() => restore(key)}>Voltar ao original</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Imagens do site ---------- */
export function Images() {
  const { images, refresh } = useContent();
  const toast = useToast();
  const slots = [
    ["image.hero", "Imagem principal da página inicial", images.hero],
    ["image.about", "Imagem da seção “Sobre nós”", images.about],
  ];

  async function setImage(key, url) {
    const { error } = url
      ? await supabase.from("site_settings").upsert({ key, value: url }, { onConflict: "key" })
      : await supabase.from("site_settings").delete().eq("key", key);
    if (error) return toast(error.message, "error");
    toast(url ? "Imagem atualizada." : "Imagem removida: o site volta a usar a padrão.");
    refresh();
  }

  return (
    <div className="admin-section">
      <h2>Imagens do site</h2>
      {slots.map(([key, label, value]) => (
        <div key={key} className="field" style={{ marginBottom: 20 }}>
          <span>{label}</span>
          <ImageUpload value={value} onChange={(url) => setImage(key, url)} folder="site" />
        </div>
      ))}
    </div>
  );
}

/* ---------- Contato, redes e horário ---------- */
export function SiteSettings() {
  const { store, refresh } = useContent();
  const toast = useToast();
  const [d, setD] = useState(() => ({
    address: store.address || "", phone: store.phone || "", email: store.email || "",
    instagram: store.instagram || "", hours: (store.hours || []).map((h) => ({ ...h })),
  }));
  const text = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const hour = (i, k) => (e) => setD({ ...d, hours: d.hours.map((h, j) => (j === i ? { ...h, [k]: e.target.value } : h)) });

  async function save(e) {
    e.preventDefault();
    if (!d.address.trim()) return toast("Informe o endereço da loja.", "error");
    if (d.email && !/^\S+@\S+\.\S+$/.test(d.email)) return toast("O e-mail informado não é válido.", "error");
    if (d.instagram && !/^https?:\/\//.test(d.instagram)) return toast("O link do Instagram deve começar com https://", "error");
    if (d.hours.some((h) => !h.days?.trim() || !h.time?.trim())) return toast("Preencha dias e horário em todas as linhas, ou remova a linha.", "error");
    const rows = [
      { key: "store.address", value: d.address.trim() },
      { key: "store.phone", value: d.phone.trim() },
      { key: "store.email", value: d.email.trim() },
      { key: "store.instagram", value: d.instagram.trim() },
      { key: "store.hours", value: d.hours.map((h) => ({ days: h.days.trim(), time: h.time.trim() })) },
    ];
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) return toast(error.message, "error");
    toast("Informações da loja salvas.");
    refresh();
  }

  return (
    <form className="admin-section res-form" onSubmit={save}>
      <h2>Contato, redes sociais e horário</h2>
      <label className="field"><span>Endereço *</span><input value={d.address} onChange={text("address")} /></label>
      <div className="row">
        <label className="field"><span>Telefone</span><input value={d.phone} onChange={text("phone")} /></label>
        <label className="field"><span>E-mail</span><input value={d.email} onChange={text("email")} /></label>
      </div>
      <label className="field"><span>Instagram (link completo)</span><input value={d.instagram} onChange={text("instagram")} /></label>
      <div className="field">
        <span>Horário de funcionamento</span>
        {d.hours.map((h, i) => (
          <div className="inline-form" key={i}>
            <input placeholder="Dias (ex.: Seg–Sex)" value={h.days || ""} onChange={hour(i, "days")} />
            <input placeholder="Horário (ex.: 12:00–20:00)" value={h.time || ""} onChange={hour(i, "time")} />
            <button type="button" className="button button-outline small" onClick={() => setD({ ...d, hours: d.hours.filter((_, j) => j !== i) })}>Remover</button>
          </div>
        ))}
        <button type="button" className="button button-outline small" onClick={() => setD({ ...d, hours: [...d.hours, { days: "", time: "" }] })}>Adicionar linha</button>
      </div>
      <div className="actions"><button className="button button-primary small">Salvar</button></div>
    </form>
  );
}
