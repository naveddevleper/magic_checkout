// lib/useCheckoutConfig.js
// Fetches store config from backend for dynamic checkout rendering

import { useState, useEffect } from 'react'

const DEFAULT_CONFIG = {
  storeName: 'My Store',
  logoUrl: null,
  primaryColor: '#e91e63',
  secondaryColor: '#c2185b',
  headerBannerText: 'No COD above Rs. 3000',
  headerBannerColor: '#1a1a1a',
  headerBannerEnabled: true,
  footerText: 'Powered by Shiprocket',
  footerLinks: [
    { label: 'T&C', url: '#' },
    { label: 'Privacy Policy', url: '#' },
    { label: 'Refund Policy', url: '#' },
  ],
  codEnabled: true,
  codLimit: 3000,
  upiEnabled: true,
  cardEnabled: true,
  netbankingEnabled: true,
  walletEnabled: true,
  emiEnabled: true,
  payLaterEnabled: true,
  prepaidDiscount: 50,
  expressDeliveryDays: 3,
  quickDeliveryCharge: 300,
  quickDeliveryEnabled: true,
  razorpayKeyId: null,
  coupons: [],
}

export function useCheckoutConfig(shopDomain) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!shopDomain) { setLoading(false); return }

    fetch(`/api/checkout/config?shop=${encodeURIComponent(shopDomain)}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load store config')
        return r.json()
      })
      .then(data => {
        setConfig({ ...DEFAULT_CONFIG, ...data })
        // Inject CSS custom properties for dynamic theming
        if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty('--color-brand', data.primaryColor || '#e91e63')
          document.documentElement.style.setProperty('--color-brand-dark', data.secondaryColor || '#c2185b')
        }
        setLoading(false)
      })
      .catch(err => {
        console.warn('Config load failed, using defaults:', err.message)
        setError(err.message)
        setLoading(false)
      })
  }, [shopDomain])

  return { config, loading, error }
}

// Get shop domain from URL or Shopify context
export function getShopDomain() {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return (
    params.get('shop') ||
    params.get('shopDomain') ||
    window.__SHOPIFY_SHOP__ ||
    'demo.myshopify.com'
  )
}
