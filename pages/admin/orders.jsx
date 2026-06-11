// pages/admin/orders.jsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdmin } from '../../lib/useAdmin'
import { Search, ChevronLeft, ChevronRight, ChevronDown, Package, Filter } from 'lucide-react'

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  created:   'bg-blue-100 text-blue-700 border-blue-200',
  shipped:   'bg-purple-100 text-purple-700 border-purple-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  pending:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  paid:      'bg-green-100 text-green-700 border-green-200',
  failed:    'bg-red-100 text-red-700 border-red-200',
}

const ORDER_STATUSES = ['created','confirmed','shipped','delivered','cancelled']
const PAYMENT_STATUSES = ['pending','paid','failed','refunded']

export default function OrdersPage() {
  const { admin, loading: authLoading, shopDomain } = useAdmin()
  const [orders, setOrders]         = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [stats, setStats]           = useState({})
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterMethod, setFilterMethod] = useState('')
  const [expanded, setExpanded]     = useState(null)
  const [updating, setUpdating]     = useState(null)

  const fetchOrders = useCallback((page = 1, q = search, status = filterStatus, method = filterMethod) => {
    if (!shopDomain) return
    setLoading(true)
    const params = new URLSearchParams({ shopDomain, page, search: q, status, method })
    fetch(`/api/admin/orders?${params}`)
      .then(r => r.json())
      .then(d => {
        setOrders(d.orders || [])
        setPagination(d.pagination || { total: 0, page: 1, pages: 1 })
        setStats(d.stats || {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [shopDomain, search, filterStatus, filterMethod])

  useEffect(() => { if (shopDomain) fetchOrders() }, [shopDomain])

  const handleSearch = (e) => {
    const q = e.target.value; setSearch(q)
    clearTimeout(window._ordersTimer)
    window._ordersTimer = setTimeout(() => fetchOrders(1, q), 400)
  }

  const updateOrderStatus = async (id, field, value) => {
    setUpdating(id)
    await fetch(`/api/admin/orders?shopDomain=${shopDomain}&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    setUpdating(null)
    fetchOrders()
  }

  const totalRevenue = (stats.paid?.revenue || 0)

  if (authLoading) return null

  return (
    <>
      <Head><title>Orders · Magic Checkout</title></Head>
      <AdminLayout admin={admin} shopDomain={shopDomain}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {pagination.total} total · ₹{totalRevenue.toLocaleString()} revenue
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Total', count: pagination.total, color: 'text-gray-700' },
            { label: 'Paid', count: stats.paid?.count || 0, color: 'text-green-600' },
            { label: 'Pending', count: stats.pending?.count || 0, color: 'text-yellow-600' },
            { label: 'Failed', count: stats.failed?.count || 0, color: 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-card text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={handleSearch}
              placeholder="Order ID, phone, name..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 bg-white" />
          </div>

          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); fetchOrders(1, search, e.target.value, filterMethod) }}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-brand-400">
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>

          <select value={filterMethod} onChange={e => { setFilterMethod(e.target.value); fetchOrders(1, search, filterStatus, e.target.value) }}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-brand-400">
            <option value="">All Methods</option>
            {['upi','card','cod','netbanking','wallet','emi','paylater'].map(m => (
              <option key={m} value={m} className="uppercase">{m.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-36 rounded shimmer" />
                    <div className="h-2.5 w-24 rounded shimmer" />
                  </div>
                  <div className="h-3 w-20 rounded shimmer" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {search || filterStatus || filterMethod ? 'No orders match your filters.' : 'No orders yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {orders.map(order => (
                <div key={order.id}>
                  {/* Row */}
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-gray-800">{order.orderId}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {order.paymentStatus}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                        <span>📱 {order.phone}</span>
                        {order.name && <span>👤 {order.name}</span>}
                        <span className="uppercase font-medium text-gray-500">{order.paymentMethod}</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">₹{order.total?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</p>
                    </div>

                    <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Expanded detail */}
                  {expanded === order.id && (
                    <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100 space-y-4 pt-4">
                      <div className="grid sm:grid-cols-3 gap-4">
                        {/* Delivery address */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Delivery Address</p>
                          <p className="text-xs text-gray-700 font-medium">{order.address?.name}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {[order.address?.line1, order.address?.line2, order.address?.city, order.address?.state, order.address?.pincode].filter(Boolean).join(', ')}
                          </p>
                          {order.email && <p className="text-xs text-gray-400 mt-1">✉ {order.email}</p>}
                        </div>

                        {/* Items */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Items Ordered</p>
                          <div className="space-y-1">
                            {(order.items || []).map((item, i) => (
                              <div key={i} className="text-xs text-gray-600">
                                {item.quantity}× {item.name} — <span className="font-medium">₹{item.price?.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payment summary */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1.5">Payment Summary</p>
                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal?.toLocaleString()}</span></div>
                            {order.couponDiscount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({order.couponCode})</span><span>-₹{order.couponDiscount?.toLocaleString()}</span></div>}
                            {order.deliveryCharge > 0 && <div className="flex justify-between"><span>Delivery</span><span>₹{order.deliveryCharge?.toLocaleString()}</span></div>}
                            <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1"><span>Total</span><span>₹{order.total?.toLocaleString()}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* IDs */}
                      {(order.razorpayOrderId || order.razorpayPaymentId || order.shopifyOrderId) && (
                        <div className="text-xs text-gray-400 space-y-0.5">
                          {order.razorpayOrderId && <p>Razorpay Order: <span className="font-mono">{order.razorpayOrderId}</span></p>}
                          {order.razorpayPaymentId && <p>Payment ID: <span className="font-mono">{order.razorpayPaymentId}</span></p>}
                          {order.shopifyOrderId && <p>Shopify Order: <span className="font-mono">#{order.shopifyOrderId}</span></p>}
                        </div>
                      )}

                      {/* Status update controls */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">Order Status:</span>
                          <select
                            defaultValue={order.orderStatus}
                            onChange={e => updateOrderStatus(order.id, 'orderStatus', e.target.value)}
                            disabled={updating === order.id}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-brand-400"
                          >
                            {ORDER_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 font-medium">Payment:</span>
                          <select
                            defaultValue={order.paymentStatus}
                            onChange={e => updateOrderStatus(order.id, 'paymentStatus', e.target.value)}
                            disabled={updating === order.id}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white outline-none focus:border-brand-400"
                          >
                            {PAYMENT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                          </select>
                        </div>
                        {updating === order.id && <span className="text-xs text-gray-400 animate-pulse">Saving...</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                {(pagination.page - 1) * 20 + 1}–{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1.5">
                <button disabled={pagination.page <= 1} onClick={() => fetchOrders(pagination.page - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all">
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-gray-500 px-1">{pagination.page} / {pagination.pages}</span>
                <button disabled={pagination.page >= pagination.pages} onClick={() => fetchOrders(pagination.page + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  )
}
