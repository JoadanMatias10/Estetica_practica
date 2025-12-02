import { sendEmail } from './email/email.service.js'


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim() : '')

function ensureValidPayload({ to, code }) {
  if (!EMAIL_REGEX.test(normalizeEmail(to))) {
    throw new Error('EMAIL_INVALID')
  }

   if (typeof code !== 'string' || code.trim().length === 0) {
    throw new Error('CODE_INVALID')
  }
}

export async function sendEmailVerificationCode({ to, code }) {
  ensureValidPayload({ to, code })

  const sender = normalizeEmail(
    process.env.EMAIL_DEFAULT_FROM || process.env.EMAIL_FROM || process.env.SMTP_FROM || ''
  )

   const greeting = 'Hola,'
  const message = `Tu código de verificación es: ${code}\nEste código expirará en 10 minutos.`

const emailSent = await sendEmail({
    from: sender || undefined,
    to,
   subject: 'Verifica tu cuenta',
    text: `${greeting}\n\n${message}`,
    html: `
      <div style="font-family:system-ui,sans-serif;padding:16px;line-height:1.5">
        <h1 style="margin-bottom:8px;">Verifica tu cuenta</h1>
        <p style="margin:0 0 16px 0;">Usa este código para confirmar tu correo electrónico:</p>
        <p style="margin:0 0 24px 0;font-size:26px;letter-spacing:6px;font-weight:700;">${code}</p>
        <p style="margin:0;color:#6b7280;">Este código expirará en 24 horas.</p>
      </div>
    `
  })

  if (!emailSent) {
    throw new Error('EMAIL_DELIVERY_FAILED')
  }

}