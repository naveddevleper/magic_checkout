// pages/api/checkout/config.js
// Public endpoint - returns store config for checkout frontend

import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { shop } = req.query
  if (!shop) return res.status(400).json({ error: 'shop required' })

  let config = await prisma.storeConfig.findUnique({
    where: { shopDomain: shop },
    include: {
      coupons: {
        where: { isActive: true },
        select: { code: true, type: true, value: true, maxDiscount: true, minAmount: true, minItems: true, description: true },
      },
    },
  })

  if (!config) {
    config = await prisma.storeConfig.create({ data: { shopDomain: shop } })
  }

  // Return only safe public fields (no secrets)
  return res.status(200).json({
    storeName: config.storeName,
    logoUrl: config.logoUrl,
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
    headerBannerText: config.headerBannerText,
    headerBannerColor: config.headerBannerColor,
    headerBannerEnabled: config.headerBannerEnabled,
    footerText: config.footerText,
    footerLinks: safeJson(config.footerLinks, []),
    codEnabled: config.codEnabled,
    codLimit: config.codLimit,
    upiEnabled: config.upiEnabled,
    cardEnabled: config.cardEnabled,
    netbankingEnabled: config.netbankingEnabled,
    walletEnabled: config.walletEnabled,
    emiEnabled: config.emiEnabled,
    payLaterEnabled: config.payLaterEnabled,
    prepaidDiscount: config.prepaidDiscount,
    expressDeliveryDays: config.expressDeliveryDays,
    quickDeliveryCharge: config.quickDeliveryCharge,
    quickDeliveryEnabled: config.quickDeliveryEnabled,
    razorpayKeyId: config.razorpayKeyId || null,
    coupons: config.coupons || [],
  })
}

function safeJson(str, fallback) {
  try { return str ? JSON.parse(str) : fallback } catch { return fallback }
}
