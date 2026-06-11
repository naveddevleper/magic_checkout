// components/checkout/CheckoutHeader.jsx
import { ChevronLeft, Lock } from 'lucide-react'

export default function CheckoutHeader({ step, onBack, config }) {
  const { storeName, logoUrl, primaryColor, headerBannerEnabled, headerBannerText, headerBannerColor } = config
  const steps = ['Cart', 'Details', 'Payment']

  return (
    <div className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Dynamic banner from admin */}
      {headerBannerEnabled && headerBannerText && (
        <div
          className="text-center text-xs py-2 px-4 font-medium"
          style={{ backgroundColor: headerBannerColor || '#1a1a1a', color: '#fff' }}
        >
          {headerBannerText}
        </div>
      )}

      {/* Brand bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-8 w-auto object-contain" />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: primaryColor || '#e91e63' }}
            >
              <span className="text-white font-bold text-sm">
                {(storeName || 'S').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-semibold text-gray-800 text-sm">{storeName}</span>
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          <Lock size={12} />
          <span className="text-xs">Secure</span>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center px-4 pb-3 pt-2 gap-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all`}
                style={{
                  backgroundColor: i < step ? '#22c55e' : i === step ? (primaryColor || '#e91e63') : '#e5e7eb',
                  color: i <= step ? '#fff' : '#9ca3af',
                }}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: i === step ? (primaryColor || '#e91e63') : i < step ? '#22c55e' : '#9ca3af' }}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-1 mb-5 rounded-full transition-all"
                style={{ backgroundColor: i < step ? '#86efac' : '#e5e7eb' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
