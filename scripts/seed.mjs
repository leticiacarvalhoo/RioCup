// Copia os dados que hoje estão no código (src/data) para o banco, sem sobrescrever nada que já exista.
// Uso: node --env-file=.env.seed scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";
import { products } from "../src/data/products.js";
import { acaiSizes } from "../src/data/acai.js";
import { toppings, toppingGroups, toppingLimits } from "../src/data/toppings.js";
import { store } from "../src/data/store.js";

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function put(table, rows, onConflict = "id") {
  if (!rows.length) return;
  const { error } = await sb.from(table).upsert(rows, { onConflict, ignoreDuplicates: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: ${rows.length} linhas`);
}

await put("topping_groups", toppingGroups.map((g, i) => ({ id: g.id, name_pt: g.pt, name_de: g.de, position: i })));
await put("toppings", toppings.map((x, i) => ({
  id: x.id, group_id: x.group, name_pt: x.pt, name_de: x.de, extra_price: x.extraPrice || 0, position: i,
})));
await put("sizes", acaiSizes.map((s, i) => ({
  id: s.id, label: s.id, price: s.price, max_toppings: toppingLimits[s.id] ?? null, position: i,
})));
// Nomes e descrições dos produtos continuam nos arquivos de idioma até o admin editá-los.
await put("products", products.map((p, i) => ({
  id: p.id, gluten: p.gluten ?? "varies", lactose: p.lactose ?? "varies", position: i,
})));
await put("site_settings", [
  { key: "store.address", value: store.address },
  { key: "store.instagram", value: store.instagram },
  { key: "store.hours", value: store.hours || [] },
], "key");
console.log("Pronto.");
