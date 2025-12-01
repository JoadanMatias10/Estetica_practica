import crypto from 'crypto'
import { shouldEnforceHttps } from '../middleware/security.js'

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url')

const signJwt = (payload, secret, ttlMs) => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const nowSeconds = Math.floor(Date.now() / 1000)
  const expSeconds = nowSeconds + Math.floor(ttlMs / 1000)
  const body = { ...payload, iat: nowSeconds, exp: expSeconds }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(body))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const signature = crypto.createHmac('sha256', secret).update(signingInput).digest('base64url')

  return `${signingInput}.${signature}`
}

const safeEqual = (a, b) => {
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)

  if (bufferA.length !== bufferB.length) {
    return false
  }

  return crypto.timingSafeEqual(bufferA, bufferB)
}

const decodeJwt = (token, secret) => {
  const [encodedHeader, encodedPayload, signature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Formato de token inválido')
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest('base64url')

  if (!safeEqual(signature, expectedSignature)) {
    throw new Error('Firma no válida')
  }

  const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'))

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expirado')
  }

  return payload
}

const parseNumberEnv = (name, fallback) => {
  const value = Number.parseInt(process.env[name] || '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const JWT_SECRET = process.env.JWT_SECRET || 'cambia-esta-clave-en-produccion'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET

export const ACCESS_TOKEN_TTL_MS = parseNumberEnv('ACCESS_TOKEN_TTL_MS', 15 * 60 * 1000)
export const REFRESH_TOKEN_TTL_MS = parseNumberEnv('REFRESH_TOKEN_TTL_MS', 7 * 24 * 60 * 60 * 1000)

const secureCookies = process.env.COOKIE_SECURE === 'true' || shouldEnforceHttps
const sameSitePolicy = process.env.COOKIE_SAMESITE || 'lax'

export const createSessionTokens = (usuario) => {
  const payload = {
    sub: usuario._id.toString(),
    email: usuario.email,
    role: usuario.rol,
    tv: usuario.tokenVersion || 0
  }

  const accessToken = signJwt(payload, JWT_SECRET, ACCESS_TOKEN_TTL_MS)
  const refreshToken = signJwt(payload, JWT_REFRESH_SECRET, REFRESH_TOKEN_TTL_MS)

  return {
    accessToken,
    refreshToken,
    accessTokenTtlMs: ACCESS_TOKEN_TTL_MS,
    refreshTokenTtlMs: REFRESH_TOKEN_TTL_MS
  }
}

export const verifyAccessToken = (token) => decodeJwt(token, JWT_SECRET)
export const verifyRefreshToken = (token) => decodeJwt(token, JWT_REFRESH_SECRET)

const parseCookieHeader = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, pair) => {
    const [rawKey, ...rawValue] = pair.trim().split('=')
    if (!rawKey) return acc

    acc[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join('='))
    return acc
  }, {})
}

export const getTokenFromRequest = (req, cookieName = 'refreshToken') => {
  const authHeader = req.headers?.authorization || ''
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim()
  }

  if (req.headers?.cookie) {
    const cookies = parseCookieHeader(req.headers.cookie)
    if (cookies[cookieName]) {
      return cookies[cookieName]
    }
  }

  if (req.body?.token) {
    return req.body.token
  }

  return ''
}

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: secureCookies,
  sameSite: sameSitePolicy,
  maxAge
})

export const setAuthCookies = (res, session) => {
  res.cookie('accessToken', session.accessToken, getCookieOptions(session.accessTokenTtlMs))
  res.cookie('refreshToken', session.refreshToken, getCookieOptions(session.refreshTokenTtlMs))
}

export const clearAuthCookies = (res) => {
  const expired = { ...getCookieOptions(0), maxAge: 0 }
  res.clearCookie('accessToken', expired)
  res.clearCookie('refreshToken', expired)
}

export const revokeUserSessions = async (usuario) => {
  if (!usuario) return
  usuario.tokenVersion = (usuario.tokenVersion || 0) + 1
  await usuario.save().catch((error) => {
    console.error('No se pudo revocar las sesiones del usuario:', error)
  })
}