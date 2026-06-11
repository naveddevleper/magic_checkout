// lib/shopify.js
// Shopify Admin API integration

export async function shopifyFetch({ shop, accessToken, query, variables = {} }) {
  const url = `https://${shop}/admin/api/2024-04/graphql.json`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`)
  }

  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join(', '))
  }

  return json.data
}

// Shopify REST API helper
export async function shopifyRest({ shop, accessToken, endpoint, method = 'GET', body }) {
  const url = `https://${shop}/admin/api/2024-04/${endpoint}`

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Shopify REST error: ${res.status} - ${err}`)
  }

  return res.json()
}

// Create Shopify order after successful payment
export async function createShopifyOrder({ shop, accessToken, orderData }) {
  const {
    customer, lineItems, shippingAddress,
    totalPrice, paymentGateway, financialStatus,
    tags, note
  } = orderData

  const order = {
    order: {
      line_items: lineItems.map(item => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        price: item.price,
        title: item.title,
      })),
      customer: {
        first_name: customer.name?.split(' ')[0] || '',
        last_name: customer.name?.split(' ').slice(1).join(' ') || '',
        email: customer.email,
        phone: customer.phone,
      },
      shipping_address: {
        first_name: shippingAddress.name?.split(' ')[0] || '',
        last_name: shippingAddress.name?.split(' ').slice(1).join(' ') || '',
        address1: shippingAddress.line1,
        address2: shippingAddress.line2 || '',
        city: shippingAddress.city,
        province: shippingAddress.state,
        zip: shippingAddress.pincode,
        country: 'IN',
        phone: customer.phone,
      },
      billing_address: {
        first_name: shippingAddress.name?.split(' ')[0] || '',
        last_name: shippingAddress.name?.split(' ').slice(1).join(' ') || '',
        address1: shippingAddress.line1,
        city: shippingAddress.city,
        province: shippingAddress.state,
        zip: shippingAddress.pincode,
        country: 'IN',
      },
      financial_status: financialStatus || 'paid',
      gateway: paymentGateway || 'magic_checkout',
      total_price: totalPrice,
      currency: 'INR',
      tags: tags || 'magic-checkout',
      note: note || '',
      send_receipt: true,
      send_fulfillment_receipt: true,
    },
  }

  return shopifyRest({
    shop,
    accessToken,
    endpoint: 'orders.json',
    method: 'POST',
    body: order,
  })
}

// Verify Shopify webhook HMAC
export function verifyShopifyWebhook(rawBody, hmacHeader, secret) {
  const crypto = require('crypto')
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64')
  return hash === hmacHeader
}

// Get products from Shopify
export async function getShopifyProducts({ shop, accessToken, limit = 10 }) {
  return shopifyRest({
    shop,
    accessToken,
    endpoint: `products.json?limit=${limit}&fields=id,title,variants,images`,
  })
}
