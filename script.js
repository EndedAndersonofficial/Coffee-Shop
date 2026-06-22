const PRODUCTS = [
  {
    id: "esp-01",
    name: "Classic Espresso",
    category: "Espresso",
    price: 3.0,
    img: "☕",
    desc: "Bold double shot, rich crema.",
  },
  {
    id: "esp-02",
    name: "Espresso Macchiato",
    category: "Espresso",
    price: 3.5,
    img: "☕",
    desc: "Espresso marked with foamed milk.",
  },
  {
    id: "lat-01",
    name: "Vanilla Latte",
    category: "Latte",
    price: 4.5,
    img: "🥛",
    desc: "Smooth espresso, steamed milk, vanilla.",
  },
  {
    id: "lat-02",
    name: "Classic Latte",
    category: "Latte",
    price: 4.0,
    img: "🥛",
    desc: "Espresso with silky steamed milk.",
  },
  {
    id: "cap-01",
    name: "Cappuccino",
    category: "Cappuccino",
    price: 4.2,
    img: "🍮",
    desc: "Equal parts espresso, milk, and foam.",
  },
  {
    id: "cap-02",
    name: "Cinnamon Cappuccino",
    category: "Cappuccino",
    price: 4.6,
    img: "🍮",
    desc: "Cappuccino dusted with cinnamon.",
  },
  {
    id: "cb-01",
    name: "Cold Brew",
    category: "Cold Brew",
    price: 4.0,
    img: "🧊",
    desc: "Slow-steeped, smooth and bold over ice.",
  },
  {
    id: "cb-02",
    name: "Vanilla Cold Brew",
    category: "Cold Brew",
    price: 4.5,
    img: "🧊",
    desc: "Cold brew with a hint of vanilla sweetness.",
  },
  {
    id: "moc-01",
    name: "Classic Mocha",
    category: "Mocha",
    price: 4.8,
    img: "🍫",
    desc: "Espresso, chocolate, and steamed milk.",
  },
  {
    id: "moc-02",
    name: "White Chocolate Mocha",
    category: "Mocha",
    price: 5.0,
    img: "🍫",
    desc: "Espresso with creamy white chocolate.",
  },
];

/* ===== script.js ===== */

// ---------- Storage layer ----------
// NOTE: This Claude.ai preview sandbox does not support localStorage,
// so we use an in-memory object as a stand-in.
//
// TO USE REAL PERSISTENCE IN YOUR OWN PROJECT:
// 1) Delete the `memoryStore` object and the `Storage` object below.
// 2) Uncomment the "REAL LOCALSTORAGE VERSION" block underneath it.

const memoryStore = {};
const Storage = {
  get(key) {
    return memoryStore[key] ? JSON.parse(memoryStore[key]) : null;
  },
  set(key, value) {
    memoryStore[key] = JSON.stringify(value);
  },
};

/* ----- REAL LOCALSTORAGE VERSION (uncomment for local files) -----
const Storage = {
  get(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
------------------------------------------------------------------ */

const CART_KEY = "brewAndBeanCart";

// ---------- State ----------
let cart = Storage.get(CART_KEY) || []; // [{ id, qty }]
let activeCategory = "All";
let searchTerm = "";

// ---------- DOM refs ----------
const grid = document.getElementById("product-grid");
const resultsInfo = document.getElementById("results-info");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartCountEl = document.getElementById("cart-count");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const toast = document.getElementById("toast");

// ---------- Helpers ----------
function formatPrice(n) {
  return "$" + n.toFixed(2);
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function getFilteredProducts() {
  return PRODUCTS.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

// ---------- Render: product grid ----------
function renderProducts() {
  const list = getFilteredProducts();
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML =
      '<p class="no-results">No coffee matches your search. Try a different name or category.</p>';
  } else {
    list.forEach((p) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-img" role="img" aria-label="${p.name}">
          <span aria-hidden="true">${p.img}</span>
        </div>
        <div class="product-body">
          <span class="product-category">${p.category}</span>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.desc}</p>
          <div class="product-footer">
            <span class="product-price">${formatPrice(p.price)}</span>
            <button class="add-btn" data-id="${p.id}">Add to cart</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  resultsInfo.textContent = `Showing ${list.length} of ${PRODUCTS.length} coffees`;
}

// ---------- Cart logic ----------
function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  saveCart();
  const product = PRODUCTS.find((p) => p.id === id);
  showToast(`${product.name} added to cart`);
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
}

function clearCart() {
  cart = [];
  saveCart();
  showToast("Cart cleared");
}

function saveCart() {
  Storage.set(CART_KEY, cart);
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

function cartItemCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// ---------- Render: cart ----------
function renderCart() {
  cartCountEl.textContent = cartItemCount();

  if (cart.length === 0) {
    cartItemsEl.innerHTML =
      '<p class="cart-empty">Your cart is empty. Add some coffee!</p>';
  } else {
    cartItemsEl.innerHTML = "";
    cart.forEach((item) => {
      const product = PRODUCTS.find((p) => p.id === item.id);
      if (!product) return;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <div class="cart-item-icon" aria-hidden="true">${product.img}</div>
        <div class="cart-item-info">
          <h3>${product.name}</h3>
          <div class="cart-item-price">${formatPrice(product.price)} each</div>
          <div class="qty-controls">
            <button aria-label="Decrease quantity of ${product.name}" data-action="dec" data-id="${product.id}">−</button>
            <span aria-live="polite">${item.qty}</span>
            <button aria-label="Increase quantity of ${product.name}" data-action="inc" data-id="${product.id}">+</button>
          </div>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${product.id}">Remove</button>
      `;
      cartItemsEl.appendChild(row);
    });
  }

  cartTotalEl.textContent = formatPrice(cartTotal());
}

// ---------- Cart panel open/close ----------
function openCart() {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  document.getElementById("close-cart-btn").focus();
}

function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  document.getElementById("open-cart-btn").focus();
}

// ---------- Event listeners ----------
document.getElementById("open-cart-btn").addEventListener("click", openCart);
document.getElementById("close-cart-btn").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && cartPanel.classList.contains("open")) closeCart();
});

grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(btn.dataset.id);
});

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (action === "inc") changeQty(id, 1);
  if (action === "dec") changeQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

document.getElementById("clear-cart-btn").addEventListener("click", clearCart);

document.getElementById("checkout-btn").addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Your cart is empty");
    return;
  }
  showToast("Checkout demo — connect this to your payment flow!");
});

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    activeCategory = btn.dataset.category;
    renderProducts();
  });
});

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
});

document.getElementById("search-input").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  renderProducts();
});

// ---------- Init ----------
renderProducts();
renderCart();
