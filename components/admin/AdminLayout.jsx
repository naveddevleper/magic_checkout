// components/admin/AdminLayout.jsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LayoutDashboard, ShoppingBag, Users, Tag, Settings,
  Store, LogOut, ChevronRight, Menu, X, Bell, Search,
  Zap, BarChart2
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, badge: 'new' },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/store', label: 'Store Settings', icon: Store },
  { href: '/admin/payment', label: 'Payment Setup', icon: Zap },
]

export default function AdminLayout({ children, admin, shopDomain }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/auth?action=logout', {
      method: 'POST',
      credentials: 'same-origin',
    })
    router.push('/admin/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      flex flex-col bg-gray-900 text-white
      ${mobile ? 'w-full h-full' : 'w-64 h-screen sticky top-0'}
    `}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-none">Magic Checkout</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-none">Admin Panel</p>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Shop domain */}
      {shopDomain && (
        <div className="px-5 py-3 border-b border-gray-800">
          <p className="text-xs text-gray-500">Shop</p>
          <p className="text-xs text-green-400 font-medium truncate">{shopDomain}</p>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = router.pathname === href || (href !== '/admin' && router.pathname.startsWith(href))
          return (
            <Link key={href} href={`${href}${shopDomain ? `?shop=${shopDomain}` : ''}`}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                ${active ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] bg-brand-400 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {badge}
                </span>
              )}
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Admin info + logout */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{admin?.name?.[0] || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{admin?.name}</p>
            <p className="text-xs text-gray-400 truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {shopDomain && (
              <span className="hidden sm:inline bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-medium border border-green-200">
                {shopDomain}
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
