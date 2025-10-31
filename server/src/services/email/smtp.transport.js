import nodemailer from 'nodemailer'

let cachedTransporter = undefined
let warnedNoConfig = false
let warnedPartialAuth = false

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')
const firstNonEmptyEnv = (keys) => {
  for (const key of keys) {
    const rawValue = process.env[key]

    if (rawValue !== undefined && rawValue !== null) {
      const normalized = normalize(rawValue)

      if (normalized) {
        return normalized
      }
    }
  }

  return undefined
}
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

const resolveTransporter = () => {
  if (cachedTransporter !== undefined) {
    return cachedTransporter
  }

  const host = firstNonEmptyEnv(['SMTP_HOST', 'EMAIL_HOST'])
  const user = firstNonEmptyEnv(['SMTP_USER', 'EMAIL_USER', 'EMAIL_USERNAME'])
  const password = firstNonEmptyEnv(['SMTP_PASSWORD', 'EMAIL_PASSWORD', 'EMAIL_PASS'])
  const port = parsePort(firstNonEmptyEnv(['SMTP_PORT', 'EMAIL_PORT']))
  const secure = parseBoolean(
    firstNonEmptyEnv(['SMTP_SECURE', 'EMAIL_SECURE']),
    port === 465
  )

  if (!host) {
    cachedTransporter = null

    if (!warnedNoConfig) {
      console.warn(
        'No se pudo inicializar el transporte SMTP porque faltan las variables SMTP_HOST o EMAIL_HOST. Configura el servidor SMTP para enviar correos.'
      )
      warnedNoConfig = true
    }

    return cachedTransporter
  }

  const options = {
    host,
    port: port ?? (secure ? 465 : 587),
    secure
  }

  if (user && password) {
    options.auth = { user, pass: password }
    warnedPartialAuth = false
  } else if (user || password) {
    options.auth = undefined

    if (!warnedPartialAuth) {
      console.warn(
        'Las credenciales SMTP están incompletas. Se intentará enviar sin autenticación, lo que podría fallar según la configuración del servidor.'
      )
      warnedPartialAuth = true
    }
  }

  if (parseBoolean(firstNonEmptyEnv(['SMTP_REQUIRE_TLS', 'EMAIL_REQUIRE_TLS']))) {
    options.requireTLS = true
  }

  if (parseBoolean(firstNonEmptyEnv(['SMTP_IGNORE_TLS', 'EMAIL_IGNORE_TLS']))) {
    options.ignoreTLS = true
  }

  const rejectUnauthorized = firstNonEmptyEnv([
    'SMTP_TLS_REJECT_UNAUTHORIZED',
    'EMAIL_TLS_REJECT_UNAUTHORIZED'
  ])
  if (rejectUnauthorized !== undefined) {
    options.tls = {
      ...(options.tls || {}),
      rejectUnauthorized: parseBoolean(rejectUnauthorized, true)
    }
  }

  try {
    cachedTransporter = nodemailer.createTransport(options)
    warnedNoConfig = false
    return cachedTransporter
  } catch (error) {
    console.error('No fue posible inicializar el transporte SMTP:', error)
    cachedTransporter = null
    return cachedTransporter
  }
}

export const isSmtpConfigured = () => Boolean(resolveTransporter())

export const sendWithSmtp = async ({ to, subject, text, html, from }) => {
  const transporter = resolveTransporter()

  if (!transporter) {
    return false
  }

  const sender =
    normalize(from) ||
    firstNonEmptyEnv([
      'SMTP_DEFAULT_FROM',
      'EMAIL_DEFAULT_FROM',
      'EMAIL_FROM',
      'EMAIL_SENDER'
    ]) ||
    firstNonEmptyEnv(['SMTP_USER', 'EMAIL_USER'])

  const mailOptions = {
    to,
    subject,
    from: sender || undefined
  }

  if (text) {
    mailOptions.text = text
  }

  if (html) {
    mailOptions.html = html
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('No fue posible enviar el correo utilizando SMTP:', error)
    return false
  }
}