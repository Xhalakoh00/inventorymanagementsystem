/**
 * Boku Supermarket POS & Inventory Management System
 * Production Controller: Stockroom Hub, Responsive UI & Sales History Archive
 */

const API_BASE_URL = "https://boku-pos-api.onrender.com";

// Supermarket Catalog
const DEFAULT_PRODUCTS = [
  {
    _id: "p_1",
    name: "Peak Milk Powder (400g)",
    price: 3200,
    costPrice: 2750,
    quantity: 45,
    minStock: 10,
    expiryDate: "2027-04-15",
    category: "Groceries",
    barcode: "61511000101",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_2",
    name: "Indomie Hungry Man Size (180g)",
    price: 850,
    costPrice: 700,
    quantity: 120,
    minStock: 25,
    expiryDate: "2027-02-10",
    category: "Groceries",
    barcode: "61511000102",
    image: "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_3",
    name: "Golden Penny Semovita 2kg",
    price: 3500,
    costPrice: 2950,
    quantity: 30,
    minStock: 8,
    expiryDate: "2027-06-30",
    category: "Groceries",
    barcode: "61511000103",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_4",
    name: "Coca-Cola 50cl (Pet)",
    price: 400,
    costPrice: 320,
    quantity: 72,
    minStock: 24,
    expiryDate: "2026-12-20",
    category: "Drinks",
    barcode: "61511000104",
    image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_5",
    name: "Milo Refill Pack (500g)",
    price: 3100,
    costPrice: 2600,
    quantity: 35,
    minStock: 10,
    expiryDate: "2027-05-18",
    category: "Groceries",
    barcode: "61511000105",
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_6",
    name: "Chivita 100% Real Juice (1L)",
    price: 1900,
    costPrice: 1550,
    quantity: 24,
    minStock: 12,
    expiryDate: "2026-11-30",
    category: "Drinks",
    barcode: "61511000106",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_7",
    name: "Dettol Antiseptic Soap (110g)",
    price: 650,
    costPrice: 500,
    quantity: 50,
    minStock: 15,
    expiryDate: "2028-01-01",
    category: "Toiletries",
    barcode: "61511000107",
    image: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_8",
    name: "Minimie Chinchin Regular",
    price: 300,
    costPrice: 220,
    quantity: 90,
    minStock: 25,
    expiryDate: "2027-01-15",
    category: "Snacks",
    barcode: "61511000108",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_9",
    name: "Golden Penny Spaghetti (500g)",
    price: 1100,
    costPrice: 900,
    quantity: 60,
    minStock: 15,
    expiryDate: "2027-08-20",
    category: "Groceries",
    barcode: "61511000109",
    image: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_10",
    name: "Eva Bottled Water 75cl",
    price: 300,
    costPrice: 200,
    quantity: 80,
    minStock: 24,
    expiryDate: "2027-03-10",
    category: "Drinks",
    barcode: "61511000110",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_11",
    name: "Pringles Original 110g",
    price: 2400,
    costPrice: 1950,
    quantity: 20,
    minStock: 8,
    expiryDate: "2026-12-15",
    category: "Snacks",
    barcode: "61511000111",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=500&q=80"
  },
  {
    _id: "p_12",
    name: "Ariel Washing Powder (400g)",
    price: 1400,
    costPrice: 1150,
    quantity: 40,
    minStock: 12,
    expiryDate: "2028-06-01",
    category: "Toiletries",
    barcode: "61511000112",
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=500&q=80"
  }
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80";

// Safely restore state
let initialUser = null;
try {
  const storedUser = localStorage.getItem("boku_user");
  initialUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
} catch (e) {
  initialUser = null;
}

// Seed mock history if local storage is empty
let savedSalesHistory = [];
try {
  const storedSales = localStorage.getItem("boku_sales_history");
  if (storedSales) {
    savedSalesHistory = JSON.parse(storedSales);
  } else {
    // Helpful starter transactions for testing reprint
    savedSalesHistory = [
      {
        orderNumber: "BOKU-382914",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        cashier: "Cashier",
        paymentMethod: "Cash",
        totalAmount: 4050,
        tenderedAmount: 5000,
        changeAmount: 950,
        grossProfit: 850,
        items: [
          { name: "Peak Milk Powder (400g)", quantity: 1, price: 3200 },
          { name: "Indomie Hungry Man Size (180g)", quantity: 1, price: 850 }
        ]
      },
      {
        orderNumber: "BOKU-719302",
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        cashier: "Cashier",
        paymentMethod: "POS / Card",
        totalAmount: 3900,
        tenderedAmount: 3900,
        changeAmount: 0,
        grossProfit: 830,
        items: [
          { name: "Golden Penny Semovita 2kg", quantity: 1, price: 3500 },
          { name: "Coca-Cola 50cl (Pet)", quantity: 1, price: 400 }
        ]
      }
    ];
    localStorage.setItem("boku_sales_history", JSON.stringify(savedSalesHistory));
  }
} catch (e) {
  savedSalesHistory = [];
}

const state = {
  token: localStorage.getItem("boku_token") || null,
  user: initialUser,
  products: [...DEFAULT_PRODUCTS],
  cart: [],
  salesHistory: savedSalesHistory,
  activeCategory: "all",
  searchQuery: "",
  selectedPaymentMethod: "Cash",
  inventoryActiveTab: "all",
  historyDateFilter: "all",
  historySearchQuery: "",
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
// Authentication
// -------------------------------------------------------------
async function handleLogin(email, password) {
  if (!email || !password) {
    alert("Please enter both email and password.");
    return false;
  }

  try {
    const data = await apiRequest("/users/loginuser", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() }),
    });

    state.token = data.token;
    state.user = data.user || { email: email.trim() };
    localStorage.setItem("boku_token", state.token);
    localStorage.setItem("boku_user", JSON.stringify(state.user));

    updateAuthUI();
    await loadProducts();
    await loadSalesHistory();
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

    alert("Staff profile registered successfully! You can now sign in.");
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

function updateAuthUI() {
  const authScreen = document.getElementById("auth-screen");
  const posScreen = document.getElementById("pos-screen");
  const userDesktop = document.getElementById("cashier-name");
  const userMobile = document.getElementById("cashier-name-mobile");

  const displayName = state.user?.name || state.user?.fullName || state.user?.email || "Cashier";

  if (state.token) {
    if (authScreen) authScreen.classList.add("hidden");
    if (posScreen) posScreen.classList.remove("hidden");
    if (userDesktop) userDesktop.textContent = displayName;
    if (userMobile) userMobile.textContent = displayName;
  } else {
    if (authScreen) authScreen.classList.remove("hidden");
    if (posScreen) posScreen.classList.add("hidden");
    if (userDesktop) userDesktop.textContent = "Not logged in";
    if (userMobile) userMobile.textContent = "Not logged in";
  }

  if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
    try {
      lucide.createIcons();
    } catch (e) {}
  }
}

function switchToLoginTab() {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (!tabLogin || !tabRegister) return;

  tabLogin.className = "flex-1 pb-3 font-semibold border-b-2 border-[#0a3832] text-[#0a3832] transition cursor-pointer";
  tabRegister.className = "flex-1 pb-3 font-medium text-slate-400 border-b-2 border-transparent hover:text-slate-600 transition cursor-pointer";

  if (loginForm) loginForm.classList.remove("hidden");
  if (registerForm) registerForm.classList.add("hidden");
}

function switchToRegisterTab() {
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (!tabLogin || !tabRegister) return;

  tabRegister.className = "flex-1 pb-3 font-semibold border-b-2 border-[#0a3832] text-[#0a3832] transition cursor-pointer";
  tabLogin.className = "flex-1 pb-3 font-medium text-slate-400 border-b-2 border-transparent hover:text-slate-600 transition cursor-pointer";

  if (loginForm) loginForm.classList.add("hidden");
  if (registerForm) registerForm.classList.remove("hidden");
}

// -------------------------------------------------------------
// Catalog & Inventory
// -------------------------------------------------------------
async function loadProducts() {
  try {
    const data = await apiRequest("/products");
    const dbItems = Array.isArray(data) ? data : (data.products || []);

    if (dbItems && dbItems.length > 0) {
      state.products = dbItems.map((prod) => {
        const matchingDefault = DEFAULT_PRODUCTS.find(
          (d) => d.name.toLowerCase() === (prod.name || "").toLowerCase()
        );
        return {
          ...prod,
          costPrice: Number(prod.costPrice || matchingDefault?.costPrice || (prod.price * 0.75)),
          minStock: Number(prod.minStock || matchingDefault?.minStock || 10),
          expiryDate: prod.expiryDate || matchingDefault?.expiryDate || "2027-12-31",
          image: prod.image || matchingDefault?.image || FALLBACK_IMAGE,
          barcode: prod.barcode || matchingDefault?.barcode || "",
        };
      });
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
    const query = state.searchQuery.toLowerCase();
    const nameMatch = (product.name || "").toLowerCase().includes(query);
    const barcodeMatch = (product.barcode || "").includes(query);
    const matchesCat = state.activeCategory === "all" || product.category === state.activeCategory;
    return (nameMatch || barcodeMatch) && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="col-span-full py-16 text-center text-slate-400 font-medium">No matching items found.</div>';
    return;
  }

  container.innerHTML = filtered
    .map((prod) => {
      const isOutOfStock = prod.quantity <= 0;
      const isLowStock = prod.quantity > 0 && prod.quantity <= (prod.minStock || 10);
      const categoryLabel = prod.category || "Groceries";
      const imgSrc = prod.image || FALLBACK_IMAGE;

      let stockBadge = '<span class="text-[11px] text-slate-400">Stock: ' + prod.quantity + '</span>';
      if (isOutOfStock) {
        stockBadge = '<span class="text-[9px] font-bold text-rose-600 bg-rose-50 px-1 py-0.5 rounded">Out</span>';
      } else if (isLowStock) {
        stockBadge = '<span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded">Low (' + prod.quantity + ')</span>';
      }

      return (
        '<div onclick="' + (isOutOfStock ? "" : "addToCart('" + prod._id + "')") + '" ' +
        'class="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 hover:border-emerald-600 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden p-2.5 sm:p-3.5 shadow-sm ' +
        (isOutOfStock ? "opacity-50 cursor-not-allowed" : "") + '">' +
          '<div>' +
            '<div class="h-28 sm:h-32 w-full bg-slate-100 rounded-lg sm:rounded-xl overflow-hidden mb-2.5 relative flex items-center justify-center">' +
              '<img src="' + imgSrc + '" alt="' + prod.name + '" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" onerror="this.src=\'' + FALLBACK_IMAGE + '\'">' +
              '<span class="absolute top-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/95 backdrop-blur-sm text-slate-800 shadow-sm">' +
                categoryLabel +
              '</span>' +
            '</div>' +
            '<h4 class="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 mb-1">' +
              prod.name +
            '</h4>' +
          '</div>' +
          '<div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">' +
            '<div>' +
              '<span class="text-[#0a3832] font-black text-xs sm:text-sm block font-mono">₦' + Number(prod.price).toLocaleString() + '</span>' +
              stockBadge +
            '</div>' +
            '<button class="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-[#0a3832] group-hover:bg-emerald-700 text-white rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold shadow-sm transition" ' +
            (isOutOfStock ? "disabled" : "") + '>' +
              (isOutOfStock ? "Empty" : "Add") +
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
      costPrice: Number(product.costPrice || (product.price * 0.75)),
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
  const totalCost = state.cart.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal: total, total: total, profit: Math.max(0, total - totalCost), count: count };
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");
  const payBtn = document.getElementById("checkout-btn");

  const mobileBar = document.getElementById("mobile-cart-bar");
  const mobileCount = document.getElementById("mobile-cart-count");
  const mobileTotal = document.getElementById("mobile-cart-total");

  if (!container) return;

  const { total, count } = calculateCartTotals();

  if (mobileBar) {
    if (state.cart.length > 0) {
      mobileBar.classList.remove("hidden");
      if (mobileCount) mobileCount.textContent = count;
      if (mobileTotal) mobileTotal.textContent = "₦" + total.toLocaleString() + ".00";
    } else {
      mobileBar.classList.add("hidden");
    }
  }

  if (state.cart.length === 0) {
    container.innerHTML =
      '<div class="h-44 sm:h-64 flex flex-col items-center justify-center text-slate-400">' +
        '<i data-lucide="shopping-bag" class="w-8 h-8 mb-2 stroke-1 text-slate-300"></i>' +
        '<p class="text-xs">Scan or click products to build ticket</p>' +
      '</div>';
    if (typeof lucide !== "undefined") lucide.createIcons();
    if (subtotalEl) subtotalEl.textContent = "₦0.00";
    if (totalEl) totalEl.textContent = "₦0.00";
    if (payBtn) payBtn.disabled = true;
    return;
  }

  container.innerHTML = state.cart
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      return (
        '<div class="flex items-center justify-between p-2 sm:p-2.5 mb-1.5 sm:mb-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">' +
          '<div class="flex-1 pr-2 truncate">' +
            '<p class="font-bold text-slate-800 leading-tight truncate">' + item.name + '</p>' +
            '<span class="text-[10px] text-slate-500 font-mono">₦' + item.price.toLocaleString() + ' × ' + item.quantity + '</span>' +
          '</div>' +
          '<div class="flex items-center space-x-1 sm:space-x-1.5">' +
            '<button onclick="updateCartQuantity(\'' + item._id + '\', -1)" class="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-300">-</button>' +
            '<span class="font-bold text-slate-800 w-4 text-center">' + item.quantity + '</span>' +
            '<button onclick="updateCartQuantity(\'' + item._id + '\', 1)" class="w-5 h-5 sm:w-6 sm:h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-300">+</button>' +
            '<button onclick="removeFromCart(\'' + item._id + '\')" class="text-rose-500 hover:text-rose-700 ml-1 text-base font-bold">×</button>' +
          '</div>' +
          '<div class="w-16 sm:w-20 text-right font-black text-slate-800 font-mono">' +
            '₦' + lineTotal.toLocaleString() +
          '</div>' +
        '</div>'
      );
    })
    .join("");

  if (subtotalEl) subtotalEl.textContent = "₦" + total.toLocaleString() + ".00";
  if (totalEl) totalEl.textContent = "₦" + total.toLocaleString() + ".00";
  if (payBtn) payBtn.disabled = false;
}

function scrollToCartOrCheckout() {
  openCheckoutModal();
}

// -------------------------------------------------------------
// Checkout Modal & Tender/Change Calculation
// -------------------------------------------------------------
function openCheckoutModal() {
  if (state.cart.length === 0) return;

  const { total } = calculateCartTotals();
  const dueEl = document.getElementById("modal-due-amount");
  const tenderInput = document.getElementById("tender-amount-input");

  if (dueEl) dueEl.textContent = "₦" + total.toLocaleString() + ".00";
  if (tenderInput) tenderInput.value = total;

  selectPaymentMethod("Cash");
  calculateChange();

  document.getElementById("payment-modal").classList.remove("hidden");
}

function closeCheckoutModal() {
  document.getElementById("payment-modal").classList.add("hidden");
}

function selectPaymentMethod(method) {
  state.selectedPaymentMethod = method;
  const methods = ["Cash", "POS / Card", "Transfer"];
  const buttonIds = {
    Cash: "method-cash",
    "POS / Card": "method-card",
    Transfer: "method-transfer",
  };

  methods.forEach((m) => {
    const btn = document.getElementById(buttonIds[m]);
    if (!btn) return;
    if (m === method) {
      btn.className = "py-2 px-2.5 rounded-xl border border-emerald-600 bg-emerald-50 text-[#0a3832] font-bold text-xs flex flex-col items-center justify-center space-y-1 transition";
    } else {
      btn.className = "py-2 px-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs flex flex-col items-center justify-center space-y-1 hover:border-slate-300 transition";
    }
  });

  const cashCalc = document.getElementById("cash-calculator");
  if (cashCalc) {
    cashCalc.style.display = method === "Cash" ? "block" : "none";
  }
}

function calculateChange() {
  const { total } = calculateCartTotals();
  const tenderInput = document.getElementById("tender-amount-input");
  const changeEl = document.getElementById("change-due-display");
  const confirmBtn = document.getElementById("confirm-payment-btn");

  const tendered = Number(tenderInput?.value || 0);
  const change = tendered - total;

  if (changeEl) {
    if (change >= 0) {
      changeEl.textContent = "₦" + change.toLocaleString() + ".00";
      changeEl.className = "text-base sm:text-lg font-black font-mono text-emerald-700";
      if (confirmBtn) confirmBtn.disabled = false;
    } else {
      changeEl.textContent = "Short by ₦" + Math.abs(change).toLocaleString();
      changeEl.className = "text-xs sm:text-sm font-bold font-mono text-rose-600";
      if (confirmBtn && state.selectedPaymentMethod === "Cash") {
        confirmBtn.disabled = true;
      }
    }
  }
}

function setExactTender() {
  const { total } = calculateCartTotals();
  const tenderInput = document.getElementById("tender-amount-input");
  if (tenderInput) {
    tenderInput.value = total;
    calculateChange();
  }
}

function addTender(amount) {
  const tenderInput = document.getElementById("tender-amount-input");
  if (tenderInput) {
    tenderInput.value = Number(tenderInput.value || 0) + amount;
    calculateChange();
  }
}

async function executeFinalCheckout() {
  const { total, profit } = calculateCartTotals();
  const tenderInput = document.getElementById("tender-amount-input");
  const tendered = state.selectedPaymentMethod === "Cash" ? Number(tenderInput?.value || total) : total;
  const change = Math.max(0, tendered - total);

  state.cart.forEach((cartItem) => {
    const prod = state.products.find((p) => p._id === cartItem._id);
    if (prod) prod.quantity = Math.max(0, prod.quantity - cartItem.quantity);
  });

  const payload = {
    orderNumber: "BOKU-" + Math.floor(100000 + Math.random() * 900000),
    items: state.cart.map((item) => ({
      product: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      costPrice: item.costPrice,
    })),
    totalAmount: total,
    grossProfit: profit,
    tenderedAmount: tendered,
    changeAmount: change,
    paymentMethod: state.selectedPaymentMethod,
    cashier: state.user?.name || "Cashier",
    createdAt: new Date().toISOString(),
  };

  const confirmBtn = document.getElementById("confirm-payment-btn");
  if (confirmBtn) {
    confirmBtn.disabled = true;
    confirmBtn.textContent = "Saving...";
  }

  try {
    const saleResult = await apiRequest("/sales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    recordSaleLocally(saleResult || payload);
  } catch (err) {
    recordSaleLocally(payload);
  } finally {
    closeCheckoutModal();
    displayReceipt(payload);
    clearCart();
    renderProductCatalog();

    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.textContent = "Confirm & Print Receipt";
    }
  }
}

function recordSaleLocally(sale) {
  state.salesHistory.unshift(sale);
  try {
    localStorage.setItem("boku_sales_history", JSON.stringify(state.salesHistory.slice(0, 100)));
  } catch (e) {}
}

// -------------------------------------------------------------
// Thermal Receipt Display (80mm Formatted)
// -------------------------------------------------------------
function displayReceipt(sale) {
  const receiptModal = document.getElementById("receipt-modal");
  const receiptContent = document.getElementById("receipt-content");

  if (!receiptModal || !receiptContent) return;

  const itemsList = sale.items || [];
  const orderNum = sale.orderNumber || "BOKU-0001";
  const cashier = sale.cashier || state.user?.name || "Cashier";
  const dateStr = new Date(sale.createdAt || Date.now()).toLocaleString();
  const subtotal = Number(sale.totalAmount || 0).toLocaleString();
  const tendered = Number(sale.tenderedAmount || sale.totalAmount || 0).toLocaleString();
  const change = Number(sale.changeAmount || 0).toLocaleString();

  const itemsRows = itemsList
    .map(
      (item) => `
      <div class="flex justify-between py-0.5">
        <span class="truncate pr-2">${item.name} x${item.quantity}</span>
        <span class="font-mono">₦${(item.price * item.quantity).toLocaleString()}</span>
      </div>`
    )
    .join("");

  receiptContent.innerHTML = `
    <div class="text-center pb-2 border-b border-dashed border-slate-300 mb-2">
      <h2 class="font-extrabold text-sm uppercase tracking-wider">BOKU SUPERMARKET</h2>
      <p class="text-[10px] text-slate-500">Abeokuta, Ogun State</p>
      <p class="text-[9px] text-slate-400 mt-1">Ref: ${orderNum} • ${cashier}</p>
      <p class="text-[9px] text-slate-400">${dateStr}</p>
    </div>

    <div class="py-1 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
      ${itemsRows}
    </div>

    <div class="pt-2 text-[11px] space-y-1">
      <div class="flex justify-between font-bold text-xs">
        <span>TOTAL:</span>
        <span class="font-mono">₦${subtotal}</span>
      </div>
      <div class="flex justify-between text-slate-600">
        <span>Method:</span>
        <span>${sale.paymentMethod || "Cash"}</span>
      </div>
      <div class="flex justify-between text-slate-600">
        <span>Tendered:</span>
        <span class="font-mono">₦${tendered}</span>
      </div>
      <div class="flex justify-between font-bold text-emerald-800">
        <span>Change:</span>
        <span class="font-mono">₦${change}</span>
      </div>
    </div>

    <div class="text-center pt-3 mt-2 border-t border-dashed border-slate-300 text-[9px] text-slate-400">
      Thank you for shopping with us!<br>Goods purchased in good condition cannot be returned.
    </div>
  `;

  receiptModal.classList.remove("hidden");
}

// -------------------------------------------------------------
// SALES & RECEIPT HISTORY ARCHIVE LOGIC
// -------------------------------------------------------------
function openHistoryModal() {
  state.historyDateFilter = "all";
  state.historySearchQuery = "";
  const searchInput = document.getElementById("history-search-input");
  if (searchInput) searchInput.value = "";

  renderHistoryTable();
  document.getElementById("history-modal").classList.remove("hidden");
}

function filterHistoryDate(filterMode) {
  state.historyDateFilter = filterMode;

  const filters = ["all", "today", "yesterday", "week"];
  filters.forEach((f) => {
    const btn = document.getElementById("hist-filter-" + f);
    if (!btn) return;
    if (f === filterMode) {
      btn.className = "whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#0a3832] text-white font-semibold";
    } else {
      btn.className = "whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold";
    }
  });

  renderHistoryTable();
}

function handleHistorySearch(query) {
  state.historySearchQuery = query.toLowerCase().trim();
  renderHistoryTable();
}

function renderHistoryTable() {
  const tbody = document.getElementById("history-table-body");
  const countLabel = document.getElementById("history-count-label");
  if (!tbody) return;

  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterday.toDateString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

  // Filter by date
  let filtered = state.salesHistory.filter((s) => {
    const saleDate = new Date(s.createdAt);

    if (state.historyDateFilter === "today") {
      return saleDate.toDateString() === todayStr;
    } else if (state.historyDateFilter === "yesterday") {
      return saleDate.toDateString() === yesterdayStr;
    } else if (state.historyDateFilter === "week") {
      return saleDate >= sevenDaysAgo;
    }
    return true;
  });

  // Filter by search query (Receipt ref, cashier, or items)
  if (state.historySearchQuery) {
    filtered = filtered.filter((s) => {
      const orderMatch = (s.orderNumber || "").toLowerCase().includes(state.historySearchQuery);
      const cashierMatch = (s.cashier || "").toLowerCase().includes(state.historySearchQuery);
      const itemMatch = (s.items || []).some((i) => (i.name || "").toLowerCase().includes(state.historySearchQuery));
      return orderMatch || cashierMatch || itemMatch;
    });
  }

  if (countLabel) {
    countLabel.textContent = `Showing ${filtered.length} of ${state.salesHistory.length} total receipts`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-400">No past transactions match your search filter.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered
    .map((s) => {
      const dateObj = new Date(s.createdAt || Date.now());
      const formattedDate = dateObj.toLocaleDateString([], { month: "short", day: "numeric" });
      const formattedTime = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const totalItemsCount = (s.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
      const firstItemName = s.items && s.items[0] ? s.items[0].name : "General Sale";
      const extraItems = (s.items || []).length > 1 ? ` +${s.items.length - 1} more` : "";
      const itemSummary = `<span class="truncate max-w-[180px] inline-block font-medium">${firstItemName}</span><span class="text-slate-400 text-[10px]">${extraItems} (${totalItemsCount} units)</span>`;

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-2.5 font-mono font-bold text-emerald-800">${s.orderNumber || "BOKU-000000"}</td>
          <td class="p-2.5 text-slate-600">
            <div>${formattedDate}</div>
            <div class="text-[10px] text-slate-400 font-mono">${formattedTime}</div>
          </td>
          <td class="p-2.5 font-medium text-slate-700">${s.cashier || "Cashier"}</td>
          <td class="p-2.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">${s.paymentMethod || "Cash"}</span>
          </td>
          <td class="p-2.5 text-slate-700">${itemSummary}</td>
          <td class="p-2.5 text-right font-black font-mono text-emerald-800">₦${Number(s.totalAmount || 0).toLocaleString()}</td>
          <td class="p-2.5 text-center">
            <button onclick="reprintHistoricalReceipt('${s.orderNumber}')" class="px-2.5 py-1 bg-[#0a3832] hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] shadow-sm transition flex items-center justify-center space-x-1 mx-auto">
              <i data-lucide="printer" class="w-3 h-3"></i>
              <span>Reprint</span>
            </button>
          </td>
        </tr>`;
    })
    .join("");

  if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
    lucide.createIcons();
  }
}

function reprintHistoricalReceipt(orderNumber) {
  const sale = state.salesHistory.find((s) => s.orderNumber === orderNumber);
  if (!sale) {
    alert("Receipt reference not found in archive.");
    return;
  }
  displayReceipt(sale);
}

// -------------------------------------------------------------
// Daily Sales History & Gross Profit Ledger
// -------------------------------------------------------------
async function loadSalesHistory() {
  try {
    const data = await apiRequest("/sales");
    if (Array.isArray(data) && data.length > 0) {
      state.salesHistory = data;
      localStorage.setItem("boku_sales_history", JSON.stringify(data.slice(0, 100)));
    }
  } catch (err) {}
}

function openSalesLedgerModal() {
  const revEl = document.getElementById("ledger-total-revenue");
  const profitEl = document.getElementById("ledger-total-profit");
  const countEl = document.getElementById("ledger-total-tickets");
  const cashEl = document.getElementById("ledger-cash-revenue");
  const tbody = document.getElementById("ledger-transactions-body");

  const todayStr = new Date().toDateString();
  const todaysSales = state.salesHistory.filter((s) => new Date(s.createdAt).toDateString() === todayStr);

  const totalRev = todaysSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
  const totalProfit = todaysSales.reduce((acc, s) => acc + (s.grossProfit || (s.totalAmount * 0.22) || 0), 0);
  const totalCash = todaysSales
    .filter((s) => s.paymentMethod === "Cash")
    .reduce((acc, s) => acc + (s.totalAmount || 0), 0);

  if (revEl) revEl.textContent = "₦" + totalRev.toLocaleString();
  if (profitEl) profitEl.textContent = "₦" + Math.round(totalProfit).toLocaleString();
  if (countEl) countEl.textContent = todaysSales.length;
  if (cashEl) cashEl.textContent = "₦" + totalCash.toLocaleString();

  if (tbody) {
    if (todaysSales.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-400">No transactions recorded today yet.</td></tr>';
    } else {
      tbody.innerHTML = todaysSales
        .map((s) => {
          const time = new Date(s.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const count = (s.items || []).reduce((acc, i) => acc + i.quantity, 0);
          const estProfit = s.grossProfit || Math.round((s.totalAmount || 0) * 0.22);
          return `
            <tr class="hover:bg-slate-50">
              <td class="p-2.5 font-medium text-slate-700">${time}</td>
              <td class="p-2.5"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100">${s.paymentMethod || "Cash"}</span></td>
              <td class="p-2.5 text-slate-600">${count} items</td>
              <td class="p-2.5 font-bold font-mono text-teal-800">₦${estProfit.toLocaleString()}</td>
              <td class="p-2.5 text-right font-black font-mono text-emerald-800">₦${Number(s.totalAmount || 0).toLocaleString()}</td>
            </tr>`;
        })
        .join("");
    }
  }

  document.getElementById("sales-ledger-modal").classList.remove("hidden");
}

// -------------------------------------------------------------
// INVENTORY STOCKROOM HUB
// -------------------------------------------------------------
function openInventoryModal() {
  renderInventoryTable("all");
  document.getElementById("inventory-modal").classList.remove("hidden");
}

function renderInventoryTable(filterMode = "all") {
  state.inventoryActiveTab = filterMode;

  const costEl = document.getElementById("inv-total-cost");
  const retailEl = document.getElementById("inv-total-retail");
  const profitEl = document.getElementById("inv-total-profit");
  const lowCountEl = document.getElementById("inv-low-count");
  const tbody = document.getElementById("inventory-table-body");

  const tabs = ["all", "low", "expiry"];
  tabs.forEach((t) => {
    const btn = document.getElementById("inv-tab-" + t);
    if (!btn) return;
    if (t === filterMode) {
      btn.className = "whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#0a3832] text-white font-semibold transition";
    } else {
      btn.className = "whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold transition";
    }
  });

  let totalCostValuation = 0;
  let totalRetailValuation = 0;
  let lowStockCount = 0;

  const now = new Date();
  const ninetyDaysFromNow = new Date();
  ninetyDaysFromNow.setDate(now.getDate() + 90);

  state.products.forEach((p) => {
    const qty = p.quantity || 0;
    const cost = p.costPrice || (p.price * 0.75);
    const retail = p.price || 0;

    totalCostValuation += qty * cost;
    totalRetailValuation += qty * retail;

    if (qty <= (p.minStock || 10)) {
      lowStockCount++;
    }
  });

  const totalPotentialProfit = Math.max(0, totalRetailValuation - totalCostValuation);

  if (costEl) costEl.textContent = "₦" + Math.round(totalCostValuation).toLocaleString();
  if (retailEl) retailEl.textContent = "₦" + Math.round(totalRetailValuation).toLocaleString();
  if (profitEl) profitEl.textContent = "₦" + Math.round(totalPotentialProfit).toLocaleString();
  if (lowCountEl) lowCountEl.textContent = lowStockCount + " Items";

  let filteredItems = [...state.products];
  if (filterMode === "low") {
    filteredItems = state.products.filter((p) => (p.quantity || 0) <= (p.minStock || 10));
  } else if (filterMode === "expiry") {
    filteredItems = state.products.filter((p) => {
      if (!p.expiryDate) return false;
      const exp = new Date(p.expiryDate);
      return exp <= ninetyDaysFromNow;
    });
  }

  if (!tbody) return;

  if (filteredItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-slate-400">No items match the active inventory filter.</td></tr>';
    return;
  }

  tbody.innerHTML = filteredItems
    .map((prod) => {
      const isOut = prod.quantity <= 0;
      const isLow = !isOut && prod.quantity <= (prod.minStock || 10);
      const cost = Number(prod.costPrice || (prod.price * 0.75));
      const price = Number(prod.price);
      const margin = Math.round(((price - cost) / price) * 100);

      let expiryBadge = '<span class="text-slate-500 font-mono text-[11px]">' + (prod.expiryDate || "N/A") + '</span>';
      if (prod.expiryDate) {
        const exp = new Date(prod.expiryDate);
        if (exp < now) {
          expiryBadge = '<span class="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">EXPIRED</span>';
        } else if (exp <= ninetyDaysFromNow) {
          expiryBadge = '<span class="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">' + prod.expiryDate + '</span>';
        }
      }

      let stockPill = '<span class="font-bold text-slate-700 font-mono">' + prod.quantity + '</span>';
      if (isOut) {
        stockPill = '<span class="px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded text-[9px]">0</span>';
      } else if (isLow) {
        stockPill = '<span class="px-1.5 py-0.5 bg-amber-100 text-amber-800 font-bold rounded text-[9px]">Low (' + prod.quantity + ')</span>';
      }

      return `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-2.5">
            <div class="font-bold text-slate-800">${prod.name}</div>
            <span class="text-[9px] text-slate-400 uppercase">${prod.category || "General"}</span>
          </td>
          <td class="p-2.5">${stockPill}</td>
          <td class="p-2.5 font-mono text-slate-600">₦${cost.toLocaleString()}</td>
          <td class="p-2.5 font-mono font-bold text-emerald-800">₦${price.toLocaleString()}</td>
          <td class="p-2.5">
            <span class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[9px]">+${margin}%</span>
          </td>
          <td class="p-2.5">${expiryBadge}</td>
          <td class="p-2.5 text-right">
            <button onclick="openRestockModal('${prod._id}')" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] shadow-sm transition">
              + Restock
            </button>
          </td>
        </tr>`;
    })
    .join("");
}

function filterInventoryTable(query) {
  const q = query.toLowerCase();
  const rows = document.querySelectorAll("#inventory-table-body tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? "" : "none";
  });
}

// -------------------------------------------------------------
// Inward Restock
// -------------------------------------------------------------
function openRestockModal(productId) {
  const prod = state.products.find((p) => p._id === productId);
  if (!prod) return;

  document.getElementById("restock-product-id").value = prod._id;
  document.getElementById("restock-product-name").value = prod.name;
  document.getElementById("restock-current-qty").value = prod.quantity + " units";
  document.getElementById("restock-add-qty").value = "";
  document.getElementById("restock-note").value = "";

  document.getElementById("restock-modal").classList.remove("hidden");
}

async function handleExecuteRestock(e) {
  e.preventDefault();
  const prodId = document.getElementById("restock-product-id").value;
  const addedQty = Number(document.getElementById("restock-add-qty").value);

  if (isNaN(addedQty) || addedQty <= 0) {
    alert("Please enter a valid restock quantity.");
    return;
  }

  const prod = state.products.find((p) => p._id === prodId);
  if (prod) {
    prod.quantity += addedQty;
  }

  alert("Added " + addedQty + " units to " + (prod ? prod.name : "product") + "!");
  document.getElementById("restock-modal").classList.add("hidden");

  renderProductCatalog();
  renderInventoryTable(state.inventoryActiveTab);
}

// -------------------------------------------------------------
// Quick Add Product Form Handler
// -------------------------------------------------------------
async function handleQuickCreateProduct(e) {
  e.preventDefault();
  const saveBtn = document.getElementById("save-product-btn");
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }

  const name = document.getElementById("new-prod-name").value.trim();
  const costPrice = Number(document.getElementById("new-prod-cost").value);
  const price = Number(document.getElementById("new-prod-price").value);
  const quantity = Number(document.getElementById("new-prod-qty").value);
  const minStock = Number(document.getElementById("new-prod-min").value) || 10;
  const category = document.getElementById("new-prod-category").value.trim() || "Groceries";
  const expiryDate = document.getElementById("new-prod-expiry").value || "2027-12-31";
  const barcode = document.getElementById("new-prod-barcode").value.trim();

  const payload = {
    name,
    price,
    costPrice,
    quantity,
    minStock,
    category,
    expiryDate,
    barcode,
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
    state.products.unshift({
      _id: "local_" + Date.now(),
      name,
      price,
      costPrice,
      quantity,
      minStock,
      category,
      expiryDate,
      barcode,
      image: FALLBACK_IMAGE,
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
// App Initialization
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  loadProducts();
  loadSalesHistory();

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

  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const allInputs = Array.from(registerForm.querySelectorAll("input"));
      const allSelects = Array.from(registerForm.querySelectorAll("select"));

      const fullName = (allInputs[0]?.value || "").trim();
      const email = (allInputs[1]?.value || "").trim().toLowerCase();
      const phone = (allInputs[2]?.value || "").trim();
      const password = (allInputs[3]?.value || "").trim();

      const rawRole = (allSelects[0]?.value || "user").toLowerCase();
      const role = rawRole.includes("admin") ? "admin" : "user";
      const gender = (allSelects[1]?.value || "Male").trim();

      const payload = {
        name: fullName,
        username: fullName,
        fullName: fullName,
        email: email,
        phone: phone,
        phoneNumber: phone,
        password: password,
        role: role,
        gender: gender,
        HasAdminAccess: role === "admin",
      };

      await handleRegister(payload);
    });
  }
});

// Window Bindings
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.switchToLoginTab = switchToLoginTab;
window.switchToRegisterTab = switchToRegisterTab;
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.selectPaymentMethod = selectPaymentMethod;
window.calculateChange = calculateChange;
window.setExactTender = setExactTender;
window.addTender = addTender;
window.executeFinalCheckout = executeFinalCheckout;
window.openSalesLedgerModal = openSalesLedgerModal;
window.openInventoryModal = openInventoryModal;
window.renderInventoryTable = renderInventoryTable;
window.filterInventoryTable = filterInventoryTable;
window.openRestockModal = openRestockModal;
window.handleExecuteRestock = handleExecuteRestock;
window.handleQuickCreateProduct = handleQuickCreateProduct;
window.scrollToCartOrCheckout = scrollToCartOrCheckout;
window.openHistoryModal = openHistoryModal;
window.filterHistoryDate = filterHistoryDate;
window.handleHistorySearch = handleHistorySearch;
window.reprintHistoricalReceipt = reprintHistoricalReceipt;