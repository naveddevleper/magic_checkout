// components/checkout/DeliveryOptions.jsx
export default function DeliveryOptions({ options, selected, onChange, config }) {
  const { primaryColor } = config
  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-4">
      <h2 className="text-sm font-semibold text-gray-800 mb-3">Delivery options</h2>
      <div className="flex gap-3">
        {options.map(opt => {
          const isSelected = selected?.id === opt.id
          return (
            <button key={opt.id} onClick={() => onChange(opt)}
              className="flex-1 border-2 rounded-xl p-3 text-left transition-all"
              style={{ borderColor: isSelected ? primaryColor : '#e5e7eb', backgroundColor: isSelected ? `${primaryColor}08` : '#fff' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{opt.icon}</span>
                <span className="text-xs font-semibold" style={isSelected ? { color: primaryColor } : { color: '#374151' }}>{opt.label}</span>
              </div>
              <p className="text-xs font-medium" style={isSelected ? { color: primaryColor } : { color: '#6b7280' }}>{opt.date}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: opt.price === 0 ? '#16a34a' : isSelected ? primaryColor : '#374151' }}>
                {opt.priceLabel}
              </p>
              {opt.badge && (
                <span className="mt-1.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                  style={isSelected ? { backgroundColor: `${primaryColor}20`, color: primaryColor } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                  {opt.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
