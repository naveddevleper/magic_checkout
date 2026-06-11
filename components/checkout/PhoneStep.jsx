// components/checkout/PhoneStep.jsx
import { useState } from 'react'
import { Smartphone, ArrowRight, Loader2 } from 'lucide-react'

export default function PhoneStep({ onSubmit, config }) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { primaryColor } = config

  const handleSubmit = async () => {
    if (!phone || phone.length !== 10 || !/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number'); return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    setLoading(false)
    onSubmit(phone)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-5">
      <div className="flex items-center gap-2 mb-1">
        <Smartphone size={16} style={{ color: primaryColor }} />
        <h2 className="text-sm font-semibold text-gray-800">Enter mobile number</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4 ml-6">Provide your mobile number to continue</p>

      <div className={`flex items-center border rounded-xl overflow-hidden transition-all ${error ? 'border-red-400' : 'border-gray-200'}`}
        style={{ '--focus-color': primaryColor }}>
        <div className="flex items-center gap-1.5 px-3 py-3 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          <span className="text-base leading-none">🇮🇳</span>
          <span className="text-sm font-medium text-gray-600">+91</span>
        </div>
        <input
          type="tel" inputMode="numeric" maxLength={10} value={phone}
          onChange={e => { setPhone(e.target.value.replace(/\D/g,'').slice(0,10)); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="10-digit mobile number"
          className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5 ml-1">{error}</p>}

      <button
        onClick={handleSubmit} disabled={phone.length !== 10 || loading}
        className="mt-4 w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all text-white"
        style={{ backgroundColor: phone.length === 10 && !loading ? primaryColor : '#d1d5db' }}
      >
        {loading ? <Loader2 size={16} className="animate-spin"/> : <><span>Continue</span><ArrowRight size={16}/></>}
      </button>

      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-400">
        <span>🔒 100% Secure</span><span>·</span><span>🛡️ PCI DSS Certified</span>
      </div>
    </div>
  )
}
