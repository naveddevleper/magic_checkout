// components/checkout/PaymentSection.jsx
import { useState } from 'react'
import { ChevronRight, Shield, Zap, Loader2, QrCode, Eye, EyeOff, CreditCard, Landmark, Wallet, Clock, HandCoins, Banknote } from 'lucide-react'

const METHOD_META = {
  upi:         { label: 'UPI Payment',       icon: Zap,         enabledKey: 'upiEnabled' },
  card:        { label: 'Credit/Debit Card', icon: CreditCard,  enabledKey: 'cardEnabled' },
  netbanking:  { label: 'Net Banking',       icon: Landmark,    enabledKey: 'netbankingEnabled' },
  wallets:     { label: 'Wallets',           icon: Wallet,      enabledKey: 'walletEnabled' },
  paylater:    { label: 'Pay Later',         icon: HandCoins,   enabledKey: 'payLaterEnabled' },
  emi:         { label: 'Pay with EMI',      icon: Clock,       enabledKey: 'emiEnabled' },
}

export default function PaymentSection({ total, onPay, config, loading: payLoading }) {
  const { primaryColor, codEnabled, codLimit, prepaidDiscount } = config
  const [selected, setSelected] = useState('upi')
  const [showQR, setShowQR] = useState(false)
  const [upiId, setUpiId] = useState('')
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [showCVV, setShowCVV] = useState(false)
  const [selectedBank, setSelectedBank] = useState('')

  const prepaidTotal = Math.max(total - (prepaidDiscount || 0), 0)
  const codAvailable = codEnabled && total <= (codLimit || 3000)

  const enabledMethods = Object.entries(METHOD_META).filter(([, meta]) => config[meta.enabledKey])

  const handlePay = (method, extra = {}) => {
    onPay({ method, details: { upiId, cardDetails, selectedBank, ...extra } })
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold text-gray-800">Pay via</h2>
      </div>

      {/* Online savings banner */}
      {prepaidDiscount > 0 && (
        <div className="mx-4 mb-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
          <Zap size={14} className="text-green-600 flex-shrink-0" />
          <span className="text-xs text-green-700 font-medium">Save ₹{prepaidDiscount} by paying online</span>
        </div>
      )}

      <div className="divide-y divide-gray-50">
        {/* Online payment methods */}
        {enabledMethods.map(([id, meta]) => {
          const isSelected = selected === id
          const Icon = meta.icon

          return (
            <div key={id}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${isSelected ? 'bg-opacity-5' : 'hover:bg-gray-50'}`}
                style={isSelected ? { backgroundColor: `${primaryColor}08` } : {}}
                onClick={() => setSelected(isSelected ? null : id)}
              >
                {/* Radio */}
                <div
                  className="rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    width: 18, height: 18,
                    borderColor: isSelected ? primaryColor : '#d1d5db',
                  }}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />
                  )}
                </div>

                <Icon size={18} className={isSelected ? '' : 'text-gray-500'} style={isSelected ? { color: primaryColor } : {}} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{meta.label}</p>
                  {prepaidDiscount > 0 && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      Save ₹{prepaidDiscount}
                    </p>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  {prepaidDiscount > 0 && total !== prepaidTotal && (
                    <p className="text-xs text-gray-400 line-through">₹{total.toLocaleString()}</p>
                  )}
                  <p className="text-sm font-semibold text-gray-800">₹{prepaidTotal.toLocaleString()}</p>
                </div>
                <ChevronRight size={14} className={`text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </button>

              {/* Expanded method panels */}
              {isSelected && (
                <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
                  {id === 'upi' && (
                    <UPIPanel
                      showQR={showQR} setShowQR={setShowQR}
                      upiId={upiId} setUpiId={setUpiId}
                      amount={prepaidTotal} onPay={() => handlePay('upi')}
                      loading={payLoading} primaryColor={primaryColor}
                    />
                  )}
                  {id === 'card' && (
                    <CardPanel
                      details={cardDetails} setDetails={setCardDetails}
                      showCVV={showCVV} setShowCVV={setShowCVV}
                      amount={prepaidTotal} onPay={() => handlePay('card')}
                      loading={payLoading} primaryColor={primaryColor}
                    />
                  )}
                  {id === 'netbanking' && (
                    <NetBankingPanel
                      selectedBank={selectedBank} setSelectedBank={setSelectedBank}
                      amount={prepaidTotal} onPay={() => handlePay('netbanking')}
                      loading={payLoading} primaryColor={primaryColor}
                    />
                  )}
                  {id === 'wallets' && (
                    <WalletPanel amount={prepaidTotal} onPay={() => handlePay('wallets')} loading={payLoading} primaryColor={primaryColor} />
                  )}
                  {(id === 'paylater' || id === 'emi') && (
                    <GenericPanel label={meta.label} amount={prepaidTotal} onPay={() => handlePay(id)} loading={payLoading} primaryColor={primaryColor} />
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* COD */}
        {codEnabled && (
          <div>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${!codAvailable ? 'opacity-50 cursor-not-allowed' : selected === 'cod' ? 'bg-opacity-5' : 'hover:bg-gray-50'}`}
              style={selected === 'cod' ? { backgroundColor: `${primaryColor}08` } : {}}
              onClick={() => codAvailable && setSelected('cod')}
              disabled={!codAvailable}
            >
              <div
                className="rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ width: 18, height: 18, borderColor: selected === 'cod' ? primaryColor : '#d1d5db' }}
              >
                {selected === 'cod' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }} />}
              </div>
              <Banknote size={18} className="text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Cash on Delivery</p>
                {!codAvailable && (
                  <p className="text-xs text-red-500">Not available above ₹{codLimit?.toLocaleString()}</p>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800">₹{total.toLocaleString()}</p>
              <ChevronRight size={14} className={`text-gray-400 transition-transform ${selected === 'cod' ? 'rotate-90' : ''}`} />
            </button>

            {selected === 'cod' && codAvailable && (
              <div className="bg-gray-50 px-4 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-3">Pay ₹{total.toLocaleString()} in cash when your order is delivered.</p>
                <PayBtn amount={total} onPay={() => handlePay('cod')} label="Place Order" loading={payLoading} primaryColor={primaryColor} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security badges */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-center gap-3 text-xs text-gray-400 flex-wrap">
        <span className="flex items-center gap-1"><Shield size={10} /> PCI DSS</span>
        <span>🔒 Secure Payments</span>
        <span>🚚 Assured Delivery</span>
        <span>✅ Verified Seller</span>
      </div>
    </div>
  )
}

/* ── Sub-panels ─────────────────────────────────── */

function UPIPanel({ showQR, setShowQR, upiId, setUpiId, amount, onPay, loading, primaryColor }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[{ label: 'GPay', emoji: '💳' }, { label: 'PhonePe', emoji: '💜' }, { label: 'Paytm', emoji: '🔵' }].map(a => (
          <button key={a.label} onClick={onPay}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
            <span className="text-xl">{a.emoji}</span>
            <span className="text-xs text-gray-600 font-medium">{a.label}</span>
          </button>
        ))}
        <button onClick={() => setShowQR(!showQR)}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all">
          <QrCode size={20} className="text-gray-500" />
          <span className="text-xs text-gray-600 font-medium">QR</span>
        </button>
      </div>

      {showQR && (
        <div className="flex flex-col items-center gap-2 py-3">
          <div className="bg-white border-2 rounded-2xl p-3 shadow-sm" style={{ borderColor: `${primaryColor}40` }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=merchant@paytm&pn=Store&am=${amount}&cu=INR`}
              alt="UPI QR"
              className="w-36 h-36"
            />
          </div>
          <p className="text-xs text-gray-500">Scan to pay ₹{amount.toLocaleString()}</p>
        </div>
      )}

      <div className="flex gap-2">
        <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
          placeholder="yourname@upi"
          className="flex-1 px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-gray-400" />
        <button onClick={onPay} disabled={loading}
          className="px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
          style={{ backgroundColor: primaryColor }}>
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Pay'}
        </button>
      </div>
      <PayBtn amount={amount} onPay={onPay} label="Pay via UPI" loading={loading} primaryColor={primaryColor} />
    </div>
  )
}

function CardPanel({ details, setDetails, showCVV, setShowCVV, amount, onPay, loading, primaryColor }) {
  const fmtCard = v => v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})/g,'$1 ').trim()
  const fmtExp  = v => { const d = v.replace(/\D/g,'').slice(0,4); return d.length >= 2 ? d.slice(0,2)+'/'+d.slice(2) : d }

  return (
    <div className="space-y-2.5">
      <input type="tel" value={details.number} onChange={e => setDetails(d => ({...d,number:fmtCard(e.target.value)}))}
        placeholder="1234 5678 9012 3456"
        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-gray-400" />
      <input type="text" value={details.name} onChange={e => setDetails(d => ({...d,name:e.target.value}))}
        placeholder="Name on card"
        className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-gray-400" />
      <div className="flex gap-2">
        <input type="tel" value={details.expiry} onChange={e => setDetails(d => ({...d,expiry:fmtExp(e.target.value)}))}
          placeholder="MM/YY"
          className="flex-1 px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-gray-400" />
        <div className="relative flex-1">
          <input type={showCVV?'text':'password'} value={details.cvv} maxLength={4}
            onChange={e => setDetails(d => ({...d,cvv:e.target.value.replace(/\D/g,'').slice(0,4)}))}
            placeholder="CVV"
            className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 outline-none focus:border-gray-400 pr-9" />
          <button onClick={() => setShowCVV(!showCVV)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            {showCVV ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        </div>
      </div>
      <PayBtn amount={amount} onPay={onPay} label="Pay Securely" loading={loading} primaryColor={primaryColor} />
    </div>
  )
}

function NetBankingPanel({ selectedBank, setSelectedBank, amount, onPay, loading, primaryColor }) {
  const banks = ['HDFC Bank','ICICI Bank','SBI','Axis Bank','Kotak Bank','Yes Bank']
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {banks.map(b => (
          <button key={b} onClick={() => setSelectedBank(b)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition-all"
            style={selectedBank===b ? {borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}08`} : {borderColor:'#e5e7eb',color:'#374151'}}>
            🏦 {b}
          </button>
        ))}
      </div>
      <PayBtn amount={amount} onPay={onPay} label={selectedBank ? `Pay via ${selectedBank}` : 'Select Bank'} loading={loading} primaryColor={primaryColor} disabled={!selectedBank} />
    </div>
  )
}

function WalletPanel({ amount, onPay, loading, primaryColor }) {
  return (
    <div className="space-y-2">
      {[{n:'Paytm Wallet',e:'🔵'},{n:'Amazon Pay',e:'🟠'},{n:'MobiKwik',e:'🟣'}].map(w => (
        <button key={w.n} onClick={onPay}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-all text-left">
          <span className="text-xl">{w.e}</span>
          <span className="text-sm text-gray-700">{w.n}</span>
          <ChevronRight size={14} className="ml-auto text-gray-400" />
        </button>
      ))}
    </div>
  )
}

function GenericPanel({ label, amount, onPay, loading, primaryColor }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">You'll be redirected to complete payment.</p>
      <PayBtn amount={amount} onPay={onPay} label={`Proceed with ${label}`} loading={loading} primaryColor={primaryColor} />
    </div>
  )
}

function PayBtn({ amount, onPay, loading, label, primaryColor, disabled }) {
  return (
    <button onClick={onPay} disabled={loading || disabled}
      className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{ backgroundColor: loading || disabled ? '#d1d5db' : primaryColor }}>
      {loading ? <Loader2 size={16} className="animate-spin"/> : `${label} · ₹${amount?.toLocaleString()}`}
    </button>
  )
}
