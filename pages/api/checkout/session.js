// pages/api/checkout/session.js
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { shop, sessionId, phone, name, email, address, items, cartTotal, itemCount } = req.body
  if (!shop) return res.status(400).json({ error: 'shop required' })

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || ''
  const userAgent = req.headers['user-agent'] || ''

  let existing = null
  if (sessionId) {
    existing = await prisma.customerSession.findUnique({ where: { id: sessionId } }).catch(() => null)
  }

  if (!existing && phone) {
    existing = await prisma.customerSession.findFirst({
      where: { shopDomain: shop, phone },
      orderBy: { updatedAt: 'desc' },
    })
  }

  const sessionData = {
    shopDomain: shop,
    phone: phone || existing?.phone || null,
    name: name || existing?.name || null,
    email: email || existing?.email || null,
    address: address ? JSON.stringify(address) : existing?.address || null,
    cartItems: items ? JSON.stringify(items) : existing?.cartItems || null,
    cartTotal: typeof cartTotal === 'number' ? cartTotal : existing?.cartTotal || 0,
    cartItemCount: typeof itemCount === 'number' ? itemCount : existing?.cartItemCount || 0,
    visitedAt: new Date(),
    ip,
    userAgent,
  }

  let result
  if (existing) {
    result = await prisma.customerSession.update({
      where: { id: existing.id },
      data: {
        ...sessionData,
      },
    })
  } else {
    result = await prisma.customerSession.create({
      data: sessionData,
    })
  }

  return res.status(200).json({ sessionId: result.id, isReturning: !!existing })
}
