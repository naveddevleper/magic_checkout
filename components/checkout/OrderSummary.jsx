// components/checkout/OrderSummary.jsx
import { useState } from 'react'
import { ChevronDown, ChevronUp, Tag, Truck, Gift } from 'lucide-react'

export default function OrderSummary({ products, totals, collapsed = true, config }) {
  const [open, setOpen] = useState(!collapsed)
  const { primaryColor } = config
  const { subtotal, originalTotal, discount, couponDiscount, deliveryCharge, total, totalSavings, itemCount } = totals

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors" onClick={() => setOpen(!open)}>
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-sm font-semibold text-gray-800">
            Order Summary <span className="text-gray-400 font-normal">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          </span>
          {totalSavings > 0 && !open && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1"><Tag size={10}/>You save ₹{totalSavings.toLocaleString()}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!open && originalTotal !== total && <span className="text-xs text-gray-400 line-through">₹{originalTotal.toLocaleString()}</span>}
          <span className="font-bold text-base" style={{ color: primaryColor }}>₹{total.toLocaleString()}</span>
          {open ? <ChevronUp size={16} className="text-gray-400"/> : <ChevronDown size={16} className="text-gray-400"/>}
        </div>
      </button>

      {open && (
        <div>
          <div className="px-4 pb-3 space-y-3">
            {products.map(p => (
              <div key={p.id} className="flex items-start gap-3">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.src = `https://via.placeholder.com/56x56/fce4ec/c2185b?text=${p.name[0]}` }} />
                  <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium" style={{ backgroundColor: primaryColor }}>{p.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-tight truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.color} · Size {p.size}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-800">₹{(p.price * p.quantity).toLocaleString()}</p>
                  {p.originalPrice > p.price && <p className="text-xs text-gray-400 line-through">₹{(p.originalPrice * p.quantity).toLocaleString()}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-100 px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <div className="flex items-center gap-1.5">
                {discount > 0 && <span className="line-through text-gray-400 text-xs">₹{originalTotal.toLocaleString()}</span>}
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
            </div>
            {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span className="flex items-center gap-1"><Gift size={12}/>Product discount</span><span>-₹{discount.toLocaleString()}</span></div>}
            {couponDiscount > 0 && <div className="flex justify-between text-sm text-green-600"><span className="flex items-center gap-1"><Tag size={12}/>Coupon discount</span><span>-₹{couponDiscount.toLocaleString()}</span></div>}
            <div className="flex justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1"><Truck size={12}/>Delivery</span>
              <span className={deliveryCharge === 0 ? 'text-green-600 font-medium' : ''}>{deliveryCharge === 0 ? 'Free' : `+₹${deliveryCharge}`}</span>
            </div>
          </div>

          <div className="border-t border-gray-100 px-4 py-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total</span>
              <span className="font-bold text-lg" style={{ color: primaryColor }}>₹{total.toLocaleString()}</span>
            </div>
            {totalSavings > 0 && (
              <div className="mt-2 bg-green-50 rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-lg">🎉</span>
                <span className="text-xs text-green-700 font-medium">You're saving ₹{totalSavings.toLocaleString()} on this order!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
