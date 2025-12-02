import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/overview', requireAuth, requireRole('admin'), (req, res) => {
  const userData = req.user || {}

  return res.status(200).json({
    message: 'Acceso concedido. Información solo para administradores.',
    user: {
      id: userData.sub,
      email: userData.email,
      rol: userData.role
    }
  })
})

export default router