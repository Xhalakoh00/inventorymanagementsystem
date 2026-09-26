const API_BASE = "http://localhost:5000";

// Fallback catalog: ensures Netlify never displays a blank screen when backend is offline
const DEFAULT_PRODUCTS = [
  { _id: '1', name: 'Golden Penny Sugar 500g', price: 1200, stock: 24, category: 'Groceries' },
  { _id: '2', name: 'Peak Milk Tin', price: 900, stock: 8, category: 'Dairy' },
  { _id: '3', name: 'Indomie Super Pack', price: 450, stock: 50, category: 'Food' },
  { _id: '4', name: 'Eva Water 75cl', price: 250, stock: 4, category: 'Drinks' },
];

// App State
let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let token = localStorage.getItem('token') || null;
let products = [...DEFAULT_PRODUCTS];
let cart = [];

// DOM References
const authScreen = document.getElementById('auth-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const btnTabPos = document.getElementById('btn-tab-pos');
const btnTabInventory = document.getElementById('btn-tab-inventory');
const viewPos = document.getElementById('view-pos');
const viewInventory = document.getElementById('view-inventory');
const productModal = document.getElementById('product-modal');

// Application Lifecycle
window.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  if (token && currentUser) {
    showDashboard();
  } else {
    showAuth();
  }
  lucide.createIcons();
});

function setupEventListeners() {
  tabLogin.addEventListener('click', () => switchAuthTab('login'));
  tabRegister.addEventListener('click', () => switchAuthTab('register'));
  btnTabPos.addEventListener('click', () => switchView('pos'));
  btnTabInventory.addEventListener('click', () => switchView('inventory'));
  document.getElementById('btn-logout').addEventListener('click', handleLogout);
  document.getElementById('btn-clear-cart').addEventListener('click', clearCart);
  document.getElementById('btn-checkout').addEventListener('click', checkoutOrder);
  document.getElementById('btn-open-modal').addEventListener('click', openProductModal);
  document.getElementById('btn-close-modal').addEventListener('click', closeProductModal);
  document.getElementById('pos-search').addEventListener('input', (e) => filterPOSProducts(e.target.value));

  loginForm.addEventListener('submit', handleLogin);
  registerForm.addEventListener('submit', handleRegister);
  document.getElementById('create-product-form').addEventListener('submit', handleCreateProduct);
}

// Auth Tabs Switcher
function switchAuthTab(type) {
  const isLogin = type === 'login';
  loginForm.classList.toggle('hidden', !isLogin);
  registerForm.classList.toggle('hidden', isLogin);
  tabLogin.className = isLogin 
    ? "flex-1 pb-3 font-semibold border-b-2 border-[#0a3832] text-[#0a3832] transition" 
    : "flex-1 pb-3 font-medium text-slate-400 border-b-2 border-transparent hover:text-slate-600 transition";
  tabRegister.className = !isLogin 
    ? "flex-1 pb-3 font-semibold border-b-2 border-[#0a3832] text-[#0a3832] transition" 
    : "flex-1 pb-3 font-medium text-slate-400 border-b-2 border-transparent hover:text-slate-600 transition";
}

// Navigation Tabs Switcher
function switchView(view) {
  if (view === 'pos') {
    viewPos.classList.remove('hidden');
    viewInventory.classList.add('hidden');
    btnTabPos.className = "px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-[#0a3832] flex items-center gap-2 transition";
    btnTabInventory.className = "px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition";
  } else {
    viewPos.classList.add('hidden');
    viewInventory.classList.remove('hidden');
    btnTabInventory.className = "px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-[#0a3832] flex items-center gap-2 transition";
    btnTabPos.className = "px-4 py-2 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 flex items-center gap-2 transition";
    renderInventoryTable();
  }
  lucide.createIcons();
}

// Authentication API Handlers
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch(`${API_BASE}/users/loginuser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    token = data.token;
    currentUser = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(currentUser));
    showDashboard();
  } catch (err) {
    alert(err.message);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('reg-name').value,
    email: document.getElementById('reg-email').value,
    phone: document.getElementById('reg-phone').value,
    password: document.getElementById('reg-password').value,
    role: document.getElementById('reg-role').value,
    gender: document.getElementById('reg-gender').value,
    HasAdminAccess: document.getElementById('reg-role').value === 'admin'
  };

  try {
    const res = await fetch(`${API_BASE}/users/createuser`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    alert("Staff account created successfully! Please sign in.");
    switchAuthTab('login');
  } catch (err) {
    alert(err.message);
  }
}

function handleLogout() {
  localStorage.clear();
  token = null;
  currentUser = null;
  cart = [];
  products = [...DEFAULT_PRODUCTS];
  showAuth();
}

// Products API Handlers
async function fetchProductsFromDB() {
  try {
    const res = await fetch(`${API_BASE}/products/all`, {
      headers: { 
        'Authorization': `Bearer ${token}` 
      }
    });
    
    if (!res.ok) throw new Error("Could not reach backend");
    
    const data = await res.json();
    const fetchedItems = data.products || data;
    
    if (Array.isArray(fetchedItems) && fetchedItems.length > 0) {
      products = fetchedItems;
      renderPOSProducts(products);
      renderInventoryTable();
    }
  } catch (err) {
    console.warn("Using local catalog:", err.message);
    if (products.length === 0) {
      products = [...DEFAULT_PRODUCTS];
    }
    renderPOSProducts(products);
    renderInventoryTable();
  }
}

async function handleCreateProduct(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('prod-name').value,
    price: Number(document.getElementById('prod-price').value),
    stock: Number(document.getElementById('prod-stock').value),
    category: document.getElementById('prod-category').value
  };

  try {
    const res = await fetch(`${API_BASE}/products/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not save product');

    alert("Product saved to database!");
    closeProductModal();
    e.target.reset();
    fetchProductsFromDB();
  } catch (err) {
    const fallbackProd = { ...payload, _id: Date.now().toString() };
    products.unshift(fallbackProd);
    renderPOSProducts(products);
    renderInventoryTable();
    closeProductModal();
    e.target.reset();
    alert("Saved locally (offline mode)!");
  }
}

window.deleteProduct = async function(productId) {
  const prod = products.find(p => p._id === productId);
  if (!prod) return;

  if (confirm(`Are you sure you want to remove "${prod.name}" from inventory?`)) {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      alert("Item deleted successfully!");
    } catch (err) {
      console.warn("Deleted locally:", err.message);
    }

    products = products.filter(p => p._id !== productId);
    cart = cart.filter(c => c._id !== productId);
    renderInventoryTable();
    renderPOSProducts(products);
    renderCart();
  }
};

// Sales & Order Checkout Handler
async function checkoutOrder() {
  if (cart.length === 0) return alert("Cart is empty!");

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const payload = {
    items: cart,
    totalAmount: totalAmount,
    paymentMethod: 'Cash'
  };

  try {
    const res = await fetch(`${API_BASE}/sales/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Checkout failed');

    const receiptId = data.sale?._id ? data.sale._id.slice(-6).toUpperCase() : 'OK';
    alert(`Receipt #${receiptId} — Sale completed successfully!`);

    clearCart();
    await fetchProductsFromDB();
  } catch (err) {
    console.warn("Server checkout error:", err.message);
    cart.forEach(cartItem => {
      const prod = products.find(p => p._id === cartItem._id);
      if (prod) prod.stock = Math.max(0, prod.stock - cartItem.qty);
    });

    alert("Sale registered (Local mode).");
    clearCart();
    renderPOSProducts(products);
    renderInventoryTable();
  }
}

// Screen Renders
function showDashboard() {
  authScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  document.getElementById('user-display-name').textContent = currentUser?.name || 'Staff';
  document.getElementById('user-display-role').textContent = currentUser?.role || 'user';
  
  renderPOSProducts(products);
  renderInventoryTable();
  fetchProductsFromDB();
}

function showAuth() {
  authScreen.classList.remove('hidden');
  dashboardScreen.classList.add('hidden');
}

function renderPOSProducts(items) {
  const container = document.getElementById('pos-products-grid');
  if (!items || items.length === 0) {
    container.innerHTML = `<div class="col-span-full py-12 text-center text-slate-400 text-xs">No products in inventory. Add some from the Stock tab.</div>`;
    return;
  }

  container.innerHTML = items.map(p => `
    <div onclick="addToCart('${p._id}')" class="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-600 hover:shadow-sm cursor-pointer transition flex flex-col justify-between">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${p.category || 'General'}</span>
        <h4 class="font-bold text-slate-800 text-sm mt-1 line-clamp-1">${p.name}</h4>
      </div>
      <div class="mt-4 flex items-center justify-between">
        <span class="font-bold text-emerald-700">₦${p.price.toLocaleString()}</span>
        <span class="text-[11px] px-2 py-0.5 rounded ${p.stock > 10 ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700 font-semibold'}">${p.stock} in stock</span>
      </div>
    </div>
  `).join('');
}

function filterPOSProducts(search) {
  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );
  renderPOSProducts(filtered);
}

// Cart System
window.addToCart = function(productId) {
  const prod = products.find(p => p._id === productId);
  if (!prod || prod.stock <= 0) return alert("Item out of stock!");

  const existing = cart.find(item => item._id === productId);
  if (existing) {
    if (existing.qty < prod.stock) {
      existing.qty += 1;
    } else {
      alert("Maximum stock reached!");
    }
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  renderCart();
};

window.updateCartQty = function(productId, delta) {
  const item = cart.find(i => i._id === productId);
  const prod = products.find(p => p._id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i._id !== productId);
  } else if (item.qty > prod.stock) {
    item.qty = prod.stock;
    alert("Stock limit reached!");
  }
  renderCart();
};

function clearCart() {
  cart = [];
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  if (cart.length === 0) {
    container.innerHTML = `<div class="text-center py-12 text-slate-400 text-xs">Cart is empty</div>`;
    document.getElementById('cart-subtotal').textContent = '₦0.00';
    document.getElementById('cart-total').textContent = '₦0.00';
    return;
  }

  let total = 0;
  container.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    return `
      <div class="flex items-center justify-between border-b border-slate-100 pb-2">
        <div class="flex-1 pr-2">
          <h5 class="text-xs font-semibold text-slate-800 line-clamp-1">${item.name}</h5>
          <span class="text-[11px] text-slate-400">₦${item.price.toLocaleString()}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="updateCartQty('${item._id}', -1)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">-</button>
          <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
          <button onclick="updateCartQty('${item._id}', 1)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">+</button>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('cart-subtotal').textContent = `₦${total.toLocaleString()}`;
  document.getElementById('cart-total').textContent = `₦${total.toLocaleString()}`;
  lucide.createIcons();
}

// Inventory Logic
function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  if (!products || products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400 text-xs">No inventory items found. Click "+ Add New Product" to add.</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    let statusBadge = p.stock > 10 
      ? `<span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">In Stock</span>`
      : p.stock > 0 
      ? `<span class="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">Low Stock</span>`
      : `<span class="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Out of Stock</span>`;

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-4 font-semibold text-slate-900">${p.name}</td>
        <td class="p-4 text-slate-600">${p.category || 'General'}</td>
        <td class="p-4 font-bold text-slate-800">₦${p.price.toLocaleString()}</td>
        <td class="p-4 font-medium text-slate-600">${p.stock} units</td>
        <td class="p-4 text-center">${statusBadge}</td>
        <td class="p-4 text-right">
          <button onclick="deleteProduct('${p._id}')" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Item">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

function openProductModal() {
  productModal.classList.remove('hidden');
  productModal.classList.add('flex');
}

function closeProductModal() {
  productModal.classList.add('hidden');
  productModal.classList.remove('flex');
}