// Shop Owner Admin Controller
const ADMIN_KEY_STORAGE = "bumblebee_admin_key";
let adminProducts = [];
let adminOrders = [];

window.Admin = {
  getKey() { return sessionStorage.getItem(ADMIN_KEY_STORAGE); },
  setKey(k) { sessionStorage.setItem(ADMIN_KEY_STORAGE, k); },
  clearKey() { sessionStorage.removeItem(ADMIN_KEY_STORAGE); },

  async verifyAuth() {
    const key = this.getKey();
    const gate = document.getElementById("admin-gate-screen");
    const dash = document.getElementById("admin-main-dashboard");
    if (!key) {
      if (gate) gate.style.display = "block";
      if (dash) dash.style.display = "none";
      return;
    }
    try {
      const res = await fetch("/api/orders", { headers: { "x-admin-key": key } });
      if (res.ok) {
        if (gate) gate.style.display = "none";
        if (dash) dash.style.display = "block";
        this.loadDashboardData();
      } else {
        this.clearKey();
        if (gate) gate.style.display = "block";
        if (dash) dash.style.display = "none";
      }
    } catch {
      this.clearKey();
    }
  },

  async login(password) {
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        this.setKey(data.token);
        window.showToast("Admin console unlocked!");
        this.verifyAuth();
      } else {
        window.showToast("Incorrect Admin Password", "error");
      }
    } catch (err) {
      window.showToast(err.message, "error");
    }
  },

  logout() {
    this.clearKey();
    window.location.reload();
  },

  async loadDashboardData() {
    await Promise.all([this.loadProducts(), this.loadOrders()]);
    this.updateStats();
  },

  async loadProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        adminProducts = data.products || [];
        this.renderProductsTable(adminProducts);
      }
    } catch (err) { console.error(err); }
  },

  async loadOrders() {
    try {
      const key = this.getKey();
      const res = await fetch("/api/orders", { headers: { "x-admin-key": key } });
      const data = await res.json();
      if (data.success) {
        adminOrders = data.orders || [];
        this.renderOrdersTable(adminOrders);
      }
    } catch (err) { console.error(err); }
  },

  updateStats() {
    const totalRev = adminOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = adminOrders.length;
    const totalProds = adminProducts.length;
    const aov = totalOrders > 0 ? (totalRev / totalOrders) : 0;

    // NO DECIMALS ON REVENUE AND AOV
    const revEl = document.getElementById("stat-total-revenue");
    const aovEl = document.getElementById("stat-aov");
    const ordEl = document.getElementById("stat-total-orders");
    const prodEl = document.getElementById("stat-total-products");

    if (revEl) revEl.textContent = window.formatPrice(totalRev, false);
    if (aovEl) aovEl.textContent = window.formatPrice(aov, false);
    if (ordEl) ordEl.textContent = totalOrders;
    if (prodEl) prodEl.textContent = totalProds;
  },

  renderProductsTable(products) {
    const tbody = document.getElementById("admin-products-tbody");
    if (!tbody) return;
    if (products.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px;">No products in catalog.</td></tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => {
      const img = (p.images && p.images.length > 0) ? p.images[0] : "";
      const sizeStr = (p.sizes || []).join(", ") || "Standard";
      return `
        <tr class="clickable-table-row" onclick="openAdminProductInspect('${p._id}')">
          <td><img src="${img}" class="table-product-thumb" alt="${p.name}"></td>
          <td>
            <strong style="font-size:15px;">${p.name}</strong>
            <div style="font-size:12px; color:#666;">${p.category}</div>
          </td>
          <td><strong>${window.formatPrice(p.price, false)}</strong></td>
          <td><span class="badge-brutal ${p.stock <= 5 ? 'badge-pink' : 'badge-yellow'}">${p.stock} in stock</span></td>
          <td><span style="font-size:12px; font-weight:700;">${sizeStr}</span></td>
          <td onclick="event.stopPropagation()">
            <div style="display:flex; gap:6px;">
              <button class="btn-brutal btn-sm btn-cyan" onclick="openEditProductModal('${p._id}')">EDIT</button>
              <button class="btn-brutal btn-sm btn-pink" onclick="deleteProduct('${p._id}')">DEL</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  renderOrdersTable(orders) {
    const tbody = document.getElementById("admin-orders-tbody");
    if (!tbody) return;
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px;">No customer orders placed yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr class="clickable-table-row" onclick="openAdminOrderInspect('${o.orderNumber || o._id}')">
        <td><strong>#${o.orderNumber}</strong><div style="font-size:11px; color:#666;">${new Date(o.createdAt).toLocaleDateString()}</div></td>
        <td><strong>${o.customer?.name || 'Customer'}</strong><br><small>${o.customer?.email || ''}</small></td>
        <td>${o.shippingAddress?.city || ''}, ${o.shippingAddress?.state || ''}</td>
        <td><strong>${o.items ? o.items.length : 0} items</strong></td>
        <td><strong>${window.formatPrice(o.total, false)}</strong></td>
        <td onclick="event.stopPropagation()">
          <select class="select-brutal" style="padding:4px 8px; font-size:12px;" onchange="updateOrderStatus('${o._id || o.orderNumber}', this.value)">
            <option value="Processing" ${o.orderStatus === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
        <td><span class="badge-brutal badge-cyan" style="font-size:10px;">${o.trackingNumber || 'BEE-EXP-101'}</span></td>
      </tr>
    `).join("");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Admin.verifyAuth();
});

function switchAdminTab(tab) {
  document.getElementById("admin-view-products").style.display = tab === "products" ? "block" : "none";
  document.getElementById("admin-view-orders").style.display = tab === "orders" ? "block" : "none";

  document.getElementById("admin-tab-products").className = tab === "products" ? "admin-tab-btn active" : "admin-tab-btn";
  document.getElementById("admin-tab-orders").className = tab === "orders" ? "admin-tab-btn active" : "admin-tab-btn";
}

// ==========================================
// DYNAMIC SIZE SYSTEM & CUSTOM SIZES MANAGER
// ==========================================
let currentProductSizes = [];

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function renderAdminSizeChips(sizesArray, activeSet = null) {
  const container = document.getElementById("admin-size-pills");
  if (!container) return;
  container.innerHTML = "";

  if (!sizesArray || sizesArray.length === 0) {
    container.innerHTML = `<span style="font-size:12px; color:#888; font-style:italic; padding:6px 0;">No sizes configured. Enter any custom size above or click a quick preset.</span>`;
    return;
  }

  sizesArray.forEach(sz => {
    const trimmed = String(sz).trim();
    if (!trimmed) return;
    const isActive = activeSet ? activeSet.has(trimmed) : true;

    const chip = document.createElement("div");
    chip.className = `admin-size-chip ${isActive ? 'active' : ''}`;
    chip.setAttribute("data-size", trimmed);

    chip.innerHTML = `
      <span class="chip-label" title="Click to toggle on/off">${escapeHtml(trimmed)}</span>
      <button type="button" class="chip-del-btn" title="Remove ${escapeHtml(trimmed)}">✕</button>
    `;

    chip.querySelector(".chip-label").addEventListener("click", (e) => {
      e.stopPropagation();
      chip.classList.toggle("active");
    });

    chip.querySelector(".chip-del-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removeAdminSize(trimmed);
    });

    container.appendChild(chip);
  });
}

function getSelectedAdminSizes() {
  const activeChips = document.querySelectorAll("#admin-size-pills .admin-size-chip.active");
  const sizes = [];
  activeChips.forEach(c => {
    const sz = c.getAttribute("data-size");
    if (sz && !sizes.includes(sz)) sizes.push(sz);
  });
  return sizes.length > 0 ? sizes : ["One Size"];
}

window.addCustomSizeFromInput = function() {
  const input = document.getElementById("custom-size-input");
  if (!input) return;
  const raw = input.value.trim();
  if (!raw) return;

  // Supports single or comma-separated sizes: "UK 8, UK 9, UK 10" or "Oversized"
  const newSizes = raw.split(",").map(s => s.trim()).filter(Boolean);
  if (newSizes.length === 0) return;

  const currentActive = new Set(getSelectedAdminSizes());
  newSizes.forEach(s => {
    if (!currentProductSizes.includes(s)) {
      currentProductSizes.push(s);
    }
    currentActive.add(s);
  });

  input.value = "";
  renderAdminSizeChips(currentProductSizes, currentActive);
  input.focus();
};

window.removeAdminSize = function(sizeToRemove) {
  currentProductSizes = currentProductSizes.filter(s => s !== sizeToRemove);
  const currentActive = new Set(getSelectedAdminSizes().filter(s => s !== sizeToRemove));
  renderAdminSizeChips(currentProductSizes, currentActive);
};

window.addPresetGroup = function(presetArray) {
  const currentActive = new Set(getSelectedAdminSizes());
  presetArray.forEach(s => {
    if (!currentProductSizes.includes(s)) {
      currentProductSizes.push(s);
    }
    currentActive.add(s);
  });
  renderAdminSizeChips(currentProductSizes, currentActive);
};

window.selectAllSizes = function(selectAll) {
  document.querySelectorAll("#admin-size-pills .admin-size-chip").forEach(c => {
    c.classList.toggle("active", selectAll);
  });
};

window.clearAllSizes = function() {
  currentProductSizes = [];
  renderAdminSizeChips([], new Set());
};

// Variant Builder Rows
function addVariantBuilderRow(name = '', img = '', colorHex = '#000000') {
  const container = document.getElementById("variant-builder-rows");
  const row = document.createElement("div");
  row.className = "variant-row";
  row.innerHTML = `
    <input type="text" placeholder="Option Name (e.g. Acid Neon)" value="${name}" class="var-name" style="flex:1.2;">
    <input type="color" value="${colorHex}" class="var-color" style="width:44px; height:36px; padding:0; cursor:pointer;">
    <input type="url" placeholder="Variant Photo URL (auto-switches on click)" value="${img}" class="var-img" style="flex:2;">
    <button type="button" class="btn-brutal btn-sm btn-pink" onclick="this.closest('.variant-row').remove()">✕</button>
  `;
  container.appendChild(row);
}

function openAddProductModal() {
  document.getElementById("product-modal-title").textContent = "ADD NEW PRODUCT";
  document.getElementById("prod-edit-id").value = "";
  document.getElementById("product-form").reset();

  const customInput = document.getElementById("custom-size-input");
  if (customInput) customInput.value = "";

  // Initialize with standard apparel presets and active default set
  currentProductSizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];
  renderAdminSizeChips(currentProductSizes, new Set(["S", "M", "L", "XL"]));

  const vContainer = document.getElementById("variant-builder-rows");
  vContainer.innerHTML = "";
  addVariantBuilderRow("Core Black", "", "#0a0a0a");
  addVariantBuilderRow("Volt Acid", "", "#ffe814");

  document.getElementById("product-form-modal").style.display = "block";
  document.getElementById("product-form-modal-overlay").classList.add("active");
}

function openEditProductModal(id) {
  const prod = adminProducts.find(p => p._id === id);
  if (!prod) return;

  document.getElementById("product-modal-title").textContent = "EDIT: " + prod.name.toUpperCase();
  document.getElementById("prod-edit-id").value = prod._id;
  document.getElementById("prod-name").value = prod.name;
  document.getElementById("prod-category").value = prod.category || "Tops & Tees";
  document.getElementById("prod-price").value = prod.price;
  document.getElementById("prod-compare-price").value = prod.compareAtPrice || "";
  document.getElementById("prod-stock").value = prod.stock;
  document.getElementById("prod-main-image").value = (prod.images && prod.images.length > 0) ? prod.images[0] : "";
  document.getElementById("prod-description").value = prod.description || "";

  const customInput = document.getElementById("custom-size-input");
  if (customInput) customInput.value = "";

  // Load whatever custom sizes this product currently has
  const pSizes = (prod.sizes && prod.sizes.length > 0) ? prod.sizes : ["S", "M", "L", "XL"];
  currentProductSizes = [...pSizes];
  renderAdminSizeChips(currentProductSizes, new Set(pSizes));

  const vContainer = document.getElementById("variant-builder-rows");
  vContainer.innerHTML = "";
  if (prod.variants && prod.variants.length > 0) {
    prod.variants.forEach(v => addVariantBuilderRow(v.name, v.image || '', v.color || '#000000'));
  } else if (prod.colors && prod.colors.length > 0) {
    prod.colors.forEach((c, idx) => addVariantBuilderRow(c, prod.images?.[idx] || '', '#000000'));
  } else {
    addVariantBuilderRow("Default Black", prod.images?.[0] || '', '#000000');
  }

  document.getElementById("product-form-modal").style.display = "block";
  document.getElementById("product-form-modal-overlay").classList.add("active");
}

function closeProductModal() {
  document.getElementById("product-form-modal").style.display = "none";
  document.getElementById("product-form-modal-overlay").classList.remove("active");
}

async function handleSaveProduct(e) {
  e.preventDefault();
  const id = document.getElementById("prod-edit-id").value;
  const key = Admin.getKey();

  const variantRows = document.querySelectorAll("#variant-builder-rows .variant-row");
  const variants = [];
  const colors = [];
  const images = [document.getElementById("prod-main-image").value.trim()];

  variantRows.forEach(r => {
    const vName = r.querySelector(".var-name").value.trim();
    const vImg = r.querySelector(".var-img").value.trim();
    const vColor = r.querySelector(".var-color").value;
    if (vName) {
      variants.push({ name: vName, image: vImg, color: vColor });
      colors.push(vName);
      if (vImg && !images.includes(vImg)) images.push(vImg);
    }
  });

  const payload = {
    name: document.getElementById("prod-name").value.trim(),
    category: document.getElementById("prod-category").value,
    price: parseFloat(document.getElementById("prod-price").value),
    compareAtPrice: parseFloat(document.getElementById("prod-compare-price").value) || null,
    stock: parseInt(document.getElementById("prod-stock").value, 10),
    images: images,
    description: document.getElementById("prod-description").value.trim(),
    variants: variants,
    colors: colors.length > 0 ? colors : ["Default Black"],
    sizes: getSelectedAdminSizes()
  };

  try {
    const url = id ? `/api/products/${id}` : "/api/products";
    const method = id ? "PUT" : "POST";
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-key": key
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      window.showToast(id ? "Product updated successfully!" : "Product published to catalog!");
      closeProductModal();
      Admin.loadDashboardData();
    } else {
      window.showToast(data.message || "Failed to save product", "error");
    }
  } catch (err) {
    window.showToast(err.message, "error");
  }
}

// Product Inspection Modal on Row Click
window.openAdminProductInspect = function(id) {
  const prod = adminProducts.find(p => p._id === id);
  if (!prod) return;

  const modal = document.getElementById("admin-inspect-modal");
  const overlay = document.getElementById("admin-inspect-modal-overlay");
  const title = document.getElementById("admin-inspect-title");
  const body = document.getElementById("admin-inspect-body");

  title.textContent = `PRODUCT DETAILS: ${prod.name.toUpperCase()}`;
  body.innerHTML = `
    <div style="display:flex; gap:20px; margin-bottom:20px;">
      <img src="${prod.images?.[0] || ''}" style="width:140px; height:140px; object-fit:cover; border:2px solid #000; box-shadow:3px 3px 0 #000;">
      <div>
        <h3 style="font-size:20px;">${prod.name}</h3>
        <p style="font-size:14px; color:#555;">Category: <strong>${prod.category}</strong></p>
        <p style="font-size:20px; font-weight:900; margin:6px 0;">${window.formatPrice(prod.price, false)}</p>
        <span class="badge-brutal badge-yellow">${prod.stock} Units In Stock</span>
        <div style="margin-top:8px; font-size:13px; font-weight:700;">Sizes: ${(prod.sizes || []).join(', ')}</div>
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <h4>Assigned Color Variants &amp; Photo Switchers:</h4>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:8px;">
        ${(prod.variants || []).map(v => `
          <div style="border:2px solid #000; padding:8px 12px; background:#faf8f2; display:flex; align-items:center; gap:8px;">
            <span style="width:16px; height:16px; background:${v.color || '#000'}; border:1px solid #000;"></span>
            <strong>${v.name}</strong>
            ${v.image ? `<img src="${v.image}" style="width:32px; height:32px; object-fit:cover; border:1px solid #000;">` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    <p style="font-size:14px; color:#666;">${prod.description || 'No description entered.'}</p>
    <div style="margin-top:20px; display:flex; justify-content:flex-end;">
      <button class="btn-brutal btn-yellow" onclick="closeAdminInspectModal(); openEditProductModal('${prod._id}')">EDIT THIS PRODUCT</button>
    </div>
  `;

  modal.style.display = "block";
  overlay.classList.add("active");
};

// Order Inspection Modal on Row Click
window.openAdminOrderInspect = function(orderNum) {
  const order = adminOrders.find(o => o.orderNumber === orderNum || o._id === orderNum);
  if (!order) return;

  const modal = document.getElementById("admin-inspect-modal");
  const overlay = document.getElementById("admin-inspect-modal-overlay");
  const title = document.getElementById("admin-inspect-title");
  const body = document.getElementById("admin-inspect-body");

  title.textContent = `ORDER INSPECTION: #${order.orderNumber}`;
  body.innerHTML = `
    <div style="display:flex; justify-content:space-between; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:16px;">
      <div>
        <strong>Customer:</strong> ${order.customer?.name || 'Customer'}<br>
        <small>${order.customer?.email || ''} | ${order.customer?.phone || 'N/A'}</small>
      </div>
      <div style="text-align:right;">
        <strong>Total Amount:</strong> <h2 style="font-size:24px;">${window.formatPrice(order.total, false)}</h2>
      </div>
    </div>
    <div style="margin-bottom:16px;">
      <h4>Delivery Destination:</h4>
      <p style="font-size:14px;">${order.shippingAddress?.street}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.pincode}</p>
    </div>
    <h4>Purchased Items:</h4>
    <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
      ${(order.items || []).map(i => `
        <div style="display:flex; justify-content:space-between; border:2px solid #000; padding:10px; background:#fff;">
          <div><strong>${i.name}</strong> (Size: ${i.size}, Color: ${i.color}) x ${i.quantity}</div>
          <div><strong>${window.formatPrice(i.price * i.quantity, false)}</strong></div>
        </div>
      `).join('')}
    </div>
  `;

  modal.style.display = "block";
  overlay.classList.add("active");
};

function closeAdminInspectModal() {
  document.getElementById("admin-inspect-modal").style.display = "none";
  document.getElementById("admin-inspect-modal-overlay").classList.remove("active");
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this piece from MongoDB?")) return;
  const key = Admin.getKey();
  try {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { "x-admin-key": key }
    });
    const data = await res.json();
    if (data.success) {
      window.showToast("Product deleted.");
      Admin.loadDashboardData();
    }
  } catch (err) {
    window.showToast(err.message, "error");
  }
}

async function updateOrderStatus(id, status) {
  const key = Admin.getKey();
  try {
    await fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-key": key },
      body: JSON.stringify({ status })
    });
    window.showToast("Order marked as " + status);
    Admin.loadOrders();
  } catch (err) {
    window.showToast("Failed to update status", "error");
  }
}
