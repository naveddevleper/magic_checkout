// pages/api/shopify/callback.js
import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
  const { shop, code, state, hmac } = req.query

  if (!shop || !code) {
    return res.status(400).send('Missing parameters')
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      }),
    })

    if (!tokenRes.ok) throw new Error('Failed to exchange code for token')

    const { access_token } = await tokenRes.json()

    // Get shop info
    const shopRes = await fetch(`https://${shop}/admin/api/2024-04/shop.json`, {
      headers: { 'X-Shopify-Access-Token': access_token },
    })
    const { shop: shopInfo } = await shopRes.json()

    // Save/update store config with access token
    await prisma.storeConfig.upsert({
      where: { shopDomain: shop },
      update: {
        shopifyAccessToken: access_token,
        storeName: shopInfo.name,
        updatedAt: new Date(),
      },
      create: {
        shopDomain: shop,
        shopifyAccessToken: access_token,
        storeName: shopInfo.name,
      },
    })

    // Register mandatory webhooks
    await registerWebhooks(shop, access_token)

    // Redirect to admin panel
    res.redirect(`/admin?shop=${shop}&installed=true`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.redirect(`/admin/install-error?shop=${shop}&error=${encodeURIComponent(err.message)}`)
  }
}

async function registerWebhooks(shop, accessToken) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const webhooks = [
    { topic: 'app/uninstalled', address: `${appUrl}/api/shopify/webhooks?topic=app/uninstalled` },
    { topic: 'orders/cancelled', address: `${appUrl}/api/shopify/webhooks?topic=orders/cancelled` },
  ]

  for (const wh of webhooks) {
    try {
      await fetch(`https://${shop}/admin/api/2024-04/webhooks.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ webhook: wh }),
      })
    } catch (e) {
      console.warn('Webhook registration failed:', wh.topic, e.message)
    }
  }
}
