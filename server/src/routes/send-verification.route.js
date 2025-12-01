import { Router } from 'express'
import crypto from 'crypto'


import Usuario from '../models/Usuario.js'
import { sendEmailVerificationLink } from '../services/verification.service.js'

const router = Router()

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '')

const sanitizeToken = (value) => (typeof value === 'string' ? value.trim() : '')

router.post('/api/auth/send-verification', async (req, res) => {
  const email = normalizeEmail(req.body?.email)

  if (!email) {
    return res.status(400).json({ ok: false, error: 'EMAIL_REQUIRED' })
  }

  try {
const usuario = await Usuario.findOne({ email, 'emailVerification.token': hashedToken })

if (!usuario) {
  return res.status(400).json({ ok: false, error: 'TOKEN_INVALID' })
}

if (
  !usuario.emailVerification ||
  !usuario.emailVerification.expiresAt ||
  usuario.emailVerification.expiresAt < new Date()
) {
  return res.status(400).json({ ok: false, error: 'TOKEN_EXPIRED' })
}

usuario.emailVerified = true
usuario.emailVerification = { token: null, expiresAt: null }
await usuario.save()

    await sendEmailVerificationLink({ to: email, token })

    return res.json({ ok: true, message: 'Correo de verificación enviado.' })
  } catch (error) {
    console.error('Error enviando correo de verificación:', error)
    return res.status(500).json({ ok: false, error: 'EMAIL_SEND_FAILED' })
  }
})

router.get('/api/auth/verify-email', async (req, res) => {
  const email = normalizeEmail(req.query?.email)
  const token = sanitizeToken(req.query?.token)

  if (!email || !token) {
    return res.status(400).json({ ok: false, error: 'TOKEN_OR_EMAIL_REQUIRED' })
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  try {
    const usuario = await Usuario.findOne({ email, 'emailVerification.token': hashedToken })

    if (!usuario) {
      return res.status(400).json({ ok: false, error: 'TOKEN_INVALID' })
    }

    if (usuario.verification?.expiresAt && usuario.verification.expiresAt < new Date()) {
      return res.status(400).json({ ok: false, error: 'TOKEN_EXPIRED' })
    }

    usuario.emailVerified = true
    usuario.verification = undefined
    await usuario.save()

    return res.json({ ok: true, message: 'Correo verificado correctamente.' })
  } catch (error) {
    console.error('Error al verificar correo electrónico:', error)
    return res.status(500).json({ ok: false, error: 'VERIFY_EMAIL_FAILED' })
  }
})

export default router