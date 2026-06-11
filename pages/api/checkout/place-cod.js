// pages/api/checkout/place-cod.js
import { prisma } from '../../../lib/prisma'
import { createShopifyOrder } from '../../../lib/shopify'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { shop, sessionId, orderData } = req.body
  if (!shop || !orderData?.phone || !orderData?.address) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Get store config to check COD limit and settings
  const config = await prisma.storeConfig.findUnique({ where: { shopDomain: shop } })
  if (!config) return res.status(404).json({ error: 'Store not found' })

  if (!config.codEnabled) {
    return res.status(400).json({ error: 'Cash on delivery is not available' })
  }

  if (orderData.total > config.codLimit) {
    return res.status(400).json({ error: `COD not available for orders above ₹${config.codLimit}` })
  }

  const internalOrderId = `COD-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`

  const order = await prisma.order.create({
    data: {
      shopDomain: shop,
      sessionId: sessionId || null,
      orderId: internalOrderId,
      phone: orderData.phone,
      email: orderData.email || null,
      name: orderData.name || null,
      address: JSON.stringify(orderData.address),
      items: JSON.stringify(orderData.items || []),
      subtotal: parseFloat(orderData.subtotal || 0),
      discount: parseFloat(orderData.discount || 0),
      couponCode: orderData.couponCode || null,
      couponDiscount: parseFloat(orderData.couponDiscount || 0),
      deliveryCharge: parseFloat(orderData.deliveryCharge || 0),
      total: parseFloat(orderData.total || 0),
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
    },
  })

  // Increment coupon usage
  if (orderData.couponCode) {
    await prisma.coupon.updateMany({
      where: { shopDomain: shop, code: orderData.couponCode },
      data: { usageCount: { increment: 1 } },
    })
  }

  if (sessionId) {
    await prisma.customerSession.update({
      where: { id: sessionId },
      data: { ordersCount: { increment: 1 } },
    }).catch(() => {})
  }

  // Create Shopify order
  let shopifyOrderId = null
  if (config.shopifyAccessToken && orderData.items?.length) {
    try {
      const shopifyOrder = await createShopifyOrder({
        shop,
        accessToken: config.shopifyAccessToken,
        orderData: {
          customer: { name: orderData.name, email: orderData.email, phone: orderData.phone },
          lineItems: orderData.items.map(i => ({
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
            title: i.name,
          })),
          shippingAddress: orderData.address,
          totalPrice: orderData.total,
          paymentGateway: 'Cash on Delivery',
          financialStatus: 'pending',
          tags: 'magic-checkout,cod',
        },
      })
      shopifyOrderId = shopifyOrder?.order?.id
    } catch (err) {
      console.error('Shopify COD order error:', err.message)
    }
  }

  return res.status(200).json({
    success: true,
    orderId: internalOrderId,
    shopifyOrderId,
  })
}
