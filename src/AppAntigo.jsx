
import { useState } from "react";
import "./App.css";

const products = [
  {
    id: 1,
    name: "Açaí clássico",
    category: "Açaí",
    description: "Açaí cremoso para montar do seu jeito.",
    price: 8.5,
    emoji: "🫐",
  },
  {
    id: 2,
    name: "Açaí tropical",
    category: "Açaí",
    description: "Açaí com banana e morango.",
    price: 10.5,
    emoji: "🍓",
  },
  {
    id: 3,
    name: "Tapioca queijo & tomate",
    category: "Tapiocas",
    description: "Quentinha, com queijo derretido.",
    price: 6.5,
    emoji: "🫓",
  },
  {
    id: 4,
    name: "Tapioca de chocolate",
    category: "Tapiocas",
    description: "Uma combinação irresistível.",
    price: 7,
    emoji: "🍫",
  },
  {
    id: 5,
    name: "Brigadeiros",
    category: "Docinhos",
    description: "Quatro brigadeiros artesanais.",
    price: 5,
    emoji: "🍬",
  },
  {
    id: 6,
    name: "Cupcake do dia",
    category: "Docinhos",
    description: "Um bolinho feito com carinho.",
    price: 4,
    emoji: "🧁",
  },
];

const money = (value) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);

function App() {
  const [category, setCategory] = useState("Tudo");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("");
  const [pickup, setPickup] = useState("17:00");
  const [message, setMessage] = useState("");

  const categories = ["Tudo", "Açaí", "Tapiocas", "Docinhos"];

  const visibleProducts =
    category === "Tudo"
      ? products
      : products.filter((product) => product.category === category);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  function addToCart(product) {
    setMessage("");

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        { ...product, quantity: 1 },
      ];
    });
  }

  function changeQuantity(id, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function placeOrder(event) {
    event.preventDefault();

    if (cart.length === 0) {
      setMessage("Adicione pelo menos um produto ao carrinho.");
      return;
    }

    if (!customer.trim()) {
      setMessage("Digite seu nome para continuar.");
      return;
    }

    setMessage(
      `Tudo certo, ${customer}! Seu pedido de ${money(total)} está simulado para as ${pickup}. Ainda não foi enviado à loja.`
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#inicio">
          rio<span>cup</span> ✳
        </a>

        <nav>
          <a href="#cardapio">Cardápio</a>
          <a href="#pedido" className="nav-cart">
            Meu pedido <span>{itemCount}</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <span className="eyebrow">
              UM POUQUINHO DO BRASIL ♡
            </span>

            <h1>
              Seu momento
              <br />
              mais <span>gostoso.</span>
            </h1>

            <p>
              Açaí caprichado, tapiocas quentinhas e
              docinhos feitos com carinho. Escolha seus
              favoritos e aproveite!
            </p>

            <a href="#cardapio" className="button button-primary">
              Explorar cardápio ↘
            </a>

            <div className="hero-note">
              ✳ Feito com carinho, do nosso jeitinho.
            </div>
          </div>

          <div className="hero-art" aria-label="Ilustração de açaí">
            <span className="floating-label label-top">
              feito na hora ♡
            </span>
            <div className="hero-fruit">🍓</div>
            <div className="hero-cup">
              <span>RIO</span>
              <span>CUP</span>
            </div>
            <span className="floating-label label-bottom">
              um gostinho do Brasil
            </span>
          </div>
        </section>

        <section className="menu-section" id="cardapio">
          <div className="section-heading">
            <div>
              <span className="eyebrow">COM AMOR, PARA VOCÊ</span>
              <h2>O que vai ser hoje?</h2>
              <p>Seu próximo favorito está aqui.</p>
            </div>
            <span className="product-count">
              {visibleProducts.length} delícias
            </span>
          </div>

          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item}
                className={`category-button ${
                  category === item ? "selected" : ""
                }`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="shop-layout">
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-art">
                    <span>{product.emoji}</span>
                    <span className="product-tag">
                      {product.category}
                    </span>
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>

                    <div className="product-bottom">
                      <strong>{money(product.price)}</strong>
                      <button
                        className="add-button"
                        aria-label={`Adicionar ${product.name}`}
                        onClick={() => addToCart(product)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="cart-panel" id="pedido">
              <div className="cart-title">
                <div>
                  <span className="eyebrow">SÓ COISA BOA</span>
                  <h2>Seu pedido</h2>
                </div>
                <span className="cart-count">{itemCount}</span>
              </div>

              {cart.length === 0 ? (
                <div className="empty-cart">
                  <span>🛍️</span>
                  <strong>Seu carrinho está vazio</strong>
                  <p>Escolha uma delícia para começar.</p>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>{money(item.price)}</span>
                      </div>

                      <div className="quantity-control">
                        <button
                          aria-label={`Diminuir ${item.name}`}
                          onClick={() => changeQuantity(item.id, -1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label={`Aumentar ${item.name}`}
                          onClick={() => changeQuantity(item.id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="cart-total">
                <span>Total</span>
                <strong>{money(total)}</strong>
              </div>

              <form onSubmit={placeOrder}>
                <label htmlFor="customer">Seu nome</label>
                <input
                  id="customer"
                  value={customer}
                  onChange={(event) => setCustomer(event.target.value)}
                  placeholder="Como podemos te chamar?"
                />

                <label htmlFor="pickup">Horário de retirada</label>
                <select
                  id="pickup"
                  value={pickup}
                  onChange={(event) => setPickup(event.target.value)}
                >
                  {["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"].map(
                    (time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    )
                  )}
                </select>

                <button className="button button-primary checkout-button">
                  Continuar pedido ↗
                </button>

                {message && (
                  <p className="form-message" role="status">
                    {message}
                  </p>
                )}

                <p className="disclaimer">
                  Versão inicial para testes. Nenhum pedido ou
                  pagamento real é enviado.
                </p>
              </form>
            </aside>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="logo" href="#inicio">
          rio<span>cup</span> ✳
        </a>
        <p>Um pouquinho do Brasil em cada pedido.</p>
        <span>Feito com ♡</span>
      </footer>
    </div>
  );
}

export default App;
