import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'

import registroRoutes from './routes/registro.routes.js'
import authRoutes from './routes/auth.routes.js'
//Nuevo
import userRoutes from './routes/user.routes.js'
//-----------------------------

const app = express()

//NUEVO
app.use(helmet())
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
)
app.use(helmet.frameguard({ action: 'deny' }))
app.use(helmet.noSniff())
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }))
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'none'"],
    },
  })
)
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=()'
  )
  next()
})
//----------------------

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente 🚀' })
})

app.use('/api/registro', registroRoutes)
app.use('/api/auth', authRoutes)
//NUEVO
app.use('/api/user', userRoutes)
//----------------------
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err)
  res.status(500).json({ message: 'Ha ocurrido un error inesperado.' })
})

export default app