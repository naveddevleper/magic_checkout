// pages/api/admin/coupons.js
import { prisma } from '../../../lib/prisma'
import { requireAdmin } from '../../../lib/auth'

async function handler(req, res) {
  const { shopDomain, id } = req.query

  if (!shopDomain) return res.status(400).json({ error: 'shopDomain required' })

  // GET - list all coupons
  if (req.method === 'GET') {
    const coupons = await prisma.coupon.findMany({
      where: { shopDomain },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json({ coupons })
  }

  // POST - create coupon
  if (req.method === 'POST') {
    const { code, type, value, maxDiscount, minAmount, minItems, description, usageLimit, expiresAt } = req.body

    if (!code || !type || !value) {
      return res.status(400).json({ error: 'code, type, value required' })
    }

    const existing = await prisma.coupon.findUnique({
      where: { shopDomain_code: { shopDomain, code: code.toUpperCase() } }
    })
    if (existing) return res.status(409).json({ error: 'Coupon code already exists' })

    const coupon = await prisma.coupon.create({
      data: {
        shopDomain,
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        maxDiscount: parseFloat(maxDiscount || value),
        minAmount: parseFloat(minAmount || 0),
        minItems: parseInt(minItems || 1),
        description: description || '',
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })
    return res.status(201).json({ coupon })
  }

  // PUT - update coupon
  if (req.method === 'PUT') {
    if (!id) return res.status(400).json({ error: 'id required' })

    const { isActive, description, maxDiscount, minAmount, usageLimit, expiresAt, value, type } = req.body

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(description && { description }),
        ...(maxDiscount !== undefined && { maxDiscount: parseFloat(maxDiscount) }),
        ...(minAmount !== undefined && { minAmount: parseFloat(minAmount) }),
        ...(usageLimit !== undefined && { usageLimit: parseInt(usageLimit) }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(type && { type }),
        updatedAt: new Date(),
      },
    })
    return res.status(200).json({ coupon })
  }

  // DELETE - remove coupon
  if (req.method === 'DELETE') {
    if (!id) return res.status(400).json({ error: 'id required' })
    await prisma.coupon.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default requireAdmin(handler)
