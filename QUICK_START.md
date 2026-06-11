# 🎯 QUICK START CHECKLIST

## For Windows Users - FASTEST WAY (1 Command!)

```
📁 Open project folder in Command Prompt
↓
▶️  Run: setup.bat
↓
✅ Everything done! Server running on http://localhost:3000
```

---

## Manual Setup Checklist (If setup.bat doesn't work)

### Pre-Setup (One-Time)
```
☐ Download & install MySQL (or XAMPP with MySQL)
  → https://www.apachefriends.org/ (XAMPP recommended)
  
☐ Download & install Node.js
  → https://nodejs.org/ (LTS version)
  
☐ Start MySQL
  → XAMPP: Open XAMPP Control Panel → Click MySQL "Start"
  → Or: Command Prompt Admin → net start MySQL80
```

### Setup (First Time Running Project)
```
☐ Open Command Prompt in project folder

☐ Create database in phpMyAdmin
  → http://localhost/phpmyadmin
  → New → Database: magic_checkout_db → Create

☐ npm install
  (Wait for completion - takes 2-5 minutes)

☐ npm run db:push
  (Creates all tables)

☐ npm run db:seed
  (Adds demo data)

☐ npm run dev
  (Starts server on http://localhost:3000)
```

### Verify Everything Works
```
☐ Checkout page loads: http://localhost:3000
  
☐ Admin login works: http://localhost:3000/admin
  • Email: admin@magiccheckout.com
  • Password: admin123
  
☐ Try a coupon: QTYDIS (20% off with 2+ items)
  
☐ Database GUI: npm run db:studio → http://localhost:5555
```

---

## Daily Use

### Start Development
```bash
npm run dev
```
→ Open http://localhost:3000

### View/Edit Database
```bash
npm run db:studio
```
→ Opens http://localhost:5555

### Manage Data (phpMyAdmin)
```
http://localhost/phpmyadmin
Username: root
Password: (empty or "root")
```

### Stop Server
```
Press Ctrl+C in Command Prompt
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start server
npm run build           # Build for production
npm run start           # Run production build

# Database
npm run db:push         # Create/update tables
npm run db:studio       # Open database GUI
npm run db:seed         # Add demo data
npm run db:reset        # Delete all data & reset
npm run db:migrate      # Create migration
npm run db:generate     # Regenerate Prisma client
```

---

## Access Points

| What | Where | Login |
|------|-------|-------|
| Checkout | http://localhost:3000 | None |
| Admin | http://localhost:3000/admin | admin@magiccheckout.com / admin123 |
| Database GUI | http://localhost:5555 | None |
| phpMyAdmin | http://localhost/phpmyadmin | root / (empty) |

---

## Test Data

### Login
```
Email:    admin@magiccheckout.com
Password: admin123
```

### Coupons (Try on checkout)
```
QTYDIS      - 20% off (2+ items)
SAVE10      - ₹500 off (₹3000+)
FIRST50     - 50% off (first order)
SHIPROCKET  - ₹300 off (₹1000+)
```

### Store Domain
```
demo.myshopify.com
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "MySQL not found" | Start MySQL (XAMPP or `net start MySQL80`) |
| "Database doesn't exist" | Create in phpMyAdmin or `mysql -u root -p -e "CREATE DATABASE magic_checkout_db;"` |
| "npm command not found" | Restart Command Prompt after installing Node.js |
| "Port 3000 in use" | Kill process: `netstat -ano \| findstr :3000` then `taskkill /PID <NUMBER> /F` |
| "Login fails" | Make sure you ran `npm run db:seed` |
| "Tables missing" | Run `npm run db:push` to create them |

---

## Documentation Files

```
📖 README.md               ← Main project overview
📊 DATABASE_SETUP.md       ← Complete database setup guide
⚡ DB_COMMANDS.md          ← Quick command reference
🖥️  SETUP_LOCAL.md         ← Windows step-by-step (DETAILED!)
✅ SETUP_SUMMARY.md        ← What we've done & checklist
🎯 THIS FILE               ← Quick start checklist
```

**For detailed help:** Open and read `SETUP_LOCAL.md`

---

## System Requirements

- Windows 10 or later
- MySQL 5.7+ or MariaDB
- Node.js 16+
- 500MB free disk space
- ~100MB RAM for development

---

## Ready? Let's Go! 🚀

**Windows Quick Start:**
```
setup.bat
```

**If that doesn't work:**
1. Read: `SETUP_LOCAL.md`
2. Follow the 8-step manual setup
3. Run: `npm run dev`
4. Visit: `http://localhost:3000`

**Questions?** Check the documentation files or the comments in the code!

---

**Happy coding! 🎉**
