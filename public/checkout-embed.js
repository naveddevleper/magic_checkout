// public/checkout-embed.js
// Paste this script in your Shopify theme to activate Magic Checkout
// Place in theme.liquid before </body> or use a Script Tag via Shopify API

;(function () {
  'use strict'

  // Configuration — update APP_URL to your deployed app URL
  var APP_URL = window.MAGIC_CHECKOUT_URL || 'https://your-magic-checkout-app.vercel.app'
  var SHOP    = window.Shopify?.shop || ''

  // Intercept checkout button clicks
  function intercept() {
    var selectors = [
      'button[name="checkout"]',
      'input[name="checkout"]',
      'a[href="/checkout"]',
      '.cart__checkout',
      '[data-action="checkout"]',
      '#checkout',
    ]

    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (btn) {
        if (btn.dataset.magicHooked) return
        btn.dataset.magicHooked = 'true'

        btn.addEventListener('click', function (e) {
          e.preventDefault()
          e.stopPropagation()
          openMagicCheckout()
        }, true)
      })
    })
  }

  // Gather cart data from Shopify AJAX API
  async function getCartData() {
    try {
      var r = await fetch('/cart.js')
      var cart = await r.json()
      return {
        items: cart.items.map(function (item) {
          return {
            id: String(item.id),
            variantId: item.variant_id,
            name: item.product_title,
            variantTitle: item.variant_title,
            sku: item.sku,
            price: item.price / 100,
            originalPrice: item.original_price / 100,
            quantity: item.quantity,
            image: item.image,
            color: item.variant_options?.[0] || '',
            size: item.variant_options?.[1] || '',
          }
        }),
        total: cart.total_price / 100,
        itemCount: cart.item_count,
      }
    } catch (err) {
      console.warn('Magic Checkout: could not load cart data', err)
      return null
    }
  }

  // Open Magic Checkout modal
  async function openMagicCheckout() {
    var cartData = await getCartData()

    // Inject cart data into checkout page via postMessage / query param
    var checkoutUrl = APP_URL + '/?shop=' + encodeURIComponent(SHOP)

    // Create overlay modal
    var overlay = document.createElement('div')
    overlay.id = 'magic-checkout-overlay'
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '99999',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'flex-end',
      animation: 'mcFadeIn 0.2s ease-out',
    })

    var modal = document.createElement('div')
    Object.assign(modal.style, {
      width: '100%', maxWidth: '480px', height: '95vh',
      margin: '0 auto', backgroundColor: '#fff',
      borderRadius: '20px 20px 0 0',
      overflow: 'hidden',
      animation: 'mcSlideUp 0.3s ease-out',
    })

    var iframe = document.createElement('iframe')
    iframe.src = checkoutUrl
    iframe.style.cssText = 'width:100%;height:100%;border:none;'
    iframe.allow = 'payment'

    // Inject CSS animation
    var style = document.createElement('style')
    style.textContent = '@keyframes mcFadeIn{from{opacity:0}to{opacity:1}}@keyframes mcSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}'
    document.head.appendChild(style)

    // Close on overlay click
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal()
    })

    modal.appendChild(iframe)
    overlay.appendChild(modal)
    document.body.appendChild(overlay)
    document.body.style.overflow = 'hidden'

    // Pass cart data to iframe after load
    iframe.addEventListener('load', function () {
      if (cartData) {
        iframe.contentWindow.postMessage({ type: 'MAGIC_CHECKOUT_CART', data: cartData }, APP_URL)
      }
    })

    // Listen for close / success from iframe
    window.addEventListener('message', function onMsg(e) {
      if (e.origin !== APP_URL) return
      if (e.data?.type === 'MAGIC_CHECKOUT_CLOSE') {
        closeModal()
        window.removeEventListener('message', onMsg)
      }
      if (e.data?.type === 'MAGIC_CHECKOUT_SUCCESS') {
        closeModal()
        window.removeEventListener('message', onMsg)
        if (e.data.orderId) window.location.href = '/pages/order-confirmed?order=' + e.data.orderId
      }
    })
  }

  function closeModal() {
    var overlay = document.getElementById('magic-checkout-overlay')
    if (overlay) overlay.remove()
    document.body.style.overflow = ''
  }

  // Hook into cart page and dynamic cart drawers
  function init() {
    intercept()
    // Re-intercept when DOM changes (for dynamic carts)
    var observer = new MutationObserver(function () { intercept() })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
