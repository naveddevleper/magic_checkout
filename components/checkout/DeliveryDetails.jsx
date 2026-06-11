// components/checkout/DeliveryDetails.jsx
import { useState } from 'react'
import { MapPin, Edit2, ChevronDown, Check } from 'lucide-react'

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh']

export default function DeliveryDetails({ address, phone, onUpdate, config }) {
  const [editing, setEditing] = useState(!address)
  const [form, setForm]       = useState(address || { name:'', line1:'', line2:'', city:'', state:'Delhi', pincode:'', email:'', phone: phone||'' })
  const [errors, setErrors]   = useState({})
  const { primaryColor }      = config

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name   = 'Name required'
    if (!form.line1.trim()) e.line1  = 'Address required'
    if (!form.city.trim())  e.city   = 'City required'
    if (!form.state)        e.state  = 'State required'
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Valid 6-digit pincode required'
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone || form.phone.length !== 10) e.phone = 'Valid 10-digit number required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onUpdate(form); setEditing(false)
  }

  const F = ({ name, label, type='text', required, placeholder, children }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children || (
        <input type={type} value={form[name]} onChange={e => { setForm(f=>({...f,[name]:e.target.value})); setErrors(er=>({...er,[name]:''})) }}
          placeholder={placeholder}
          className={`w-full px-3 py-2.5 rounded-xl text-sm border transition-all outline-none ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
          style={!errors[name] ? { '--focus-border': primaryColor } : {}}
          onFocus={e => !errors[name] && (e.target.style.borderColor = primaryColor)}
          onBlur={e => !errors[name] && (e.target.style.borderColor = '#e5e7eb')}
        />
      )}
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  )

  if (!editing && address) {
    return (
      <div className="bg-white rounded-2xl shadow-card px-4 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
              <MapPin size={14} style={{ color: primaryColor }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-semibold text-gray-800">{address.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>Home</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {[address.line1,address.line2,address.city,address.state,address.pincode].filter(Boolean).join(', ')}
              </p>
              {address.phone && <p className="text-xs text-gray-400 mt-0.5">📞 {address.phone}</p>}
              {address.email && <p className="text-xs text-gray-400">✉ {address.email}</p>}
            </div>
          </div>
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition-all"
            style={{ color: primaryColor }}>
            <Edit2 size={12}/> Change
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} style={{ color: primaryColor }} />
        <h2 className="text-sm font-semibold text-gray-800">Delivery details</h2>
      </div>
      <div className="space-y-3">
        <F name="name" label="Full Name" required placeholder="Your full name" />
        <F name="line1" label="Address Line 1" required placeholder="House no., Street, Area" />
        <F name="line2" label="Address Line 2" placeholder="Landmark (optional)" />
        <div className="grid grid-cols-2 gap-3">
          <F name="city" label="City" required placeholder="City" />
          <F name="pincode" label="Pincode" required placeholder="110001" type="tel" />
        </div>
        <F name="state" label="State" required>
          <div className="relative">
            <select value={form.state} onChange={e => { setForm(f=>({...f,state:e.target.value})); setErrors(er=>({...er,state:''})) }}
              className="w-full px-3 py-2.5 rounded-xl text-sm border border-gray-200 appearance-none outline-none bg-white">
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
        </F>
        <F name="email" label="Email" type="email" placeholder="email@example.com" />
        <F name="phone" label="Mobile Number" required type="tel" placeholder="10-digit mobile" />
      </div>
      <button onClick={handleSave}
        className="mt-4 w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        style={{ backgroundColor: primaryColor }}>
        <Check size={16}/> Save & Continue
      </button>
    </div>
  )
}
