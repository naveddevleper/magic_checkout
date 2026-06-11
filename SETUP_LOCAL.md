# 🖥️ LOCAL SETUP GUIDE - Windows + MySQL + phpMyAdmin

## Complete Step-by-Step Instructions

---

## 📦 Prerequisites

Before starting, install these on your Windows machine:

### 1. **MySQL Database Server**

**Option A: Using XAMPP (Recommended - Easiest)**
1. Download from: https://www.apachefriends.org/download.html
2. Run the installer, follow steps
3. Install to: `C:\xampp` (or preferred location)
4. After installation:
   - Open **XAMPP Control Panel**
   - Click **Start** next to "MySQL"
   - You'll see "Started" in green

**Option B: Direct MySQL Installation**
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Run installer, follow setup wizard
3. When asked, set:
   - Root password: `root` (or your choice)
   - Port: `3306` (default)
4. Installation type: **Developer Default**
5. After installation, run Command Prompt as **Administrator**:
   ```cmd
   net start MySQL80
   ```

### 2. **Node.js & npm**
1. Download from: https://nodejs.org/
2. Get **LTS version** (latest stable)
3. Run installer, click "Next" for all defaults
4. Verify installation in Command Prompt:
   ```cmd
   node --version
   npm --version
   ```

### 3. **Git** (Optional but recommended)
1. Download from: https://git-scm.com/download/win
2. Run installer with all defaults

---

## ✅ STEP 1: Start MySQL

### If using XAMPP:
1. Open **XAMPP Control Panel** (`C:\xampp\xampp-control.exe`)
2. Look for "MySQL" row
3. Click **Start** button
4. Wait for it to show "Started" (green)

### If using direct MySQL:
1. Open Command Prompt as **Administrator**
2. Run:
   ```cmd
   net start MySQL80
   ```
3. Output should say: `The MySQL80 service is starting.` then `The MySQL80 service was started successfully.`

### Verify MySQL is running:
```cmd
mysql -u root -p
```
When prompted for password:
- If using XAMPP default: press **Enter** (no password)
- If you set a password: type it

You should see:
```
Welcome to the MySQL monitor. Type 'help' or '\h' for help.

mysql>
```

Type `exit` to quit.

---

## ✅ STEP 2: Create Database

### Using phpMyAdmin (Easiest):

1. Open browser → `http://localhost/phpmyadmin`
2. Login:
   - Username: `root`
   - Password: (leave empty or `root`)
3. Click **New** in left sidebar
4. Type database name: `magic_checkout_db`
5. Collation: `utf8mb4_unicode_ci` (default)
6. Click **Create**
7. Done! You should see the new database in left sidebar

### Using MySQL Command Line:

Open Command Prompt:
```cmd
mysql -u root -p -e "CREATE DATABASE magic_checkout_db;"
```
When prompted for password, press Enter (XAMPP) or type your password.

---

## ✅ STEP 3: Clone/Navigate to Project

1. Open Command Prompt
2. Navigate to your project folder:
   ```cmd
   cd C:\Users\HP\Desktop\magic-checkout-shopify\magic-checkout
   ```

Or if using Git:
```cmd
git clone <repo-url>
cd magic-checkout
```

---

## ✅ STEP 4: Configure Environment Variables

1. Open `.env.local` file in the project folder with any text editor
2. Make sure it contains (update if needed):
   ```env
   DATABASE_URL="mysql://root:root@localhost:3306/magic_checkout_db"
   JWT_SECRET="super-secret-key-change-in-production"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   SHOPIFY_API_KEY=""
   SHOPIFY_API_SECRET=""
   SHOPIFY_SHOP_DOMAIN=""
   SHOPIFY_ACCESS_TOKEN=""
   RAZORPAY_KEY_ID=""
   RAZORPAY_KEY_SECRET=""
   NEXT_PUBLIC_RAZORPAY_KEY_ID=""
   ```

3. Save the file

**If you set a different MySQL password:**
Change the first line to:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/magic_checkout_db"
```

---

## ✅ STEP 5: Install Dependencies

In Command Prompt (from project folder):
```cmd
npm install
```

Wait for it to complete (might take 2-5 minutes).

You should see:
```
added XXX packages in XXs
```

---

## ✅ STEP 6: Initialize Database

Run:
```cmd
npm run db:push
```

This creates all database tables. Output should show:
```
✔ Database tables created successfully
```

---

## ✅ STEP 7: Seed Demo Data

Run:
```cmd
npm run db:seed
```

Output should show:
```
🌱 Seeding database with demo data...
✅ Admin user created: admin@magiccheckout.com
✅ Store config created: demo.myshopify.com
✅ Demo coupons created: QTYDIS, SAVE10, FIRST50, SHIPROCKET

🎉 Database seeding complete!
```

---

## ✅ STEP 8: Start Development Server

Run:
```cmd
npm run dev
```

You should see:
```
▲ Next.js 14.2.3
- Local: http://localhost:3000
```

Leave this Command Prompt window open (it runs the server).

---

## 🌐 Access Your Application

Open these in your browser:

| Link | What to do |
|------|-----------|
| **http://localhost:3000** | View checkout page |
| **http://localhost:3000/admin** | Go to admin login |
| **http://localhost/phpmyadmin** | Manage database |
| **http://localhost:5555** | Open Prisma Studio (see command below) |

---

## 🔐 Admin Login

Use these credentials on the admin login page:

```
Email:    admin@magiccheckout.com
Password: admin123
```

---

## 🎟️ Test Coupons

On the checkout page, try entering these coupon codes:

```
QTYDIS    → 20% off if you add 2+ items
SAVE10    → ₹500 flat discount on orders ₹3000+
FIRST50   → 50% off for first order
SHIPROCKET → ₹300 off on orders ₹1000+
```

---

## 📊 Prisma Studio (Visual Database Editor)

Open another Command Prompt window (keep the first one running):

```cmd
cd C:\Users\HP\Desktop\magic-checkout-shopify\magic-checkout
npm run db:studio
```

This opens `http://localhost:5555` in your browser where you can:
- View all database tables
- Edit/delete records
- Add new records
- Search data

---

## 📊 phpMyAdmin (Database Management)

Open in browser: `http://localhost/phpmyadmin`

You can:
- View table structure
- Execute SQL queries
- Backup/export data
- Create/modify tables

---

## ⚡ Useful Commands

Open Command Prompt in project folder and run:

```bash
# Start development server
npm run dev

# View database GUI
npm run db:studio

# Add seed data again
npm run db:seed

# Reset database (⚠️ DELETES ALL DATA!)
npm run db:reset

# Build for production
npm run build

# Run production version
npm run start
```

---

## 🆘 Troubleshooting

### ❌ "Can't connect to MySQL server"

**Solution:**
1. Ensure MySQL is running:
   - Check XAMPP Control Panel - MySQL should show "Started"
   - Or run: `net start MySQL80`
2. Verify credentials in `.env.local`
3. Test connection:
   ```cmd
   mysql -u root -p
   ```

### ❌ "Unknown database 'magic_checkout_db'"

**Solution:**
1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Create the database (see Step 2 above)
3. Or run: `mysql -u root -p -e "CREATE DATABASE magic_checkout_db;"`

### ❌ "npm command not found"

**Solution:**
1. Node.js not installed properly
2. Reinstall from https://nodejs.org/
3. Restart Command Prompt after installation

### ❌ Port 3000 already in use

**Solution:**
```cmd
# Find and kill the process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

Then try `npm run dev` again.

### ❌ Tables not created after `npm run db:push`

**Solution:**
1. Check database exists:
   ```cmd
   mysql -u root -p magic_checkout_db -e "SHOW TABLES;"
   ```
2. Force reset and recreate:
   ```cmd
   npm run db:reset
   npm run db:push
   ```

### ❌ Login fails / "Invalid credentials"

**Solution:**
1. Make sure you ran: `npm run db:seed`
2. Use correct credentials:
   - Email: `admin@magiccheckout.com`
   - Password: `admin123`
3. Check database has the admin user:
   ```cmd
   mysql -u root -p magic_checkout_db -e "SELECT * FROM AdminUser;"
   ```

---

## 🚀 Quick Commands Cheat Sheet

```bash
# FIRST TIME SETUP
npm install
npm run db:push
npm run db:seed
npm run dev

# DAILY DEVELOPMENT
npm run dev                    # Start server
npm run db:studio              # Open database GUI
npm run db:seed                # Add more demo data if needed

# DATABASE MANAGEMENT
mysql -u root -p               # Connect to MySQL
npm run db:reset               # Reset (delete all data)
npm run db:generate            # After schema changes

# TESTING
# Login: admin@magiccheckout.com / admin123
# Test coupons: QTYDIS, SAVE10, FIRST50, SHIPROCKET
```

---

## 📁 Important File Locations

```
Project Folder:         C:\Users\HP\Desktop\magic-checkout-shopify\magic-checkout\
Environment File:       .env.local (in project root)
Database Config:        prisma\schema.prisma
Demo Data Script:       prisma\seed.js
Admin Pages:            pages\admin\
API Endpoints:          pages\api\
Components:             components\
```

---

## ✨ You're All Set!

Your application is now running on `http://localhost:3000`

- **Checkout Page:** `http://localhost:3000`
- **Admin Panel:** `http://localhost:3000/admin`
- **Database GUI:** `npm run db:studio` then `http://localhost:5555`
- **phpMyAdmin:** `http://localhost/phpmyadmin`

Enjoy! 🎉

---

## 📞 Next Steps

1. **Customize your store:**
   - Go to Admin → Store Settings
   - Upload logo, change colors, modify banners

2. **Add your Razorpay keys:**
   - Sign up at https://razorpay.com
   - Add test keys in Admin → Payment Setup

3. **Connect Shopify (Optional):**
   - Get API keys from Shopify Partner Dashboard
   - Add to Admin → Store Config
   - Use Shopify API for order syncing

4. **Deploy to Production:**
   - Use Vercel, Netlify, or your hosting provider
   - Update DATABASE_URL to production database

For detailed info, see:
- 📖 README.md
- 📊 DATABASE_SETUP.md
- ⚡ DB_COMMANDS.md
