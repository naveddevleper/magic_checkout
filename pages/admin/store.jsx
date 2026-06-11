// pages/admin/store.jsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdmin } from '../../lib/useAdmin'
import { Save, Loader2, Plus, Trash2, Store, Palette, Layout, Link as LinkIcon } from 'lucide-react'

export default function StoreSettings() {
  const { admin, loading: authLoading, shopDomain } = useAdmin()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    if (!shopDomain) return
    fetch(`/api/admin/store-config?shopDomain=${shopDomain}`)
      .then(r => r.json())
      .then(d => { setConfig(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [shopDomain])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch(`/api/admin/store-config?shopDomain=${shopDomain}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    const data = await res.json()
    if (res.ok) {
      setConfig(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  const update = (key, value) => setConfig(c => ({ ...c, [key]: value }))

  const TABS = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'header', label: 'Header/Footer', icon: Layout },
    { id: 'shopify', label: 'Shopify', icon: LinkIcon },
  ]

  if (authLoading || loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" /></div>

  return (
    <>
      <Head><title>Store Settings · Magic Checkout</title></Head>
      <AdminLayout admin={admin} shopDomain={shopDomain}>
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
              <p className="text-sm text-gray-500 mt-0.5">Customize your checkout appearance and behavior</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
                  ${activeTab === t.id ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <t.icon size={14} />{t.label}
              </button>
            ))}
          </div>

          {config && (
            <div className="space-y-4">
              {/* GENERAL TAB */}
              {activeTab === 'general' && (
                <Card title="General Information">
                  <Field label="Store Name">
                    <Input value={config.storeName || ''} onChange={v => update('storeName', v)} placeholder="My Store" />
                  </Field>
                  <Field label="Logo URL" hint="Direct image URL for your store logo">
                    <Input value={config.logoUrl || ''} onChange={v => update('logoUrl', v)} placeholder="https://your-store.com/logo.png" />
                    {config.logoUrl && (
                      <img src={config.logoUrl} alt="Logo preview" className="mt-2 h-10 object-contain rounded border border-gray-200 p-1" />
                    )}
                  </Field>
                  <Field label="COD Limit (₹)" hint="Orders above this amount will not have COD option">
                    <Input type="number" value={config.codLimit || 3000} onChange={v => update('codLimit', parseFloat(v))} />
                  </Field>
                  <Field label="Prepaid Discount (₹)" hint="Discount given to customers who pay online">
                    <Input type="number" value={config.prepaidDiscount || 50} onChange={v => update('prepaidDiscount', parseFloat(v))} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Express Delivery Days">
                      <Input type="number" value={config.expressDeliveryDays || 3} onChange={v => update('expressDeliveryDays', parseInt(v))} />
                    </Field>
                    <Field label="Quick Delivery Charge (₹)">
                      <Input type="number" value={config.quickDeliveryCharge || 300} onChange={v => update('quickDeliveryCharge', parseFloat(v))} />
                    </Field>
                  </div>
                  <Toggle
                    label="Enable Quick (2HR) Delivery"
                    checked={config.quickDeliveryEnabled}
                    onChange={v => update('quickDeliveryEnabled', v)}
                  />
                </Card>
              )}

              {/* BRANDING TAB */}
              {activeTab === 'branding' && (
                <Card title="Colors & Branding">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Primary Color">
                      <div className="flex items-center gap-2">
                        <input type="color" value={config.primaryColor || '#e91e63'}
                          onChange={e => update('primaryColor', e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                        />
                        <Input value={config.primaryColor || '#e91e63'} onChange={v => update('primaryColor', v)} />
                      </div>
                    </Field>
                    <Field label="Secondary Color">
                      <div className="flex items-center gap-2">
                        <input type="color" value={config.secondaryColor || '#c2185b'}
                          onChange={e => update('secondaryColor', e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                        />
                        <Input value={config.secondaryColor || '#c2185b'} onChange={v => update('secondaryColor', v)} />
                      </div>
                    </Field>
                  </div>

                  {/* Live preview */}
                  <div className="mt-4 p-4 border border-gray-200 rounded-xl">
                    <p className="text-xs font-medium text-gray-500 mb-3">Preview</p>
                    <button className="px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: config.primaryColor || '#e91e63' }}>
                      Pay Now · ₹999
                    </button>
                  </div>
                </Card>
              )}

              {/* HEADER/FOOTER TAB */}
              {activeTab === 'header' && (
                <>
                  <Card title="Header Banner">
                    <Toggle
                      label="Show header banner"
                      checked={config.headerBannerEnabled}
                      onChange={v => update('headerBannerEnabled', v)}
                    />
                    <Field label="Banner Text">
                      <Input value={config.headerBannerText || ''} onChange={v => update('headerBannerText', v)}
                        placeholder="No COD above Rs. 3000" />
                    </Field>
                    <Field label="Banner Background Color">
                      <div className="flex items-center gap-2">
                        <input type="color" value={config.headerBannerColor || '#1a1a1a'}
                          onChange={e => update('headerBannerColor', e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5"
                        />
                        <Input value={config.headerBannerColor || '#1a1a1a'} onChange={v => update('headerBannerColor', v)} />
                      </div>
                    </Field>
                  </Card>

                  <Card title="Footer">
                    <Field label="Footer Text">
                      <Input value={config.footerText || ''} onChange={v => update('footerText', v)}
                        placeholder="Powered by Magic Checkout" />
                    </Field>

                    <Field label="Footer Links">
                      <div className="space-y-2">
                        {(config.footerLinks || []).map((link, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input value={link.label} onChange={v => {
                              const links = [...(config.footerLinks || [])]
                              links[i] = { ...links[i], label: v }
                              update('footerLinks', links)
                            }} placeholder="Label (e.g., T&C)" />
                            <Input value={link.url} onChange={v => {
                              const links = [...(config.footerLinks || [])]
                              links[i] = { ...links[i], url: v }
                              update('footerLinks', links)
                            }} placeholder="URL" />
                            <button onClick={() => {
                              update('footerLinks', config.footerLinks.filter((_, fi) => fi !== i))
                            }} className="p-2 text-red-400 hover:text-red-600 flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => update('footerLinks', [...(config.footerLinks || []), { label: '', url: '' }])}
                          className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600 font-medium"
                        >
                          <Plus size={14} /> Add link
                        </button>
                      </div>
                    </Field>
                  </Card>
                </>
              )}

              {/* SHOPIFY TAB */}
              {activeTab === 'shopify' && (
                <Card title="Shopify Integration">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-blue-700 font-medium">How to connect Shopify</p>
                    <ol className="text-xs text-blue-600 mt-1.5 space-y-1 list-decimal list-inside">
                      <li>Go to your Shopify store → Apps → Develop Apps</li>
                      <li>Create a new app with <code>write_orders, read_customers</code> permissions</li>
                      <li>Copy the Access Token below</li>
                    </ol>
                  </div>

                  <Field label="Shop Domain">
                    <Input value={shopDomain} disabled onChange={() => {}} />
                  </Field>
                  <Field label="Shopify Access Token" hint="Admin API access token from your Shopify app">
                    <input
                      type="password"
                      value={config.shopifyAccessToken || ''}
                      onChange={e => update('shopifyAccessToken', e.target.value)}
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 transition-all font-mono"
                    />
                  </Field>

                  <div className="mt-2 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">
                      When connected, confirmed orders will automatically be created in your Shopify admin.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  )
}

// Reusable sub-components
function Card({ title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <h3 className="text-sm font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 transition-all disabled:bg-gray-50 disabled:text-gray-400"
    />
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
