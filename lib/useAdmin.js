// lib/useAdmin.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export function useAdmin() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Prefer shop from query, fallback to localStorage
  const shopDomain =
    router.query.shop ||
    (typeof window !== 'undefined' ? localStorage.getItem('mc_shop') : null) ||
    'demo.myshopify.com'

  useEffect(() => {
    if (router.query.shop && typeof window !== 'undefined') {
      localStorage.setItem('mc_shop', router.query.shop)
    }
  }, [router.query.shop])

  useEffect(() => {
    fetch('/api/admin/auth?action=me')
      .then(r => r.json())
      .then(d => {
        if (d.admin) setAdmin(d.admin)
        else router.push('/admin/login')
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false))
  }, [])

  return { admin, loading, shopDomain }
}
