// pages/admin/customers.jsx
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdmin } from '../../lib/useAdmin'
import { Search, Phone, Mail, MapPin, ShoppingBag, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

export default function CustomersPage() {
  const { admin, loading: authLoading, shopDomain } = useAdmin()
  const [customers, setCustomers] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)

  const fetchCustomers = useCallback((page = 1, q = search) => {
    setLoading(true)
    fetch(`/api/admin/customers?shopDomain=${shopDomain}&page=${page}&search=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => {
        setCustomers(d.customers || [])
        setPagination(d.pagination || { total: 0, page: 1, pages: 1 })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [shopDomain, search])

  useEffect(() => { if (shopDomain) fetchCustomers() }, [shopDomain])

  const handleSearch = (e) => {
    const q = e.target.value
    setSearch(q)
    clearTimeout(window._searchTimer)
    window._searchTimer = setTimeout(() => fetchCustomers(1, q), 400)
  }

  if (authLoading) return null

  return (
    <>
      <Head><title>Customers · Magic Checkout</title></Head>
      <AdminLayout admin={admin} shopDomain={shopDomain}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total customers tracked</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search by phone, name, or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 bg-white"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full shimmer" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 rounded shimmer" />
                    <div className="h-2.5 w-24 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center">
              <Phone size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {search ? `No customers found for "${search}"` : 'No customers yet. They appear when someone enters their phone number at checkout.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {customers.map(c => (
                <div key={c.id}>
                  <div
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-brand-600">
                        {(c.name || c.phone)?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">{c.name || 'Unknown'}</p>
                        {c.ordersCount > 0 && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                            {c.ordersCount} order{c.ordersCount !== 1 ? 's' : ''}
                          </span>
                        )}
                        {c.cartItemCount > 0 && c.ordersCount === 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                            Abandoned cart
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={10} /> {c.phone}
                        </span>
                        {c.email && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail size={10} /> {c.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(c.visitedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {expanded === c.id ? <ChevronUp size={14} className="text-gray-400 ml-auto mt-1" /> : <ChevronDown size={14} className="text-gray-400 ml-auto mt-1" />}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {expanded === c.id && (
                    <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid sm:grid-cols-2 gap-4 pt-4">
                        {/* Address */}
                        {c.address && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                              <MapPin size={11} /> Saved Address
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {[c.address.line1, c.address.line2, c.address.city, c.address.state, c.address.pincode]
                                .filter(Boolean).join(', ')}
                            </p>
                          </div>
                        )}

                        {/* Device info */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1.5">Session Info</p>
                          <p className="text-xs text-gray-400">IP: {c.ip || 'N/A'}</p>
                          <p className="text-xs text-gray-400 truncate" title={c.userAgent}>
                            {c.userAgent?.slice(0, 50) || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Abandoned cart details */}
                      {c.cartItemCount > 0 && (
                        <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                          <div className="flex items-center justify-between mb-3 gap-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">Cart snapshot</p>
                              <p className="text-sm font-semibold text-gray-800">{c.cartItemCount} item{c.cartItemCount !== 1 ? 's' : ''} · ₹{c.cartTotal?.toLocaleString()}</p>
                            </div>
                            {c.ordersCount === 0 ? (
                              <span className="text-[10px] px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 uppercase font-semibold">Abandoned</span>
                            ) : (
                              <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase font-semibold">In cart</span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {(c.cartItems || []).map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                  <p className="text-xs text-gray-500">Qty {item.quantity} · ₹{item.price?.toLocaleString()} each</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-700">₹{(item.price * item.quantity)?.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Orders */}
                      {c.orders?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                            <ShoppingBag size={11} /> Recent Orders
                          </p>
                          <div className="space-y-1.5">
                            {c.orders.map(order => (
                              <div key={order.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                                <div>
                                  <p className="text-xs font-mono font-semibold text-gray-700">{order.orderId}</p>
                                  <p className="text-xs text-gray-400 capitalize">{order.paymentMethod} · {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-semibold text-gray-800">₹{order.total?.toLocaleString()}</p>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                  }`}>{order.paymentStatus}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                Showing {(pagination.page - 1) * 20 + 1}–{Math.min(pagination.page * 20, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchCustomers(pagination.page - 1)}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-xs text-gray-500 px-2">Page {pagination.page} / {pagination.pages}</span>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => fetchCustomers(pagination.page + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-all"
                >
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
