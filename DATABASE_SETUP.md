# 🗄️ DATABASE SETUP GUIDE
## Local Development with phpMyAdmin & MySQL

---

## 📋 PREREQUISITES

Before starting, ensure you have:

1. **MySQL Server** installed and running
   - Windows: Download from [mysql.com](https://dev.mysql.com/downloads/mysql/)
   - Or use **XAMPP** (includes Apache + MySQL + phpMyAdmin)

2. **phpMyAdmin** access
   - If using XAMPP: `http://localhost/phpmyadmin`
   - Default credentials: `root` / (no password or `root`)

3. **Node.js & npm** installed

---

## 🚀 QUICK START (5 STEPS)

### Step 1: Create MySQL Database
```
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Click "New" in the left sidebar
3. Database name: magic_checkout_db
4. Collation: utf8mb4_unicode_ci
5. Click "Create"
```

### Step 2: Update Environment Variables
Edit `.env.local` and update the DATABASE_URL:
```env
DATABASE_URL="mysql://root:root@localhost:3306/magic_checkout_db"
```

**If your MySQL has a different username/password:**
```env
DATABASE_URL="mysql://your_username:your_password@localhost:3306/magic_checkout_db"
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Initialize Database (Create Tables)
```bash
npm run db:push
```

**Expected output:**
```
✔ Database tables created successfully
```

### Step 5: Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## 📊 DATABASE COMMANDS

### **Regular Development Commands**

| Command | Purpose |
|---------|---------|
| `npm run db:push` | Create/sync tables with MySQL database |
| `npm run db:studio` | Open Prisma Studio GUI (http://localhost:5555) |
| `npm run db:seed` | Add demo data (admin users, coupons) |
| `npm run db:generate` | Regenerate Prisma client after schema changes |

### **Advanced Commands**

| Command | Purpose |
|---------|---------|
| `npm run db:reset` | ⚠️ **DELETE ALL DATA** - Reset database to fresh state |
| `npm run db:migrate` | Create named migration for schema changes |
| `npm run build` | Build production code |
| `npm run start` | Run production build |

---

## 🛠️ TROUBLESHOOTING

### ❌ Error: "Can't connect to MySQL server"

**Solution:**
1. Check if MySQL is running:
   - **Windows (XAMPP):** Start MySQL from XAMPP Control Panel
   - **Windows (Direct):** Services → MySQL → Start
   - **Mac:** System Preferences → MySQL Server → Start

2. Verify credentials in `.env.local`:
   ```bash
   # Test connection
   mysql -u root -p -h localhost
   ```

### ❌ Error: "Unknown database 'magic_checkout_db'"

**Solution:**
1. Create database in phpMyAdmin (see Step 1 above)
2. Or via MySQL command:
   ```bash
   mysql -u root -p -e "CREATE DATABASE magic_checkout_db;"
   ```

### ❌ Error: "Access denied for user 'root'@'localhost'"

**Solution:**
1. Get your correct MySQL credentials
2. Update `.env.local` with correct username/password
3. Test connection:
   ```bash
   mysql -u your_username -p -h localhost
   ```

### ❌ Error: "Port 3306 already in use"

**Solution:**
1. Kill the process using port 3306:
   ```bash
   # Windows (PowerShell as Admin)
   Get-Process -Id (Get-NetTCPConnection -LocalPort 3306).OwningProcess | Stop-Process
   
   # Or find running MySQL and restart
   ```

### ❌ Tables not created after `npm run db:push`

**Solution:**
1. Clear Prisma cache: `npx prisma db push --force-reset`
2. Or manually check database:
   ```bash
   mysql -u root -p magic_checkout_db -e "SHOW TABLES;"
   ```

---

## 🔄 WORKFLOW: Making Schema Changes

### When you modify `prisma/schema.prisma`:

1. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

2. **Push changes to database:**
   ```bash
   npm run db:push
   ```

3. **View changes in Prisma Studio:**
   ```bash
   npm run db:studio
   ```

---

## 📍 Manage Data via phpMyAdmin

1. **Open phpMyAdmin:** `http://localhost/phpmyadmin`
2. **Select database:** `magic_checkout_db` (left sidebar)
3. **Browse tables:**
   - `AdminUser` - Admin accounts
   - `StoreConfig` - Shopify store settings
   - `Coupon` - Discount codes
   - `Order` - Customer orders
   - `CustomerSession` - Checkout sessions

---

## 🌱 Seed Demo Data

To add sample admin users and coupons:

```bash
npm run db:seed
```

Check `prisma/seed.js` to customize demo data.

---

## 🔐 Security Notes

⚠️ **For Production:**
- Use strong `JWT_SECRET` in `.env.local`
- Never commit `.env.local` to Git
- Use managed database services (Supabase, AWS RDS, etc.)
- Update Prisma schema provider:
  ```prisma
  datasource db {
    provider = "postgres"  // or mysql for managed MySQL
    url      = env("DATABASE_URL")
  }
  ```

---

## 📱 Database Schema Overview

```
AdminUser (Admin accounts)
├── id, email, passwordHash, name, role, timestamps

StoreConfig (Shopify store settings)
├── shopDomain, colors, payment methods, Razorpay keys
├── Feature flags (COD, UPI, Card, etc.)
└── Relations: Coupon, Order, CustomerSession

Coupon (Discount codes)
├── code, type (percent/flat), value, limits
└── Relation: StoreConfig

Order (Customer orders)
├── orderId, phone, email, items, total, payment status
├── paymentMethod, orderStatus
└── Relations: StoreConfig, CustomerSession

CustomerSession (Checkout sessions)
├── id, phone, name, email, address
└── Relation: StoreConfig
```

---

## 🆘 Need Help?

1. **Check MySQL status:**
   ```bash
   mysql -u root -e "SELECT 1;"
   ```

2. **Reset everything (fresh start):**
   ```bash
   # Delete database
   mysql -u root -p magic_checkout_db -e "DROP DATABASE magic_checkout_db;"
   
   # Recreate it
   mysql -u root -p -e "CREATE DATABASE magic_checkout_db;"
   
   # Push schema
   npm run db:push
   ```

3. **Check Prisma configuration:**
   ```bash
   npx prisma db seed --preview
   ```

---

**Happy coding! 🎉**
