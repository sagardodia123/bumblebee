// Shopping Cart Engine & Drawer Controller
const CART_STORAGE_KEY = "bumblebee_cart_items";
const PROMO_STORAGE_KEY = "bumblebee_active_promo";

window.Cart = {
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    this.updateCartCountBadge();
    this.renderDrawer();
  },

  addItem(product, size = "M", color = "Default", qty = 1, customImg = null) {
    const items = this.getItems();
    const existingIdx = items.findIndex(
      it => (it.id === product._id || it.id === product.id) && it.size === size && it.color === color
    );

    const price = Number(product.price);
    const image = customImg || (product.images && product.images.length > 0 ? product.images[0] : "");

    if (existingIdx > -1) {
      items[existingIdx].quantity += Number(qty);
    } else {
      items.push({
        id: product._id || product.id,
        name: product.name,
        price: price,
        image: image,
        size: size,
        color: color,
        quantity: Number(qty)
      });
    }

    this.saveItems(items);
    window.showToast(`Added ${product.name} [${size}] to bag.`);
    this.openDrawer();
  },

  removeItem(index) {
    const items = this.getItems();
    items.splice(index, 1);
    this.saveItems(items);
    window.showToast("Item removed from bag.", "info");
  },

  updateQuantity(index, delta) {
    const items = this.getItems();
    if (!items[index]) return;
    items[index].quantity += delta;
    if (items[index].quantity <= 0) {
      items.splice(index, 1);
    }
    this.saveItems(items);
  },

  getPromo() {
    try {
      return JSON.parse(localStorage.getItem(PROMO_STORAGE_KEY));
    } catch {
      return null;
    }
  },

  applyPromoCode(code) {
    if (!code) return { success: false, message: "Please enter a promo code." };
    const cleaned = code.trim().toUpperCase();
    const promos = window.STORE_CONFIG?.promoCodes || {};

    if (promos[cleaned]) {
      const info = promos[cleaned];
      localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify({ code: cleaned, ...info }));
      this.renderDrawer();
      return { success: true, message: `Promo code ${cleaned} applied!` };
    }
    return { success: false, message: "Invalid code. Try GENZ20 or FREESHIP" };
  },

  removePromo() {
    localStorage.removeItem(PROMO_STORAGE_KEY);
    this.renderDrawer();
    window.showToast("Promo code removed.", "info");
  },

  getTotals() {
    const items = this.getItems();
    const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const promo = this.getPromo();
    const freeThresh = window.STORE_CONFIG?.freeShippingThreshold || 1999;

    let discount = 0;
    let shipping = subtotal >= freeThresh ? 0 : 199;

    if (promo) {
      if (promo.discountPercent) {
        discount = (subtotal * promo.discountPercent) / 100;
      }
      if (promo.freeShipping) {
        shipping = 0;
      }
    }

    if (items.length === 0) {
      shipping = 0;
    }

    const tax = items.length > 0 ? (subtotal - discount) * 0.05 : 0; // 5% GST
    const total = Math.max(0, subtotal - discount + shipping + tax);

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total,
      itemCount: items.reduce((sum, it) => sum + it.quantity, 0)
    };
  },

  updateCartCountBadge() {
    const totals = this.getTotals();
    document.querySelectorAll(".cart-count-badge").forEach(badge => {
      badge.textContent = totals.itemCount;
      badge.style.display = totals.itemCount > 0 ? "inline-block" : "none";
    });
  },

  openDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      this.renderDrawer();
      drawer.classList.add("active");
      overlay.classList.add("active");
    }
  },

  closeDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
    }
  },

  proceedToCheckout() {
    const user = Auth.getUser();
    if (!user) {
      this.closeDrawer();
      window.showToast("Authentication required. Please sign in to checkout.", "error");
      setTimeout(() => {
        window.location.href = "/auth?redirect=/checkout";
      }, 700);
      return;
    }
    window.location.href = "/checkout";
  },

  renderDrawer() {
    const container = document.getElementById("cart-items-list");
    const totalsContainer = document.getElementById("cart-totals-summary");
    if (!container || !totalsContainer) return;

    const items = this.getItems();
    const totals = this.getTotals();
    const promo = this.getPromo();
    const freeThresh = window.STORE_CONFIG?.freeShippingThreshold || 1999;

    const shipMeter = document.getElementById("free-ship-text");
    if (shipMeter) {
      if (totals.subtotal >= freeThresh) {
        shipMeter.innerHTML = `<strong>FREE EXPRESS SHIPPING UNLOCKED</strong>`;
      } else {
        const remaining = (freeThresh - totals.subtotal).toFixed(2);
        shipMeter.innerHTML = `Add <strong>₹${remaining}</strong> more for <strong>FREE EXPRESS DELIVERY</strong>`;
      }
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-msg">
          <div style="margin-bottom: 14px;">${window.SVG_ICONS.cart}</div>
          <h3>YOUR BAG IS EMPTY</h3>
          <p style="font-size: 13px; margin-top: 6px; color:#555;">Explore the catalog to add pieces to your bag.</p>
        </div>
      `;
      totalsContainer.innerHTML = "";
      return;
    }

    // Clean Stepper Rendering (Image 1 Fix)
    container.innerHTML = items.map((item, idx) => `
      <div class="cart-item-card">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-variant">Size: <strong>${item.size}</strong> | Color: <strong>${item.color}</strong></div>
          <div class="cart-item-bottom">
            <div class="cart-stepper-box">
              <button class="cart-stepper-btn" onclick="Cart.updateQuantity(${idx}, -1)">-</button>
              <span class="cart-stepper-qty">${item.quantity}</span>
              <button class="cart-stepper-btn" onclick="Cart.updateQuantity(${idx}, 1)">+</button>
            </div>
            <span class="cart-item-price">${window.formatPrice(item.price * item.quantity)}</span>
            <button class="cart-item-remove-btn" onclick="Cart.removeItem(${idx})">Remove</button>
          </div>
        </div>
      </div>
    `).join("");

    totalsContainer.innerHTML = `
      ${promo ? `
        <div class="promo-code-applied">
          <span>Coupon: <strong>${promo.code}</strong></span>
          <button style="background:none; border:none; cursor:pointer; font-weight:900;" onclick="Cart.removePromo()">✕</button>
        </div>
      ` : `
        <div class="promo-input-group">
          <input type="text" id="cart-promo-input" class="input-brutal" placeholder="Promo code (e.g. GENZ20)" style="padding: 9px 12px; font-size:13px;">
          <button class="btn-brutal btn-sm btn-cyan" onclick="handleApplyPromo()">Apply</button>
        </div>
      `}

      <div class="cart-summary-line">
        <span>Subtotal</span>
        <span>${window.formatPrice(totals.subtotal)}</span>
      </div>
      ${totals.discount > 0 ? `
        <div class="cart-summary-line" style="color: #008844;">
          <span>Discount</span>
          <span>-${window.formatPrice(totals.discount)}</span>
        </div>
      ` : ""}
      <div class="cart-summary-line">
        <span>Shipping</span>
        <span>${totals.shipping === 0 ? '<strong style="color:#008844;">FREE</strong>' : window.formatPrice(totals.shipping)}</span>
      </div>
      <div class="cart-summary-line">
        <span>Estimated GST (5%)</span>
        <span>${window.formatPrice(totals.tax)}</span>
      </div>
      <div class="cart-summary-line cart-summary-total">
        <span>TOTAL</span>
        <span style="color: var(--pink);">${window.formatPrice(totals.total)}</span>
      </div>
      <button onclick="Cart.proceedToCheckout()" class="btn-brutal btn-yellow" style="width: 100%; margin-top: 18px; padding: 15px; font-size:15px; text-align: center;">
        PROCEED TO CHECKOUT [${window.formatPrice(totals.total)}]
      </button>
    `;
  }
};

window.handleApplyPromo = function() {
  const input = document.getElementById("cart-promo-input");
  if (!input) return;
  const res = Cart.applyPromoCode(input.value);
  if (res.success) {
    window.showToast(res.message);
  } else {
    window.showToast(res.message, "error");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Cart.updateCartCountBadge();
});
