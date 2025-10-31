import nodemailer from 'nodemailer'

const REQUIRED_ENV_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']

const TRUE_VALUES = new Set(['true', '1', 'yes', 'on']) 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  let transporterPromise
  let cachedConfigSignature

const parseBoolean = (value, defaultValue) => {
  if (value === undefined) {
    return defaultValue
  }

  return TRUE_VALUES.has(String(value).trim().toLowerCase())
}

const validateFromAddress = () => {
  const from = process.env.SMTP_FROM

  if (!EMAIL_REGEX.test(from)) {
    throw new Error(
      'SMTP_FROM debe contener un correo electrónico válido (por ejemplo: usuario@dominio.com).'
    )
  }

  const name = process.env.SMTP_FROM_NAME?.trim()

  return name ? `"${name}" <${from}>` : from
}

const validateEmailConfig = () => {
  REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar])

  if (missing.length) {
    throw new Error(
      `Faltan variables de entorno para configurar el correo: ${missing.join(', ')}`
    )
  }

  const port = Number(process.env.SMTP_PORT)

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('La variable SMTP_PORT debe ser un número entero válido.')
  }

  return port
}

const buildTransporter = async () => {
  const port = validateEmailConfig()

  const secure = parseBoolean(process.env.SMTP_SECURE, port === 465)
  const requireTLS = parseBoolean(process.env.SMTP_REQUIRE_TLS, false)
  const ignoreTLS = parseBoolean(process.env.SMTP_IGNORE_TLS, false)
  const rejectUnauthorized = parseBoolean(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true)

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
    secure,
    requireTLS,
    ignoreTLS,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized
    }
  })

  await transporter.verify()

  return transporter
}

const getConfigSignature = () =>
  JSON.stringify({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
    secure: process.env.SMTP_SECURE,
    requireTLS: process.env.SMTP_REQUIRE_TLS,
    ignoreTLS: process.env.SMTP_IGNORE_TLS,
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED
  })

  const getTransporter = () => {
    const signature = getConfigSignature()

  if (!transporterPromise || cachedConfigSignature !== signature) {
    cachedConfigSignature = signature
    transporterPromise = buildTransporter().catch((error) => {
      transporterPromise = undefined
      throw error
    })

  }

     return transporterPromise
  }

  const ensureAccepted = (info, context) => {
  const accepted = Array.isArray(info?.accepted) ? info.accepted.length > 0 : false

  if (!accepted) {
    throw new Error(
      `El servidor SMTP rechazó el correo ${context}. Revisa la configuración o las credenciales.`
    )
  }
}

const validateDelivery = (info, context) => {
  const rejected = Array.isArray(info?.rejected) ? info.rejected : []
  const pending = Array.isArray(info?.pending) ? info.pending : []
  const accepted = Array.isArray(info?.accepted) ? info.accepted : []

  if (rejected.length) {
    throw new Error(
      `El servidor SMTP rechazó el correo ${context} para: ${rejected.join(', ')}. Verifica el remitente o los destinatarios.`
    )
  }

  if (!accepted.length) {
    throw new Error(
      `El servidor SMTP no confirmó la entrega del correo ${context}. Revisa la configuración o las credenciales.`
    )
  }

  if (pending.length) {
    console.warn(
      `El servidor SMTP marcó como pendiente el correo ${context} para: ${pending.join(', ')}.`
    )
  }
}

const sendMail = async (mailOptions, context) => {
  const transporter = await getTransporter()
  const from = validateFromAddress()

  const info = await transporter.sendMail({
    ...mailOptions,
    from: mailOptions.from || from
  })

  validateDelivery(info, context)

  return info
}

export const sendTwoFactorCodeEmail = async ({ to, code, nombre }) => {
  if (!to || !code) {
    throw new Error('El destinatario y el código son obligatorios para enviar el correo 2FA.')
  }

  const greetingName = nombre ? `Hola ${nombre},` : 'Hola,'

  const transport = getTransporter()

  const mailOptions = {
    to,
    subject: 'Tu código de verificación',
    text: `${greetingName}\n\nTu código de verificación es: ${code}\nEste código expirará en 10 minutos.`,
    html: `
      <p>${greetingName}</p>
      <p>Tu código de verificación es:</p>
      <h2 style="font-size: 28px; letter-spacing: 6px;">${code}</h2>
      <p>Este código expirará en 10 minutos.</p>
    `
  }

    await sendMail(mailOptions, 'de verificación 2FA')
}

export const sendPasswordResetEmail = async ({ to, token, nombre }) => {
  if (!to || !token) {
    throw new Error('El destinatario y el token son obligatorios para enviar la recuperación.')
  }

  const greetingName = nombre ? `Hola ${nombre},` : 'Hola,'

  const resetUrlBase = process.env.APP_PASSWORD_RESET_URL
  const resetLink = resetUrlBase
    ? `${resetUrlBase}${resetUrlBase.includes('?') ? '&' : '?'}token=${token}&email=${encodeURIComponent(
        to
      )}`
    : ''

  const plainInstructions = resetLink
    ? `Sigue este enlace para restablecer tu contraseña: ${resetLink}`
    : `Utiliza el siguiente token para restablecer tu contraseña: ${token}`

  const htmlInstructions = resetLink
    ? `
        <p>Puedes restablecer tu contraseña dando clic en el siguiente enlace:</p>
        <p><a href="${resetLink}">Restablecer contraseña</a></p>
      `
    : `
        <p>Utiliza el siguiente token para restablecer tu contraseña:</p>
        <p style="font-size: 24px; letter-spacing: 4px; font-weight: 700;">${token}</p>
      `

    const transport = getTransporter()

  const mailOptions = {
    to,
    subject: 'Recupera el acceso a tu cuenta',
    text: `${greetingName}\n\n${plainInstructions}\nEste enlace o token expirará en 60 minutos.`,
    html: `
      <p>${greetingName}</p>
      ${htmlInstructions}
      <p>Este enlace o token expirará en 60 minutos.</p>
    `
  }

   await sendMail(mailOptions, 'de restablecimiento de contraseña')
 
}