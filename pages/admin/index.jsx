// pages/admin/index.jsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdmin } from '../../lib/useAdmin'
import {
  ShoppingBag, Users, TrendingUp, IndianRupee,
  ArrowUpRight, Package, Clock, CheckCircle, XCircle
} from 'lucide-react'

const STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700',
  created: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const { admin, loading: authLoading, shopDomain } = useAdmin()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shopDomain) return
    fetch(`/api/admin/dashboard?shopDomain=${shopDomain}`)
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [shopDomain])

  if (authLoading) return <LoadingScreen />

  const o = stats?.overview || {}

  return (
    <>
      <Head><title>Dashboard · Magic Checkout Admin</title></Head>
      <AdminLayout admin={admin} shopDomain={shopDomain}>
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {admin?.name}. Here's what's happening.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-28 shimmer" />
            ))}
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPICard
                title="Total Revenue"
                value={`₹${(o.totalRevenue || 0).toLocaleString()}`}
                sub={`₹${(o.todayRevenue || 0).toLocaleString()} today`}
                icon={IndianRupee}
                color="text-green-600"
                bg="bg-green-50"
              />
              <KPICard
                title="Total Orders"
                value={o.totalOrders || 0}
                sub={`${o.todayOrders || 0} today`}
                icon={ShoppingBag}
                color="text-blue-600"
                bg="bg-blue-50"
              />
              <KPICard
                title="Customers"
                value={o.totalCustomers || 0}
                sub={`${o.todayCustomers || 0} today`}
                icon={Users}
                color="text-purple-600"
                bg="bg-purple-50"
              />
              <KPICard
                title="Conversion Rate"
                value={`${o.conversionRate || 0}%`}
                sub={`${o.paidOrders || 0} paid orders`}
                icon={TrendingUp}
                color="text-brand-600"
                bg="bg-brand-50"
              />
            </div>

            {/* Revenue chart + payment methods */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              {/* Daily revenue bars */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-card">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue (Last 7 Days)</h3>
                <RevenueChart data={stats?.dailyRevenue || []} />
              </div>

              {/* Payment method breakdown */}
              <div className="bg-white rounded-2xl p-5 shadow-card">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  {(stats?.paymentMethodStats || []).map(s => (
                    <div key={s.method} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs capitalize font-medium text-gray-700 w-20 truncate">{s.method}</span>
                      </div>
                      <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${Math.min((s.count / (o.totalOrders || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8 text-right">{s.count}</span>
                    </div>
                  ))}
                  {!stats?.paymentMethodStats?.length && (
                    <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent orders + customers */}
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">Recent Orders</h3>
                  <a href="/admin/orders" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                    View all <ArrowUpRight size={12} />
                  </a>
                </div>
                <div className="divide-y divide-gray-50">
                  {(stats?.recentOrders || []).slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{order.orderId}</p>
                        <p className="text-xs text-gray-400">{order.phone} · {order.paymentMethod?.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-800">₹{order.total?.toLocaleString()}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.paymentStatus] || 'bg-gray-100 text-gray-500'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                  {!stats?.recentOrders?.length && (
                    <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">Recent Customers</h3>
                  <a href="/admin/customers" className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                    View all <ArrowUpRight size={12} />
                  </a>
                </div>
                <div className="divide-y divide-gray-50">
                  {(stats?.recentCustomers || []).slice(0, 5).map(c => (
                    <div key={c.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-gray-500">
                          {c.name?.[0] || c.phone?.[0] || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{c.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(c.visitedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  ))}
                  {!stats?.recentCustomers?.length && (
                    <p className="text-sm text-gray-400 text-center py-6">No customers yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  )
}

function KPICard({ title, value, sub, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
        <Icon size={18} className={color} />
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{title}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function RevenueChart({ data }) {
  if (!data.length) {
    return <div className="h-32 flex items-center justify-center text-sm text-gray-400">No revenue data yet</div>
  }

  const max = Math.max(...data.map(d => Number(d.revenue) || 0), 1)

  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d, i) => {
        const h = Math.max((Number(d.revenue) / max) * 100, 4)
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
            <div className="relative flex-1 w-full flex items-end">
              <div
                className="w-full bg-brand-500 rounded-t-md hover:bg-brand-600 transition-all"
                style={{ height: `${h}%`, minHeight: '4px' }}
                title={`₹${Number(d.revenue).toLocaleString()}`}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                ₹{Number(d.revenue || 0).toLocaleString()}
              </div>
            </div>
            <p className="text-[9px] text-gray-400 truncate w-full text-center">
              {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
    </div>
  )
}
