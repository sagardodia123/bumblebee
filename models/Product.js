const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true, default: "Anonymous Drip God" },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  comment: { type: String, required: true },
  tag: { type: String, default: "Verified Buyer" },
  avatar: { type: String, default: "⚡" },
  date: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, lowercase: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, default: 0 },
  category: { 
    type: String, 
    required: true, 
    enum: ["Tops & Tees", "Hoodies & Outerwear", "Bottoms & Cargos", "Footwear", "Cyber Accessories"],
    default: "Tops & Tees"
  },
  description: { type: String, required: true },
  details: [{ type: String }],
  sizes: [{ type: String, default: ["S", "M", "L", "XL"] }],
  colors: [{ type: String, default: ["Black", "Acid Wash"] }],
  stock: { type: Number, required: true, default: 20, min: 0 },
  images: [{ type: String, required: true }],
  badge: { type: String, default: "🔥 TRENDING" },
  tags: [{ type: String }],
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  reviews: [reviewSchema],
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Calculate average rating automatically before saving reviews
productSchema.methods.recalcRating = function() {
  if (this.reviews && this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    this.rating = parseFloat((sum / this.reviews.length).toFixed(1));
    this.reviewCount = this.reviews.length;
  } else {
    this.rating = 5.0;
    this.reviewCount = 0;
  }
};

module.exports = mongoose.model("Product", productSchema);
