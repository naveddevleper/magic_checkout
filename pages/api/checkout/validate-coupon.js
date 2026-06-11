// pages/api/checkout/validate-coupon.js
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { shop, code, cartTotal, itemCount } = req.body
  if (!shop || !code) return res.status(400).json({ error: 'shop and code required' })

  const coupon = await prisma.coupon.findUnique({
    where: { shopDomain_code: { shopDomain: shop, code: code.toUpperCase().trim() } },
  })

  if (!coupon || !coupon.isActive) {
    return res.status(200).json({ valid: false, message: 'Invalid or expired coupon code' })
  }

  // Check expiry
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return res.status(200).json({ valid: false, message: 'This coupon has expired' })
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return res.status(200).json({ valid: false, message: 'Coupon usage limit reached' })
  }

  // Check min conditions
  if (coupon.minAmount && cartTotal < coupon.minAmount) {
    return res.status(200).json({
      valid: false,
      message: `Minimum cart value of ₹${coupon.minAmount} required`
    })
  }

  if (coupon.minItems && itemCount < coupon.minItems) {
    return res.status(200).json({
      valid: false,
      message: `Add ${coupon.minItems} or more items to use this coupon`
    })
  }

  // Calculate discount
  let discount = 0
  if (coupon.type === 'percent') {
    discount = Math.min(Math.floor((cartTotal * coupon.value) / 100), coupon.maxDiscount)
  } else {
    discount = Math.min(coupon.value, coupon.maxDiscount)
  }

  return res.status(200).json({
    valid: true,
    coupon: {
      code: coupon.code,
      description: coupon.description,
      discount,
      type: coupon.type,
      value: coupon.value,
    },
    message: `🎉 You save ₹${discount}!`,
  })
}
