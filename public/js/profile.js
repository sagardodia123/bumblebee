// Customer Profile Logic with Interactive Tracking
let myOrders = [];
let myReviews = [];

document.addEventListener("DOMContentLoaded", async () => {
  const token = Auth.getToken();
  if (!token) {
    window.location.href = "/auth?redirect=/profile";
    return;
  }
  await loadUserProfile();
  await loadUserOrders();
  await loadUserReviews();
});

async function loadUserProfile() {
  const token = Auth.getToken();
  try {
    const res = await fetch("/api/user/profile", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();
    if (data.success && data.user) {
      const u = data.user;
      document.getElementById("profile-name-display").textContent = u.name || "Customer";
      document.getElementById("profile-email-display").textContent = u.email || "";
      document.getElementById("profile-avatar-initials").textContent = (u.name ? u.name.charAt(0) : "U").toUpperCase();

      document.getElementById("profile-edit-name").value = u.name || "";
      document.getElementById("profile-edit-phone").value = u.phone || "";
      if (u.savedAddress) {
        document.getElementById("profile-edit-street").value = u.savedAddress.street || "";
        document.getElementById("profile-edit-city").value = u.savedAddress.city || "";
        document.getElementById("profile-edit-state").value = u.savedAddress.state || "";
        document.getElementById("profile-edit-pincode").value = u.savedAddress.pincode || "";
      }
    } else {
      Auth.logout();
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadUserOrders() {
  const token = Auth.getToken();
  const container = document.getElementById("profile-orders-list");
  try {
    const res = await fetch("/api/user/orders", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();
    if (data.success) {
      myOrders = data.orders || [];
      document.getElementById("profile-order-count").textContent = myOrders.length;

      if (myOrders.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:50px 20px; background:#faf8f2; border:2px solid #000;">
            <h3>NO ORDERS PLACED YET</h3>
            <p style="font-size:14px; color:#666; margin:8px 0 18px;">You haven't ordered any pieces from the archive yet.</p>
            <a href="/" class="btn-brutal btn-yellow">EXPLORE ARCHIVE DROPS</a>
          </div>
        `;
        return;
      }

      container.innerHTML = myOrders.map(order => `
        <div style="border:2px solid #000; box-shadow:3px 3px 0 #000; padding:22px; margin-bottom:20px; background:#fff;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:16px;">
            <div>
              <strong style="font-size:16px;">#${order.orderNumber || order._id.substring(0, 8)}</strong>
              <div style="font-size:12px; color:#666;">Placed on ${new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <div style="text-align:right;">
              <span class="badge-brutal badge-yellow" style="font-size:11px;">${(order.orderStatus || 'Processing').toUpperCase()}</span>
              <div style="font-size:18px; font-weight:900; margin-top:4px;">${window.formatPrice(order.total, false)}</div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
            ${(order.items || []).map(it => `
              <div style="display:flex; align-items:center; gap:14px;">
                <img src="${it.image || ''}" style="width:50px; height:50px; object-fit:cover; border:2px solid #000;">
                <div style="flex:1;">
                  <strong style="font-size:14px;">${it.name}</strong>
                  <div style="font-size:12px; color:#666;">Size: <strong>${it.size}</strong> | Color: <strong>${it.color}</strong> | Qty: <strong>${it.quantity}</strong></div>
                </div>
                <div style="font-weight:800;">${window.formatPrice(it.price * it.quantity, false)}</div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px solid #f0f0f0; padding-top:14px;">
            <div style="font-size:12px; color:#666;">
              Ship to: <strong>${order.shippingAddress?.fullName || 'Customer'}, ${order.shippingAddress?.city || ''}</strong>
            </div>
            <button class="btn-brutal btn-sm btn-cyan" onclick="openOrderTrackingModal('${order.orderNumber || order._id}')">
              TRACK SHIPMENT
            </button>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error loading orders.</p>`;
  }
}

async function loadUserReviews() {
  const token = Auth.getToken();
  const container = document.getElementById("profile-reviews-list");
  try {
    const res = await fetch("/api/user/reviews", {
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await res.json();
    if (data.success) {
      myReviews = data.reviews || [];
      document.getElementById("profile-review-count").textContent = myReviews.length;

      if (myReviews.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:50px 20px; background:#faf8f2; border:2px solid #000;">
            <h3>NO REVIEWS SUBMITTED YET</h3>
            <p style="font-size:14px; color:#666;">Rate and review pieces you have purchased from the product pages.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = myReviews.map(r => `
        <div style="border:2px solid #000; box-shadow:3px 3px 0 #000; padding:18px; margin-bottom:16px; background:#fff;">
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <strong>${r.productName}</strong>
            <span style="font-size:12px; color:#777;">${r.date}</span>
          </div>
          <div style="font-weight:900; color:#000; margin-bottom:6px;">${'★'.repeat(r.rating || 5)}</div>
          <p style="font-size:14px;">"${r.comment}"</p>
        </div>
      `).join('');
    }
  } catch (err) {
    container.innerHTML = `<p>Failed to load reviews.</p>`;
  }
}

function switchProfileTab(tab, btn) {
  document.getElementById("profile-tab-orders").style.display = tab === "orders" ? "block" : "none";
  document.getElementById("profile-tab-reviews").style.display = tab === "reviews" ? "block" : "none";
  document.getElementById("profile-tab-address").style.display = tab === "address" ? "block" : "none";

  document.querySelectorAll("#tab-btn-orders, #tab-btn-reviews, #tab-btn-address").forEach(b => {
    b.className = "btn-brutal btn-white btn-block";
  });
  if (btn) btn.className = "btn-brutal btn-yellow btn-block";
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const token = Auth.getToken();
  const payload = {
    name: document.getElementById("profile-edit-name").value.trim(),
    phone: document.getElementById("profile-edit-phone").value.trim(),
    savedAddress: {
      fullName: document.getElementById("profile-edit-name").value.trim(),
      phone: document.getElementById("profile-edit-phone").value.trim(),
      street: document.getElementById("profile-edit-street").value.trim(),
      city: document.getElementById("profile-edit-city").value.trim(),
      state: document.getElementById("profile-edit-state").value.trim(),
      pincode: document.getElementById("profile-edit-pincode").value.trim()
    }
  };

  try {
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      window.showToast("Profile and address updated!");
      loadUserProfile();
    }
  } catch (err) {
    window.showToast("Failed to save profile", "error");
  }
}

// Order Tracking Modal with Visual Timeline
window.openOrderTrackingModal = function(orderIdOrNum) {
  const order = myOrders.find(o => o.orderNumber === orderIdOrNum || o._id === orderIdOrNum);
  if (!order) return;

  const modal = document.getElementById("tracking-modal");
  const overlay = document.getElementById("tracking-modal-overlay");
  const title = document.getElementById("tracking-modal-title");
  const content = document.getElementById("tracking-modal-content");

  title.textContent = `SHIPMENT TRACKING: #${order.orderNumber}`;

  const status = (order.orderStatus || 'Processing').toLowerCase();
  let stepIdx = 1;
  if (status === 'shipped') stepIdx = 3;
  if (status === 'delivered') stepIdx = 5;

  const steps = [
    { title: "ORDER CONFIRMED & PAYMENT VERIFIED", desc: "Payment received and authorized by Bumblebee gateway." },
    { title: "QUALITY CHECKED & PACKED", desc: "Garments packaged into Bumblebee archive dust-box." },
    { title: "DISPATCHED VIA AIR EXPRESS", desc: `Handed over to carrier. Tracking ID: ${order.trackingNumber || 'BEE-EXP-9921'}` },
    { title: "OUT FOR DELIVERY", desc: "Courier partner on the final delivery route to destination address." },
    { title: "DELIVERED TO CUSTOMER", desc: "Package handed over and signed." }
  ];

  content.innerHTML = `
    <div class="tracking-timeline-box">
      ${steps.map((st, i) => `
        <div class="timeline-step ${i < stepIdx ? 'completed' : ''} ${i === stepIdx - 1 ? 'current' : ''}">
          <div class="step-marker">${i < stepIdx ? '✓' : (i + 1)}</div>
          <div class="step-content">
            <h4>${st.title}</h4>
            <p>${st.desc}</p>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px solid #000; padding-top:14px; margin-top:14px;">
      <div><strong>Carrier:</strong> Blue Dart Express / DTDC</div>
      <a href="mailto:sagardodia6@gmail.com?subject=Tracking Inquiry ${order.orderNumber}" class="btn-brutal btn-sm btn-white">CONTACT SUPPORT</a>
    </div>
  `;

  modal.style.display = "block";
  overlay.classList.add("active");
};

window.closeTrackingModal = function() {
  document.getElementById("tracking-modal").style.display = "none";
  document.getElementById("tracking-modal-overlay").classList.remove("active");
};
