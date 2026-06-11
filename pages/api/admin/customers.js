// pages/api/admin/customers.js
import { prisma } from '../../../lib/prisma'
import { requireAdmin } from '../../../lib/auth'

async function handler(req, res) {
  const { shopDomain, page = '1', limit = '20', search = '', id } = req.query

  if (!shopDomain) return res.status(400).json({ error: 'shopDomain required' })

  // GET - list customers with search + pagination
  if (req.method === 'GET') {
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const where = {
      shopDomain,
      ...(search && {
        OR: [
          { phone: { contains: search } },
          { name: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    }

    const [customers, total] = await Promise.all([
      prisma.customerSession.findMany({
        where,
        orderBy: { visitedAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true, orderId: true, total: true,
              paymentMethod: true, paymentStatus: true,
              orderStatus: true, createdAt: true,
            },
          },
        },
      }),
      prisma.customerSession.count({ where }),
    ])

    // Parse address JSON
    const parsed = customers.map(c => ({
      ...c,
      address: safeJson(c.address, null),
      cartItems: safeJson(c.cartItems, []),
    }))

    return res.status(200).json({
      customers: parsed,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

function safeJson(str, fallback) {
  try { return str ? JSON.parse(str) : fallback } catch { return fallback }
}

export default requireAdmin(handler)
