// pages/api/admin/orders.js
import { prisma } from '../../../lib/prisma'
import { requireAdmin } from '../../../lib/auth'

async function handler(req, res) {
  const {
    shopDomain, page = '1', limit = '20',
    search = '', status = '', method = '', id
  } = req.query

  if (!shopDomain) return res.status(400).json({ error: 'shopDomain required' })

  // GET - list orders
  if (req.method === 'GET') {
    // Single order detail
    if (id) {
      const order = await prisma.order.findUnique({ where: { id } })
      if (!order) return res.status(404).json({ error: 'Order not found' })
      return res.status(200).json({ order: parseOrder(order) })
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const where = {
      shopDomain,
      ...(search && {
        OR: [
          { phone: { contains: search } },
          { name: { contains: search } },
          { orderId: { contains: search } },
        ],
      }),
      ...(status && { orderStatus: status }),
      ...(method && { paymentMethod: method }),
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.order.count({ where }),
    ])

    // Stats
    const stats = await prisma.order.groupBy({
      by: ['paymentStatus'],
      where: { shopDomain },
      _count: true,
      _sum: { total: true },
    })

    return res.status(200).json({
      orders: orders.map(parseOrder),
      pagination: {
        total, page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: stats.reduce((acc, s) => ({
        ...acc,
        [s.paymentStatus]: { count: s._count, revenue: s._sum.total || 0 }
      }), {}),
    })
  }

  // PUT - update order status
  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'id required' })
    const { orderStatus, paymentStatus } = req.body

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: new Date(),
      },
    })
    return res.status(200).json({ order: parseOrder(order) })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

function parseOrder(o) {
  return {
    ...o,
    items: safeJson(o.items, []),
    address: safeJson(o.address, {}),
  }
}

function safeJson(str, fallback) {
  try { return str ? JSON.parse(str) : fallback } catch { return fallback }
}

export default requireAdmin(handler)
