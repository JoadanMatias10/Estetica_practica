import nodemailer from 'nodemailer'

let cachedTransporter = undefined
let transporterVerified = false
let warnedNoConfig = false
let warnedPartialAuth = false

const invalidateTransporter = (persistNull = false) => {
  cachedTransporter = persistNull ? null : undefined
  transporterVerified = false
}

const normalize = (value) => (typeof value === 'string' ? value.trim() : '')

const resolveEnvReference = (value, seen = new Set()) => {
  const normalized = normalize(value)

  if (!normalized) {
    return ''
  }

  const match = normalized.match(/^\$\{([A-Z0-9_]+)\}$/i)

  if (!match) {
    return normalized
  }

  const referencedKey = match[1]

  if (seen.has(referencedKey)) {
    return ''
  }

  seen.add(referencedKey)

  return resolveEnvReference(process.env[referencedKey], seen)
}

const firstNonEmptyEnv = (keys) => {
  for (const key of keys) {
    const rawValue = process.env[key]

    if (rawValue !== undefined && rawValue !== null) {
      const resolved = resolveEnvReference(rawValue, new Set([key]))

      if (resolved) {
        return resolved
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
  const user = firstNonEmptyEnv([
    'SMTP_USER',
    'EMAIL_USER',
    'EMAIL_USERNAME',
    'GMAIL_USER'
  ])
  const password = firstNonEmptyEnv([
    'SMTP_PASSWORD',
    'EMAIL_PASSWORD',
    'EMAIL_PASS',
    'GMAIL_APP_PASSWORD'
  ])
  const port = parsePort(firstNonEmptyEnv(['SMTP_PORT', 'EMAIL_PORT']))
  const secure = parseBoolean(
    firstNonEmptyEnv(['SMTP_SECURE', 'EMAIL_SECURE']),
    port === 465
  )

  if (!host) {
    invalidateTransporter(true)

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
    transporterVerified = false
    warnedNoConfig = false
    return cachedTransporter
  } catch (error) {
    console.error('No fue posible inicializar el transporte SMTP:', error)
    invalidateTransporter(true)
    return cachedTransporter
  }
}

export const isSmtpConfigured = () => Boolean(resolveTransporter())

export const sendWithSmtp = async ({ to, subject, text, html, from }) => {
  const transporter = resolveTransporter()

  if (!transporter) {
    return false
  }

  if (!transporterVerified && typeof transporter.verify === 'function') {
    try {
      await transporter.verify()
      transporterVerified = true
    } catch (error) {
      console.error('No fue posible autenticar la conexión SMTP. Revisa host, puerto y credenciales.', error)
      invalidateTransporter(true)
      return false
    }
  }

  const sender =
    normalize(from) ||
    firstNonEmptyEnv([
      'SMTP_DEFAULT_FROM',
      'EMAIL_DEFAULT_FROM',
      'EMAIL_FROM',
      'EMAIL_SENDER',
      'GMAIL_DEFAULT_FROM'
    ]) ||
    firstNonEmptyEnv(['SMTP_USER', 'EMAIL_USER', 'EMAIL_USERNAME', 'GMAIL_USER'])

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
    const info = await transporter.sendMail(mailOptions)
    const acceptedCount = Array.isArray(info?.accepted) ? info.accepted.length : 0

    if (!acceptedCount) {
      console.error('El servidor SMTP rechazó el mensaje. Revisa la configuración del remitente y destinatario.')
      return false
    }

    return true
  } catch (error) {
    console.error('No fue posible enviar el correo utilizando SMTP:', error)
    invalidateTransporter()
    return false
  }
}