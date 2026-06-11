// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║                              DATABASE SEED SCRIPT                               ║
// ║                     Populates demo data for development                         ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝
//
// RUN THIS COMMAND:
// ────────────────────────────────────────────────────────────────────────────────
// npm run db:seed
//
// This will:
// ✅ Create a demo admin user (admin@magiccheckout.com / admin123)
// ✅ Create a demo store configuration
// ✅ Add sample discount coupons for testing
//
// Note: Uses 'upsert' so it won't create duplicates if run multiple times
// ────────────────────────────────────────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with demo data...')

  // ┌─ CREATE DEFAULT ADMIN USER ──────────────────────────────────────────────┐
  // │ Email: admin@magiccheckout.com                                           │
  // │ Password: admin123                                                       │
  // │ Role: superadmin (full access)                                           │
  // └──────────────────────────────────────────────────────────────────────────┘
  const hash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@magiccheckout.com' },
    update: {},
    create: {
      email: 'admin@magiccheckout.com',
      passwordHash: hash,
      name: 'Super Admin',
      role: 'superadmin',
    },
  })
  console.log('✅ Admin user created:', admin.email)
  console.log('   Password: admin123 (change in production!)')

  // ┌─ CREATE DEFAULT STORE CONFIG ────────────────────────────────────────────┐
  // │ This represents a Shopify store with payment settings                    │
  // │ You can add more stores by calling upsert with different shopDomain      │
  // └──────────────────────────────────────────────────────────────────────────┘
  const store = await prisma.storeConfig.upsert({
    where: { shopDomain: 'demo.myshopify.com' },
    update: {},
    create: {
      shopDomain: 'demo.myshopify.com',
      storeName: 'Naved Collections',
      primaryColor: '#e91e63',
      headerBannerText: 'No COD above Rs. 3000',
      headerBannerEnabled: true,
      codLimit: 3000,
      prepaidDiscount: 50,
      // Add your Razorpay keys here when available
      // razorpayKeyId: 'rzp_test_XXXX',
      // razorpayKeySecret: 'XXXX',
    },
  })
  console.log('✅ Store config created:', store.shopDomain)

  // ┌─ CREATE DEMO COUPONS ────────────────────────────────────────────────────┐
  // │ Sample discount codes for testing different coupon types                 │
  // │ Types: 'percent' (20% off) or 'flat' (₹500 off)                         │
  // └──────────────────────────────────────────────────────────────────────────┘
  const coupons = [
    { 
      code: 'QTYDIS', 
      type: 'percent', 
      value: 20, 
      maxDiscount: 2000, 
      minItems: 2, 
      description: '20% off on 2+ items' 
    },
    { 
      code: 'SAVE10', 
      type: 'flat', 
      value: 500, 
      maxDiscount: 500, 
      minAmount: 3000, 
      description: 'Flat ₹500 off' 
    },
    { 
      code: 'FIRST50', 
      type: 'percent', 
      value: 50, 
      maxDiscount: 1000, 
      minItems: 1, 
      description: '50% off for first order' 
    },
    { 
      code: 'SHIPROCKET', 
      type: 'flat', 
      value: 300, 
      maxDiscount: 300, 
      minAmount: 1000, 
      description: 'Flat ₹300 off' 
    },
  ]

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { shopDomain_code: { shopDomain: 'demo.myshopify.com', code: c.code } },
      update: {},
      create: { shopDomain: 'demo.myshopify.com', ...c },
    })
  }
  console.log('✅ Demo coupons created:')
  coupons.forEach(c => console.log(`   • ${c.code}: ${c.description}`))

  console.log('\n🎉 Database seeding complete!')
  console.log('\n📝 LOGIN CREDENTIALS:')
  console.log('   Email: admin@magiccheckout.com')
  console.log('   Password: admin123')
  console.log('\n🛍️  TEST COUPONS:')
  coupons.forEach(c => console.log(`   • ${c.code}`))
}

main()
  .catch((error) => {
    console.error('❌ Seed error:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

