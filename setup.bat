@echo off
REM ╔═══════════════════════════════════════════════════════════════════════════════╗
REM ║                    MAGIC CHECKOUT - WINDOWS SETUP SCRIPT                      ║
REM ║                   Sets up the entire project with one command                  ║
REM ║                                                                                 ║
REM ║  This script:                                                                  ║
REM ║  1. Checks if MySQL is running                                                ║
REM ║  2. Creates the database in MySQL                                              ║
REM ║  3. Installs npm dependencies                                                  ║
REM ║  4. Pushes Prisma schema to database                                           ║
REM ║  5. Seeds demo data                                                            ║
REM ║  6. Starts the development server                                              ║
REM ║                                                                                 ║
REM ║  REQUIREMENTS: MySQL, Node.js 16+, npm                                        ║
REM ║  RUN: setup.bat (from project root directory)                                 ║
REM ╚═══════════════════════════════════════════════════════════════════════════════╝

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║          🚀 MAGIC CHECKOUT - LOCAL DEVELOPMENT SETUP (WINDOWS)            ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Check if MySQL is running
echo [1/6] Checking MySQL connection...
mysql -u root -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: MySQL is not running!
    echo.
    echo Solution:
    echo  • XAMPP: Open XAMPP Control Panel ^-^> Click "Start" next to MySQL
    echo  • Direct: Open Command Prompt as Admin, run: net start MySQL80
    echo  • Or: Start MySQL Service from Windows Services
    echo.
    pause
    exit /b 1
)
echo ✓ MySQL is running
echo.

REM Step 2: Create database
echo [2/6] Creating MySQL database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS magic_checkout_db;"
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Could not create database!
    echo Solution: Check if MySQL username/password is correct in .env.local
    pause
    exit /b 1
)
echo ✓ Database 'magic_checkout_db' ready
echo.

REM Step 3: Install dependencies
echo [3/6] Installing npm dependencies...
if not exist "node_modules" (
    call npm install
    echo ✓ Dependencies installed
) else (
    echo ✓ Dependencies already installed
)
echo.

REM Step 4: Push Prisma schema
echo [4/6] Setting up database schema...
call npm run db:push
if errorlevel 1 (
    echo.
    echo ❌ ERROR: Database schema push failed!
    echo Solution: 
    echo  • Check if DATABASE_URL in .env.local is correct
    echo  • MySQL database exists (check in phpMyAdmin)
    pause
    exit /b 1
)
echo ✓ Database schema created
echo.

REM Step 5: Seed demo data
echo [5/6] Seeding demo data...
call npm run db:seed
echo ✓ Demo data seeded
echo.

REM Step 6: Success!
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                   ✅ SETUP COMPLETE - READY TO DEVELOP!                    ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📱 Your application will start in a moment...
echo.
echo 🔗 IMPORTANT LINKS:
echo    Admin Panel:      http://localhost:3000/admin
echo    Checkout Page:    http://localhost:3000
echo    phpMyAdmin:       http://localhost/phpmyadmin
echo    Prisma Studio:    npm run db:studio (in another terminal)
echo.
echo 🔐 LOGIN CREDENTIALS:
echo    Email:            admin@magiccheckout.com
echo    Password:         admin123
echo.
echo 🎟️  TEST COUPONS:
echo    • QTYDIS (20%% off on 2+ items)
echo    • SAVE10 (₹500 flat)
echo    • FIRST50 (50%% off)
echo    • SHIPROCKET (₹300 off)
echo.
echo ⏹️  To stop the server: Press Ctrl+C
echo.
pause

REM Step 7: Start development server
echo.
echo Starting Next.js development server...
echo.
call npm run dev
