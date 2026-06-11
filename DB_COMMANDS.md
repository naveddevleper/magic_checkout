# ⚡ QUICK DATABASE COMMANDS REFERENCE

## 🚀 START HERE (First Time Setup)

```bash
# 1. Create database in phpMyAdmin first!
#    http://localhost/phpmyadmin → New → Database: magic_checkout_db

# 2. Install dependencies
npm install

# 3. Initialize database
npm run db:push

# 4. Start development server
npm run dev

# Then visit: http://localhost:3000
```

---

## 📊 DAILY DEVELOPMENT COMMANDS

```bash
# Start development server (with hot reload)
npm run dev

# View/edit database GUI
npm run db:studio

# Add seed data (demo users & coupons)
npm run db:seed

# Build for production
npm build
```

---

## 🛠️ DATABASE MANAGEMENT COMMANDS

```bash
# Push schema changes to MySQL
npm run db:push

# Generate Prisma client after schema changes
npm run db:generate

# Named migration (for team collaboration)
npm run db:migrate -- --name add_new_field

# ⚠️ DANGEROUS: Reset database (deletes all data!)
npm run db:reset

# View database connection
cat .env.local | grep DATABASE_URL
```

---

## 🔌 MYSQL DIRECT COMMANDS

```bash
# Connect to MySQL
mysql -u root -p

# Create database
mysql -u root -p -e "CREATE DATABASE magic_checkout_db;"

# Delete database
mysql -u root -p -e "DROP DATABASE magic_checkout_db;"

# Show all tables
mysql -u root -p magic_checkout_db -e "SHOW TABLES;"

# Check row count
mysql -u root -p magic_checkout_db -e "SELECT COUNT(*) FROM AdminUser;"
```

---

## 🌍 PHPMYADMIN

Open in browser: **http://localhost/phpmyadmin**

- Username: `root`
- Password: (leave empty or `root`)
- Select database: `magic_checkout_db`

---

## ⚙️ ENVIRONMENT SETUP

Update `.env.local`:
```
DATABASE_URL=mysql://root:root@localhost:3306/magic_checkout_db
JWT_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ VERIFY EVERYTHING IS WORKING

```bash
# 1. Check if npm packages installed
npm list | head -20

# 2. Check database connection
npm run db:studio
# Should open http://localhost:5555 with tables visible

# 3. Start server
npm run dev
# Should show: ▲ Next.js 14.2.3
#              - Local: http://localhost:3000

# 4. Test in browser
# Visit http://localhost:3000 - should load without errors
```

---

## 📁 DATABASE SCHEMA TABLES

```
├── AdminUser (admin accounts)
├── StoreConfig (Shopify store settings)
├── Coupon (discount codes)
├── Order (customer orders)
└── CustomerSession (checkout sessions)
```

---

## 🆘 QUICK FIXES

**MySQL not starting?**
- Windows: Start XAMPP → Click MySQL Start button
- Or: `net start MySQL80` (Windows Command Prompt as Admin)

**Connection refused?**
- `npm run db:studio` should tell you connection issue
- Update DATABASE_URL in .env.local

**Tables missing?**
- `npm run db:push` to create them

**Data corrupted?**
- `npm run db:reset` for fresh start

---

For detailed troubleshooting, see: **DATABASE_SETUP.md**
