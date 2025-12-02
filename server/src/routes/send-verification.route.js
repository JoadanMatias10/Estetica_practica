import { Router } from 'express'
import crypto from 'crypto'

import { sendEmailVerificationLink } from '../services/verification.service.js'

const router = Router()

router.post('/api/auth/send-verification', async (req, res) => {
  const { email } = req.body ?? {}

  if (typeof email !== 'string') {
    return res.status(400).json({ ok: false, error: 'EMAIL_REQUIRED' })
  }

  try {
    const token = crypto.randomBytes(32).toString('hex')

    await sendEmailVerificationLink({ to: email, token })

    return res.json({ ok: true })
  } catch (error) {
    console.error('Error enviando correo de verificación:', error)
    return res.status(500).json({ ok: false, error: 'EMAIL_SEND_FAILED' })
  }
})

export default router