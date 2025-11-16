import { sendEmail } from './email/email.service.js'


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim() : '')

function ensureValidPayload({ to, token }) {
  if (!EMAIL_REGEX.test(normalizeEmail(to))) {
    throw new Error('EMAIL_INVALID')
  }

  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('TOKEN_INVALID')
  }
}

export async function sendEmailVerificationLink({ to, token }) {
  ensureValidPayload({ to, token })

  const sender = normalizeEmail(
    process.env.EMAIL_DEFAULT_FROM || process.env.EMAIL_FROM || process.env.SMTP_FROM || ''
  )

  const link = `https://proyecto2fa.web.app/verified?token=${encodeURIComponent(
    token,
  )}&email=${encodeURIComponent(to)}`

  const subject = 'Verifica tu cuenta'
  const text = `Confirma tu cuenta ingresando a: ${link}`
  const html = `
    <div style="font-family:system-ui,sans-serif;padding:16px;line-height:1.5">
      <h1 style="margin-bottom:8px;">Verifica tu cuenta</h1>
      <p style="margin:0 0 16px 0;">Haz clic en el siguiente enlace para confirmar tu correo:</p>
      <p style="margin:0 0 24px 0;"><a href="${link}" style="color:#2563eb;">Verificar correo</a></p>
      <p style="margin:0;color:#6b7280;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p style="margin:8px 0 0 0;color:#374151;word-break:break-all;">${link}</p>
    </div>
  `
  const sent = await sendEmail({
    from: sender || undefined,
    to,
    subject,
    text,
    html
  })

  if (!sent) {
    throw new Error('EMAIL_DELIVERY_FAILED')
  }

}