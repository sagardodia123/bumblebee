// Checkout Handler
document.addEventListener("DOMContentLoaded", () => {
  const user = Auth.getUser();
  if (!user) {
    window.showToast("Authentication required. Please sign in first.", "error");
    setTimeout(() => { window.location.href = "/auth?redirect=/checkout"; }, 700);
    return;
  }

  const items = Cart.getItems();
  if (items.length === 0) {
    window.location.href = "/";
    return;
  }

  renderCheckoutSummary();
  prefillUserDetails(user);
});

function prefillUserDetails(user) {
  document.getElementById("ship-name").value = user.name || "";
  document.getElementById("ship-phone").value = user.phone || "";
  if (user.savedAddress) {
    document.getElementById("ship-street").value = user.savedAddress.street || "";
    document.getElementById("ship-city").value = user.savedAddress.city || "";
    document.getElementById("ship-state").value = user.savedAddress.state || "";
    document.getElementById("ship-pincode").value = user.savedAddress.pincode || "";
  }
}

function renderCheckoutSummary() {
  const container = document.getElementById("checkout-items-list");
  const items = Cart.getItems();
  const totals = Cart.getTotals();

  container.innerHTML = items.map(it => `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; gap:12px; align-items:center;">
        <img src="${it.image || ''}" style="width:44px; height:44px; object-fit:cover; border:2px solid #000;">
        <div>
          <strong style="font-size:13px;">${it.name}</strong>
          <div style="font-size:11px; color:#666;">${it.size} | ${it.color} x ${it.quantity}</div>
        </div>
      </div>
      <strong>${window.formatPrice(it.price * it.quantity, false)}</strong>
    </div>
  `).join('');

  document.getElementById("co-subtotal").textContent = window.formatPrice(totals.subtotal, false);
  document.getElementById("co-shipping").textContent = totals.shipping === 0 ? "FREE" : window.formatPrice(totals.shipping, false);
  document.getElementById("co-tax").textContent = window.formatPrice(totals.tax, false);
  document.getElementById("co-total").textContent = window.formatPrice(totals.total, false);
}

async function handlePlaceOrder(e) {
  e.preventDefault();
  const user = Auth.getUser();
  const token = Auth.getToken();
  const items = Cart.getItems();
  const totals = Cart.getTotals();

  const payload = {
    customer: {
      name: document.getElementById("ship-name").value.trim(),
      email: user.email,
      phone: document.getElementById("ship-phone").value.trim()
    },
    shippingAddress: {
      fullName: document.getElementById("ship-name").value.trim(),
      phone: document.getElementById("ship-phone").value.trim(),
      street: document.getElementById("ship-street").value.trim(),
      city: document.getElementById("ship-city").value.trim(),
      state: document.getElementById("ship-state").value.trim(),
      pincode: document.getElementById("ship-pincode").value.trim()
    },
    items: items,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    paymentMethod: document.querySelector('input[name="payment"]:checked').value
  };

  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      localStorage.removeItem("bumblebee_cart_items");
      window.showToast("Order placed successfully! Redirecting to profile...");
      setTimeout(() => { window.location.href = "/profile"; }, 1000);
    } else {
      window.showToast(data.message || "Failed to place order", "error");
    }
  } catch (err) {
    window.showToast(err.message, "error");
  }
}
