// pages/api/checkout/verify-payment.js
import { prisma } from '../../../lib/prisma'
import { verifyRazorpaySignature } from '../../../lib/razorpay-server'
import { createShopifyOrder } from '../../../lib/shopify'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const {
    shop, razorpay_order_id, razorpay_payment_id, razorpay_signature,
    demo, sessionId, orderData,
  } = req.body

  if (!shop) return res.status(400).json({ error: 'shop required' })

  // Get store config
  const config = await prisma.storeConfig.findUnique({ where: { shopDomain: shop } })
  if (!config) return res.status(404).json({ error: 'Store not found' })

  // Verify signature
  const isDemo = demo || razorpay_order_id?.startsWith('order_demo_')
  const verified = isDemo || verifyRazorpaySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
    keySecret: config.razorpayKeySecret,
  })

  if (!verified) {
    return res.status(400).json({ verified: false, error: 'Invalid payment signature' })
  }

  // Generate our order ID
  const internalOrderId = `MC-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`

  // Save order to DB
  const order = await prisma.order.create({
    data: {
      shopDomain: shop,
      sessionId: sessionId || null,
      orderId: internalOrderId,
      razorpayOrderId: razorpay_order_id || null,
      razorpayPaymentId: razorpay_payment_id || null,
      phone: orderData?.phone || '',
      email: orderData?.email || null,
      name: orderData?.name || null,
      address: JSON.stringify(orderData?.address || {}),
      items: JSON.stringify(orderData?.items || []),
      subtotal: parseFloat(orderData?.subtotal || 0),
      discount: parseFloat(orderData?.discount || 0),
      couponCode: orderData?.couponCode || null,
      couponDiscount: parseFloat(orderData?.couponDiscount || 0),
      deliveryCharge: parseFloat(orderData?.deliveryCharge || 0),
      total: parseFloat(orderData?.total || 0),
      paymentMethod: orderData?.paymentMethod || 'unknown',
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
    },
  })

  // Increment coupon usage
  if (orderData?.couponCode) {
    await prisma.coupon.updateMany({
      where: { shopDomain: shop, code: orderData.couponCode },
      data: { usageCount: { increment: 1 } },
    })
  }

  // Update session order count
  if (sessionId) {
    await prisma.customerSession.update({
      where: { id: sessionId },
      data: { ordersCount: { increment: 1 } },
    }).catch(() => {})
  }

  // Create Shopify order (if access token configured)
  let shopifyOrderId = null
  if (config.shopifyAccessToken && orderData?.items?.length && !isDemo) {
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
          paymentGateway: `Razorpay (${orderData.paymentMethod})`,
          financialStatus: 'paid',
          tags: 'magic-checkout',
        },
      })
      shopifyOrderId = shopifyOrder?.order?.id
      await prisma.order.update({
        where: { id: order.id },
        data: { shopifyOrderId: String(shopifyOrderId) },
      })
    } catch (err) {
      console.error('Shopify order creation failed:', err.message)
    }
  }

  return res.status(200).json({
    verified: true,
    demo: isDemo,
    orderId: internalOrderId,
    paymentId: razorpay_payment_id || `pay_demo_${Date.now()}`,
    shopifyOrderId,
  })
}
