// pages/admin/coupons.jsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdmin } from '../../lib/useAdmin'
import { Plus, Trash2, Edit2, Tag, Loader2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'

export default function CouponsPage() {
  const { admin, loading: authLoading, shopDomain } = useAdmin()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ code: '', type: 'flat', value: '', maxDiscount: '', minAmount: '', minItems: 1, description: '', usageLimit: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCoupons = () => {
    fetch(`/api/admin/coupons?shopDomain=${shopDomain}`)
      .then(r => r.json())
      .then(d => { setCoupons(d.coupons || []); setLoading(false) })
  }

  useEffect(() => { if (shopDomain) fetchCoupons() }, [shopDomain])

  const handleSubmit = async () => {
    setSaving(true); setError('')
    const url = editId ? `/api/admin/coupons?shopDomain=${shopDomain}&id=${editId}` : `/api/admin/coupons?shopDomain=${shopDomain}`
    const method = editId ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || 'Failed'); return }
    fetchCoupons()
    setShowForm(false)
    setEditId(null)
    setForm({ code: '', type: 'flat', value: '', maxDiscount: '', minAmount: '', minItems: 1, description: '', usageLimit: '' })
  }

  const toggleActive = async (id, isActive) => {
    await fetch(`/api/admin/coupons?shopDomain=${shopDomain}&id=${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !isActive })
    })
    fetchCoupons()
  }

  const deleteCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return
    await fetch(`/api/admin/coupons?shopDomain=${shopDomain}&id=${id}`, { method: 'DELETE' })
    fetchCoupons()
  }

  if (authLoading) return null

  return (
    <>
      <Head><title>Coupons · Magic Checkout</title></Head>
      <AdminLayout admin={admin} shopDomain={shopDomain}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
            <p className="text-sm text-gray-500 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? 's' : ''} configured</p>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all">
            <Plus size={16} /> Add Coupon
          </button>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-card p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800">{editId ? 'Edit Coupon' : 'New Coupon'}</h3>
              <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Code *</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="SAVE100" disabled={!!editId}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 font-mono uppercase disabled:bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type *</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 bg-white">
                  <option value="flat">Flat (₹)</option>
                  <option value="percent">Percent (%)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  {form.type === 'percent' ? 'Percent off (%)' : 'Amount off (₹)'} *
                </label>
                <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                  placeholder={form.type === 'percent' ? '20' : '500'}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Max Discount (₹)</label>
                <input type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                  placeholder="2000"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Min Cart Amount (₹)</label>
                <input type="number" value={form.minAmount} onChange={e => setForm(f => ({ ...f, minAmount: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Min Items</label>
                <input type="number" value={form.minItems} onChange={e => setForm(f => ({ ...f, minItems: e.target.value }))}
                  placeholder="1"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Usage Limit</label>
                <input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Description *</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="20% off on 2+ items"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={handleSubmit} disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white font-semibold text-sm hover:bg-brand-600 transition-all disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editId ? 'Update' : 'Create'}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null) }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Coupons table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center">
              <Tag size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No coupons yet. Add your first coupon.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Code', 'Discount', 'Min Amount', 'Usage', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">{c.code}</span>
                      <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-800">
                        {c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}
                      </p>
                      <p className="text-xs text-gray-400">max ₹{c.maxDiscount}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-700">₹{c.minAmount || 0}</p>
                      <p className="text-xs text-gray-400">{c.minItems}+ items</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-700">{c.usageCount}</p>
                      <p className="text-xs text-gray-400">/ {c.usageLimit || '∞'}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => toggleActive(c.id, c.isActive)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all
                          ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? <><Check size={10} /> Active</> : <><X size={10} /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditId(c.id); setForm({ ...c }); setShowForm(true) }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => deleteCoupon(c.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
