import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useContent } from "../content/ContentContext";
import Resource from "../admin/Resource";
import { ToastProvider } from "../admin/ui";
import { Dashboard, ProductOptions, Texts, Images, SiteSettings } from "../admin/AdminExtras";
import AdminStock from "../components/AdminStock";
import AdminTeam from "../components/AdminTeam";
import "../admin/admin.css";

const SECTIONS = [
  ["dashboard", "Dashboard"],
  ["products", "Produtos"],
  ["categories", "Categorias"],
  ["sizes", "Tamanhos e sabores"],
  ["toppings", "Toppings e complementos"],
  ["content", "Textos e imagens"],
  ["promos", "Banners e promoções"],
  ["settings", "Configurações gerais"],
  ["stock", "Estoque"],
  ["team", "Equipe"],
];
const BADGES = [{ value: "new", label: "Novidade" }, { value: "best", label: "Mais vendido" }, { value: "soldout", label: "Indisponível" }];
const DIET = [{ value: "free", label: "Sem" }, { value: "contains", label: "Contém" }, { value: "varies", label: "Varia" }];

export default function Admin() {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuth();
  const { raw, refresh } = useContent();
  const [section, setSection] = useState("dashboard");
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
  const body = {
    dashboard: <Dashboard go={go} />,
    products: (
      <>
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
          rowActions={(r) => <button className="button button-outline small" onClick={() => setOptionsFor(r)}>Opções</button>}
          hint="Use “Ativar/Desativar” para tirar um produto do site sem excluir. “Opções” define quais tamanhos e toppings valem para ele."
          fields={[
            { name: "image_url", label: "Foto", type: "image", list: true },
            { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
            { name: "name_de", label: "Name (DE)", type: "text" },
            { name: "description_pt", label: "Descrição (PT)", type: "textarea" },
            { name: "description_de", label: "Beschreibung (DE)", type: "textarea" },
            { name: "price", label: "Preço (€)", type: "number", min: 0, money: true, list: true, hint: "Opcional. O preço do pedido vem do tamanho escolhido." },
            { name: "category_id", label: "Categoria", type: "select", options: catOptions, list: true },
            { name: "badge", label: "Selo", type: "select", options: BADGES, list: true },
            { name: "gluten", label: "Glúten", type: "select", options: DIET, required: true },
            { name: "lactose", label: "Lactose", type: "select", options: DIET, required: true },
            { name: "active", label: "Visível no site", type: "bool", list: true },
          ]}
        />
      </>
    ),
    categories: (
      <Resource table="categories" title="Categorias" textId="name_pt" newLabel="Nova categoria"
        hint="Excluir uma categoria não exclui os produtos: eles apenas ficam sem categoria."
        fields={[
          { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
          { name: "name_de", label: "Name (DE)", type: "text", list: true },
        ]} />
    ),
    sizes: (
      <>
        <Resource table="sizes" title="Tamanhos" textId="label" newLabel="Novo tamanho" defaults={{ active: true }}
          fields={[
            { name: "label", label: "Nome (ex.: P, M, G)", type: "text", required: true, list: true },
            { name: "price", label: "Preço (€)", type: "number", min: 0, money: true, required: true, list: true },
            { name: "max_toppings", label: "Máx. de toppings", type: "number", min: 0, list: true, hint: "Vazio = ilimitado." },
            { name: "active", label: "Disponível", type: "bool", list: true },
          ]} />
        <Resource table="flavors" title="Sabores" textId="name_pt" newLabel="Novo sabor" defaults={{ active: true }}
          hint="Sabores sem produto escolhido aparecem em todos os pedidos."
          fields={[
            { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
            { name: "name_de", label: "Name (DE)", type: "text" },
            { name: "product_id", label: "Só para o produto", type: "select", options: productOptions, list: true },
            { name: "active", label: "Disponível", type: "bool", list: true },
          ]} />
      </>
    ),
    toppings: (
      <>
        <Resource table="topping_groups" title="Categorias de toppings" textId="name_pt" newLabel="Nova categoria"
          fields={[
            { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
            { name: "name_de", label: "Name (DE)", type: "text", list: true },
          ]} />
        <Resource table="toppings" title="Toppings e complementos" textId="name_pt" newLabel="Novo topping"
          defaults={{ active: true, extra_price: 0 }}
          fields={[
            { name: "name_pt", label: "Nome (PT)", type: "text", required: true, list: true },
            { name: "name_de", label: "Name (DE)", type: "text" },
            { name: "group_id", label: "Categoria", type: "select", options: groupOptions, required: true, list: true },
            { name: "extra_price", label: "Preço adicional (€)", type: "number", min: 0, money: true, list: true },
            { name: "active", label: "Disponível", type: "bool", list: true },
          ]} />
      </>
    ),
    content: (<><Images /><Texts /></>),
    promos: (
      <Resource table="promotions" title="Banners e promoções" textId="title_pt" sortBy="created_at" newLabel="Nova promoção"
        defaults={{ active: true, show_on_home: true }}
        hint="A promoção só aparece entre as datas de início e término. O preço promocional é exibido na página inicial e na lista de produtos."
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
    ),
    settings: <SiteSettings />,
    stock: <AdminStock />,
    team: <AdminTeam />,
  };

  return (
    <ToastProvider>
      <section className="page">
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
              {SECTIONS.map(([id, label]) => (
                <button key={id} className={section === id ? "active" : ""} onClick={() => go(id)}>{label}</button>
              ))}
            </nav>
            <div className="admin-main" key={section}>{body[section]}</div>
          </div>
        </div>
      </section>
    </ToastProvider>
  );
}
