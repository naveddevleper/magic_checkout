// components/checkout/CouponSection.jsx
import { useState } from 'react'
import { Tag, X, ChevronRight, Loader2, Check } from 'lucide-react'

export default function CouponSection({ shop, cartTotal, itemCount, appliedCoupon, onApply, onRemove, config }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showList, setShowList] = useState(false)

  const { primaryColor, coupons: availableCoupons = [] } = config

  const handleApply = async (couponCode) => {
    const codeToApply = (couponCode || code).toUpperCase().trim()
    if (!codeToApply) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop, code: codeToApply, cartTotal, itemCount }),
      })
      const data = await res.json()
      if (data.valid) { onApply(data.coupon); setCode(''); setShowList(false) }
      else setError(data.message || 'Invalid coupon')
    } catch { setError('Failed to apply coupon. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {appliedCoupon ? (
        <div className="px-4 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check size={16} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-700">{appliedCoupon.code} applied!</p>
            <p className="text-xs text-green-600">You save ₹{appliedCoupon.discount?.toLocaleString()}</p>
          </div>
          <button onClick={onRemove} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center px-3 py-2.5 gap-2">
            <Tag size={16} className="text-gray-400 flex-shrink-0" />
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleApply()}
              placeholder="Enter coupon code"
              className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
            />
            {code && <button onClick={() => setCode('')}><X size={14} className="text-gray-400" /></button>}
            <button
              onClick={() => handleApply()}
              disabled={!code || loading}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ color: code && !loading ? primaryColor : '#9ca3af' }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
            </button>
          </div>

          {error && <p className="px-4 pb-2 text-xs text-red-500">{error}</p>}

          {availableCoupons.length > 0 && (
            <button
              onClick={() => setShowList(!showList)}
              className="w-full flex items-center justify-between px-4 py-2.5 border-t border-dashed border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xs font-medium" style={{ color: primaryColor }}>Unlock coupons</span>
              <ChevronRight size={14} style={{ color: primaryColor }} className={`transition-transform ${showList ? 'rotate-90' : ''}`} />
            </button>
          )}

          {showList && availableCoupons.length > 0 && (
            <div className="border-t border-gray-100">
              {availableCoupons.map(c => (
                <div key={c.code} className="flex items-center justify-between px-4 py-3 border-b border-dashed border-gray-100 last:border-0">
                  <div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-md tracking-wide"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      {c.code}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                    <p className="text-xs text-green-600 font-medium">
                      Save {c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} (max ₹{c.maxDiscount})
                    </p>
                  </div>
                  <button
                    onClick={() => handleApply(c.code)}
                    disabled={loading}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
                    style={{ color: primaryColor, borderColor: `${primaryColor}40` }}
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
