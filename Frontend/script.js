/**
 * Boku Supermarket POS & Inventory Management System
 * Production Frontend Controller
 */

// Live Render backend URL (no /api prefix)
const API_BASE_URL = "https://boku-pos-api.onrender.com";

// Application State
const state = {
  token: localStorage.getItem("boku_token") || null,
  user: JSON.parse(localStorage.getItem("boku_user")) || null,
  products: [],
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
        throw new Error("Session expired. Please log in again.");
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
  try {
    const data = await apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
    });

    state.token = data.token;
    state.user = data.user || { email: email };
    localStorage.setItem("boku_token", state.token);
    localStorage.setItem("boku_user", JSON.stringify(state.user));

    updateAuthUI();
    loadProducts();
    alert("Login successful!");
    return true;
  } catch (err) {
    alert("Login failed: " + err.message);
    return false;
  }
}

async function handleRegister(name, email, password, role = "cashier") {
  try {
    const data = await apiRequest("/users/register", {
      method: "POST",
      body: JSON.stringify({ name: name, email: email, password: password, role: role }),
    });

    alert("Registration successful! You can now log in.");
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

function updateAuthUI() {
  const authSection = document.getElementById("auth-modal");
  const userDisplay = document.getElementById("logged-in-user");

  if (state.token) {
    if (authSection) authSection.classList.add("hidden");
    if (userDisplay) {
      userDisplay.textContent = state.user?.name || state.user?.email || "Cashier";
    }
  } else {
    if (authSection) authSection.classList.remove("hidden");
    if (userDisplay) {
      userDisplay.textContent = "Not logged in";
    }
  }
}

// -------------------------------------------------------------
// Catalog & Inventory
// -------------------------------------------------------------
async function loadProducts() {
  const productsContainer = document.getElementById("product-grid");
  try {
    if (productsContainer) {
      productsContainer.innerHTML = '<div class="p-6 text-gray-500">Loading catalog from cloud...</div>';
    }

    const data = await apiRequest("/products");
    state.products = Array.isArray(data) ? data : (data.products || []);
    renderProductCatalog();
  } catch (err) {
    if (productsContainer) {
      productsContainer.innerHTML =
        '<div class="p-6 text-red-500 bg-red-50 rounded border border-red-200">' +
        'Failed to load catalog. Please check network connection and refresh.' +
        '</div>';
    }
  }
}

function renderProductCatalog() {
  const container = document.getElementById("product-grid");
  if (!container) return;

  const filtered = state.products.filter((product) => {
    const nameMatch = (product.name || "").toLowerCase().includes(state.searchQuery.toLowerCase());
    const barcodeMatch = (product.barcode || "").includes(state.searchQuery);
    const matchesSearch = nameMatch || barcodeMatch;
    const matchesCat = state.activeCategory === "all" || product.category === state.activeCategory;
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="col-span-full py-12 text-center text-gray-400">No products found.</div>';
    return;
  }

  container.innerHTML = filtered.map((prod) => {
    const isOutOfStock = prod.quantity <= 0;
    const categoryLabel = prod.category || "General";
    const stockLabel = prod.quantity < 5
      ? '<span class="text-xs text-amber-600 font-bold">Stock: ' + prod.quantity + '</span>'
      : '<span class="text-xs text-gray-400">Stock: ' + prod.quantity + '</span>';

    return (
      '<div onclick="' + (isOutOfStock ? '' : "addToCart('" + prod._id + "')") + '" ' +
      'class="p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer flex flex-col justify-between ' +
      (isOutOfStock ? 'opacity-50 cursor-not-allowed' : '') + '">' +
        '<div>' +
          '<div class="flex justify-between items-start mb-2">' +
            '<span class="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">' + categoryLabel + '</span>' +
            stockLabel +
          '</div>' +
          '<h4 class="font-semibold text-gray-800 text-sm mb-1 leading-snug">' + prod.name + '</h4>' +
        '</div>' +
        '<div class="mt-4 flex items-center justify-between">' +
          '<span class="text-emerald-700 font-bold">₦' + Number(prod.price).toLocaleString() + '</span>' +
          '<button class="px-2 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 transition" ' +
          (isOutOfStock ? 'disabled' : '') + '>' +
            (isOutOfStock ? 'Out of Stock' : 'Add') +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }).join("");
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
      alert("Only " + product.quantity + " units available in stock.");
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
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0;
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");
  const payBtn = document.getElementById("checkout-btn");

  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML =
      '<div class="h-64 flex flex-col items-center justify-center text-gray-400">' +
      '<p class="text-sm">Scan barcode or select an item</p>' +
      '</div>';
    if (subtotalEl) subtotalEl.textContent = "₦0";
    if (totalEl) totalEl.textContent = "₦0";
    if (payBtn) payBtn.disabled = true;
    return;
  }

  container.innerHTML = state.cart.map((item) => {
    const lineTotal = item.price * item.quantity;
    return (
      '<div class="flex items-center justify-between p-3 mb-2 bg-gray-50 rounded-lg border border-gray-100 text-sm">' +
        '<div class="flex-1 pr-2">' +
          '<p class="font-medium text-gray-800 leading-tight">' + item.name + '</p>' +
          '<span class="text-xs text-gray-500">₦' + item.price.toLocaleString() + ' × ' + item.quantity + '</span>' +
        '</div>' +
        '<div class="flex items-center space-x-2">' +
          '<button onclick="updateCartQuantity(\'' + item._id + '\', -1)" class="w-6 h-6 rounded bg-gray-200 text-gray-700 flex items-center justify-center font-bold hover:bg-gray-300">-</button>' +
          '<span class="font-semibold text-gray-800 w-5 text-center">' + item.quantity + '</span>' +
          '<button onclick="updateCartQuantity(\'' + item._id + '\', 1)" class="w-6 h-6 rounded bg-gray-200 text-gray-700 flex items-center justify-center font-bold hover:bg-gray-300">+</button>' +
          '<button onclick="removeFromCart(\'' + item._id + '\')" class="text-red-500 hover:text-red-700 ml-2">×</button>' +
        '</div>' +
        '<div class="w-20 text-right font-bold text-gray-800">' +
          '₦' + lineTotal.toLocaleString() +
        '</div>' +
      '</div>'
    );
  }).join("");

  const { subtotal, total } = calculateCartTotals();
  if (subtotalEl) subtotalEl.textContent = "₦" + subtotal.toLocaleString();
  if (totalEl) totalEl.textContent = "₦" + total.toLocaleString();
  if (payBtn) payBtn.disabled = false;
}

// -------------------------------------------------------------
// Checkout & Receipts
// -------------------------------------------------------------
async function processSale(paymentMethod = "Cash") {
  if (state.cart.length === 0) {
    alert("Cannot process an empty sale.");
    return;
  }

  const { subtotal, tax, total } = calculateCartTotals();

  const payload = {
    items: state.cart.map((item) => ({
      product: item._id,
      quantity: item.quantity,
      price: item.price,
    })),
    subtotal: subtotal,
    tax: tax,
    totalAmount: total,
    paymentMethod: paymentMethod,
    cashier: state.user?.id || undefined,
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
    clearCart();
    loadProducts();
  } catch (err) {
    alert("Transaction Failed: " + err.message);
  } finally {
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.textContent = "Charge Sale";
    }
  }
}

function displayReceipt(sale) {
  const receiptModal = document.getElementById("receipt-modal");
  const receiptContent = document.getElementById("receipt-content");

  if (!receiptModal || !receiptContent) {
    alert("Sale successful! Receipt printed to console.");
    console.log("Sale Details:", sale);
    return;
  }

  const itemsList = sale.items || state.cart;
  const formattedTotal = (sale.totalAmount || 0).toLocaleString();
  const method = sale.paymentMethod || "Cash";
  const receiptDate = new Date().toLocaleString();

  const itemsHtml = itemsList.map((item) => {
    const itemName = item.name || "Item";
    const itemLineTotal = (item.price * item.quantity).toLocaleString();
    return (
      '<div class="flex justify-between">' +
        '<span>' + itemName + ' x ' + item.quantity + '</span>' +
        '<span>₦' + itemLineTotal + '</span>' +
      '</div>'
    );
  }).join("");

  receiptContent.innerHTML =
    '<div class="text-center pb-4 border-b border-dashed border-gray-300">' +
      '<h2 class="font-extrabold text-lg uppercase">Boku Supermarket</h2>' +
      '<p class="text-xs text-gray-500">Abeokuta, Ogun State</p>' +
      '<p class="text-xs text-gray-400 mt-1">' + receiptDate + '</p>' +
    '</div>' +
    '<div class="py-3 border-b border-dashed border-gray-300 space-y-1 text-xs">' +
      itemsHtml +
    '</div>' +
    '<div class="pt-3 text-xs space-y-1">' +
      '<div class="flex justify-between font-bold text-sm">' +
        '<span>Total:</span>' +
        '<span>₦' + formattedTotal + '</span>' +
      '</div>' +
      '<div class="flex justify-between text-gray-500">' +
        '<span>Method:</span>' +
        '<span>' + method + '</span>' +
      '</div>' +
    '</div>';

  receiptModal.classList.remove("hidden");
}

// -------------------------------------------------------------
// App Initialization & Listeners
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  loadProducts();

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      renderProductCatalog();
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const exactMatch = state.products.find(
          (p) => p.barcode === searchInput.value.trim()
        );
        if (exactMatch) {
          addToCart(exactMatch._id);
          searchInput.value = "";
          state.searchQuery = "";
          renderProductCatalog();
        }
      }
    });
  }

  const catButtons = document.querySelectorAll("[data-category]");
  catButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      catButtons.forEach((b) => b.classList.remove("bg-emerald-600", "text-white"));
      btn.classList.add("bg-emerald-600", "text-white");
      state.activeCategory = btn.getAttribute("data-category");
      renderProductCatalog();
    });
  });

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => processSale("Cash"));
  }
});