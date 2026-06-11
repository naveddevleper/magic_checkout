// pages/api/admin/auth.js
import bcrypt from 'bcryptjs'
import { prisma } from '../../../lib/prisma'
import { signToken, setAuthCookie, clearAuthCookie, getAdminFromRequest } from '../../../lib/auth'

export default async function handler(req, res) {
  const { action } = req.query

  // POST /api/admin/auth?action=login
  if (req.method === 'POST' && action === 'login') {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken({ id: admin.id, email: admin.email, name: admin.name, role: admin.role })
    setAuthCookie(res, token)

    return res.status(200).json({
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role }
    })
  }

  // POST /api/admin/auth?action=logout
  if (req.method === 'POST' && action === 'logout') {
    clearAuthCookie(res)
    return res.status(200).json({ success: true })
  }

  // GET /api/admin/auth?action=me
  if (req.method === 'GET' && action === 'me') {
    const admin = getAdminFromRequest(req)
    if (!admin) return res.status(401).json({ error: 'Not authenticated' })
    return res.status(200).json({ admin })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
