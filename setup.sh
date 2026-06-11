#!/bin/bash
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║                       MAGIC CHECKOUT - LOCAL SETUP SCRIPT                      ║
# ║                    Sets up the entire project with one command                 ║
# ║                                                                                 ║
# ║  This script:                                                                  ║
# ║  1. Checks if MySQL is running                                                ║
# ║  2. Creates the database in MySQL                                              ║
# ║  3. Installs npm dependencies                                                  ║
# ║  4. Pushes Prisma schema to database                                           ║
# ║  5. Seeds demo data                                                            ║
# ║  6. Starts the development server                                              ║
# ║                                                                                 ║
# ║  REQUIREMENTS: MySQL, Node.js 16+                                              ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

set -e

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 MAGIC CHECKOUT - LOCAL DEVELOPMENT SETUP                      ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if MySQL is running
echo -e "\n${YELLOW}[1/6]${NC} Checking MySQL connection..."
if ! mysql -u root -e "SELECT 1" > /dev/null 2>&1; then
    echo -e "${RED}✗ MySQL is not running!${NC}"
    echo "   Windows (XAMPP): Start XAMPP Control Panel → Click MySQL Start"
    echo "   Windows (Direct): net start MySQL80"
    echo "   macOS: brew services start mysql"
    exit 1
fi
echo -e "${GREEN}✓${NC} MySQL is running"

# Step 2: Create database if not exists
echo -e "\n${YELLOW}[2/6]${NC} Creating MySQL database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS magic_checkout_db;"
echo -e "${GREEN}✓${NC} Database 'magic_checkout_db' ready"

# Step 3: Install dependencies
echo -e "\n${YELLOW}[3/6]${NC} Installing npm dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
fi

# Step 4: Push Prisma schema
echo -e "\n${YELLOW}[4/6]${NC} Setting up database schema..."
npm run db:push
echo -e "${GREEN}✓${NC} Database schema created"

# Step 5: Seed demo data
echo -e "\n${YELLOW}[5/6]${NC} Seeding demo data..."
npm run db:seed
echo -e "${GREEN}✓${NC} Demo data created"

# Step 6: Success message
echo -e "\n${YELLOW}[6/6]${NC} Starting development server..."
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                   ✅ SETUP COMPLETE - READY TO DEVELOP!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📱 Admin Panel:${NC}      http://localhost:3000/admin"
echo -e "${GREEN}🛍️  Checkout Page:${NC}   http://localhost:3000"
echo -e "${GREEN}📊 Prisma Studio:${NC}    npm run db:studio"
echo -e "${GREEN}📊 phpMyAdmin:${NC}       http://localhost/phpmyadmin"
echo ""
echo -e "${YELLOW}Login Credentials:${NC}"
echo "   Email: admin@magiccheckout.com"
echo "   Password: admin123"
echo ""
echo -e "${YELLOW}Test Coupons:${NC}"
echo "   • QTYDIS (20% off on 2+ items)"
echo "   • SAVE10 (₹500 flat)"
echo "   • FIRST50 (50% off)"
echo "   • SHIPROCKET (₹300 off)"
echo ""
echo -e "${YELLOW}Stop server:${NC} Press Ctrl+C"
echo ""

# Start dev server
npm run dev
