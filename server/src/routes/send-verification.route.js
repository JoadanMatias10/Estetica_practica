import { Router } from 'express'
import crypto from 'crypto'


import Usuario from '../models/Usuario.js'
import { sendEmailVerificationCode } from '../services/verification.service.js'

const router = Router()

const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '')

const sanitizeCode = (value) => (typeof value === 'string' ? value.trim() : '')

const buildVerificationCode = () => crypto.randomInt(100000, 999999).toString()

const hashValue = (value) => crypto.createHash('sha256').update(value).digest('hex')

const confirmEmailWithCode = async (email, code) => {
  const hashedCode = hashValue(code)

  const usuario = await Usuario.findOne({ email, 'emailVerification.token': hashedCode })

  if (!usuario) {
    return { ok: false, error: 'TOKEN_INVALID' }
  }

  if (!usuario.emailVerification?.expiresAt || usuario.emailVerification.expiresAt < new Date()) {
    return { ok: false, error: 'TOKEN_EXPIRED' }
  }

  usuario.emailVerified = true
  usuario.emailVerification = { token: null, expiresAt: null }
  await usuario.save()

  return { ok: true, message: 'Correo verificado correctamente.' }
}

router.post('/api/auth/send-verification', async (req, res) => {
  const email = normalizeEmail(req.body?.email)

  if (!email) {
    return res.status(400).json({ ok: false, error: 'EMAIL_REQUIRED' })
  }

  try {

const usuario = await Usuario.findOne({ email })

if (!usuario) {
      return res.json({
        ok: true,
        message: 'Si tu correo está registrado, recibirás un enlace para verificar tu cuenta.'
      })
    }

    if (usuario.emailVerified) {
      return res.json({ ok: true, message: 'El correo ya se encuentra verificado.' })
    }

const token = crypto.randomBytes(32).toString('hex')
const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    await sendEmailVerificationLink({ to: email, token })

    return res.json({ ok: true, message: 'Correo de verificación enviado.' })
  } catch (error) {
    console.error('Error enviando correo de verificación:', error)
    return res.status(500).json({ ok: false, error: 'EMAIL_SEND_FAILED' })
  }
})

 usuario.emailVerification = {
      token: hashedToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }

    await usuario.save()

router.get('/api/auth/verify-email', async (req, res) => {
  const email = normalizeEmail(req.query?.email)
  const token = sanitizeToken(req.query?.token)

  if (!email || !token) {
    return res.status(400).json({ ok: false, error: 'TOKEN_OR_EMAIL_REQUIRED' })
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  try {
    const usuario = await Usuario.findOne({ email })

     if (!usuario) {
      return res.json({
        ok: true,
        message: 'Si tu correo está registrado, recibirás un código para verificar tu cuenta.'
      })
    }

    if (usuario.emailVerified) {
      return res.json({ ok: true, message: 'El correo ya se encuentra verificado.' })
    }

    const code = buildVerificationCode()
    const hashedCode = hashValue(code)

     usuario.emailVerification = {
      token: hashedCode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }

    await usuario.save()

    await sendEmailVerificationCode({ to: email, code })

    return res.json({ ok: true, message: 'Código de verificación enviado.' })
  } catch (error) {
    console.error('Error enviando código de verificación:', error)
    return res.status(500).json({ ok: false, error: 'VERIFY_EMAIL_FAILED' })
  }
})


router.post('/api/auth/verify-email', async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const code = sanitizeCode(req.body?.code)

  if (!email || !code) {
    return res.status(400).json({ ok: false, error: 'TOKEN_OR_EMAIL_REQUIRED' })
  }

  try {
    const result = await confirmEmailWithCode(email, code)

    if (!result.ok) {
      return res.status(400).json(result)
    }

    return res.json(result)
  } catch (error) {
    console.error('Error al verificar correo electrónico:', error)
    return res.status(500).json({ ok: false, error: 'VERIFY_EMAIL_FAILED' })
  }
})


export default router