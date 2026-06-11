// lib/razorpay-server.js
// Server-side Razorpay helpers

import crypto from 'crypto'

export function getRazorpayInstance(keyId, keySecret) {
  const Razorpay = require('razorpay')
  return new Razorpay({ key_id: keyId, key_secret: keySecret })
}

export async function createRazorpayOrder({ keyId, keySecret, amount, currency = 'INR', receipt, notes }) {
  if (!keyId || !keySecret) {
    // Demo mode
    return {
      id: `order_demo_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes,
      demo: true,
    }
  }

  const instance = getRazorpayInstance(keyId, keySecret)
  return instance.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes: notes || {},
  })
}

export function verifyRazorpaySignature({ orderId, paymentId, signature, keySecret }) {
  if (!keySecret) return true // demo mode
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex')
  return expected === signature
}

// Client-side loader
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

export function toRazorpayAmount(rupees) {
  return Math.round(rupees * 100)
}
