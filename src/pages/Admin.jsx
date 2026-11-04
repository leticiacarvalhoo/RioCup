import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useContent } from "../content/ContentContext";
import Resource from "../admin/Resource";
import { ToastProvider } from "../admin/ui";
import Dashboard from "../admin/Dashboard";
import ProductOptions from "../admin/ProductOptions";
import { Texts, Images, SiteSettings } from "../admin/AdminExtras";
import AdminStock from "../components/AdminStock";
import AdminTeam from "../components/AdminTeam";
import "../admin/admin.css";
import "../admin/admin-extra.css";

const SECTIONS = [
  ["dashboard", "Início", "Resumo e o que precisa de atenção"],
  ["menu", "Cardápio", "Produtos e categorias"],
  ["options", "Tamanhos e toppings", "Opções do açaí e de outros produtos"],
  ["promos", "Promoções", "Banners e preços promocionais"],
  ["site", "Site", "Textos, imagens, contato e horário"],
  ["ops", "Equipe e estoque", "Horas, pagamentos e reposição"],
];
const BADGES = [{ value: "new", label: "Novidade" }, { value: "best", label: "Mais vendido" }, { value: "soldout", label: "Indisponível" }];
const DIET = [{ value: "free", label: "Sem" }, { value: "contains", label: "Contém" }, { value: "varies", label: "Varia" }];

function Tabs({ tabs, value, onChange }) {
  return (
    <div className="subtabs" role="tablist">
      {tabs.map(([id, label]) => (
        <button key={id} role="tab" aria-selected={value === id} className={value === id ? "active" : ""} onClick={() => onChange(id)}>{label}</button>
      ))}
    </div>
  );
}

function Where({ children }) {
  return <p className="where"><strong>Onde aparece:</strong> {children}</p>;
}

export default function Admin() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { raw, refresh } = useContent();
  const [section, setSection] = useState("dashboard");
  const [sub, setSub] = useState({ menu: "products", options: "sizes", site: "texts", ops: "stock" });
  const [optionsFor, setOptionsFor] = useState(null);

  // Admin enxerga itens inativos: recarrega depois do login.
  useEffect(() => { refresh(); }, [refresh]);

  const pt = i18n.getFixedT("pt");
  const de = i18n.getFixedT("de");
  const productName = (p) => p.name_pt || pt(`products.items.${p.id}.name`, { defaultValue: p.id });
  const catOptions = raw.categories.map((c) => ({ value: c.id, label: c.name_pt }));
  const productOptions = raw.products.map((p) => ({ value: p.id, label: productName(p) }));
  const groupOptions = raw.topping_groups.map((g) => ({ value: g.id, label: g.name_pt }));

  const go = (s) => { setSection(s); setOptionsFor(null); };
  const setTab = (key) => (id) => { setSub((s) => ({ ...s, [key]: id })); setOptionsFor(null); };
  const current = SECTIONS.find(([id]) => id === section);

  const menu = (
    <>
      <Tabs tabs={[["products", "Produtos"], ["categories", "Categorias"]]} value={sub.menu} onChange={setTab("menu")} />
      {sub.menu === "products" && (
        <>
          <Where>Início (vitrine), Produtos (explicação, glúten e lactose) e Pedidos (para comprar). Edite aqui uma vez só e muda nos três lugares.</Where>
          {optionsFor && <ProductOptions product={optionsFor} label={productName(optionsFor)} onClose={() => setOptionsFor(null)} />}
          <Resource
            table="products" title="Produtos" textId="name_pt" newLabel="Novo produto"
            defaults={{ active: true, gluten: "varies", lactose: "varies" }}
            labelOf={productName}
            prefill={(r) => ({
              name_pt: pt(`products.items.${r.id}.name`, { defaultValue: "" }),
              name_de: de(`products.items.${r.id}.name`, { defaultValue: "" }),
              description_pt: pt(`products.items.${r.id}.what`, { defaultValue: "" }),
              description_de: de(`products.items.${r.id}.what`, { defaultValue: "" }),
            })}
            rowActions={(r) => <button className="button button-outline small" onClick={() => setOptionsFor(r)}>Tamanhos e toppings</button>}
            hint="Parou de vender um produto? Use “Desativar”: ele some do site, mas nome, descrição e foto ficam guardados. Ao ativar de novo, volta completo. Para o produto poder ser pedido, defina o preço ou os tamanhos."
            fields={[
              { name: "image_url", label: "Foto", type: "image", list: true },
              { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
              { name: "name_de", label: "Name (DE)", type: "text" },
              { name: "description_pt", label: "Descrição (PT)", type: "textarea" },
              { name: "description_de", label: "Beschreibung (DE)", type: "textarea" },
              { name: "price", label: "Preço (€)", type: "number", min: 0, money: true, list: true, hint: "Para produtos sem tamanho (tapioca, coxinha, bebidas). Com tamanhos, o preço vem do tamanho." },
              { name: "category_id", label: "Categoria", type: "select", options: catOptions, list: true },
              { name: "badge", label: "Selo", type: "select", options: BADGES, list: true },
              { name: "gluten", label: "Glúten", type: "select", options: DIET, required: true },
              { name: "lactose", label: "Lactose", type: "select", options: DIET, required: true },
              { name: "active", label: "À venda no site", type: "bool", list: true },
            ]}
          />
        </>
      )}
      {sub.menu === "categories" && (
        <>
          <Where>filtros da página Produtos e agrupamento na página Pedidos.</Where>
          <Resource table="categories" title="Categorias" textId="name_pt" newLabel="Nova categoria"
            hint="Excluir uma categoria não exclui os produtos: eles apenas ficam sem categoria."
            fields={[
              { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
              { name: "name_de", label: "Name (DE)", type: "text", list: true },
            ]} />
        </>
      )}
    </>
  );

  const options = (
    <>
      <Tabs tabs={[["sizes", "Tamanhos"], ["flavors", "Sabores"], ["topgroups", "Grupos de toppings"], ["toppings", "Toppings"]]} value={sub.options} onChange={setTab("options")} />
      <Where>página Pedidos. Cada produto só mostra os tamanhos e toppings marcados nele: em “Cardápio”, clique em “Tamanhos e toppings” na linha do produto.</Where>
      {sub.options === "sizes" && (
        <Resource table="sizes" title="Tamanhos" textId="label" newLabel="Novo tamanho" defaults={{ active: true }}
          fields={[
            { name: "label", label: "Nome (ex.: P, M, G)", type: "text", required: true, list: true },
            { name: "price", label: "Preço (€)", type: "number", min: 0, money: true, required: true, list: true },
            { name: "max_toppings", label: "Máx. de toppings", type: "number", min: 0, list: true, hint: "Vazio = ilimitado." },
            { name: "active", label: "Disponível", type: "bool", list: true },
          ]} />
      )}
      {sub.options === "flavors" && (
        <Resource table="flavors" title="Sabores" textId="name_pt" newLabel="Novo sabor" defaults={{ active: true }}
          hint="Sabor sem produto escolhido vale para todos os produtos. Sabor ligado a um produto aparece só nele."
          fields={[
            { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
            { name: "name_de", label: "Name (DE)", type: "text" },
            { name: "product_id", label: "Só para o produto", type: "select", options: productOptions, list: true },
            { name: "active", label: "Disponível", type: "bool", list: true },
          ]} />
      )}
      {sub.options === "topgroups" && (
        <Resource table="topping_groups" title="Grupos de toppings" textId="name_pt" newLabel="Novo grupo"
          hint="Ex.: Frutas, Cremes, Crocantes. Os toppings são organizados por grupo na página Pedidos."
          fields={[
            { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
            { name: "name_de", label: "Name (DE)", type: "text", list: true },
          ]} />
      )}
      {sub.options === "toppings" && (
        <Resource table="toppings" title="Toppings" textId="name_pt" newLabel="Novo topping"
          defaults={{ active: true, extra_price: 0 }}
          hint="Depois de criar um topping, marque-o nos produtos que o oferecem (Cardápio → Tamanhos e toppings). Sem isso ele não aparece para ninguém."
          fields={[
            { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
            { name: "name_de", label: "Name (DE)", type: "text" },
            { name: "group_id", label: "Grupo", type: "select", options: groupOptions, required: true, list: true },
            { name: "extra_price", label: "Preço adicional (€)", type: "number", min: 0, money: true, list: true },
            { name: "active", label: "Disponível", type: "bool", list: true },
          ]} />
      )}
    </>
  );

  const promos = (
    <>
      <Where>faixa de promoções na página inicial e preço riscado em Produtos e Pedidos (só para produtos sem tamanho).</Where>
      <Resource table="promotions" title="Banners e promoções" textId="title_pt" sortBy="created_at" newLabel="Nova promoção"
        defaults={{ active: true, show_on_home: true }}
        hint="A promoção só aparece entre as datas de início e término."
        validate={(p) => {
          if (p.promo_price != null && !p.product_id) return "Para definir um preço promocional, escolha o produto.";
          if (p.starts_at && p.ends_at && new Date(p.ends_at) <= new Date(p.starts_at)) return "A data de término deve ser depois da data de início.";
          const prod = raw.products.find((x) => x.id === p.product_id);
          if (p.promo_price != null && prod?.price != null && p.promo_price >= Number(prod.price)) return "O preço promocional deve ser menor que o preço normal do produto.";
          if (p.link && !/^(\/|https?:\/\/)/.test(p.link)) return "O link deve começar com / (página do site) ou https://";
        }}
        fields={[
          { name: "banner_url", label: "Imagem do banner", type: "image", list: true },
          { name: "title_pt", label: "Título (PT)", type: "text", required: true, list: true },
          { name: "title_de", label: "Titel (DE)", type: "text" },
          { name: "text_pt", label: "Texto (PT)", type: "textarea" },
          { name: "text_de", label: "Text (DE)", type: "textarea" },
          { name: "product_id", label: "Produto em promoção", type: "select", options: productOptions, list: true },
          { name: "promo_price", label: "Preço promocional (€)", type: "number", min: 0, money: true, list: true },
          { name: "link", label: "Link do botão", type: "text", hint: "Ex.: /bestellen ou https://…" },
          { name: "starts_at", label: "Início", type: "datetime", list: true },
          { name: "ends_at", label: "Término", type: "datetime", list: true },
          { name: "show_on_home", label: "Destacar na página inicial", type: "bool" },
          { name: "active", label: "Ativa", type: "bool", list: true },
        ]} />
    </>
  );

  const site = (
    <>
      <Tabs tabs={[["texts", "Textos"], ["images", "Imagens"], ["contact", "Contato e horário"]]} value={sub.site} onChange={setTab("site")} />
      {sub.site === "texts" && <><Where>títulos e frases das páginas Início, Sobre nós, Produtos e Pedidos, em português e alemão.</Where><Texts /></>}
      {sub.site === "images" && <><Where>imagem principal do Início e imagem da seção “Sobre nós”. Fotos de produtos e banners são enviadas em Cardápio e Promoções.</Where><Images /></>}
      {sub.site === "contact" && <><Where>seção “Visite-nos” do Início e rodapé de todas as páginas.</Where><SiteSettings /></>}
    </>
  );

  const ops = (
    <>
      <Tabs tabs={[["stock", "Estoque"], ["team", "Equipe e horas"]]} value={sub.ops} onChange={setTab("ops")} />
      <p className="where"><strong>Só no painel:</strong> estas informações não aparecem no site. Por enquanto ficam salvas neste navegador.</p>
      {sub.ops === "stock" ? <AdminStock /> : <AdminTeam />}
    </>
  );

  const body = { dashboard: <Dashboard go={go} />, menu, options, promos, site, ops };

  return (
    <ToastProvider>
      <section className="page" lang="pt" translate="no">
        <div className="wrap">
          <div className="admin-bar">
            <div>
              <h1>{t("admin.title")}</h1>
              <p className="lead">{user.email}</p>
            </div>
            <div className="actions">
              <Link to="/" className="button button-outline small">Ver site</Link>
              <button className="button button-outline small" onClick={signOut}>{t("admin.signOut")}</button>
            </div>
          </div>
          <div className="admin-shell">
            <nav className="admin-nav" aria-label="Painel">
              {SECTIONS.map(([id, label, hint]) => (
                <button key={id} className={section === id ? "active" : ""} onClick={() => go(id)}>
                  <span>{label}</span>
                  <small>{hint}</small>
                </button>
              ))}
            </nav>
            <div className="admin-main" key={`${section}-${sub[section] || ""}`}>
              {section !== "dashboard" && <p className="crumb">{current[1]}</p>}
              {body[section]}
            </div>
          </div>
        </div>
      </section>
    </ToastProvider>
  );
}