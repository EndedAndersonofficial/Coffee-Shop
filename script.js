(function () {
  var saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {}
  var theme =
    saved ||
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

/* ===== helpers.js section ===== */
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

// Storage shim — this Claude.ai preview sandbox can't use real localStorage for the
// CART. Your actual repo's script.js should keep using real localStorage directly
// (see the "REAL LOCALSTORAGE VERSION" note below). The THEME toggle below uses
// real localStorage as-is, wrapped in try/catch, since this sandbox does allow that.
const memoryStore = {};
const Storage = {
  get(key) {
    return memoryStore[key] ? JSON.parse(memoryStore[key]) : null;
  },
  set(key, value) {
    memoryStore[key] = JSON.stringify(value);
  },
};
/* ----- REAL LOCALSTORAGE VERSION (use this in your actual repo) -----
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

function formatPrice(n) {
  return "$" + n.toFixed(2);
}

function getFilteredProducts(activeCategory, searchTerm) {
  return PRODUCTS.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    return product ? sum + product.price * item.qty : sum;
  }, 0);
}

function cartItemCount(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

// renderProducts now builds <li> items (was <article>) into the <ul id="product-grid">
function renderProducts(grid, resultsInfo, activeCategory, searchTerm) {
  const list = getFilteredProducts(activeCategory, searchTerm);
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML =
      '<li class="no-results">No coffee matches your search. Try a different name or category.</li>';
  } else {
    list.forEach((p) => {
      const card = document.createElement("li");
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

function renderCart(cartItemsEl, cartTotalEl, cartCountEl, cart) {
  cartCountEl.textContent = cartItemCount(cart);

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

  cartTotalEl.textContent = formatPrice(cartTotal(cart));
}

/* ===== main.js section ===== */

let cart = Storage.get(CART_KEY) || [];
let activeCategory = "All";
let searchTerm = "";

const grid = document.getElementById("product-grid");
const resultsInfo = document.getElementById("results-info");
const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");
const cartCountEl = document.getElementById("cart-count");
const cartPanel = document.getElementById("cart-panel");
const cartOverlay = document.getElementById("cart-overlay");
const toast = document.getElementById("toast");

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function refreshProducts() {
  renderProducts(grid, resultsInfo, activeCategory, searchTerm);
}

function refreshCart() {
  renderCart(cartItemsEl, cartTotalEl, cartCountEl, cart);
}

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
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
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
  refreshCart();
}

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

const navLinks = document.querySelectorAll("[data-nav-target]");

function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => target.focus({ preventScroll: true }), 400);
  navLinks.forEach((link) => link.classList.remove("is-active"));
  const activeLink = document.querySelector(`[data-nav-target="${targetId}"]`);
  if (activeLink) activeLink.classList.add("is-active");
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    scrollToSection(link.dataset.navTarget);
  });
});

// ---------- Theme toggle (dark mode) ----------
const themeToggle = document.getElementById("theme-toggle");

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {}
  themeToggle.setAttribute("aria-checked", String(theme === "dark"));
}

// Sync switch state with whatever the head script already applied on load
setTheme(document.documentElement.getAttribute("data-theme") || "light");

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  setTheme(current === "dark" ? "light" : "dark");
});

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
    refreshProducts();
  });
});

document
  .getElementById("search-form")
  .addEventListener("submit", (e) => e.preventDefault());

document.getElementById("search-input").addEventListener("input", (e) => {
  searchTerm = e.target.value;
  refreshProducts();
});

refreshProducts();
refreshCart();
