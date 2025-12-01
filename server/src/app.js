import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import registroRoutes from './routes/registro.routes.js'
import authRoutes from './routes/auth.routes.js'
import sendVerificationRoutes from './routes/send-verification.route.js'
import {
  applySecurityHeaders,
  authRateLimitConfig,
  corsOptions,
  createRateLimiter,
  enforceHttps,
  recoverRateLimitConfig,
  globalRateLimitConfig,
  shouldTrustProxy
} from './middleware/security.js'

const app = express()

//app.use(cors())
if (shouldTrustProxy) {
  app.set('trust proxy', 1)
}

const corsMiddleware = cors(corsOptions)
const globalLimiter = createRateLimiter(globalRateLimitConfig)
const authLimiter = createRateLimiter(authRateLimitConfig)
const recoverLimiter = createRateLimiter(recoverRateLimitConfig)

app.use(enforceHttps)
app.use(applySecurityHeaders)
app.use((req, res, next) =>
  corsMiddleware(req, res, (error) => {
    if (error) {
      console.error('Solicitud bloqueada por CORS:', error.message)
      return res.status(403).json({ message: 'Origen no permitido para esta solicitud.' })
    }

    return next()
  })
)
app.use(globalLimiter)
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente 🚀' })
})

app.use('/api/auth/recover', recoverLimiter)
app.use('/api/auth', authLimiter)
app.use('/api/registro', registroRoutes)
app.use(sendVerificationRoutes)
app.use('/api/auth', authRoutes)

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err)
  res.status(500).json({ message: 'Ha ocurrido un error inesperado.' })
})

export default app