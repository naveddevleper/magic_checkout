// pages/api/shopify/install.js
// Shopify App OAuth installation flow

export default async function handler(req, res) {
  const { shop } = req.query

  if (!shop) return res.status(400).send('Missing shop parameter')

  // Validate shop domain format
  if (!/^[a-zA-Z0-9-]+\.myshopify\.com$/.test(shop)) {
    return res.status(400).send('Invalid shop domain')
  }

  const clientId = process.env.SHOPIFY_API_KEY
  const scopes = 'read_products,write_orders,read_customers,write_customers'
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/shopify/callback`
  const state = Buffer.from(Math.random().toString(36)).toString('base64')

  const installUrl =
    `https://${shop}/admin/oauth/authorize?` +
    `client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`

  res.redirect(installUrl)
}
