// Bumblebee Authentication Engine & Navigation Sync
const USER_STORAGE_KEY = "bumblebee_auth_user";
const TOKEN_STORAGE_KEY = "bumblebee_auth_token";

window.Auth = {
  getUser() {
    try { return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)); } catch { return null; }
  },
  getToken() { return localStorage.getItem(TOKEN_STORAGE_KEY); },
  setSession(user, token) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    this.syncHeaderNav();
  },
  logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.showToast("Signed out successfully.", "info");
    this.syncHeaderNav();
    setTimeout(() => { window.location.href = "/"; }, 400);
  },
  syncHeaderNav() {
    const badge = document.getElementById("header-user-badge");
    if (!badge) return;

    const user = this.getUser();
    if (user && user.name) {
      badge.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <a href="/profile" class="btn-brutal btn-sm btn-cyan">
            <svg class="icon-svg-sm" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>${user.name.toUpperCase()}</span>
          </a>
          <button class="btn-brutal btn-sm btn-pink" onclick="Auth.logout()">LOGOUT</button>
        </div>
      `;
    } else {
      badge.innerHTML = `<a href="/auth" class="btn-brutal btn-sm btn-white">SIGN IN</a>`;
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Auth.syncHeaderNav();
});

function switchAuthTab(tab) {
  const loginForm = document.getElementById("auth-login-form");
  const regForm = document.getElementById("auth-register-form");
  const loginBtn = document.getElementById("tab-btn-login");
  const regBtn = document.getElementById("tab-btn-register");

  if (tab === "login") {
    loginForm.style.display = "block";
    regForm.style.display = "none";
    loginBtn.className = "btn-brutal btn-yellow";
    regBtn.className = "btn-brutal btn-white";
  } else {
    loginForm.style.display = "none";
    regForm.style.display = "block";
    loginBtn.className = "btn-brutal btn-white";
    regBtn.className = "btn-brutal btn-cyan";
  }
}

async function handleCustomerLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      Auth.setSession(data.user, data.token);
      window.showToast("Welcome back, " + data.user.name + "!");
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/profile";
      setTimeout(() => { window.location.href = redirect; }, 600);
    } else {
      window.showToast(data.message || "Invalid credentials", "error");
    }
  } catch (err) {
    window.showToast("Connection error: " + err.message, "error");
  }
}

async function handleCustomerRegister(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const password = document.getElementById("reg-password").value.trim();

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    if (data.success) {
      Auth.setSession(data.user, data.token);
      window.showToast("Account registered successfully!");
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/profile";
      setTimeout(() => { window.location.href = redirect; }, 600);
    } else {
      window.showToast(data.message || "Failed to register", "error");
    }
  } catch (err) {
    window.showToast(err.message, "error");
  }
}

async function handleGoogleFastPass() {
  const demoEmail = "google_user_" + Math.floor(Math.random() * 899 + 100) + "@gmail.com";
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Google VIP User",
        email: demoEmail,
        password: "google-session-pass-token",
        phone: "+91 98000 00000"
      })
    });
    const data = await res.json();
    if (data.token) {
      Auth.setSession(data.user, data.token);
      window.showToast("Successfully signed in with Google!");
      const redirect = new URLSearchParams(window.location.search).get("redirect") || "/profile";
      setTimeout(() => { window.location.href = redirect; }, 600);
    }
  } catch (err) {
    window.showToast("Google sign-in error: " + err.message, "error");
  }
}
