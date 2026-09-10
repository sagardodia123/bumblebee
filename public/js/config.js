// Bumblebee Central Config & SVG Engine
window.STORE_CONFIG = {
  storeName: "BUMBLEBEE",
  storeSubtitle: "BEE-STUDIO",
  storeTagline: "ANTI-BORING GEN-Z STREETWEAR & CYBER ARCHIVE",
  currencySymbol: "₹",
  freeShippingThreshold: 1999,
  supportEmail: "sagardodia6@gmail.com",
  promoCodes: {
    "GENZ20": { discountPercent: 20 },
    "FREESHIP": { freeShipping: true },
    "VIP30": { discountPercent: 30 },
    "TIKTOK15": { discountPercent: 15 }
  }
};

// Pure SVG Icon System (Zero Emojis Anywhere)
window.SVG_ICONS = {
  cart: `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`,
  user: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  search: `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
  star: `<svg class="icon-svg-sm" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  check: `<svg class="icon-svg" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  truck: `<svg class="icon-svg" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`,
  package: `<svg class="icon-svg" viewBox="0 0 24 24"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`,
  creditCard: `<svg class="icon-svg" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`,
  mapPin: `<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  close: `<svg class="icon-svg" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  alert: `<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
  google: `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>`,
  mail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  tiktok: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>`,
  twitter: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>`,
  discord: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6h0a14.5 14.5 0 0 0-4-1.5 9.8 9.8 0 0 0-.5 1.5 12.5 12.5 0 0 0-3 0 9.8 9.8 0 0 0-.5-1.5A14.5 14.5 0 0 0 6 6a15.8 15.8 0 0 0-2 8.5 12.6 12.6 0 0 0 4.5 2.3 9.4 9.4 0 0 0 1-1.6 8.5 8.5 0 0 1-2.5-1.2l.5-.4c3.4 1.6 7.1 1.6 10.5 0l.5.4a8.5 8.5 0 0 1-2.5 1.2 9.4 9.4 0 0 0 1 1.6 12.6 12.6 0 0 0 4.5-2.3A15.8 15.8 0 0 0 18 6z"/></svg>`
};

// Global Price Formatter (with decimal toggle)
window.formatPrice = function(amount, includeDecimals = true) {
  const sym = window.STORE_CONFIG?.currencySymbol || "₹";
  const num = Number(amount || 0);
  if (!includeDecimals) {
    return `${sym}${Math.round(num).toLocaleString("en-IN")}`;
  }
  return `${sym}${num.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

// Global Toast Notifications
window.showToast = function(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-brutal ${type === "error" ? "toast-error" : type === "info" ? "toast-info" : ""}`;
  
  const iconSvg = type === "error" ? window.SVG_ICONS.alert : (type === "info" ? window.SVG_ICONS.alert : window.SVG_ICONS.check);
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span>${iconSvg}</span>
      <span>${message}</span>
    </div>
    <span style="cursor:pointer; font-weight:900; margin-left:14px; font-size:16px;" onclick="this.parentElement.remove()">✕</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 250);
  }, 3500);
};

// Sync Remote Config
async function syncStoreConfig() {
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    if (data.success && data.config) {
      window.STORE_CONFIG = data.config;
      document.querySelectorAll("[data-brand-name]").forEach(el => el.textContent = data.config.storeName);
      document.querySelectorAll("[data-brand-subtitle]").forEach(el => el.textContent = data.config.storeSubtitle);
      document.querySelectorAll("[data-brand-tagline]").forEach(el => el.textContent = data.config.storeTagline);
      document.querySelectorAll("[data-currency]").forEach(el => el.textContent = data.config.currencySymbol);

      if (!window.location.pathname.includes("admin")) {
        document.title = `${data.config.storeName} // ${data.config.storeSubtitle} — Streetwear Archive`;
      }
    }
  } catch (err) {
    console.warn("Using local configuration fallback.");
  }
}

document.addEventListener("DOMContentLoaded", syncStoreConfig);
