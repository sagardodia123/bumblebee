const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "hypevault_jwt_secret_dev_key";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Middleware to protect admin endpoints
function requireAdmin(req, res, next) {
  const adminKey = req.headers["x-admin-key"] || req.headers["authorization"]?.replace("Bearer ", "");
  
  if (!adminKey) {
    return res.status(401).json({ success: false, message: "Admin authorization required." });
  }

  // Support direct admin password key or admin JWT token
  if (adminKey === ADMIN_PASSWORD) {
    req.isAdmin = true;
    return next();
  }

  try {
    const decoded = jwt.verify(adminKey, JWT_SECRET);
    if (decoded.role === "admin" || decoded.isAdmin) {
      req.user = decoded;
      req.isAdmin = true;
      return next();
    }
  } catch (err) {
    // ignore jwt error and check direct password
  }

  return res.status(403).json({ success: false, message: "Invalid admin credentials." });
}

// Middleware to authenticate logged-in customers
function requireUser(req, res, next) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token." });
  }
}

// Helper to generate customer JWT
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { requireAdmin, requireUser, generateToken, ADMIN_PASSWORD };
