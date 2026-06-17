// pages/admin/login.jsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [form, setForm] = useState({ email: 'admin@magiccheckout.com', password: 'admin123' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/auth?action=login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      router.push('/admin')
    } else {
      setError(data.error || 'Login failed')
    }
  }

  return (
    <>
      <Head><title>Admin Login · Magic Checkout</title></Head>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mb-3 shadow-lg">
              <Zap size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Magic Checkout</h1>
            <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Sign in to continue</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand-600 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 text-center">
                Default: <span className="font-mono text-gray-600">admin@magiccheckout.com</span> / <span className="font-mono text-gray-600">admin123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
