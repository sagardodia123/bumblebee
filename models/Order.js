const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  selectedSize: { type: String, default: "M" },
  selectedColor: { type: String, default: "Black" },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => "HV-" + Math.floor(100000 + Math.random() * 900000)
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  shippingAddress: {
    street: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: "United States" }
  },
  shippingMethod: {
    name: { type: String, default: "Standard Hype Drop (3-5 Days)" },
    cost: { type: Number, default: 0 }
  },
  paymentMethod: { 
    type: String, 
    enum: ["card", "apple_pay", "upi", "cod"], 
    default: "card" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["paid", "pending", "failed"], 
    default: "paid" 
  },
  orderStatus: { 
    type: String, 
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], 
    default: "Pending" 
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  promoCode: { type: String },
  trackingNumber: { 
    type: String, 
    default: () => "TRACK-" + Math.random().toString(36).substring(2, 9).toUpperCase() 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
