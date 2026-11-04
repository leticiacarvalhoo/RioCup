import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { store as storeSeed } from "../data/store";

const TABLES = [
  "products", "categories", "sizes", "topping_groups", "toppings", "flavors",
  "promotions", "product_toppings", "product_sizes", "site_settings", "site_texts",
];
const BADGES = {
  new: { pt: "Novidade", de: "Neu" },
  best: { pt: "Mais vendido", de: "Bestseller" },
  soldout: { pt: "Indisponível", de: "Ausverkauft" },
};
const byPos = (a, b) => (a.position ?? 0) - (b.position ?? 0);

const Ctx = createContext(null);
export const useContent = () => useContext(Ctx);

export function ContentProvider({ children }) {
  const { i18n } = useTranslation();
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState("");
  const originals = useRef({});

  const refresh = useCallback(async () => {
    const res = await Promise.all(TABLES.map((t) => supabase.from(t).select("*")));
    const bad = res.find((r) => r.error);
    if (bad) return setError(bad.error.message);
    setError("");
    setRaw(Object.fromEntries(TABLES.map((t, i) => [t, res[i].data])));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Textos editados no admin sobrescrevem as traduções; apagar o override restaura o original.
  useEffect(() => {
    if (!raw) return;
    const current = new Set();
    for (const { key, lang, value } of raw.site_texts) {
      const id = `${lang}|${key}`;
      current.add(id);
      if (!(id in originals.current)) originals.current[id] = i18n.getResource(lang, "translation", key);
      i18n.addResource(lang, "translation", key, value);
    }
    for (const id of Object.keys(originals.current)) {
      if (current.has(id)) continue;
      const [lang, key] = id.split("|");
      if (originals.current[id] !== undefined) i18n.addResource(lang, "translation", key, originals.current[id]);
      delete originals.current[id];
    }
    i18n.emit("languageChanged", i18n.language);
  }, [raw, i18n]);

  const value = useMemo(() => {
    if (!raw) return null;
    const lang = i18n.resolvedLanguage === "pt" ? "pt" : "de";
    const on = (r) => r.active !== false;
    const sorted = (l) => [...l].sort(byPos);
    const num = (v) => (v == null ? null : Number(v));

    const pick = (row, f) => row?.[`${f}_${lang}`] || row?.[`${f}_pt`] || row?.[`${f}_de`] || "";
    const badgeLabel = (b) => BADGES[b]?.[lang] || "";

    const sizes = sorted(raw.sizes).filter(on).map((s) => ({
      id: s.id, label: s.label || s.id, price: Number(s.price),
    }));
    const limits = Object.fromEntries(sorted(raw.sizes).filter(on).map((s) => [s.id, s.max_toppings ?? null]));
    const groups = sorted(raw.topping_groups).map((g) => ({ id: g.id, pt: g.name_pt, de: g.name_de || g.name_pt }));
    const toppings = sorted(raw.toppings).filter(on).map((x) => ({
      id: x.id, pt: x.name_pt, de: x.name_de || x.name_pt, group: x.group_id, extraPrice: Number(x.extra_price),
    }));
    const products = sorted(raw.products).filter(on).map((p) => ({ ...p, price: num(p.price) }));
    const categories = sorted(raw.categories);

    const now = new Date();
    const promos = raw.promotions.filter((p) =>
      p.active && (!p.starts_at || new Date(p.starts_at) <= now) && (!p.ends_at || new Date(p.ends_at) >= now));
    const promoPrice = {};
    for (const p of promos) if (p.product_id && p.promo_price != null) promoPrice[p.product_id] = Number(p.promo_price);

    // Sem restrição cadastrada para o produto = todas as opções.
    const restrict = (rows, key, list) => {
      const allowed = rows.filter((r) => r.product_id === key.product).map((r) => r[key.field]);
      return allowed.length ? list.filter((x) => allowed.includes(x.id)) : list;
    };
    const toppingsFor = (pid) => restrict(raw.product_toppings, { product: pid, field: "topping_id" }, toppings);
    const sizesFor = (pid) => restrict(raw.product_sizes, { product: pid, field: "size_id" }, sizes);
    const flavorsFor = (pid) =>
      sorted(raw.flavors).filter((f) => on(f) && (!f.product_id || f.product_id === pid));

    const s = Object.fromEntries(raw.site_settings.map((r) => [r.key, r.value]));
    const store = {
      address: s["store.address"] ?? storeSeed.address,
      instagram: s["store.instagram"] ?? storeSeed.instagram,
      hours: s["store.hours"] ?? storeSeed.hours ?? [],
      phone: s["store.phone"] || "",
      email: s["store.email"] || "",
    };
    const images = { hero: s["image.hero"] || "", about: s["image.about"] || "" };

    return {
      raw, refresh, pick, badgeLabel, products, categories, sizes, limits, groups, toppings,
      toppingsFor, sizesFor, flavorsFor, promos, promoPrice, store, images,
    };
  }, [raw, refresh, i18n.resolvedLanguage]);

  if (!value) {
    return (
      <div className="wrap" style={{ padding: "96px 24px" }}>
        {error ? `Não foi possível carregar o site: ${error}` : "Carregando…"}
      </div>
    );
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
