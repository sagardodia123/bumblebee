// Main Storefront Catalog & Interaction Controller
let allProducts = [];
let activeCategory = "All Items";
let activeSize = "all";
let activeSort = "featured";
let searchQuery = "";
let minPrice = null;
let maxPrice = null;

async function fetchProducts() {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="empty-state-box">
      <h3>LOADING DROPS...</h3>
    </div>
  `;

  try {
    let url = `/api/products?sort=${activeSort}`;
    if (activeCategory && activeCategory !== "All Items") {
      url += `&category=${encodeURIComponent(activeCategory)}`;
    }
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    if (activeSize && activeSize !== "all") {
      url += `&size=${encodeURIComponent(activeSize)}`;
    }
    if (minPrice) url += `&minPrice=${minPrice}`;
    if (maxPrice) url += `&maxPrice=${maxPrice}`;

    const res = await fetch(url);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Server returned status ${res.status}. Please refresh.`);
    }

    if (data.success) {
      allProducts = data.products || [];
      renderProductGrid(allProducts);
      updateItemCountDisplay(allProducts.length);
    } else {
      throw new Error(data.message || "Failed to load drops");
    }
  } catch (err) {
    grid.innerHTML = `
      <div class="empty-state-box">
        <h3>FAILED TO LOAD DROPS</h3>
        <p>${err.message}</p>
        <button class="btn-brutal btn-yellow" onclick="fetchProducts()" style="margin-top: 15px;">Retry</button>
      </div>
    `;
  }
}

function renderProductGrid(products) {
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = `
      <div class="empty-state-box">
        <h3>NO ITEMS FOUND MATCHING FILTERS</h3>
        <p style="font-size: 14px; margin-top: 6px; color: #555;">Try clearing your filters or searching another keyword.</p>
        <button class="btn-brutal btn-cyan" onclick="resetFilters()" style="margin-top: 16px;">CLEAR ALL FILTERS</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = products.map(p => {
    const mainImg = (p.images && p.images.length > 0) ? p.images[0] : "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80";
    const discount = (p.compareAtPrice && p.compareAtPrice > p.price) 
      ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100) 
      : 0;

    return `
      <div class="product-card" data-id="${p._id}">
        ${p.badge ? `<span class="product-card-badge">${p.badge}</span>` : (discount > 0 ? `<span class="product-card-badge" style="background:var(--yellow);">${discount}% OFF</span>` : '')}
        
        <div class="product-thumb-wrapper" onclick="openProductQuickView('${p._id}')">
          <img src="${mainImg}" alt="${p.name}" class="product-thumb" loading="lazy">
          <button class="quick-view-overlay-btn" onclick="event.stopPropagation(); openProductQuickView('${p._id}')">QUICK VIEW</button>
        </div>

        <div class="product-card-body">
          <div class="product-card-category">${p.category || 'Streetwear'}</div>
          <div class="product-card-title" onclick="openProductQuickView('${p._id}')">${p.name}</div>
          
          <div class="product-card-rating">
            <span class="rating-stars">${window.SVG_ICONS.star}</span>
            <span>${p.rating ? p.rating.toFixed(1) : '5.0'}</span>
            <span style="color:#777; font-weight:600;">(${p.reviewCount || (p.reviews ? p.reviews.length : 0)})</span>
            ${p.stock < 10 ? `<span class="badge-brutal badge-pink" style="margin-left:auto; font-size:9px; padding:2px 6px;">ONLY ${p.stock} LEFT</span>` : ''}
          </div>

          <div class="product-card-footer">
            <div class="product-price-box">
              <span class="price-current">${window.formatPrice(p.price)}</span>
              ${p.compareAtPrice && p.compareAtPrice > p.price ? `<span class="price-original">${window.formatPrice(p.compareAtPrice)}</span>` : ''}
            </div>
            <button class="add-to-cart-quick-btn" onclick="quickAddToCart('${p._id}')">
              + ADD
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function updateItemCountDisplay(count) {
  const el = document.getElementById("catalog-item-count");
  if (el) el.textContent = `${count} ITEMS FOUND`;
}

window.quickAddToCart = function(productId) {
  const prod = allProducts.find(p => p._id === productId);
  if (!prod) return;
  const defaultSize = (prod.sizes && prod.sizes.length > 0) ? prod.sizes[0] : "M";
  const defaultColor = (prod.colors && prod.colors.length > 0) ? prod.colors[0] : "Default";
  Cart.addItem(prod, defaultSize, defaultColor, 1);
};

window.filterCategory = function(catName, btnElement) {
  activeCategory = catName;
  document.querySelectorAll(".cat-pill").forEach(el => el.classList.remove("active"));
  if (btnElement) btnElement.classList.add("active");
  fetchProducts();
};

window.filterSize = function(size, btnElement) {
  if (activeSize === size) {
    activeSize = "all";
    btnElement.classList.remove("active");
  } else {
    activeSize = size;
    document.querySelectorAll(".size-btn").forEach(el => el.classList.remove("active"));
    btnElement.classList.add("active");
  }
  fetchProducts();
};

window.applyPriceFilter = function() {
  const min = document.getElementById("filter-min-price")?.value;
  const max = document.getElementById("filter-max-price")?.value;
  minPrice = min ? Number(min) : null;
  maxPrice = max ? Number(max) : null;
  fetchProducts();
};

window.handleSortChange = function(selectEl) {
  activeSort = selectEl.value;
  fetchProducts();
};

window.resetFilters = function() {
  activeCategory = "All Items";
  activeSize = "all";
  activeSort = "featured";
  searchQuery = "";
  minPrice = null;
  maxPrice = null;

  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";
  const minInput = document.getElementById("filter-min-price");
  if (minInput) minInput.value = "";
  const maxInput = document.getElementById("filter-max-price");
  if (maxInput) maxInput.value = "";

  document.querySelectorAll(".cat-pill").forEach((el, idx) => el.classList.toggle("active", idx === 0));
  document.querySelectorAll(".size-btn").forEach(el => el.classList.remove("active"));
  
  fetchProducts();
};

let searchTimeout = null;
function setupSearch() {
  const searchInput = document.getElementById("search-input");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim();
      fetchProducts();
    }, 250);
  });
}

function initCategoryPillsScroll() {
  const container = document.getElementById("category-pills-bar");
  if (!container) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    container.classList.add("dragging");
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
    container.classList.remove("dragging");
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.6;
    container.scrollLeft = scrollLeft - walk;
  });

  // Convert mouse wheel to horizontal scroll when cursor is over the pills
  container.addEventListener("wheel", (e) => {
    if (e.deltaY !== 0 && container.scrollWidth > container.clientWidth) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  }, { passive: false });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  setupSearch();
  initCategoryPillsScroll();
});
