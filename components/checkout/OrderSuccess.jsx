// components/checkout/OrderSuccess.jsx
import { useEffect, useState } from 'react'
import { Check, Package, Truck, Home, Copy } from 'lucide-react'

export default function OrderSuccess({ orderId, paymentId, method, total, address, config }) {
  const [copied, setCopied]     = useState(false)
  const [confetti, setConfetti] = useState(true)
  const { primaryColor, storeName } = config || {}

  useEffect(() => { const t = setTimeout(() => setConfetti(false), 4000); return () => clearTimeout(t) }, [])

  const copy = () => {
    navigator.clipboard.writeText(orderId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-start pt-10 px-4 pb-10">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={32} className="text-white stroke-[3]" />
          </div>
        </div>
        {confetti && ['🎉','✨','🎊','⭐','💫'].map((e,i) => (
          <span key={i} className="absolute text-xl animate-bounce"
            style={{ top:`${[0,80,20,60,40][i]}%`, left:`${[80,10,50,90,20][i]}%`, animationDelay:`${i*0.15}s` }}>{e}</span>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-gray-800 mb-1">Order Confirmed! 🎉</h1>
      <p className="text-sm text-gray-500 text-center mb-6">
        {method === 'cod' ? 'Your COD order has been placed!' : 'Payment successful! Your order is confirmed.'}
      </p>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-dashed border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Order ID</p>
            <p className="text-sm font-bold text-gray-800 font-mono">{orderId}</p>
          </div>
          <button onClick={copy} className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all"
            style={{ color: primaryColor, borderColor: `${primaryColor}40` }}>
            {copied ? <Check size={12}/> : <Copy size={12}/>}{copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {paymentId && (
          <div className="mb-3 pb-3 border-b border-dashed border-gray-100">
            <p className="text-xs text-gray-400">Payment ID</p>
            <p className="text-xs font-mono text-gray-600 truncate">{paymentId}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-3 pb-3 border-b border-dashed border-gray-100">
          <div><p className="text-xs text-gray-400">Amount</p><p className="text-base font-bold text-gray-800">₹{total?.toLocaleString()}</p></div>
          <div className="text-right"><p className="text-xs text-gray-400">Method</p><p className="text-sm font-medium text-gray-700 capitalize">{method === 'cod' ? 'Cash on Delivery' : method?.toUpperCase()}</p></div>
        </div>

        {address && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Delivering to</p>
            <p className="text-xs text-gray-600">{address.name} · {[address.line1,address.city,address.state,address.pincode].filter(Boolean).join(', ')}</p>
          </div>
        )}
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-4 mb-6">
        <p className="text-sm font-semibold text-gray-800 mb-4">What's next?</p>
        <div className="space-y-4">
          {[
            { icon: Check,   label: 'Order Confirmed',  desc: 'Just now',           done: true },
            { icon: Package, label: 'Being Packed',     desc: 'Within 24 hours',    done: false },
            { icon: Truck,   label: 'Out for Delivery', desc: 'In 3-4 days',        done: false },
            { icon: Home,    label: 'Delivered',        desc: 'Estimated Jun 12',   done: false },
          ].map((s,i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: s.done ? '#22c55e' : '#f3f4f6' }}>
                <s.icon size={14} style={{ color: s.done ? '#fff' : '#9ca3af' }} />
              </div>
              <div className="pt-0.5">
                <p className={`text-sm font-medium ${s.done ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</p>
                <p className="text-xs text-gray-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => window.location.href = '/'}
        className="w-full max-w-sm py-3.5 rounded-2xl text-white font-semibold text-sm transition-all active:scale-[0.98]"
        style={{ backgroundColor: primaryColor }}>
        Continue Shopping
      </button>
      <p className="mt-3 text-xs text-gray-400 text-center">Order confirmation sent to your email/SMS</p>
    </div>
  )
}
