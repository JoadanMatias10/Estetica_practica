const DEFAULT_ALLOWED_ORIGINS = [
  'https://estetica-practica.vercel.app',
  'https://estetica-practica.onrender.com',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173'
]

const parseAllowedOrigins = () => {
  const envOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (envOrigins.length) return envOrigins

  return DEFAULT_ALLOWED_ORIGINS
}

export const allowedOrigins = parseAllowedOrigins()

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`Origen no permitido: ${origin}`), false)
  },
  credentials: process.env.CORS_ALLOW_CREDENTIALS !== 'false',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  optionsSuccessStatus: 204
}

const MAX_AGE_SECONDS = Number.parseInt(process.env.HSTS_MAX_AGE_SECONDS || `${60 * 60 * 24 * 180}`, 10)

export const shouldEnforceHttps = process.env.ENFORCE_HTTPS === 'true'
export const shouldTrustProxy = process.env.TRUST_PROXY === 'true'

export const enforceHttps = (req, res, next) => {
  if (!shouldEnforceHttps) return next()

  const forwardedProto = (req.headers['x-forwarded-proto'] || '').toLowerCase()

  if (req.secure || forwardedProto === 'https') {
    return next()
  }

  const host = req.headers.host

  if (!host) {
    return res.status(400).json({ message: 'Se requiere HTTPS para este recurso.' })
  }

  return res.redirect(308, `https://${host}${req.originalUrl}`)
}

export const applySecurityHeaders = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-DNS-Prefetch-Control', 'off')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'geolocation=()')

  if (shouldEnforceHttps) {
    res.setHeader('Strict-Transport-Security', `max-age=${MAX_AGE_SECONDS}; includeSubDomains`)
  }

  next()
}

const parseNumberEnv = (name, fallback) => {
  const value = Number.parseInt(process.env[name] || '', 10)
  if (Number.isFinite(value) && value > 0) return value
  return fallback
}

export const createRateLimiter = ({ windowMs, max, message, keyGenerator }) => {
  const hits = new Map()

  const windowMilliseconds = parseNumberEnv(windowMs.name || '', windowMs.value || windowMs)
  const maxRequests = parseNumberEnv(max.name || '', max.value || max)

  return (req, res, next) => {
    const key = (keyGenerator ? keyGenerator(req) : req.ip) || req.ip || 'anonymous'
    const now = Date.now()
    const entry = hits.get(key)

    if (!entry || now - entry.start >= windowMilliseconds) {
      hits.set(key, { start: now, count: 1 })
      return next()
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({ message: message || 'Demasiadas solicitudes. Intenta nuevamente más tarde.' })
    }

    entry.count += 1
    hits.set(key, entry)
    return next()
  }
}

export const globalRateLimitConfig = {
  windowMs: { name: 'RATE_LIMIT_WINDOW_MS', value: 15 * 60 * 1000 },
  max: { name: 'RATE_LIMIT_MAX', value: 200 },
  message: 'Has superado el límite de peticiones. Intenta de nuevo más tarde.'
}

export const authRateLimitConfig = {
  windowMs: { name: 'AUTH_RATE_LIMIT_WINDOW_MS', value: 15 * 60 * 1000 },
  max: { name: 'AUTH_RATE_LIMIT_MAX', value: 10 },
  message: 'Has excedido los intentos de autenticación. Espera unos minutos antes de reintentar.'
}

export const recoverRateLimitConfig = {
  windowMs: { name: 'RECOVER_RATE_LIMIT_WINDOW_MS', value: 15 * 60 * 1000 },
  max: { name: 'RECOVER_RATE_LIMIT_MAX', value: 3 },
  message:
    'Has solicitado demasiadas recuperaciones recientemente. Espera unos minutos antes de intentarlo de nuevo.',
  keyGenerator: (req) => {
    const email = req.body?.email

    if (email && typeof email === 'string' && email.trim()) {
      return `${email.trim().toLowerCase()}|${req.ip || 'unknown'}`
    }

    return req.ip
  }
}