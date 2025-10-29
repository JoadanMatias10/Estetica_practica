import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

import registroRoutes from './routes/registro.routes.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionando correctamente 🚀' })
})

app.use('/api/registro', registroRoutes)

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err)
  res.status(500).json({ message: 'Ha ocurrido un error inesperado.' })
})

export default app