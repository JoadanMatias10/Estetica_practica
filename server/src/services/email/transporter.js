import nodemailer from 'nodemailer'

let cachedTransporter = undefined
let warnedMissingConfig = false

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')

const parseBoolean = (value, defaultValue = false) => {
  const normalized = normalize(value).toLowerCase()

  if (!normalized) {
    return defaultValue
  }

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  return defaultValue
}

const parsePort = (value) => {
  const normalized = normalize(value)

  if (!normalized) {
    return undefined
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

const resolveBooleanEnv = (keys, defaultValue) => {
  for (const key of keys) {
    if (process.env[key] !== undefined) {
      return parseBoolean(process.env[key], defaultValue)
    }
  }

  return defaultValue
}

const resolveEnv = (keys) => {
  for (const key of keys) {
    const value = normalize(process.env[key])

    if (value) {
      return value
    }
  }

  return undefined
}

const resolveTransporter = () => {
  if (cachedTransporter !== undefined) {
    return cachedTransporter
  }

  const host = resolveEnv(['SMTP_HOST', 'EMAIL_HOST'])
  const port = parsePort(resolveEnv(['SMTP_PORT', 'EMAIL_PORT']))
  const secure = resolveBooleanEnv(['SMTP_SECURE', 'EMAIL_SECURE'], port ? port === 465 : false)
  const user =
    resolveEnv(['SMTP_USER', 'EMAIL_USER', 'EMAIL_USERNAME', 'EMAIL_ACCOUNT']) || normalize(process.env.GMAIL_USER)
  const password =
    resolveEnv(['SMTP_PASSWORD', 'EMAIL_PASSWORD', 'EMAIL_PASS']) || normalize(process.env.GMAIL_APP_PASSWORD)

  const auth = user && password ? { user, pass: password } : undefined

  if (host) {
    try {
      cachedTransporter = nodemailer.createTransport({
        host,
        port: port ?? (secure ? 465 : 587),
        secure,
        auth
      })
      warnedMissingConfig = false
      return cachedTransporter
    } catch (error) {
      console.error('No fue posible inicializar el transporte SMTP configurado:', error)
      cachedTransporter = null
      return cachedTransporter
    }
  }

  if (normalize(process.env.GMAIL_USER) && normalize(process.env.GMAIL_APP_PASSWORD)) {
    try {
      cachedTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: normalize(process.env.GMAIL_USER),
          pass: normalize(process.env.GMAIL_APP_PASSWORD)
        }
      })
      warnedMissingConfig = false
      return cachedTransporter
    } catch (error) {
      console.error('No fue posible inicializar el transporte de Gmail:', error)
      cachedTransporter = null
      return cachedTransporter
    }
  }

  cachedTransporter = null

  if (!warnedMissingConfig) {
    console.warn(
      'No se pudo crear un transporte de correo. Define las variables SMTP/EMAIL o las credenciales de Gmail para habilitar el envío.'
    )
    warnedMissingConfig = true
  }

  return cachedTransporter
}

export const isTransportReady = () => Boolean(resolveTransporter())

const defaultSender = () =>
  normalize(process.env.EMAIL_DEFAULT_FROM) ||
  normalize(process.env.EMAIL_FROM) ||
  normalize(process.env.EMAIL_SENDER) ||
  normalize(process.env.SMTP_DEFAULT_FROM) ||
  normalize(process.env.GMAIL_DEFAULT_FROM) ||
  normalize(process.env.EMAIL_USER) ||
  normalize(process.env.SMTP_USER) ||
  normalize(process.env.GMAIL_USER)

export const sendMailWithConfiguredTransport = async ({ to, subject, text, html, from }) => {
  const transporter = resolveTransporter()

  if (!transporter) {
    return false
  }

  const sender = normalize(from) || defaultSender()

  const mailOptions = {
    to,
    subject,
    from: sender || undefined,
    text,
    html
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    const accepted = Array.isArray(info?.accepted) ? info.accepted : []

    if (!accepted.length) {
      console.error('El servidor de correo rechazó el mensaje. Verifica remitente y destinatario configurados.')
      return false
    }

    return true
  } catch (error) {
    console.error('No fue posible enviar el correo con Nodemailer:', error)
    cachedTransporter = undefined
    return false
  }
}