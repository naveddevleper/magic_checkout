// pages/api/checkout/create-order.js
import { prisma } from '../../../lib/prisma'
import { createRazorpayOrder } from '../../../lib/razorpay-server'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { shop, amount, currency = 'INR', sessionId, items, address, couponCode } = req.body

  if (!shop || !amount) return res.status(400).json({ error: 'shop and amount required' })

  // Get store config (with Razorpay keys)
  const config = await prisma.storeConfig.findUnique({ where: { shopDomain: shop } })
  if (!config) return res.status(404).json({ error: 'Store not found' })

  const receipt = `mc_${uuidv4().slice(0, 8)}`

  try {
    const order = await createRazorpayOrder({
      keyId: config.razorpayKeyId,
      keySecret: config.razorpayKeySecret,
      amount: parseFloat(amount),
      currency,
      receipt,
      notes: {
        shop,
        sessionId: sessionId || '',
        coupon: couponCode || '',
      },
    })

    return res.status(200).json({
      order,
      demo: order.demo || false,
      keyId: config.razorpayKeyId || null,
    })
  } catch (err) {
    console.error('Create order error:', err)
    return res.status(500).json({ error: err.message })
  }
}
