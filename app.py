import os
import sys
import json
import random
import string
import datetime
from bson import ObjectId
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

# Ensure UTF-8 output on Windows consoles
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, 'reconfigure'):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "public")
CONFIG_PATH = os.path.join(BASE_DIR, "store_config.json")

from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__, static_folder=STATIC_DIR)
CORS(app)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

def load_store_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "storeName": "BUMBLEBEE",
        "storeSubtitle": "VAULT-99",
        "storeTagline": "ANTI-BORING GEN-Z STREETWEAR & CYBER ARCHIVE",
        "currencySymbol": "₹",
        "freeShippingThreshold": 1999,
        "adminPassword": "admin123",
        "promoCodes": {
            "GENZ20": {"discountPercent": 20, "description": "20% OFF Entire Order"},
            "FREESHIP": {"freeShipping": True, "description": "Free Sonic Delivery"},
            "VIP30": {"discountPercent": 30, "description": "30% VIP Drop Access"},
            "TIKTOK15": {"discountPercent": 15, "description": "15% Creator Code"}
        },
        "categories": [
            "All Items",
            "Tops & Tees",
            "Hoodies & Outerwear",
            "Bottoms & Cargos",
            "Footwear",
            "Cyber Accessories"
        ]
    }

store_config = load_store_config()
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", store_config.get("adminPassword", "admin123"))
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb+srv://sagardodia6_db_user:9MpsCCYf8yaKtu3C@cluster0.lh2x5xg.mongodb.net/?appName=Cluster0")

# MongoDB Atlas Connection
db = None
products_col = None
orders_col = None
users_col = None

try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=6000)
    db = client["bumblebee_db"]
    products_col = db["products"]
    orders_col = db["orders"]
    users_col = db["users"]
    client.admin.command("ping")
    print("[MongoDB Atlas] Connected to Cluster0 / DB: bumblebee_db")
except Exception as e:
    print(f"[MongoDB Atlas] Notice: {e}. Falling back to memory store.")
    db = None

# Realistic INR Streetwear Catalog (Zero Emojis)
DEMO_PRODUCTS = [
    {
        "name": "CYBER-VOID OVERSIZED GRAPHIC TEE",
        "slug": "cyber-void-oversized-graphic-tee",
        "price": 1499,
        "compareAtPrice": 1999,
        "category": "Tops & Tees",
        "description": "Heavyweight 280GSM cotton boxy-cut tee with high-density cyber-matrix screen print on the back and chest distress details. Built for relaxed streetwear styling.",
        "details": [
            "100% Ultra-Heavyweight 280 GSM Cotton",
            "Dropped shoulders & boxy silhouette",
            "Silkscreen high-density graphic print",
            "Pre-shrunk acid wash treatment",
            "Unisex relaxed fit"
        ],
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Acid Onyx", "Cyber Violet", "Bone White"],
        "stock": 35,
        "images": [
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80"
        ],
        "badge": "BESTSELLER",
        "tags": ["oversized", "streetwear", "heavyweight", "y2k"],
        "rating": 4.9,
        "reviewCount": 4,
        "reviews": [
            {"author": "Kai Vance", "rating": 5, "comment": "The 280GSM weight feels premium and retains shape after multiple washes.", "tag": "Verified Buyer", "date": "2026-08-15"},
            {"author": "Mia Vortex", "rating": 5, "comment": "Fits boxy and clean. Styled it with parachute cargos.", "tag": "Verified Buyer", "date": "2026-08-20"},
            {"author": "Ezra K.", "rating": 5, "comment": "Graphic print is thick and sharp. Recommend standard size for oversized look.", "tag": "Verified Buyer", "date": "2026-08-28"},
            {"author": "Rohan M.", "rating": 4, "comment": "Clean silhouette and prompt delivery.", "tag": "Verified Buyer", "date": "2026-09-02"}
        ],
        "isFeatured": True
    },
    {
        "name": "TOXIC-ACID HEAVYWEIGHT ZIP HOODIE",
        "slug": "toxic-acid-heavyweight-zip-hoodie",
        "price": 2999,
        "compareAtPrice": 3799,
        "category": "Hoodies & Outerwear",
        "description": "420GSM French Terry thermal zip-up with dual custom metal zipper pulls, raw distress hems, and a double-layered oversized hood that stacks cleanly.",
        "details": [
            "420 GSM 100% French Terry Cotton",
            "Custom 2-Way Brutal Metal Zippers",
            "Hand-distressed raw cuff trims",
            "Washed acid dye finish",
            "Deep kangaroo pockets with hidden earphone port"
        ],
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Mineral Washed Black", "Toxic Olive", "Ghost Ash"],
        "stock": 18,
        "images": [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"
        ],
        "badge": "25% OFF",
        "tags": ["hoodie", "outerwear", "acid-wash", "winter"],
        "rating": 4.8,
        "reviewCount": 3,
        "reviews": [
            {"author": "Dylan C.", "rating": 5, "comment": "The 2-way metal zipper works smoothly. Heavy thermal feel.", "tag": "Verified Buyer", "date": "2026-08-10"},
            {"author": "Chloe Cyber", "rating": 5, "comment": "Comfortable heavyweight fabric and accurate fit.", "tag": "Verified Buyer", "date": "2026-08-19"},
            {"author": "Vex 99", "rating": 4, "comment": "Substantial hood shape that fits over over-ear headphones.", "tag": "Verified Buyer", "date": "2026-09-01"}
        ],
        "isFeatured": True
    },
    {
        "name": "TACTICAL PARACHUTE CARGO PANTS",
        "slug": "tactical-parachute-cargo-pants",
        "price": 2499,
        "compareAtPrice": 3199,
        "category": "Bottoms & Cargos",
        "description": "Wide parachute fit crafted from water-resistant ripstop nylon. Features 8 utility 3D pockets, adjustable bungee toggles at the ankles, and an elasticated waistband.",
        "details": [
            "Ripstop Ultra-Light Tactical Nylon",
            "8 3D Multi-Cargo Pockets with metal snap closures",
            "Ankle drawstrings for wide-leg or tapered cuff styling",
            "D-ring utility clips for attachments",
            "Unisex relaxed balloon cut"
        ],
        "sizes": ["XS", "S", "M", "L", "XL"],
        "colors": ["Cyber Black", "Olive Drab", "Desert Sand"],
        "stock": 22,
        "images": [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80"
        ],
        "badge": "TRENDING",
        "tags": ["cargos", "parachute", "tactical", "gorpcore"],
        "rating": 5.0,
        "reviewCount": 3,
        "reviews": [
            {"author": "Axel V.", "rating": 5, "comment": "The toggle system at the ankles allows versatile styling with high-tops and runners.", "tag": "Verified Buyer", "date": "2026-08-12"},
            {"author": "Jade X.", "rating": 5, "comment": "Spacious pockets and lightweight ripstop fabric.", "tag": "Verified Buyer", "date": "2026-08-25"}
        ],
        "isFeatured": True
    },
    {
        "name": "CYBER-STOMPER CHUNKY PLATFORM BOOTS",
        "slug": "cyber-stomper-chunky-platform-boots",
        "price": 4499,
        "compareAtPrice": 5999,
        "category": "Footwear",
        "description": "6cm mega-tread platform combat boots built from vegan micro-grain leather. Reinforced steel eyelets, quick-zip inner side closure, and cushioned anti-fatigue insole.",
        "details": [
            "Premium Vegan Micro-Grain Leather",
            "6cm Sculpted Brutalist Lug Sole",
            "Side heavy-duty zipper for easy on/off",
            "Memory foam dual-density footbed",
            "Slip-resistant rubber outsole"
        ],
        "sizes": ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
        "colors": ["Pitch Black Matte", "Patent Gloss"],
        "stock": 14,
        "images": [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80"
        ],
        "badge": "LIMITED DROP",
        "tags": ["shoes", "boots", "platform", "goth", "cyberpunk"],
        "rating": 4.8,
        "reviewCount": 2,
        "reviews": [
            {"author": "Raven S.", "rating": 5, "comment": "Solid construction and surprisingly comfortable sole.", "tag": "Verified Buyer", "date": "2026-08-18"},
            {"author": "Tate K.", "rating": 4, "comment": "Lightweight despite the chunky profile. True to size.", "tag": "Verified Buyer", "date": "2026-08-30"}
        ],
        "isFeatured": True
    },
    {
        "name": "MATRIX Y2K RIMLESS CHROMIUM SHADES",
        "slug": "matrix-y2k-rimless-chromium-shades",
        "price": 999,
        "compareAtPrice": 1499,
        "category": "Cyber Accessories",
        "description": "Futuristic rimless wrap-around shades with mirror silver UV400 lenses, titanium-finish arms, and laser engraving on the temples.",
        "details": [
            "100% UV400 Polarized Mirror Lenses",
            "Rimless aerodynamic shield silhouette",
            "Ultralight flexible titanium-alloy arms",
            "Includes hard protective case & microfiber cloth"
        ],
        "sizes": ["ONE SIZE"],
        "colors": ["Silver Chrome", "Cyber Blue", "Pitch Black"],
        "stock": 45,
        "images": [
            "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&w=800&q=80"
        ],
        "badge": "ACCESSORY",
        "tags": ["accessories", "sunglasses", "y2k", "silver"],
        "rating": 4.9,
        "reviewCount": 3,
        "reviews": [
            {"author": "Suki C.", "rating": 5, "comment": "Clean mirror finish and comfortable nose pads.", "tag": "Verified Buyer", "date": "2026-08-14"},
            {"author": "Leo M.", "rating": 5, "comment": "Lightweight frame that stays secure on move.", "tag": "Verified Buyer", "date": "2026-08-22"}
        ],
        "isFeatured": True
    },
    {
        "name": "BARBED WIRE INDUSTRIAL HEAVY CHAIN",
        "slug": "barbed-wire-industrial-heavy-chain",
        "price": 1199,
        "compareAtPrice": 1699,
        "category": "Cyber Accessories",
        "description": "Solid 316L stainless steel brutalist chain with modular barbed wire links and heavy padlock pendant. Never tarnishes, water-resistant, hypoallergenic.",
        "details": [
            "316L Surgical Grade Stainless Steel",
            "Rust-proof and tarnish-resistant",
            "55cm length with 5cm extension",
            "Weight: 98g (heavy hand-feel)"
        ],
        "sizes": ["ONE SIZE"],
        "colors": ["Raw Stainless Steel", "Matte Gunmetal"],
        "stock": 50,
        "images": [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1611591475155-42e9fba5ce55?auto=format&fit=crop&w=800&q=80"
        ],
        "badge": "STAINLESS STEEL",
        "tags": ["jewelry", "chain", "silver", "grunge"],
        "rating": 5.0,
        "reviewCount": 2,
        "reviews": [
            {"author": "Kieran D.", "rating": 5, "comment": "Heavy gauge steel with solid link connections.", "tag": "Verified Buyer", "date": "2026-08-21"}
        ],
        "isFeatured": False
    },
    {
        "name": "DISTRESSED ACID-WASH BAGGY DENIM",
        "slug": "distressed-acid-wash-baggy-denim",
        "price": 2799,
        "compareAtPrice": 3499,
        "category": "Bottoms & Cargos",
        "description": "13.5oz non-stretch rigid denim with vintage sandblast fade, knee slash distress, and sweeping floor-length hem tailored for chunky sneaker stacking.",
        "details": [
            "100% 13.5oz Rigid Cotton Denim",
            "Deep acid wash with sandblasted highlights",
            "Raw slash distressing at knee and hem",
            "Custom branded steel button fly",
            "Loose baggy fit throughout leg"
        ],
        "sizes": ["28", "30", "32", "34", "36"],
        "colors": ["Acid Grey Wash", "Vintage Indigo Wash"],
        "stock": 20,
        "images": [
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80"
        ],
        "badge": "STAFF PICK",
        "tags": ["jeans", "denim", "acid-wash", "baggy"],
        "rating": 4.7,
        "reviewCount": 2,
        "reviews": [
            {"author": "Marcus J.", "rating": 5, "comment": "Proper loose drape over footwear.", "tag": "Verified Buyer", "date": "2026-08-16"}
        ],
        "isFeatured": False
    },
    {
        "name": "CYBERPUNK UTILITY CROSSBODY RIG",
        "slug": "cyberpunk-utility-crossbody-rig",
        "price": 1399,
        "compareAtPrice": 1899,
        "category": "Cyber Accessories",
        "description": "Modular chest and shoulder rig with waterproof Cordura shell, quick-release alloy buckle, and headphone pass-through.",
        "details": [
            "Ballistic 1000D Cordura Waterproof Fabric",
            "Quick-release alloy buckle mechanism",
            "Key tether clip & hidden passport pocket",
            "Reflective print on front panel"
        ],
        "sizes": ["ONE SIZE"],
        "colors": ["Tactical Black", "Safety Orange"],
        "stock": 28,
        "images": [
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80"
        ],
        "badge": "ESSENTIAL",
        "tags": ["bag", "chest-rig", "tactical", "waterproof"],
        "rating": 4.9,
        "reviewCount": 2,
        "reviews": [
            {"author": "Devin H.", "rating": 5, "comment": "Solid buckle action and holds phone, power bank, and keys comfortably.", "tag": "Verified Buyer", "date": "2026-08-24"}
        ],
        "isFeatured": False
    }
]

# Reset MongoDB Atlas with Rupees and clean data
def reseed_mongo():
    if products_col is not None:
        try:
            products_col.delete_many({})
            for item in DEMO_PRODUCTS:
                doc = dict(item)
                doc["createdAt"] = datetime.datetime.now()
                products_col.insert_one(doc)
            print("[MongoDB Atlas] Seeded fresh INR catalog without emojis.")
        except Exception as e:
            print("[MongoDB Atlas] Seed error:", e)

reseed_mongo()

memory_products = json.loads(json.dumps(DEMO_PRODUCTS))
for idx, p in enumerate(memory_products):
    p["_id"] = f"mem_prod_{idx+1}"
    p["createdAt"] = datetime.datetime.now().isoformat()
memory_orders = []
memory_users = []

def serialize_doc(doc):
    if not doc: return None
    doc = dict(doc)
    if "_id" in doc: doc["_id"] = str(doc["_id"])
    if "createdAt" in doc and isinstance(doc["createdAt"], datetime.datetime):
        doc["createdAt"] = doc["createdAt"].isoformat()
    return doc

def get_current_user_from_req(req):
    auth_header = req.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()
    if not token:
        # Check query or custom header
        token = req.headers.get("x-user-token", "")
    if not token:
        return None

    if users_col is not None:
        return users_col.find_one({"token": token})
    else:
        return next((u for u in memory_users if u.get("token") == token), None)

# --- API ROUTES ---

@app.route("/api/config", methods=["GET"])
def get_config():
    cfg = load_store_config()
    is_mongo = products_col is not None
    return jsonify({
        "success": True,
        "config": cfg,
        "dbStatus": {
            "connected": is_mongo,
            "engine": "MongoDB Atlas" if is_mongo else "In-Memory Engine",
            "host": "cluster0.lh2x5xg.mongodb.net" if is_mongo else "Local"
        }
    })

# GET Products
@app.route("/api/products", methods=["GET"])
def get_products():
    try:
        category = request.args.get("category")
        search = request.args.get("search")
        min_price = request.args.get("minPrice")
        max_price = request.args.get("maxPrice")
        size = request.args.get("size")
        sort_by = request.args.get("sort")
        featured = request.args.get("featured")

        if products_col is not None:
            query = {}
            if category and category not in ["All Items", "all"]:
                query["category"] = category
            if search and search.strip():
                s = search.strip()
                query["$or"] = [
                    {"name": {"$regex": s, "$options": "i"}},
                    {"description": {"$regex": s, "$options": "i"}},
                    {"tags": {"$regex": s, "$options": "i"}},
                    {"category": {"$regex": s, "$options": "i"}}
                ]
            if min_price or max_price:
                query["price"] = {}
                if min_price: query["price"]["$gte"] = float(min_price)
                if max_price: query["price"]["$lte"] = float(max_price)
            if size and size != "all":
                query["sizes"] = size
            if featured == "true":
                query["isFeatured"] = True

            cursor = products_col.find(query)
            if sort_by == "price-asc": cursor = cursor.sort("price", 1)
            elif sort_by == "price-desc": cursor = cursor.sort("price", -1)
            elif sort_by == "rating": cursor = cursor.sort("rating", -1)
            elif sort_by == "newest": cursor = cursor.sort("createdAt", -1)

            results = [serialize_doc(d) for d in cursor]
            return jsonify({"success": True, "count": len(results), "products": results})
        else:
            prods = list(memory_products)
            if category and category not in ["All Items", "all"]:
                prods = [p for p in prods if p.get("category") == category]
            if search and search.strip():
                s = search.strip().lower()
                prods = [p for p in prods if s in p.get("name", "").lower() or s in p.get("description", "").lower() or any(s in t.lower() for t in p.get("tags", []))]
            if min_price: prods = [p for p in prods if p.get("price", 0) >= float(min_price)]
            if max_price: prods = [p for p in prods if p.get("price", 0) <= float(max_price)]
            if size and size != "all": prods = [p for p in prods if size in p.get("sizes", [])]
            if featured == "true": prods = [p for p in prods if p.get("isFeatured")]

            if sort_by == "price-asc": prods.sort(key=lambda x: x.get("price", 0))
            elif sort_by == "price-desc": prods.sort(key=lambda x: x.get("price", 0), reverse=True)
            elif sort_by == "rating": prods.sort(key=lambda x: x.get("rating", 0), reverse=True)

            return jsonify({"success": True, "count": len(prods), "products": prods})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# GET Product by ID or Slug
@app.route("/api/products/<id_or_slug>", methods=["GET"])
def get_product(id_or_slug):
    try:
        if products_col is not None:
            doc = None
            if ObjectId.is_valid(id_or_slug):
                doc = products_col.find_one({"_id": ObjectId(id_or_slug)})
            if not doc:
                doc = products_col.find_one({"slug": id_or_slug})
            if not doc:
                return jsonify({"success": False, "message": "Product not found"}), 404
            return jsonify({"success": True, "product": serialize_doc(doc)})
        else:
            prod = next((p for p in memory_products if p.get("_id") == id_or_slug or p.get("slug") == id_or_slug), None)
            if not prod:
                return jsonify({"success": False, "message": "Product not found"}), 404
            return jsonify({"success": True, "product": prod})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# POST Create Product (Admin)
@app.route("/api/products", methods=["POST"])
def create_product():
    admin_key = request.headers.get("x-admin-key")
    if admin_key != ADMIN_PASSWORD:
        return jsonify({"success": False, "message": "Admin authorization required."}), 401
    
    data = request.json or {}
    if not data.get("name") or not data.get("price"):
        return jsonify({"success": False, "message": "Product Name and Price are required."}), 400

    data["price"] = float(data["price"])
    data["compareAtPrice"] = float(data.get("compareAtPrice", 0) or 0)
    data["stock"] = int(data.get("stock", 20) or 20)
    data["slug"] = data["name"].lower().replace(" ", "-").replace("/", "-")
    data["rating"] = float(data.get("rating", 5.0) or 5.0)
    data["reviewCount"] = int(data.get("reviewCount", 0) or 0)
    if "reviews" not in data: data["reviews"] = []

    for key in ["sizes", "colors", "tags", "images"]:
        if isinstance(data.get(key), str):
            data[key] = [x.strip() for x in data[key].split(",") if x.strip()]
    if isinstance(data.get("details"), str):
        data["details"] = [x.strip() for x in data["details"].split("\n") if x.strip()]

    if not data.get("images"):
        data["images"] = ["https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=800&q=80"]

    if products_col is not None:
        data["createdAt"] = datetime.datetime.now()
        res = products_col.insert_one(data)
        data["_id"] = str(res.inserted_id)
        data["createdAt"] = data["createdAt"].isoformat()
        return jsonify({"success": True, "product": data, "message": "Product added to catalog successfully!"}), 201
    else:
        data["_id"] = f"mem_prod_{len(memory_products)+1}"
        data["createdAt"] = datetime.datetime.now().isoformat()
        memory_products.insert(0, data)
        return jsonify({"success": True, "product": data, "message": "Product added to local catalog!"}), 201

# PUT Update Product (Admin)
@app.route("/api/products/<product_id>", methods=["PUT"])
def update_product(product_id):
    admin_key = request.headers.get("x-admin-key")
    if admin_key != ADMIN_PASSWORD:
        return jsonify({"success": False, "message": "Admin authorization required."}), 401

    data = request.json or {}
    if "price" in data: data["price"] = float(data["price"])
    if "compareAtPrice" in data: data["compareAtPrice"] = float(data.get("compareAtPrice", 0) or 0)
    if "stock" in data: data["stock"] = int(data["stock"])

    for key in ["sizes", "colors", "tags", "images"]:
        if isinstance(data.get(key), str):
            data[key] = [x.strip() for x in data[key].split(",") if x.strip()]
    if isinstance(data.get("details"), str):
        data["details"] = [x.strip() for x in data["details"].split("\n") if x.strip()]

    if products_col is not None:
        if ObjectId.is_valid(product_id):
            products_col.update_one({"_id": ObjectId(product_id)}, {"$set": data})
            updated = products_col.find_one({"_id": ObjectId(product_id)})
            return jsonify({"success": True, "product": serialize_doc(updated), "message": "Product updated successfully!"})
        return jsonify({"success": False, "message": "Invalid Product ID"}), 400
    else:
        prod = next((p for p in memory_products if p.get("_id") == product_id), None)
        if not prod: return jsonify({"success": False, "message": "Product not found."}), 404
        prod.update(data)
        return jsonify({"success": True, "product": prod, "message": "Product updated!"})

# DELETE Product (Admin)
@app.route("/api/products/<product_id>", methods=["DELETE"])
def delete_product(product_id):
    admin_key = request.headers.get("x-admin-key")
    if admin_key != ADMIN_PASSWORD:
        return jsonify({"success": False, "message": "Admin authorization required."}), 401

    if products_col is not None:
        if ObjectId.is_valid(product_id):
            res = products_col.delete_one({"_id": ObjectId(product_id)})
            if res.deleted_count > 0:
                return jsonify({"success": True, "message": "Product deleted successfully!"})
        return jsonify({"success": False, "message": "Product not found."}), 404
    else:
        global memory_products
        prev_len = len(memory_products)
        memory_products = [p for p in memory_products if p.get("_id") != product_id]
        if len(memory_products) < prev_len:
            return jsonify({"success": True, "message": "Product deleted!"})
        return jsonify({"success": False, "message": "Product not found."}), 404

# POST Add Review (AUTH REQUIRED)
@app.route("/api/products/<product_id>/reviews", methods=["POST"])
def add_review(product_id):
    data = request.json or {}
    rating = float(data.get("rating", 5) or 5)
    comment = data.get("comment", "").strip()
    tag = data.get("tag", "Verified Buyer")
    
    # Check User Auth
    user = get_current_user_from_req(request)
    author = data.get("author", "").strip()
    user_email = ""

    if user:
        author = user.get("name", author or "Verified Customer")
        user_email = user.get("email", "")
    elif not author:
        return jsonify({
            "success": False,
            "requiresAuth": True,
            "message": "Authentication required. Please sign in to submit a review."
        }), 401

    if not comment:
        return jsonify({"success": False, "message": "Review comment cannot be empty."}), 400

    review_obj = {
        "author": author,
        "userEmail": user_email,
        "rating": rating,
        "comment": comment,
        "tag": tag,
        "date": datetime.datetime.now().strftime("%Y-%m-%d")
    }

    if products_col is not None:
        if ObjectId.is_valid(product_id):
            doc = products_col.find_one({"_id": ObjectId(product_id)})
            if not doc: return jsonify({"success": False, "message": "Product not found"}), 404
            reviews = doc.get("reviews", [])
            reviews.insert(0, review_obj)
            avg_rating = round(sum(r.get("rating", 5) for r in reviews) / len(reviews), 1)
            products_col.update_one(
                {"_id": ObjectId(product_id)},
                {"$set": {"reviews": reviews, "rating": avg_rating, "reviewCount": len(reviews)}}
            )
            return jsonify({"success": True, "message": "Review submitted successfully.", "reviews": reviews, "rating": avg_rating})
    else:
        prod = next((p for p in memory_products if p.get("_id") == product_id), None)
        if not prod: return jsonify({"success": False, "message": "Product not found"}), 404
        if "reviews" not in prod: prod["reviews"] = []
        prod["reviews"].insert(0, review_obj)
        prod["rating"] = round(sum(r.get("rating", 5) for r in prod["reviews"]) / len(prod["reviews"]), 1)
        prod["reviewCount"] = len(prod["reviews"])
        return jsonify({"success": True, "message": "Review added!", "reviews": prod["reviews"], "rating": prod["rating"]})

# POST Place Order
@app.route("/api/orders", methods=["POST"])
def place_order():
    data = request.json or {}
    items = data.get("items", [])
    customer = data.get("customer", {})
    shipping_address = data.get("shippingAddress", {})
    payment_method = data.get("paymentMethod", "card")
    promo_code = data.get("promoCode", "")
    shipping_method = data.get("shippingMethod", {})

    # Check if user is logged in
    user = get_current_user_from_req(request)
    if not user and not customer.get("email"):
        return jsonify({
            "success": False,
            "requiresAuth": True,
            "message": "Please sign in or create an account to proceed with checkout."
        }), 401

    if not items:
        return jsonify({"success": False, "message": "Your bag is empty."}), 400
    if not customer.get("name") or not customer.get("email") or not shipping_address.get("street"):
        return jsonify({"success": False, "message": "Please provide full name, email, and shipping address."}), 400

    cfg = load_store_config()
    subtotal = sum(float(it.get("price", 0)) * int(it.get("quantity", 1)) for it in items)
    promo_info = cfg.get("promoCodes", {}).get(promo_code.upper()) if promo_code else None

    free_thresh = cfg.get("freeShippingThreshold", 1999)
    discount = 0.0
    shipping_cost = float(shipping_method.get("cost", 0) if shipping_method else (0 if subtotal >= free_thresh else 199))

    if promo_info:
        if "discountPercent" in promo_info:
            discount = round((subtotal * promo_info["discountPercent"]) / 100.0, 2)
        if promo_info.get("freeShipping"):
            shipping_cost = 0.0

    tax = round((subtotal - discount) * 0.05, 2) # 5% GST
    total = round(subtotal - discount + shipping_cost + tax, 2)

    order_num = "HV-" + "".join(random.choices(string.digits, k=6))
    tracking_num = "TRK-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

    order_doc = {
        "orderNumber": order_num,
        "customer": customer,
        "userEmail": customer.get("email", "").lower(),
        "shippingAddress": shipping_address,
        "shippingMethod": shipping_method or {"name": "Standard Delivery", "cost": shipping_cost},
        "paymentMethod": payment_method,
        "paymentStatus": "Pending" if payment_method == "cod" else "Paid",
        "orderStatus": "Processing",
        "items": items,
        "subtotal": subtotal,
        "discount": discount,
        "shippingCost": shipping_cost,
        "tax": tax,
        "total": total,
        "promoCode": promo_code,
        "trackingNumber": tracking_num,
        "createdAt": datetime.datetime.now()
    }

    if orders_col is not None:
        res = orders_col.insert_one(order_doc)
        order_doc["_id"] = str(res.inserted_id)
        order_doc["createdAt"] = order_doc["createdAt"].isoformat()

        # Update saved address on user document if logged in
        if user:
            users_col.update_one(
                {"_id": user["_id"]},
                {"$set": {"savedAddress": shipping_address, "phone": customer.get("phone", "")}}
            )

        # Decrement stock in Mongo
        for it in items:
            p_id = it.get("product") or it.get("_id")
            if p_id and ObjectId.is_valid(p_id):
                products_col.update_one(
                    {"_id": ObjectId(p_id)},
                    {"$inc": {"stock": -int(it.get("quantity", 1))}}
                )
    else:
        order_doc["_id"] = f"mem_ord_{len(memory_orders)+1}"
        order_doc["createdAt"] = order_doc["createdAt"].isoformat()
        memory_orders.insert(0, order_doc)

    return jsonify({
        "success": True,
        "order": order_doc,
        "message": f"Order {order_num} placed successfully!"
    }), 201

# GET Orders (Admin)
@app.route("/api/orders", methods=["GET"])
def get_orders():
    admin_key = request.headers.get("x-admin-key")
    if admin_key != ADMIN_PASSWORD:
        return jsonify({"success": False, "message": "Admin authorization required."}), 401

    if orders_col is not None:
        docs = orders_col.find().sort("createdAt", -1)
        results = [serialize_doc(d) for d in docs]
        return jsonify({"success": True, "count": len(results), "orders": results})
    else:
        return jsonify({"success": True, "count": len(memory_orders), "orders": memory_orders})

# PUT Order Status (Admin)
@app.route("/api/orders/<order_id>/status", methods=["PUT"])
def update_order_status(order_id):
    admin_key = request.headers.get("x-admin-key")
    if admin_key != ADMIN_PASSWORD:
        return jsonify({"success": False, "message": "Admin authorization required."}), 401

    data = request.json or {}
    status = data.get("status")
    tracking_num = data.get("trackingNumber")

    if status not in ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]:
        return jsonify({"success": False, "message": "Invalid status."}), 400

    update_fields = {"orderStatus": status}
    if tracking_num: update_fields["trackingNumber"] = tracking_num

    if orders_col is not None:
        if ObjectId.is_valid(order_id):
            orders_col.update_one({"_id": ObjectId(order_id)}, {"$set": update_fields})
        else:
            orders_col.update_one({"orderNumber": order_id}, {"$set": update_fields})
        return jsonify({"success": True, "message": f"Order marked as {status}!"})
    else:
        order = next((o for o in memory_orders if o.get("_id") == order_id or o.get("orderNumber") == order_id), None)
        if not order: return jsonify({"success": False, "message": "Order not found"}), 404
        order.update(update_fields)
        return jsonify({"success": True, "message": f"Order marked as {status}!"})

# --- USER PROFILE & AUTH ENDPOINTS ---

@app.route("/api/auth/register", methods=["POST"])
def customer_register():
    data = request.json or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not name or not email or not password:
        return jsonify({"success": False, "message": "All fields are required."}), 400

    token = "tok_" + "".join(random.choices(string.ascii_letters + string.digits, k=32))
    user_doc = {
        "name": name,
        "email": email,
        "password": password,
        "token": token,
        "role": "customer",
        "phone": data.get("phone", ""),
        "savedAddress": {},
        "createdAt": datetime.datetime.now()
    }

    if users_col is not None:
        existing = users_col.find_one({"email": email})
        if existing:
            return jsonify({"success": False, "message": "Email already registered. Please sign in."}), 400
        res = users_col.insert_one(user_doc)
        user_doc["_id"] = str(res.inserted_id)
        user_doc["createdAt"] = user_doc["createdAt"].isoformat()
    else:
        if any(u.get("email") == email for u in memory_users):
            return jsonify({"success": False, "message": "Email already registered."}), 400
        user_doc["_id"] = f"mem_u_{len(memory_users)+1}"
        user_doc["createdAt"] = user_doc["createdAt"].isoformat()
        memory_users.append(user_doc)

    return jsonify({
        "success": True,
        "token": token,
        "user": {"name": name, "email": email, "role": "customer", "savedAddress": {}},
        "message": "Account created successfully."
    }), 201

@app.route("/api/auth/login", methods=["POST"])
def customer_login():
    data = request.json or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "").strip()

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required."}), 400

    user = None
    if users_col is not None:
        user = users_col.find_one({"email": email, "password": password})
    else:
        user = next((u for u in memory_users if u.get("email") == email and u.get("password") == password), None)

    if not user:
        return jsonify({"success": False, "message": "Invalid email or password."}), 401

    token = user.get("token")
    if not token:
        token = "tok_" + "".join(random.choices(string.ascii_letters + string.digits, k=32))
        if users_col is not None:
            users_col.update_one({"_id": user["_id"]}, {"$set": {"token": token}})
        else:
            user["token"] = token

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone", ""),
            "role": user.get("role", "customer"),
            "savedAddress": user.get("savedAddress", {})
        },
        "message": "Welcome back!"
    })

# GET User Profile Data
@app.route("/api/user/profile", methods=["GET"])
def get_user_profile():
    user = get_current_user_from_req(request)
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    return jsonify({
        "success": True,
        "user": {
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone", ""),
            "savedAddress": user.get("savedAddress", {}),
            "createdAt": user.get("createdAt").isoformat() if isinstance(user.get("createdAt"), datetime.datetime) else str(user.get("createdAt", ""))
        }
    })

# PUT Update User Profile & Address
@app.route("/api/user/profile", methods=["PUT"])
def update_user_profile():
    user = get_current_user_from_req(request)
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    data = request.json or {}
    updates = {}
    if "name" in data: updates["name"] = data["name"].strip()
    if "phone" in data: updates["phone"] = data["phone"].strip()
    if "savedAddress" in data: updates["savedAddress"] = data["savedAddress"]

    if users_col is not None:
        users_col.update_one({"_id": user["_id"]}, {"$set": updates})
        updated = users_col.find_one({"_id": user["_id"]})
        return jsonify({
            "success": True,
            "message": "Profile updated successfully.",
            "user": {
                "name": updated.get("name"),
                "email": updated.get("email"),
                "phone": updated.get("phone", ""),
                "savedAddress": updated.get("savedAddress", {})
            }
        })
    else:
        user.update(updates)
        return jsonify({"success": True, "message": "Profile updated.", "user": user})

# GET User's Past Orders
@app.route("/api/user/orders", methods=["GET"])
def get_user_orders():
    user = get_current_user_from_req(request)
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    email = user.get("email", "").lower()
    if orders_col is not None:
        docs = orders_col.find({"$or": [{"userEmail": email}, {"customer.email": email}]}).sort("createdAt", -1)
        results = [serialize_doc(d) for d in docs]
        return jsonify({"success": True, "count": len(results), "orders": results})
    else:
        orders = [o for o in memory_orders if o.get("userEmail") == email or o.get("customer", {}).get("email") == email]
        return jsonify({"success": True, "count": len(orders), "orders": orders})

# GET User's Submitted Reviews
@app.route("/api/user/reviews", methods=["GET"])
def get_user_reviews():
    user = get_current_user_from_req(request)
    if not user:
        return jsonify({"success": False, "message": "Authentication required."}), 401

    email = user.get("email", "").lower()
    user_name = user.get("name", "").lower()
    user_reviews = []

    if products_col is not None:
        docs = products_col.find({"reviews": {"$exists": True, "$not": {"$size": 0}}})
        for p in docs:
            p_id = str(p["_id"])
            p_name = p.get("name", "Product")
            p_img = (p.get("images") or [""])[0]
            for r in p.get("reviews", []):
                if (r.get("userEmail") and r.get("userEmail").lower() == email) or (r.get("author", "").lower() == user_name):
                    user_reviews.append({
                        "productId": p_id,
                        "productName": p_name,
                        "productImage": p_img,
                        "rating": r.get("rating", 5),
                        "comment": r.get("comment", ""),
                        "tag": r.get("tag", "Verified Buyer"),
                        "date": str(r.get("date", ""))
                    })
    else:
        for p in memory_products:
            for r in p.get("reviews", []):
                if (r.get("userEmail") and r.get("userEmail").lower() == email) or (r.get("author", "").lower() == user_name):
                    user_reviews.append({
                        "productId": p.get("_id"),
                        "productName": p.get("name"),
                        "productImage": (p.get("images") or [""])[0],
                        "rating": r.get("rating", 5),
                        "comment": r.get("comment", ""),
                        "tag": r.get("tag", "Verified Buyer"),
                        "date": str(r.get("date", ""))
                    })

    return jsonify({"success": True, "count": len(user_reviews), "reviews": user_reviews})

# Admin Login
@app.route("/api/auth/admin-login", methods=["POST"])
def admin_login():
    data = request.json or {}
    password = data.get("password")
    if password == ADMIN_PASSWORD:
        return jsonify({"success": True, "token": ADMIN_PASSWORD, "message": "Admin access granted."})
    return jsonify({"success": False, "message": "Incorrect Admin password."}), 401

# Reset Catalog
@app.route("/api/admin/reset-catalog", methods=["POST"])
def reset_catalog():
    admin_key = request.headers.get("x-admin-key")
    if admin_key != ADMIN_PASSWORD:
        return jsonify({"success": False, "message": "Admin authorization required."}), 401

    reseed_mongo()
    return jsonify({"success": True, "message": f"Catalog refreshed with {len(DEMO_PRODUCTS)} streetwear drops!"})

# Static Page Handlers
@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")

@app.route("/product")
def product_page():
    return send_from_directory(STATIC_DIR, "product.html")

@app.route("/checkout")
def checkout_page():
    return send_from_directory(STATIC_DIR, "checkout.html")

@app.route("/auth")
def auth_page():
    return send_from_directory(STATIC_DIR, "auth.html")

@app.route("/profile")
def profile_page():
    return send_from_directory(STATIC_DIR, "profile.html")

@app.route("/admin")
def admin_page():
    return send_from_directory(STATIC_DIR, "admin.html")

@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(STATIC_DIR, filename)

# Automatically register route aliases without /api prefix for Vercel compatibility
for rule in list(app.url_map.iter_rules()):
    if rule.rule.startswith("/api/"):
        stripped_rule = rule.rule[4:]
        if stripped_rule not in ["/product", "/checkout", "/auth", "/profile", "/admin"]:
            endpoint_name = rule.endpoint + "_vercel_alias"
            if endpoint_name not in app.view_functions:
                methods = [m for m in rule.methods if m not in ["HEAD", "OPTIONS"]]
                app.add_url_rule(stripped_rule, endpoint_name, app.view_functions[rule.endpoint], methods=methods)

@app.errorhandler(404)
def handle_404(e):
    if request.path.startswith("/api") or "api" in request.path or request.headers.get("Accept", "").find("json") != -1:
        return jsonify({"success": False, "message": f"API route {request.path} not found"}), 404
    return send_from_directory(STATIC_DIR, "index.html"), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n{'='*60}")
    print(f"[STORE RUNNING] http://localhost:{port}")
    print(f"[ADMIN PANEL]   http://localhost:{port}/admin (Password: {ADMIN_PASSWORD})")
    print(f"[USER PROFILE]  http://localhost:{port}/profile")
    print(f"{'='*60}\n")
    app.run(host="0.0.0.0", port=port, debug=True)
