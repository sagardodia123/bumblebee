// Product Detail & Dynamic Image Switcher Engine
let currentProduct = null;
let selectedSize = "M";
let selectedColor = "Default";
let selectedQuantity = 1;

window.openProductQuickView = async function(productId) {
  const modal = document.getElementById("product-detail-modal");
  const overlay = document.getElementById("product-modal-overlay");
  const target = document.getElementById("product-modal-render-target");
  if (!modal || !target) return;

  target.innerHTML = `<div style="text-align:center; padding:50px;">Loading piece specifications...</div>`;
  modal.style.display = "block";
  overlay.classList.add("active");

  try {
    const res = await fetch(`/api/products/${productId}`);
    const data = await res.json();
    if (data.success && data.product) {
      currentProduct = data.product;
      renderProductDetailModal(currentProduct);
    }
  } catch (err) {
    target.innerHTML = `<p style="color:red;">Failed to load product.</p>`;
  }
};

window.closeProductModal = function() {
  const modal = document.getElementById("product-detail-modal");
  const overlay = document.getElementById("product-modal-overlay");
  if (modal) modal.style.display = "none";
  if (overlay) overlay.classList.remove("active");
};

function renderProductDetailModal(product) {
  const target = document.getElementById("product-modal-render-target");
  if (!target) return;

  selectedSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : "M";
  selectedColor = (product.colors && product.colors.length > 0) ? product.colors[0] : "Default";
  selectedQuantity = 1;

  const mainImg = (product.images && product.images.length > 0) ? product.images[0] : "";
  const variants = product.variants || [];

  target.innerHTML = `
    <div class="product-modal-grid-inner">
      <div>
        <div class="product-modal-img-frame">
          <img id="detail-main-img" src="${mainImg}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover; transition:opacity 0.2s ease;">
        </div>
      </div>

      <div>
        <div style="font-size:12px; font-weight:900; color:#777; text-transform:uppercase;">${product.category || 'Streetwear'}</div>
        <h2 style="font-size:26px; margin: 6px 0 10px;">${product.name}</h2>
        <div style="font-size:24px; font-weight:900; margin-bottom:18px;">${window.formatPrice(product.price, false)}</div>

        <p style="font-size:14px; color:#444; line-height:1.5; margin-bottom:20px;">${product.description || ''}</p>

        <!-- Dynamic Color Variant Swatches (CHANGES IMAGE ON CLICK) -->
        <div style="margin-bottom:18px;">
          <label style="display:block; font-size:12px; font-weight:900; margin-bottom:8px;">
            COLOR VARIANT: <span id="selected-color-label" style="color:var(--pink);">${selectedColor}</span>
          </label>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            ${(product.colors || ['Default']).map((col, idx) => {
              const matchedVar = variants.find(v => v.name === col);
              const imgUrl = matchedVar?.image || product.images?.[idx] || mainImg;
              const colorHex = matchedVar?.color || '#000';
              return `
                <button type="button" class="btn-brutal btn-sm ${idx === 0 ? 'btn-yellow' : 'btn-white'}" 
                  onclick="selectColorVariant('${col}', '${imgUrl}', this)">
                  <span style="width:12px; height:12px; background:${colorHex}; border:1px solid #000; display:inline-block; margin-right:4px;"></span>
                  ${col}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Sizes -->
        <div style="margin-bottom:24px;">
          <label style="display:block; font-size:12px; font-weight:900; margin-bottom:8px;">SELECT SIZE</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${(product.sizes || ['S', 'M', 'L', 'XL']).map((sz, idx) => `
              <button type="button" class="btn-brutal btn-sm ${idx === 0 ? 'btn-yellow' : 'btn-white'}" data-size="${encodeURIComponent(sz)}" onclick="selectProductSize(this.getAttribute('data-size'), this)">${sz}</button>
            `).join('')}
          </div>
        </div>

        <!-- Add to Bag -->
        <div style="display:flex; gap:14px;">
          <button class="btn-brutal btn-yellow btn-lg" style="flex:1;" onclick="addDetailToBag()">
            + ADD TO BAG
          </button>
        </div>
      </div>
    </div>
  `;
}

window.selectColorVariant = function(colorName, imageUrl, btn) {
  selectedColor = colorName;
  document.getElementById("selected-color-label").textContent = colorName;

  btn.parentElement.querySelectorAll("button").forEach(b => b.className = "btn-brutal btn-sm btn-white");
  btn.className = "btn-brutal btn-sm btn-yellow";

  // DYNAMIC IMAGE SWITCH
  const imgEl = document.getElementById("detail-main-img");
  if (imgEl && imageUrl) {
    imgEl.style.opacity = "0.4";
    setTimeout(() => {
      imgEl.src = imageUrl;
      imgEl.style.opacity = "1";
    }, 150);
  }
};

window.selectProductSize = function(size, btn) {
  selectedSize = decodeURIComponent(size);
  btn.parentElement.querySelectorAll("button").forEach(b => b.className = "btn-brutal btn-sm btn-white");
  btn.className = "btn-brutal btn-sm btn-yellow";
};

window.addDetailToBag = function() {
  if (!currentProduct) return;
  const mainImg = document.getElementById("detail-main-img")?.src || currentProduct.images?.[0];
  Cart.addItem(currentProduct, selectedSize, selectedColor, 1, mainImg);
  closeProductModal();
};
