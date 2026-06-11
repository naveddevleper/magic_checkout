// pages/index.jsx  — Dynamic checkout driven entirely by backend config
import { useState, useCallback, useEffect } from 'react'
import Head from 'next/head'
import { useCheckoutConfig, getShopDomain } from '../lib/useCheckoutConfig'
import { loadRazorpayScript, toRazorpayAmount } from '../lib/razorpay-server'
import CheckoutHeader   from '../components/checkout/CheckoutHeader'
import CheckoutFooter   from '../components/checkout/CheckoutFooter'
import CouponSection    from '../components/checkout/CouponSection'
import PaymentSection   from '../components/checkout/PaymentSection'
import OrderSummary     from '../components/checkout/OrderSummary'
import PhoneStep        from '../components/checkout/PhoneStep'
import DeliveryDetails  from '../components/checkout/DeliveryDetails'
import DeliveryOptions  from '../components/checkout/DeliveryOptions'
import OrderSuccess     from '../components/checkout/OrderSuccess'
import Toast            from '../components/checkout/Toast'

const STEP = { PHONE: 0, DETAILS: 1, PAYMENT: 2, SUCCESS: 3 }

// Shopify injects cart data via window.__CHECKOUT_DATA__ or query params
function getCartItems() {
  if (typeof window !== 'undefined' && window.__CHECKOUT_DATA__?.items) {
    return window.__CHECKOUT_DATA__.items
  }
  return [
    { id: 'prod_001', name: 'Premium Embroidered Kurta Set', sku: 'KS-001', price: 3999, originalPrice: 4999, quantity: 1, color: 'Rose Pink', size: 'M', image: 'https://via.placeholder.com/80x80/fce4ec/c2185b?text=K', variantId: null },
    { id: 'prod_002', name: 'Designer Palazzo Pants',        sku: 'PP-002', price: 3999, originalPrice: 4999, quantity: 1, color: 'Ivory White', size: 'M', image: 'https://via.placeholder.com/80x80/fce4ec/c2185b?text=P', variantId: null },
  ]
}

function calculateTotals(items, coupon, deliveryOption) {
  const subtotal     = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const originalTotal= items.reduce((s, i) => s + i.originalPrice * i.quantity, 0)
  const discount     = originalTotal - subtotal
  let couponDiscount = 0
  if (coupon) {
    couponDiscount = coupon.type === 'percent'
      ? Math.min(Math.floor((subtotal * coupon.value) / 100), coupon.maxDiscount || 9999)
      : Math.min(coupon.value, coupon.maxDiscount || 9999)
  }
  const deliveryCharge = deliveryOption?.price || 0
  const total = Math.max(subtotal - couponDiscount + deliveryCharge, 0)
  const totalSavings = discount + couponDiscount
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)
  return { subtotal, originalTotal, discount, couponDiscount, deliveryCharge, total, totalSavings, itemCount }
}

export default function Checkout() {
  const [shopDomain, setShopDomain]     = useState('demo.myshopify.com')
  const { config, loading: configLoading } = useCheckoutConfig(shopDomain)
  const [products]                       = useState(getCartItems)

  const [step, setStep]                 = useState(STEP.PHONE)
  const [phone, setPhone]               = useState('')
  const [address, setAddress]           = useState(null)
  const [sessionId, setSessionId]       = useState(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem('mc_session_id')
  })
  const [deliveryOption, setDeliveryOption] = useState(null)
  const [appliedCoupon, setAppliedCoupon]   = useState(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [orderResult, setOrderResult]   = useState(null)
  const [toasts, setToasts]             = useState([])

  // Set shop domain on client
  useEffect(() => {
    const shop = getShopDomain()
    if (shop) setShopDomain(shop)
  }, [])

  // Persist session key locally
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionId) {
      window.localStorage.setItem('mc_session_id', sessionId)
    }
  }, [sessionId])

  // Set default delivery option when config loads
  useEffect(() => {
    if (config && !deliveryOption) {
      setDeliveryOption({ id: 'express', label: 'Express', price: 0, date: `In ${config.expressDeliveryDays || 3}-4 days` })
    }
  }, [config])

  const toast = useCallback((msg) => {
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, ...msg }])
  }, [])
  const removeToast = useCallback(id => setToasts(t => t.filter(x => x.id !== id)), [])

  const totals = calculateTotals(products, appliedCoupon, deliveryOption)

  const updateSession = useCallback(async () => {
    if (!shopDomain || !products?.length) return

    try {
      const r = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: shopDomain,
          sessionId,
          phone: phone || undefined,
          name: address?.name,
          email: address?.email,
          address,
          items: products,
          cartTotal: totals.subtotal,
          itemCount: totals.itemCount,
        }),
      })
      const d = await r.json()
      if (d?.sessionId) setSessionId(d.sessionId)
    } catch (err) {
      console.warn('Session tracking failed', err.message)
    }
  }, [shopDomain, sessionId, phone, address, products, totals.subtotal, totals.itemCount])

  useEffect(() => {
    updateSession()
  }, [updateSession])

  const handlePhoneSubmit = async (phoneNumber) => {
    setPhone(phoneNumber)
    // Track session
    try {
      const r = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: shopDomain, phone: phoneNumber }),
      })
      const d = await r.json()
      setSessionId(d.sessionId)
    } catch {}
    setStep(STEP.DETAILS)
  }

  const handleAddressSubmit = async (addr) => {
    setAddress(addr)
    // Update session with address
    if (sessionId) {
      fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: shopDomain, phone, name: addr.name, email: addr.email, address: addr, sessionId }),
      }).catch(() => {})
    }
    setStep(STEP.PAYMENT)
  }

  const handlePay = async ({ method, details }) => {
    if (paymentLoading) return
    setPaymentLoading(true)

    const isPrepaid = method !== 'cod'
    const finalAmount = isPrepaid ? Math.max(totals.total - (config.prepaidDiscount || 0), 0) : totals.total

    const orderPayload = {
      phone,
      email: address?.email,
      name: address?.name,
      address,
      items: products,
      subtotal: totals.subtotal,
      discount: totals.discount,
      couponCode: appliedCoupon?.code,
      couponDiscount: totals.couponDiscount,
      deliveryCharge: totals.deliveryCharge,
      total: finalAmount,
      paymentMethod: method,
    }

    try {
      // COD
      if (method === 'cod') {
        const r = await fetch('/api/checkout/place-cod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shop: shopDomain, sessionId, orderData: orderPayload }),
        })
        const d = await r.json()
        setPaymentLoading(false)
        if (d.success) {
          setOrderResult({ orderId: d.orderId, method: 'cod', total: finalAmount })
          setStep(STEP.SUCCESS)
        } else {
          toast({ type: 'error', title: 'Order Failed', message: d.error || 'Failed to place order' })
        }
        return
      }

      // Online: create Razorpay order
      const orderRes = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: shopDomain, amount: finalAmount, sessionId }),
      })
      const orderData = await orderRes.json()
      if (!orderData.order) throw new Error(orderData.error || 'Failed to create order')

      const { order, demo, keyId } = orderData

      // Demo mode
      if (demo || !keyId) {
        await new Promise(r => setTimeout(r, 1000))
        const r = await fetch('/api/checkout/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shop: shopDomain, demo: true,
            razorpay_order_id: order.id, razorpay_payment_id: `pay_demo_${Date.now()}`,
            sessionId, orderData: orderPayload,
          }),
        })
        const d = await r.json()
        setPaymentLoading(false)
        setOrderResult({ orderId: d.orderId, paymentId: d.paymentId, method, total: finalAmount })
        setStep(STEP.SUCCESS)
        toast({ type: 'info', message: 'Demo mode: add Razorpay keys in admin for real payments' })
        return
      }

      // Real Razorpay
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error('Payment SDK failed to load')

      const options = {
        key: keyId,
        amount: toRazorpayAmount(finalAmount),
        currency: 'INR',
        name: config.storeName,
        order_id: order.id,
        prefill: { name: address?.name, email: address?.email, contact: `+91${phone}` },
        theme: { color: config.primaryColor || '#e91e63' },
        modal: { ondismiss: () => { setPaymentLoading(false); toast({ type: 'info', message: 'Payment cancelled' }) } },
        handler: async (response) => {
          const vr = await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shop: shopDomain,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              sessionId, orderData: orderPayload,
            }),
          })
          const vd = await vr.json()
          setPaymentLoading(false)
          if (vd.verified) {
            setOrderResult({ orderId: vd.orderId, paymentId: vd.paymentId, method, total: finalAmount })
            setStep(STEP.SUCCESS)
          } else {
            toast({ type: 'error', title: 'Verification Failed', message: 'Contact support with your payment ID' })
          }
        },
      }

      // Method pre-selection
      if (method === 'upi') options.method = { upi: true }
      else if (method === 'card') options.method = { card: true }
      else if (method === 'netbanking') options.method = { netbanking: true }
      else if (method === 'wallets') options.method = { wallet: true }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (resp) => {
        setPaymentLoading(false)
        toast({ type: 'error', title: 'Payment Failed', message: resp?.error?.description || 'Payment declined' })
      })
      rzp.open()

    } catch (err) {
      setPaymentLoading(false)
      toast({ type: 'error', title: 'Error', message: err.message || 'Something went wrong' })
    }
  }

  // Delivery options from config
  const deliveryOptions = [
    { id: 'express', label: 'Express', icon: '⚡', date: `In ${config.expressDeliveryDays || 3}-4 days`, price: 0, priceLabel: 'Free', prepaidOnly: false },
    ...(config.quickDeliveryEnabled ? [{ id: 'quick', label: 'Quick ⚡', icon: '🏃', date: '2 HR Delivery', price: config.quickDeliveryCharge || 300, priceLabel: `+₹${config.quickDeliveryCharge || 300}`, prepaidOnly: true, badge: 'Only on prepaid' }] : []),
  ]

  if (step === STEP.SUCCESS) {
    return (
      <>
        <Head><title>Order Confirmed · {config.storeName}</title></Head>
        <OrderSuccess {...orderResult} address={address} config={config} />
        <Toast toasts={toasts} onRemove={removeToast} />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Checkout · {config.storeName}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <CheckoutHeader step={step} onBack={() => step > 0 && setStep(s => s - 1)} config={config} />

        <div className="flex-1 px-3 py-4 space-y-3 max-w-lg mx-auto w-full pb-16">
          <OrderSummary products={products} totals={totals} collapsed={step > STEP.PHONE} config={config} />
          <CouponSection
            shop={shopDomain} cartTotal={totals.subtotal} itemCount={totals.itemCount}
            appliedCoupon={appliedCoupon} config={config}
            onApply={c => { setAppliedCoupon(c); toast({ type: 'success', title: 'Coupon applied!', message: `Save ₹${c.discount?.toLocaleString()} 🎉` }) }}
            onRemove={() => { setAppliedCoupon(null); toast({ type: 'info', message: 'Coupon removed' }) }}
          />

          {step === STEP.PHONE && <PhoneStep onSubmit={handlePhoneSubmit} config={config} />}

          {step >= STEP.DETAILS && (
            <>
              <DeliveryDetails address={address} phone={phone} onUpdate={handleAddressSubmit} config={config} />
              {address && (
                <DeliveryOptions options={deliveryOptions} selected={deliveryOption} onChange={setDeliveryOption} config={config} />
              )}
            </>
          )}

          {step === STEP.PAYMENT && address && (
            <PaymentSection total={totals.total} onPay={handlePay} config={config} loading={paymentLoading} />
          )}
        </div>

        <CheckoutFooter config={config} />
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  )
}
