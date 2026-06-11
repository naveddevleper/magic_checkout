// pages/api/admin/store-config.js
import { prisma } from '../../../lib/prisma'
import { requireAdmin } from '../../../lib/auth'

async function handler(req, res) {
  const { shopDomain } = req.query

  if (!shopDomain) return res.status(400).json({ error: 'shopDomain required' })

  // GET - fetch config
  if (req.method === 'GET') {
    let config = await prisma.storeConfig.findUnique({ where: { shopDomain } })
    if (!config) {
      config = await prisma.storeConfig.create({ data: { shopDomain } })
    }

    // Parse JSON fields
    return res.status(200).json({
      ...config,
      footerLinks: safeJson(config.footerLinks, []),
      razorpayKeySecret: config.razorpayKeySecret ? '••••••••' : null, // mask secret
    })
  }

  // PUT - update config
  if (req.method === 'PUT') {
    const updates = { ...req.body }

    // Sanitize: don't overwrite secret if it's masked
    if (updates.razorpayKeySecret === '••••••••') {
      delete updates.razorpayKeySecret
    }

    // Serialize JSON fields
    if (Array.isArray(updates.footerLinks)) {
      updates.footerLinks = JSON.stringify(updates.footerLinks)
    }

    // Remove read-only fields
    delete updates.id
    delete updates.createdAt
    delete updates.updatedAt
    delete updates.shopDomain

    const config = await prisma.storeConfig.upsert({
      where: { shopDomain },
      update: { ...updates, updatedAt: new Date() },
      create: { shopDomain, ...updates },
    })

    return res.status(200).json({
      ...config,
      footerLinks: safeJson(config.footerLinks, []),
      razorpayKeySecret: config.razorpayKeySecret ? '••••••••' : null,
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

function safeJson(str, fallback) {
  try { return JSON.parse(str) } catch { return fallback }
}

export default requireAdmin(handler)
