# Magic Checkout — Full-Stack Shopify Custom App

Shiprocket-style Magic Checkout with **Admin Panel + Backend + Shopify Integration + Razorpay Payments**

Built with: **Next.js 14 · Prisma (SQLite/PostgreSQL) · Razorpay · Shopify Admin API**

---

## 📁 Complete File Map

```
magic-checkout/
│
├── prisma/
│   ├── schema.prisma          ← All DB models (StoreConfig, Orders, Customers, Coupons)
│   └── seed.js                ← Creates default admin + demo data
│
├── lib/
│   ├── prisma.js              ← Singleton Prisma client
│   ├── auth.js                ← JWT sign/verify + cookie helpers + requireAdmin()
│   ├── shopify.js             ← Shopify REST/GraphQL + createShopifyOrder()
│   ├── razorpay-server.js     ← Server-side Razorpay order + signature verify
│   ├── useAdmin.js            ← React hook: admin auth state + shopDomain
│   └── useCheckoutConfig.js   ← React hook: fetches backend config for checkout
│
├── pages/
│   ├── index.jsx              ← Checkout frontend (100% driven by backend config)
│   ├── _app.jsx
│   ├── _document.jsx
│   │
│   ├── admin/
│   │   ├── login.jsx          ← Admin login page
│   │   ├── index.jsx          ← Dashboard: KPIs, charts, recent orders/customers
│   │   ├── orders.jsx         ← Orders list: filter, search, status update
│   │   ├── customers.jsx      ← Customer tracker: every phone number captured
│   │   ├── coupons.jsx        ← Full coupon CRUD
│   │   ├── store.jsx          ← Store settings: name, logo, colors, header/footer
│   │   └── payment.jsx        ← Razorpay keys + enable/disable each payment method
│   │
│   └── api/
│       ├── admin/
│       │   ├── auth.js        ← POST login/logout, GET me
│       │   ├── dashboard.js   ← GET stats, KPIs, daily revenue chart
│       │   ├── store-config.js← GET/PUT store settings (protected)
│       │   ├── coupons.js     ← GET/POST/PUT/DELETE coupons (protected)
│       │   ├── customers.js   ← GET customers with pagination + search (protected)
│       │   └── orders.js      ← GET/PUT orders with filters (protected)
│       │
│       ├── checkout/
│       │   ├── config.js      ← GET public config for checkout UI
│       │   ├── session.js     ← POST track customer phone entry
│       │   ├── validate-coupon.js ← POST validate coupon code
│       │   ├── create-order.js    ← POST create Razorpay order (uses store keys)
│       │   ├── verify-payment.js  ← POST verify + save order + create Shopify order
│       │   └── place-cod.js       ← POST place COD order
│       │
│       └── shopify/
│           ├── install.js     ← Shopify OAuth start
│           └── callback.js    ← OAuth callback + access token save
│
├── components/
│   ├── admin/
│   │   └── AdminLayout.jsx    ← Sidebar nav, header, mobile drawer
│   │
│   └── checkout/
│       ├── CheckoutHeader.jsx ← Dynamic header (banner text/color from backend)
│       ├── CheckoutFooter.jsx ← Dynamic footer links from backend
│       ├── OrderSummary.jsx   ← Collapsible order summary
│       ├── CouponSection.jsx  ← Coupon input + backend-driven unlock list
│       ├── PhoneStep.jsx      ← Mobile entry (auto-tracks to admin)
│       ├── DeliveryDetails.jsx← Address form
│       ├── DeliveryOptions.jsx← Express/Quick from backend config
│       ├── PaymentSection.jsx ← All 7 methods, enabled/disabled from backend
│       ├── OrderSuccess.jsx   ← Confirmation + timeline
│       └── Toast.jsx          ← Notification system
│
├── public/
│   └── checkout-embed.js      ← Drop into Shopify theme.liquid to activate
│
├── .env.local                 ← Your secrets (never commit)
├── .env.example               ← Template
└── package.json
```

---

## 🚀 Quick Start (MySQL + phpMyAdmin)

### ⚡ Windows Users (FASTEST WAY)
```bash
# Run this one command from project directory
setup.bat
```
That's it! It will:
1. Check if MySQL is running
2. Create the database
3. Install dependencies
4. Set up all tables
5. Seed demo data
6. Start the dev server

### 📋 Manual Setup (All Platforms)

**Step 1:** Ensure MySQL is running
- Windows/XAMPP: Start MySQL from XAMPP Control Panel
- Direct Windows: `net start MySQL80` (Command Prompt as Admin)
- macOS: `brew services start mysql`

**Step 2:** Create database in phpMyAdmin
1. Open: `http://localhost/phpmyadmin`
2. Login with your MySQL credentials
3. Click "New" → Database name: `magic_checkout_db`
4. Click "Create"

**Step 3:** Install Node dependencies
```bash
npm install
```

**Step 4:** Initialize database
```bash
npm run db:push
```

**Step 5:** Seed demo data
```bash
npm run db:seed
```

**Step 6:** Start development server
```bash
npm run dev
```

### 🌐 Access Points

| Link | Purpose |
|------|---------|
| `http://localhost:3000` | Customer checkout page |
| `http://localhost:3000/admin` | Admin dashboard login |
| `http://localhost/phpmyadmin` | Manage database directly |
| `http://localhost:5555` | Prisma Studio (run `npm run db:studio`) |

### 🔐 Default Credentials
```
Admin Email:    admin@magiccheckout.com
Admin Password: admin123
```

### 🎟️ Test Coupons
```
QTYDIS    → 20% off on 2+ items
SAVE10    → ₹500 flat discount
FIRST50   → 50% off
SHIPROCKET → ₹300 off
```

---

## 📊 Database Commands

```bash
npm run db:push           # Create/update tables
npm run db:studio        # Open Prisma Studio GUI
npm run db:seed          # Add demo data
npm run db:reset         # ⚠️ Delete all data & reset
npm run db:generate      # Regenerate Prisma client
npm run db:migrate       # Create named migration
```

For detailed database setup guide, see: **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** or **[DB_COMMANDS.md](./DB_COMMANDS.md)**

---

## ⚙️ Environment Configuration

Copy `.env.example` → `.env.local` and update:

```env
# 📊 DATABASE (MySQL with phpMyAdmin)
DATABASE_URL="mysql://root:root@localhost:3306/magic_checkout_db"

# 🔐 JWT SECRET (change in production!)
JWT_SECRET="super-secret-key-12345"

# 🌐 APP URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 🏪 SHOPIFY INTEGRATION (Optional)
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""
SHOPIFY_SHOP_DOMAIN=""
SHOPIFY_ACCESS_TOKEN=""

# 💳 RAZORPAY PAYMENTS (Optional)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""
```

---

## 🏪 Shopify Custom App Setup

### Option A — Private App (Access Token, simplest)
1. Shopify Admin → **Settings → Apps and sales channels → Develop apps**
2. Create app → **Configure Admin API scopes**: `read_products, write_orders, read_customers, write_customers`
3. Install app → Copy **Admin API access token** (`shpat_...`)
4. Paste in `.env.local` as `SHOPIFY_ACCESS_TOKEN`
5. Set `SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com`

### Option B — Public App (OAuth, multi-store)
1. Create app in [Shopify Partner Dashboard](https://partners.shopify.com)
2. Set **App URL**: `https://your-app.vercel.app`
3. Set **Redirect URL**: `https://your-app.vercel.app/api/shopify/callback`
4. Copy API Key + Secret → `.env.local`
5. Install via: `https://your-app.vercel.app/api/shopify/install?shop=STORE.myshopify.com`

### Embed Checkout in Shopify Theme
Add to your `theme.liquid` before `</body>`:
```html
<script src="https://your-app.vercel.app/checkout-embed.js" 
        data-shop="{{ shop.permanent_domain }}"
        data-app-url="https://your-app.vercel.app">
</script>
```
Or install via Shopify Script Tags API.

---

## 🎛 Admin Panel Features

| Page | What you can manage |
|------|-------------------|
| **Dashboard** | Revenue KPIs, order counts, daily chart, payment method breakdown |
| **Orders** | All orders, filter by status/method, update order status, view details |
| **Customers** | Every phone number entered at checkout, name, email, address, order history |
| **Coupons** | Create/edit/delete coupons, set % or flat discount, usage limits, expiry |
| **Store Settings** | Store name, logo URL, primary/secondary colors, header banner, footer links |
| **Payment Setup** | Razorpay API keys, enable/disable UPI/Card/NetBanking/Wallets/EMI/PayLater/COD |

---

## 💳 Razorpay Setup

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Settings → API Keys → Generate Test Key
3. Enter Key ID + Key Secret in **Admin → Payment Setup**
4. Test card: `4111 1111 1111 1111` | CVV: `123` | Expiry: any future date

> **No keys?** App runs in **Demo Mode** — all payments simulate success

---

## 🌐 Production Deployment (Vercel)

```bash
npx vercel --prod
```
Add all `.env.local` values in Vercel dashboard → Settings → Environment Variables.

For production DB, change `DATABASE_URL` to a PostgreSQL URL:
```
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```
Update `prisma/schema.prisma` datasource provider to `"postgresql"`.

---

## 🔐 Security Notes
- All `/api/admin/*` routes protected by `requireAdmin()` JWT middleware
- Razorpay secret never sent to frontend — all order creation server-side
- Payment signature verified server-side with HMAC-SHA256
- COD limit enforced on server, not just client
