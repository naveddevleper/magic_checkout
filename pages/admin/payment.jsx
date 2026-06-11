// pages/admin/payment.jsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdmin } from '../../lib/useAdmin'
import { Save, Loader2, Zap, CreditCard, Landmark, Wallet, Clock, HandCoins, Banknote } from 'lucide-react'

const METHODS = [
  { key: 'upiEnabled', label: 'UPI Payment', icon: Zap, desc: 'Google Pay, PhonePe, Paytm, QR code' },
  { key: 'cardEnabled', label: 'Credit/Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Rupay' },
  { key: 'netbankingEnabled', label: 'Net Banking', icon: Landmark, desc: 'All major Indian banks' },
  { key: 'walletEnabled', label: 'Wallets', icon: Wallet, desc: 'Paytm, Amazon Pay, MobiKwik' },
  { key: 'emiEnabled', label: 'EMI', icon: Clock, desc: 'No-cost & standard EMI on cards' },
  { key: 'payLaterEnabled', label: 'Pay Later', icon: HandCoins, desc: 'Simpl, LazyPay, ZestMoney' },
  { key: 'codEnabled', label: 'Cash on Delivery', icon: Banknote, desc: 'Collect payment at doorstep' },
]

export default function PaymentSettings() {
  const { admin, loading: authLoading, shopDomain } = useAdmin()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!shopDomain) return
    fetch(`/api/admin/store-config?shopDomain=${shopDomain}`)
      .then(r => r.json())
      .then(d => { setConfig(d); setLoading(false) })
  }, [shopDomain])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/store-config?shopDomain=${shopDomain}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  const update = (key, value) => setConfig(c => ({ ...c, [key]: value }))

  if (authLoading || loading) return <LoadingSpinner />

  return (
    <>
      <Head><title>Payment Setup · Magic Checkout</title></Head>
      <AdminLayout admin={admin} shopDomain={shopDomain}>
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Setup</h1>
              <p className="text-sm text-gray-500 mt-0.5">Configure Razorpay and enable/disable payment methods</p>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>

          {config && (
            <div className="space-y-4">
              {/* Razorpay credentials */}
              <div className="bg-white rounded-2xl shadow-card p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Zap size={14} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Razorpay Credentials</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Key ID (Public)</label>
                    <input
                      type="text"
                      value={config.razorpayKeyId || ''}
                      onChange={e => update('razorpayKeyId', e.target.value)}
                      placeholder="rzp_test_XXXXXXXXXXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 transition-all font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Key Secret</label>
                    <input
                      type="password"
                      value={config.razorpayKeySecret || ''}
                      onChange={e => update('razorpayKeySecret', e.target.value)}
                      placeholder={config.razorpayKeySecret === '••••••••' ? 'Already set (enter to change)' : 'XXXXXXXXXXXXXXXXXXXXXXXX'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 transition-all font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-1">Secret is stored encrypted and never exposed to frontend</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700">
                    <strong>Test mode:</strong> Use <code>rzp_test_*</code> keys for testing. Switch to <code>rzp_live_*</code> for production.
                    Get your keys at <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="underline">dashboard.razorpay.com</a>
                  </p>
                </div>
              </div>

              {/* Payment methods toggle */}
              <div className="bg-white rounded-2xl shadow-card p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                  Payment Methods
                </h3>
                <div className="divide-y divide-gray-50">
                  {METHODS.map(({ key, label, icon: Icon, desc }) => (
                    <div key={key} className="flex items-center justify-between py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                          <Icon size={17} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => update(key, !config[key])}
                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0
                          ${config[key] ? 'bg-brand-500' : 'bg-gray-300'}`}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                          ${config[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* COD settings */}
              <div className="bg-white rounded-2xl shadow-card p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
                  COD Settings
                </h3>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Max COD Order Amount (₹)</label>
                  <input
                    type="number"
                    value={config.codLimit || 3000}
                    onChange={e => update('codLimit', parseFloat(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Orders above this limit will not show COD option</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  )
}

function LoadingSpinner() {
  return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" /></div>
}
