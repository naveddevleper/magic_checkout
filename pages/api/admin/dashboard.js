// pages/api/admin/dashboard.js
import { prisma } from '../../../lib/prisma'
import { requireAdmin } from '../../../lib/auth'

async function handler(req, res) {
  const { shopDomain } = req.query
  if (!shopDomain) return res.status(400).json({ error: 'shopDomain required' })

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalOrders,
    paidOrders,
    todayOrders,
    monthOrders,
    totalCustomers,
    todayCustomers,
    revenueData,
    todayRevenue,
    paymentMethodStats,
    orderStatusStats,
    recentOrders,
    recentCustomers,
    dailyRevenue,
  ] = await Promise.all([
    prisma.order.count({ where: { shopDomain } }),
    prisma.order.count({ where: { shopDomain, paymentStatus: 'paid' } }),
    prisma.order.count({ where: { shopDomain, createdAt: { gte: today } } }),
    prisma.order.count({ where: { shopDomain, createdAt: { gte: thisMonth } } }),
    prisma.customerSession.count({ where: { shopDomain } }),
    prisma.customerSession.count({ where: { shopDomain, visitedAt: { gte: today } } }),
    prisma.order.aggregate({
      where: { shopDomain, paymentStatus: 'paid' },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { shopDomain, paymentStatus: 'paid', createdAt: { gte: today } },
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ['paymentMethod'],
      where: { shopDomain },
      _count: true,
      _sum: { total: true },
    }),
    prisma.order.groupBy({
      by: ['orderStatus'],
      where: { shopDomain },
      _count: true,
    }),
    prisma.order.findMany({
      where: { shopDomain },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.customerSession.findMany({
      where: { shopDomain },
      orderBy: { visitedAt: 'desc' },
      take: 5,
    }),
    // Daily revenue last 7 days
    prisma.$queryRawUnsafe(`
      SELECT date(createdAt) as date, SUM(total) as revenue, COUNT(*) as orders
      FROM "Order"
      WHERE shopDomain = ? AND paymentStatus = 'paid'
        AND createdAt >= ?
      GROUP BY date(createdAt)
      ORDER BY date ASC
    `, shopDomain, last7Days.toISOString()),
  ])

  return res.status(200).json({
    overview: {
      totalOrders,
      paidOrders,
      todayOrders,
      monthOrders,
      totalRevenue: revenueData._sum.total || 0,
      todayRevenue: todayRevenue._sum.total || 0,
      totalCustomers,
      todayCustomers,
      conversionRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : 0,
    },
    paymentMethodStats: paymentMethodStats.map(s => ({
      method: s.paymentMethod,
      count: s._count,
      revenue: s._sum.total || 0,
    })),
    orderStatusStats: orderStatusStats.map(s => ({
      status: s.orderStatus,
      count: s._count,
    })),
    recentOrders: recentOrders.map(o => ({
      ...o,
      items: safeJson(o.items, []),
      address: safeJson(o.address, {}),
    })),
    recentCustomers,
    dailyRevenue: Array.isArray(dailyRevenue) ? dailyRevenue : [],
  })
}

function safeJson(str, fallback) {
  try { return str ? JSON.parse(str) : fallback } catch { return fallback }
}

export default requireAdmin(handler)
