// lib/auth.js
import jwt from 'jsonwebtoken'
import { parse, serialize } from 'cookie'

const JWT_SECRET = process.env.JWT_SECRET || 'magic-checkout-secret-change-in-prod'
const COOKIE_NAME = 'mc_admin_token'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export function setAuthCookie(res, token) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export function clearAuthCookie(res) {
  const cookie = serialize(COOKIE_NAME, '', { maxAge: -1, path: '/' })
  res.setHeader('Set-Cookie', cookie)
}

export function getAdminFromRequest(req) {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  return verifyToken(token)
}

// Middleware: protect admin API routes
export function requireAdmin(handler) {
  return async (req, res) => {
    const admin = getAdminFromRequest(req)
    if (!admin) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.admin = admin
    return handler(req, res)
  }
}
