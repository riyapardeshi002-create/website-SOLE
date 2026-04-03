# 🥿 SOLE Store — Full-Stack Setup Guide
## React + Express + PostgreSQL

---

## 📁 Project Structure

```
sole-store/
├── backend/                  ← Node.js / Express API
│   ├── config/
│   │   └── db.js             ← PostgreSQL connection pool
│   ├── middleware/
│   │   ├── auth.js           ← JWT protect / optionalAuth
│   │   └── errorHandler.js   ← Global error handler
│   ├── routes/
│   │   ├── auth.js           ← /api/auth/*
│   │   ├── products.js       ← /api/products/*
│   │   ├── cart.js           ← /api/cart/*
│   │   ├── orders.js         ← /api/orders/*
│   │   └── wishlist.js       ← /api/wishlist/*
│   ├── sql/
│   │   ├── schema.sql        ← ALL tables, indexes, triggers, views
│   │   └── seed.sql          ← 8 products + brands + categories + sizes + colors
│   ├── scripts/
│   │   ├── initDB.js         ← Creates DB + applies schema
│   │   └── seedDB.js         ← Inserts seed data
│   ├── server.js             ← Express entry point
│   ├── package.json
│   └── .env.example          ← Copy to .env and fill in
│
└── frontend/                 ← React app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── api/
    │   │   └── client.js     ← Axios instance + all API helpers
    │   ├── context/
    │   │   ├── AuthContext.js ← Login/logout/register state
    │   │   └── CartContext.js ← Cart state synced with backend
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── Footer.js
    │   │   └── ProductCard.js
    │   ├── pages/
    │   │   ├── Home.js
    │   │   ├── Products.js
    │   │   ├── ProductDetail.js
    │   │   ├── Cart.js
    │   │   ├── Checkout.js
    │   │   ├── Login.js
    │   │   ├── Signup.js
    │   │   └── Dashboard.js
    │   ├── App.js            ← Routes
    │   ├── index.js          ← Entry point
    │   └── index.css         ← Global styles
    └── package.json
```

---

## 🗄️ Database Schema (PostgreSQL)

### Tables
| Table | Description |
|---|---|
| `users` | Accounts with hashed passwords, member tier, address |
| `brands` | Nike, Adidas, Puma, etc. |
| `categories` | Running, Casual, Sports |
| `products` | Main product table with price, badge, stock, rating |
| `product_images` | Multiple images per product |
| `product_sizes` | US sizes 6–12 with stock per size |
| `product_colors` | Hex color options per product |
| `reviews` | User reviews with rating, title, body |
| `carts` | One cart per user |
| `cart_items` | Items in cart with qty, size, color |
| `orders` | Placed orders with status, shipping address |
| `order_items` | Snapshot of items at order time (price locked) |
| `wishlist` | Saved products per user |
| `refresh_tokens` | JWT refresh token store |

### Auto Triggers
- `updated_at` auto-updates on users, products, orders, carts
- **Member tier** auto-updates when `total_spent` changes (Bronze→Silver→Gold→Platinum)
- **Product rating** auto-recalculates when a review is added

### Views
- `v_products` — full product with brand, category, images, sizes, colors
- `v_orders` — orders joined with user info and items array

---

## ⚙️ STEP-BY-STEP SETUP

### Prerequisites
- Node.js 18+ — https://nodejs.org
- PostgreSQL 14+ — https://www.postgresql.org/download/
- npm or yarn

---

### STEP 1 — Install PostgreSQL

**Mac:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
Download installer from https://www.postgresql.org/download/windows/

---

### STEP 2 — Create PostgreSQL User (if needed)

```bash
# Open psql as postgres user
sudo -u postgres psql

# Inside psql:
CREATE USER myuser WITH PASSWORD 'mypassword';
ALTER USER myuser CREATEDB;
\q
```

---

### STEP 3 — Setup Backend

```bash
# Navigate to backend folder
cd sole-store/backend

# Install dependencies
npm install

# Copy .env.example to .env
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=sole_store
DB_USER=postgres          ← your postgres username
DB_PASSWORD=yourpassword  ← your postgres password

JWT_SECRET=make_this_a_long_random_string_at_least_32_chars
JWT_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000
```

---

### STEP 4 — Initialize Database

```bash
# Still inside backend/
# This creates the DB, applies schema, and seeds data:
npm run db:reset
```

You should see:
```
✅ Created database: sole_store
✅ Schema applied
✅ Seed data inserted
```

To reset at any time: `npm run db:reset`
To only seed: `npm run db:seed`

**Verify manually (optional):**
```bash
psql -U postgres -d sole_store -c "SELECT name, price FROM products;"
```

---

### STEP 5 — Start Backend

```bash
npm run dev   # development (auto-restarts)
# OR
npm start     # production
```

You should see:
```
🚀  SOLE API  →  http://localhost:5000
🗃️   Database  →  sole_store @ localhost
```

Test it: http://localhost:5000/health

---

### STEP 6 — Setup Frontend

```bash
# Open a NEW terminal
cd sole-store/frontend

# Install dependencies
npm install
```

Create `.env` file in frontend/:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### STEP 7 — Start Frontend

```bash
npm start
```

Opens at: **http://localhost:3000** 🎉

---

## 🔌 How Frontend Connects to Backend

### The Connection Flow

```
React (port 3000)
    │
    ├── src/api/client.js       ← Axios configured with baseURL
    │        │                     pointing to http://localhost:5000/api
    │        │
    │        ▼
    ├── AuthContext.js          ← Calls /api/auth/login, /register, /me
    │        │                     Stores JWT token in localStorage
    │        │
    │        ▼
    ├── CartContext.js          ← Calls /api/cart/* with JWT in header
    │
    ▼
Express (port 5000)
    │
    ├── server.js               ← CORS allows localhost:3000
    │
    ├── middleware/auth.js      ← Reads JWT from Authorization header
    │        │
    ├── routes/auth.js          ← /api/auth/*
    ├── routes/products.js      ← /api/products/*
    ├── routes/cart.js          ← /api/cart/*
    ├── routes/orders.js        ← /api/orders/*
    └── routes/wishlist.js      ← /api/wishlist/*
    │
    ▼
PostgreSQL (port 5432)
    └── sole_store database
```

### JWT Authentication Flow

```
1. User fills Login form
2. Frontend → POST /api/auth/login { email, password }
3. Backend verifies password with bcrypt
4. Backend returns { token, user }
5. Frontend stores token in localStorage
6. Every subsequent API call includes:
   Authorization: Bearer <token>
7. Backend middleware verifies token on protected routes
8. If 401 received → frontend clears token + logs out
```

### Cart Sync Flow

```
1. User logs in → CartContext fetches cart from DB
2. User clicks "Add to Cart" → POST /api/cart/items
3. Backend saves to cart_items table
4. Response returns updated items list
5. CartContext updates React state
6. Navbar badge updates automatically
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET  | `/api/auth/me` | Yes | Get current user |
| PUT  | `/api/auth/profile` | Yes | Update profile |
| PUT  | `/api/auth/change-password` | Yes | Change password |

### Products
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | No | List with filters |
| GET | `/api/products/featured` | No | Top 8 by rating |
| GET | `/api/products/:id` | No | Single product |
| GET | `/api/products/:id/reviews` | No | Product reviews |
| POST | `/api/products/:id/reviews` | Yes | Add review |

**Product Query Params:**
```
?category=running
?brand=Nike
?badge=Sale
?minPrice=100&maxPrice=200
?search=air
?sort=price_asc|price_desc|rating|newest
?page=1&limit=20
```

### Cart (all require auth)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add item |
| PUT | `/api/cart/items/:id` | Update qty |
| DELETE | `/api/cart/items/:id` | Remove item |
| DELETE | `/api/cart` | Clear cart |

### Orders (all require auth)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Place order (from cart) |
| GET | `/api/orders` | List my orders |
| GET | `/api/orders/:id` | Order detail |
| PUT | `/api/orders/:id/cancel` | Cancel order |

### Other
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | No | All categories |
| GET | `/api/wishlist` | Yes | Get wishlist |
| POST | `/api/wishlist` | Yes | Add to wishlist |
| DELETE | `/api/wishlist/:productId` | Yes | Remove from wishlist |
| GET | `/api/dashboard/stats` | Yes | User stats |

---

## 🔒 Security Features

- **Passwords** hashed with bcrypt (12 salt rounds)
- **JWT tokens** expire in 7 days, signed with secret key
- **SQL injection** prevented — all queries use parameterized `$1, $2` placeholders
- **CORS** restricted to frontend URL only
- **Input validation** with express-validator on all POST/PUT routes
- **Stock checks** before adding to cart and before placing order
- **Transaction** used for order creation (all-or-nothing with ROLLBACK)

---

## 🚀 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=<generate with: openssl rand -base64 64>
FRONTEND_URL=https://your-domain.com
DB_HOST=your-db-host
DB_PASSWORD=strong-production-password
```

### Deploy Options
- **Backend**: Railway, Render, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Database**: Supabase (free), Railway, Neon, AWS RDS

### Build Frontend for Production
```bash
cd frontend
npm run build
# Outputs to frontend/build/ — deploy this folder
```

---

## 🛠️ Common Issues

**"ECONNREFUSED" connecting to DB:**
```bash
# Check PostgreSQL is running:
sudo systemctl status postgresql   # Linux
brew services list | grep postgresql  # Mac
```

**"relation does not exist" error:**
```bash
# Schema wasn't applied — run:
npm run db:reset
```

**CORS error in browser:**
```
Check FRONTEND_URL in backend .env matches exactly where React runs
Default: FRONTEND_URL=http://localhost:3000
```

**401 Unauthorized:**
```
Token expired or invalid — log out and log in again
```

---

## 🧪 Test Accounts

After `npm run db:seed`, register any account via the UI.
The seed script does NOT create users (they register via the UI).

**Quick test flow:**
1. Go to http://localhost:3000/signup
2. Create account
3. Browse products, add to cart
4. Checkout (use any card details — it's a demo)
5. View order in Dashboard
