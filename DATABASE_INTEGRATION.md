# 🗄️ Database Integration Setup

## ✅ Completed Setup Steps

### 1. **Environment Configuration** ✓
- Updated `.env.local` with remote database credentials:
  ```
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=u526544686_checkout
  DB_PASSWORD=YOUR_DB_PASSWORD
  DB_NAME=u526544686_checkout
  ```
- Primary Prisma DATABASE_URL configured

### 2. **Database Connection Layer** ✓
- Created `lib/db.js` - MySQL connection pool using `mysql2/promise`
- Supports both Prisma ORM and raw SQL queries
- Connection pooling configured with 10 max connections

### 3. **Test API Endpoint** ✓
- Created `pages/api/test-db.js` endpoint
- Tests database connectivity with `SELECT NOW()` query
- Returns JSON response with connection status

### 4. **Dependencies** ✓
- Installed `mysql2` package (v11 or later)

---

## 🚀 NEXT STEPS - HOW TO RUN

### Step 1: Update Your Database Password
Edit `.env.local` and replace `YOUR_DB_PASSWORD` with your actual password:
```
DB_PASSWORD=your_actual_password_here
DATABASE_URL="mysql://u526544686_checkout:your_actual_password_here@localhost:3306/u526544686_checkout"
```

### Step 2: Start Development Server
```bash
npm run dev
```
You should see:
```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
```

### Step 3: Test Database Connection
Open your browser and visit:
```
http://localhost:3000/api/test-db
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database connection successful!",
  "data": {
    "time": "2026-06-17T14:30:45.000Z"
  },
  "timestamp": "2026-06-17T14:30:45.123Z"
}
```

**If Connection Fails:**
```json
{
  "success": false,
  "message": "Database connection failed!",
  "error": "connect ECONNREFUSED 127.0.0.1:3306"
}
```

---

## 🌐 phpMyAdmin Setup

### Option 1: Using XAMPP (Recommended)
1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start XAMPP Control Panel
3. Click "Start" on MySQL module
4. Open browser: http://localhost/phpmyadmin

### Option 2: Manual MySQL Installation
```bash
# Windows (run as Admin)
net start MySQL80

# Then open: http://localhost/phpmyadmin
```

### phpMyAdmin Login
```
Username: u526544686_checkout
Password: YOUR_DB_PASSWORD
```

### Verify Database & Tables
1. Login to phpMyAdmin
2. Select database: `u526544686_checkout`
3. You should see tables created by Prisma schema

---

## 📝 File Structure
```
lib/
├── db.js                 ← NEW: MySQL connection pool
├── prisma.js
└── auth.js

pages/api/
├── test-db.js           ← NEW: Database test endpoint
├── admin/
├── checkout/
└── shopify/

.env.local               ← UPDATED: New DB credentials
```

---

## 🔧 Available Database Commands

```bash
# Start development with hot reload
npm run dev

# View/edit database (Prisma Studio at http://localhost:5555)
npm run db:studio

# Push schema changes to database
npm run db:push

# Generate Prisma client after schema changes
npm run db:generate

# Add seed data
npm run db:seed

# Reset database (⚠️ deletes all data!)
npm run db:reset

# Build for production
npm run build
```

---

## 🧪 Quick Database Tests

### Test 1: Direct Connection (Command Line)
```bash
mysql -u u526544686_checkout -p -h localhost -D u526544686_checkout -e "SELECT NOW();"
```

### Test 2: Via API Endpoint
```bash
curl http://localhost:3000/api/test-db
```

### Test 3: Using Node.js
```javascript
// Quick test in Node REPL
const db = require('./lib/db').default;
db.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE();")
  .then(([rows]) => console.log(rows))
  .catch(err => console.error(err));
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| ECONNREFUSED | MySQL not running. Start MySQL/XAMPP |
| Access Denied | Check DB_USER and DB_PASSWORD in .env.local |
| Database not found | Create database `u526544686_checkout` in phpMyAdmin |
| Timeout | Check firewall, verify DB_HOST and DB_PORT |
| Port already in use | Change DB_PORT in .env.local or kill process on 3306 |

---

## 🔐 Environment Variables Summary

**For local development (`.env.local`):**
```
DATABASE_URL="mysql://u526544686_checkout:YOUR_DB_PASSWORD@localhost:3306/u526544686_checkout"
DB_HOST=localhost
DB_PORT=3306
DB_USER=u526544686_checkout
DB_PASSWORD=YOUR_DB_PASSWORD
DB_NAME=u526544686_checkout
```

**For production (set in deployment platform):**
- Use your production database credentials
- Update DATABASE_URL for Prisma
- Update DB_* variables for mysql2 connections

---

## 📦 Next Steps After Verification

1. ✅ Test database connection at `/api/test-db`
2. 📊 Verify tables in phpMyAdmin
3. 🗄️ Run `npm run db:seed` to add sample data (if needed)
4. 🚀 Deploy or continue development
5. 📤 Commit changes to git

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [mysql2/promise Documentation](https://github.com/sidorares/node-mysql2)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
