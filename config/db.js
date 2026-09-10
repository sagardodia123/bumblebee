const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️  MONGODB_URI is not defined in .env. Database connection skipped.");
    return false;
  }

  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`🚀 MongoDB Atlas Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error("❌ MongoDB Atlas Connection Error:", error.message);
    isConnected = false;
    return false;
  }
}

function getDbStatus() {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    host: mongoose.connection.host || "Not Connected",
    name: mongoose.connection.name || "None"
  };
}

module.exports = { connectDB, getDbStatus };
