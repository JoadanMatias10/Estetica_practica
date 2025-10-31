import { transporter } from '../lib/mailer.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ensureValidPayload({ to, token }) {
  if (typeof to !== 'string' || !EMAIL_REGEX.test(to)) {
    throw new Error('EMAIL_INVALID')
  }

  if (typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('TOKEN_INVALID')
  }
}

export async function sendEmailVerificationLink({ to, token }) {
  ensureValidPayload({ to, token })

  const sender = process.env.SMTP_FROM || process.env.SMTP_USER

  if (!sender) {
    throw new Error('SMTP_FROM_REQUIRED')
  }

  if (process.env.SMTP_USER && sender !== process.env.SMTP_USER) {
    throw new Error('SMTP_FROM_MISMATCH')
  }

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

  try {
    await transporter.sendMail({
      from: sender,
      to,
      subject,
      text,
      html,
    })
  } catch (error) {
    throw error
  }
}