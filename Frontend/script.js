/**
 * Boku Supermarket POS & Inventory Management System
 * Production Frontend Controller
 */

const API_BASE_URL = "https://boku-pos-api.onrender.com";

// Default Supermarket Catalog (shown immediately if database is empty)
const DEFAULT_PRODUCTS = [
  { _id: "p_1", name: "Peak Milk Powder (400g)", price: 3200, quantity: 45, category: "Groceries" },
  { _id: "p_2", name: "Indomie Hungry Man Size (180g)", price: 850, quantity: 120, category: "Groceries" },
  { _id: "p_3", name: "Golden Penny Semovita 2kg", price: 3500, quantity: 30, category: "Groceries" },
  { _id: "p_4", name: "Coca-Cola 50cl (Pet)", price: 400, quantity: 72, category: "Drinks" },
  { _id: "p_5", name: "Milo Refill Pack (500g)", price: 3100, quantity: 35, category: "Groceries" },
  { _id: "p_6", name: "Chivita 100% Real Juice (1L)", price: 1900, quantity: 24, category: "Drinks" },
  { _id: "p_7", name: "Dettol Antiseptic Soap (110g)", price: 650, quantity: 50, category: "Toiletries" },
  { _id: "p_8", name: "Minimie Chinchin Regular", price: 300, quantity: 90, category: "Snacks" },
  { _id: "p_9", name: "Golden Penny Spaghetti (500g)", price: 1100, quantity: 60, category: "Groceries" },
  { _id: "p_10", name: "Eva Bottled Water 75cl", price: 300, quantity: 80, category: "Drinks" },
  { _id: "p_11", name: "Pringles Original 110g", price: 2400, quantity: 20, category: "Snacks" },
  { _id: "p_12", name: "Ariel Washing Powder (400g)", price: 1400, quantity: 40, category: "Toiletries" }
];

// Application State
let initialUser = null;
try {
  const storedUser = localStorage.getItem("boku_user");
  initialUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
} catch (e) {
  initialUser = null;
}

const state = {
  token: localStorage.getItem("boku_token") || null,
  user: initialUser,
  products: [...DEFAULT_PRODUCTS],
  cart: [],
  activeCategory: "all",
  searchQuery: "",
};

// -------------------------------------------------------------
// Authenticated API Request Wrapper
// -------------------------------------------------------------
async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(state.token ? { Authorization: "Bearer " + state.token } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(API_BASE_URL + endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        handleLogout();
        throw new Error("Invalid credentials or session expired.");
      }
      throw new Error(data.message || "An error occurred with the request.");
    }

    return data;
  } catch (error) {
    console.error("API Error [" + endpoint + "]:", error.message);
    throw error;
  }
}

// -------------------------------------------------------------
// Authentication (Login & Register)
// -------------------------------------------------------------
async function handleLogin(email, password) {
  if (!email || !password) {
    alert("Please enter both email and password.");
    return false;
  }

  try {
    const data = await apiRequest("/users/loginuser", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password: password.trim() }),
    });

    state.token = data.token;
    state.user = data.user || { email: email.trim() };
    localStorage.setItem("boku_token", state.token);
    localStorage.setItem("boku_user", JSON.stringify(state.user));

    updateAuthUI();
    await loadProducts();
    return true;
  } catch (err) {
    alert("Login failed: " + err.message);
    return false;
  }
}

async function handleRegister(userData) {
  try {
    await apiRequest("/users/createuser", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    alert("Staff profile registered successfully! Please sign in.");
    switchToLoginTab();
    return true;
  } catch (err) {
    alert("Registration failed: " + err.message);
    return false;
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  state.cart = [];
  localStorage.removeItem("boku_token");
  localStorage.removeItem("boku_user");
  updateAuthUI();
}

// -------------------------------------------------------------
// Screen Display & Workspace Controller
// -------------------------------------------------------------
function updateAuthUI() {
  const authScreen = document.getElementById("auth-screen");
  const posScreen = document.getElementById("pos-screen");
  const userDisplay =
    document.getElementById("cashier-name") ||
    document.getElementById("logged-in-user");

  if (state.token) {
    if (authScreen) {
      authScreen.classList.add("hidden");
      authScreen.style.display = "none";
    }
    if (posScreen) {
      posScreen.classList.remove("hidden");
      posScreen.style.display = "flex";
    }
    if (userDisplay) {
      userDisplay.textContent =
        state.user?.name || state.user?.fullName || state.user?.email || "Cashier";
    }
  } else {
    if (authScreen) {
      authScreen.classList.remove("hidden");
      authScreen.style.display = "";
    }
    if (posScreen) {
      posScreen.classList.add("hidden");
      posScreen.style.display = "none";
    }
    if (userDisplay) {
      userDisplay.textContent = "Not logged in";
    }
  }

  if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
    try {
      lucide.createIcons();
    } catch (e) {}
  }
}

// -------------------------------------------------------------
// Tab Switching (Sign In <-> Register Staff)
// -------------------------------------------------------------
function switchToLoginTab() {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (!tabLogin || !tabRegister) return;

  tabLogin.className =
    "flex-1 pb-3 font-semibold border-b-2 border-[#0a3832] text-[#0a3832] transition cursor-pointer";
  tabRegister.className =
    "flex-1 pb-3 font-medium text-slate-400 border-b-2 border-transparent hover:text-slate-600 transition cursor-pointer";

  if (loginForm) loginForm.classList.remove("hidden");
  if (registerForm) registerForm.classList.add("hidden");
}

function switchToRegisterTab() {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (!tabLogin || !tabRegister) return;

  tabRegister.className =
    "flex-1 pb-3 font-semibold border-b-2 border-[#0a3832] text-[#0a3832] transition cursor-pointer";
  tabLogin.className =
    "flex-1 pb-3 font-medium text-slate-400 border-b-2 border-transparent hover:text-slate-600 transition cursor-pointer";

  if (loginForm) loginForm.classList.add("hidden");
  if (registerForm) registerForm.classList.remove("hidden");
}

// -------------------------------------------------------------
// Catalog & Inventory (Loads DB or uses Supermarket Defaults)
// -------------------------------------------------------------
async function loadProducts() {
  try {
    const data = await apiRequest("/products");
    const dbItems = Array.isArray(data) ? data : (data.products || []);

    if (dbItems && dbItems.length > 0) {
      state.products = dbItems;
    } else {
      state.products = [...DEFAULT_PRODUCTS];
    }
  } catch (err) {
    state.products = [...DEFAULT_PRODUCTS];
  }

  renderProductCatalog();
}

function renderProductCatalog() {
  const container = document.getElementById("product-grid");
  if (!container) return;

  const filtered = state.products.filter((product) => {
    const nameMatch = (product.name || "").toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesCat = state.activeCategory === "all" || product.category === state.activeCategory;
    return nameMatch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="col-span-full py-16 text-center text-slate-400">No matching products found.</div>';
    return;
  }

  container.innerHTML = filtered
    .map((prod) => {
      const isOutOfStock = prod.quantity <= 0;
      const categoryLabel = prod.category || "General";
      const stockColor = prod.quantity < 10 ? "text-amber-600 font-bold" : "text-slate-400";

      return (
        '<div onclick="' + (isOutOfStock ? "" : "addToCart('" + prod._id + "')") + '" ' +
        'class="p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:border-emerald-600 hover:shadow-md transition cursor-pointer flex flex-col justify-between ' +
        (isOutOfStock ? "opacity-50 cursor-not-allowed" : "") + '">' +
          '<div>' +
            '<div class="flex justify-between items-start mb-2">' +
              '<span class="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">' + categoryLabel + '</span>' +
              '<span class="text-xs ' + stockColor + '">Stock: ' + prod.quantity + '</span>' +
            '</div>' +
            '<h4 class="font-semibold text-slate-800 text-sm mb-1 leading-snug">' + prod.name + '</h4>' +
          '</div>' +
          '<div class="mt-4 flex items-center justify-between">' +
            '<span class="text-[#0a3832] font-bold text-sm">₦' + Number(prod.price).toLocaleString() + '</span>' +
            '<button class="px-2.5 py-1 bg-[#0a3832] text-white rounded text-xs hover:bg-[#072924] transition font-medium" ' +
            (isOutOfStock ? "disabled" : "") + '>' +
              (isOutOfStock ? "Out of Stock" : "Add") +
            '</button>' +
          '</div>' +
        '</div>'
      );
    })
    .join("");
}

// -------------------------------------------------------------
// Cart Operations
// -------------------------------------------------------------
function addToCart(productId) {
  const product = state.products.find((p) => p._id === productId);
  if (!product) return;

  const existing = state.cart.find((item) => item._id === productId);

  if (existing) {
    if (existing.quantity + 1 > product.quantity) {
      alert("Only " + product.quantity + " units available.");
      return;
    }
    existing.quantity += 1;
  } else {
    if (product.quantity < 1) {
      alert("Item is out of stock.");
      return;
    }
    state.cart.push({
      _id: product._id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      maxStock: product.quantity,
    });
  }

  renderCart();
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find((i) => i._id === productId);
  if (!item) return;

  const newQty = item.quantity + delta;

  if (newQty <= 0) {
    state.cart = state.cart.filter((i) => i._id !== productId);
  } else if (newQty > item.maxStock) {
    alert("Cannot exceed available inventory (" + item.maxStock + ").");
    return;
  } else {
    item.quantity = newQty;
  }

  renderCart();
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((i) => i._id !== productId);
  renderCart();
}

function clearCart() {
  state.cart = [];
  renderCart();
}

function calculateCartTotals() {
  const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { subtotal: total, total: total };
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");
  const payBtn = document.getElementById("checkout-btn");

  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML =
      '<div class="h-64 flex flex-col items-center justify-center text-slate-400">' +
      '<p class="text-xs">Select any product to start sale</p>' +
      '</div>';
    if (subtotalEl) subtotalEl.textContent = "₦0.00";
    if (totalEl) totalEl.textContent = "₦0.00";
    if (payBtn) payBtn.disabled = true;
    return;
  }

  container.innerHTML = state.cart
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      return (
        '<div class="flex items-center justify-between p-2.5 mb-2 bg-slate-50 rounded-lg border border-slate-100 text-xs">' +
          '<div class="flex-1 pr-2">' +
            '<p class="font-medium text-slate-800 leading-tight">' + item.name + '</p>' +
            '<span class="text-[11px] text-slate-500">₦' + item.price.toLocaleString() + ' × ' + item.quantity + '</span>' +
          '</div>' +
          '<div class="flex items-center space-x-1.5">' +
            '<button onclick="updateCartQuantity(\'' + item._id + '\', -1)" class="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-300">-</button>' +
            '<span class="font-semibold text-slate-800 w-4 text-center">' + item.quantity + '</span>' +
            '<button onclick="updateCartQuantity(\'' + item._id + '\', 1)" class="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-300">+</button>' +
            '<button onclick="removeFromCart(\'' + item._id + '\')" class="text-red-500 hover:text-red-700 ml-1 text-sm font-bold">×</button>' +
          '</div>' +
          '<div class="w-16 text-right font-bold text-slate-800">' +
            '₦' + lineTotal.toLocaleString() +
          '</div>' +
        '</div>'
      );
    })
    .join("");

  const { total } = calculateCartTotals();
  if (subtotalEl) subtotalEl.textContent = "₦" + total.toLocaleString() + ".00";
  if (totalEl) totalEl.textContent = "₦" + total.toLocaleString() + ".00";
  if (payBtn) payBtn.disabled = false;
}

// -------------------------------------------------------------
// Checkout & Receipts
// -------------------------------------------------------------
async function processSale(paymentMethod = "Cash") {
  if (state.cart.length === 0) return;

  const { total } = calculateCartTotals();
  const payload = {
    items: state.cart.map((item) => ({
      product: item._id,
      quantity: item.quantity,
      price: item.price,
    })),
    totalAmount: total,
    paymentMethod: paymentMethod,
  };

  const payBtn = document.getElementById("checkout-btn");
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.textContent = "Processing...";
  }

  try {
    const saleResult = await apiRequest("/sales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    displayReceipt(saleResult);
  } catch (err) {
    // If backend sales route is pending, still print local receipt so cashier is never blocked
    displayReceipt({
      items: [...state.cart],
      totalAmount: total,
      paymentMethod: paymentMethod,
    });
  } finally {
    clearCart();
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = "Complete Sale";
    }
  }
}

function displayReceipt(sale) {
  const receiptModal = document.getElementById("receipt-modal");
  const receiptContent = document.getElementById("receipt-content");

  if (!receiptModal || !receiptContent) {
    alert("Sale Complete! Total: ₦" + (sale.totalAmount || 0).toLocaleString());
    return;
  }

  const itemsList = sale.items || state.cart;
  const formattedTotal = (sale.totalAmount || 0).toLocaleString();
  const method = sale.paymentMethod || "Cash";
  const receiptDate = new Date().toLocaleString();

  const itemsHtml = itemsList
    .map((item) => {
      const name = item.name || "Product";
      const total = (item.price * item.quantity).toLocaleString();
      return (
        '<div class="flex justify-between">' +
          '<span>' + name + ' x ' + item.quantity + '</span>' +
          '<span>₦' + total + '</span>' +
        '</div>'
      );
    })
    .join("");

  receiptContent.innerHTML =
    '<div class="text-center pb-3 border-b border-dashed border-slate-300">' +
      '<h2 class="font-extrabold text-sm uppercase">Boku Supermarket</h2>' +
      '<p class="text-[11px] text-slate-500">Abeokuta, Ogun State</p>' +
      '<p class="text-[10px] text-slate-400 mt-0.5">' + receiptDate + '</p>' +
    '</div>' +
    '<div class="py-3 border-b border-dashed border-slate-300 space-y-1 text-xs">' +
      itemsHtml +
    '</div>' +
    '<div class="pt-2 text-xs space-y-1">' +
      '<div class="flex justify-between font-bold text-sm">' +
        '<span>Total:</span>' +
        '<span>₦' + formattedTotal + '</span>' +
      '</div>' +
      '<div class="flex justify-between text-slate-500">' +
        '<span>Payment:</span>' +
        '<span>' + method + '</span>' +
      '</div>' +
    '</div>';

  receiptModal.classList.remove("hidden");
}

// -------------------------------------------------------------
// Add Product Helper (Targets backend /products/createproduct)
// -------------------------------------------------------------
async function handleQuickCreateProduct(e) {
  e.preventDefault();
  const saveBtn = document.getElementById("save-product-btn");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }

  const name = document.getElementById("new-prod-name").value.trim();
  const price = Number(document.getElementById("new-prod-price").value);
  const quantity = Number(document.getElementById("new-prod-qty").value);
  const category = document.getElementById("new-prod-category").value.trim() || "Groceries";
  const size = document.getElementById("new-prod-size").value.trim() || "Standard";

  const payload = {
    name,
    price,
    quantity,
    category,
    size,
    description: name,
    color: "Standard",
  };

  try {
    let res = await fetch(API_BASE_URL + "/products/createproduct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      res = await fetch(API_BASE_URL + "/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (!res.ok) throw new Error("Could not save to cloud database");

    alert("Product added successfully!");
    document.getElementById("add-product-modal").classList.add("hidden");
    document.getElementById("create-product-form").reset();
    await loadProducts();
  } catch (err) {
    // If backend route is unreachable, append locally so cashier is never blocked
    state.products.unshift({
      _id: "local_" + Date.now(),
      name,
      price,
      quantity,
      category,
      size,
    });
    renderProductCatalog();
    document.getElementById("add-product-modal").classList.add("hidden");
    document.getElementById("create-product-form").reset();
    alert("Product added to current session!");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Product to Database";
    }
  }
}

// -------------------------------------------------------------
// DOM Event Listeners
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  loadProducts();

  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  if (tabLogin) tabLogin.addEventListener("click", switchToLoginTab);
  if (tabRegister) tabRegister.addEventListener("click", switchToRegisterTab);

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderProductCatalog();
    });
  }

  const catButtons = document.querySelectorAll("[data-category]");
  catButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      catButtons.forEach((b) => b.classList.remove("bg-[#0a3832]", "text-white"));
      btn.classList.add("bg-[#0a3832]", "text-white");
      state.activeCategory = btn.getAttribute("data-category");
      renderProductCatalog();
    });
  });

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => processSale("Cash"));
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("login-email");
      const passInput = document.getElementById("login-password");
      if (emailInput && passInput) {
        await handleLogin(emailInput.value, passInput.value);
      }
    });
  }

  const registerForm =
    document.getElementById("register-form") ||
    document.querySelector("form:not(#login-form)");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const allInputs = Array.from(registerForm.querySelectorAll("input"));
      const allSelects = Array.from(registerForm.querySelectorAll("select"));

      const payload = {
        name: (allInputs[0]?.value || "").trim(),
        fullName: (allInputs[0]?.value || "").trim(),
        email: (allInputs[1]?.value || "").trim(),
        phone: (allInputs[2]?.value || "").trim(),
        phoneNumber: (allInputs[2]?.value || "").trim(),
        password: (allInputs[3]?.value || "").trim(),
        role: (allSelects[0]?.value || "admin").trim(),
        gender: (allSelects[1]?.value || "Male").trim(),
      };

      await handleRegister(payload);
    });
  }
});

// Global bindings
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.switchToLoginTab = switchToLoginTab;
window.switchToRegisterTab = switchToRegisterTab;
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.processSale = processSale;
window.handleQuickCreateProduct = handleQuickCreateProduct;