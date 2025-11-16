const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '')

// ==============================
// Helpers de correos
// ==============================
const extractEmailAddress = (value) => {
  const normalized = normalizeString(value)

  if (!normalized) {
    return { address: '', raw: '' }
  }

  const angleStart = normalized.lastIndexOf('<')
  const angleEnd = normalized.lastIndexOf('>')

  // Caso: Nombre Apellido <correo@ejemplo.com>
  if (angleStart !== -1 && angleEnd !== -1 && angleEnd > angleStart) {
    const candidate = normalizeString(normalized.slice(angleStart + 1, angleEnd))

    if (EMAIL_REGEX.test(candidate)) {
      return { address: candidate, raw: normalized }
    }
  }

  // Caso: solo correo
  if (EMAIL_REGEX.test(normalized)) {
    return { address: normalized, raw: normalized }
  }

  return { address: '', raw: normalized }
}

const deriveNameFromRawAddress = (raw, email) => {
  if (!raw) return ''

  // Quitar la parte <correo@ejemplo.com>
  const withoutEmail = raw.replace(`<${email}>`, '').trim()

  // Si no queda nada útil, no devolvemos nombre
  if (!withoutEmail || withoutEmail === email) {
    return ''
  }

  // Quitar comillas si las hubiera
  return withoutEmail.replace(/^['"]|['"]$/g, '').trim()
}

const resolveSender = (fromInput) => {
  const fallbackEmail = normalizeString(process.env.BREVO_SENDER_EMAIL)
  const fallbackName = normalizeString(process.env.BREVO_SENDER_NAME)

  // Si viene un objeto { email, name }
  if (fromInput && typeof fromInput === 'object') {
    const address = normalizeString(fromInput.email)

    if (!EMAIL_REGEX.test(address)) {
      throw new Error('El remitente debe ser un correo electrónico válido.')
    }

    return {
      email: address,
      name: fromInput.name || fallbackName || undefined
    }
  }

  // Si viene un string "Nombre Apellido <correo@ejemplo.com>" o "correo@ejemplo.com"
  if (fromInput && typeof fromInput === 'string') {
    const fromAddress = extractEmailAddress(fromInput)

    if (!fromAddress.address) {
      throw new Error('El remitente debe ser un correo electrónico válido.')
    }

    return {
      email: fromAddress.address,
      name:
        deriveNameFromRawAddress(fromAddress.raw, fromAddress.address) ||
        fallbackName ||
        undefined
    }
  }

  // Si no se envía "from", usamos el remitente por defecto de las env vars
  if (!fallbackEmail || !EMAIL_REGEX.test(fallbackEmail)) {
    throw new Error('Configura BREVO_SENDER_EMAIL para poder enviar correos.')
  }

  return { email: fallbackEmail, name: fallbackName || undefined }
}

// ==============================
// Sanitizar payload de email
// ==============================
const sanitizeEmailPayload = ({ to, subject, text, html, from }) => {
  const toAddress = extractEmailAddress(to)

  if (!toAddress.address) {
    throw new Error('El destinatario debe ser un correo electrónico válido.')
  }

  if (!subject || typeof subject !== 'string') {
    throw new Error('El asunto del correo es obligatorio.')
  }

  const sanitized = {
    to: toAddress.address,
    subject: subject.trim(),
    text: typeof text === 'string' ? text : undefined,
    html: typeof html === 'string' ? html : undefined,
    from
  }

  if (!sanitized.text && !sanitized.html) {
    throw new Error('El correo debe incluir contenido en texto o HTML.')
  }

  return sanitized
}

// ==============================
// Envío con Brevo
// ==============================
const sendWithBrevo = async ({ to, subject, text, html, from }) => {
  const apiKey = normalizeString(process.env.BREVO_API_KEY)

  if (!apiKey) {
    console.warn('BREVO_API_KEY no está configurada. No se enviará el correo.')
    return false
  }

  let sender

  try {
    sender = resolveSender(from)
  } catch (error) {
    console.error('No se pudo determinar el remitente del correo:', error)
    return false
  }

  const payload = {
    sender,
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Brevo rechazó el envío del correo:', response.status, errorBody)
      return false
    }

    return true
  } catch (error) {
    console.error('No se pudo enviar el correo con Brevo:', error)
    return false
  }
}

// ==============================
// Función genérica sendEmail
// ==============================
export const sendEmail = async (emailPayload) => {
  let sanitizedPayload

  try {
    sanitizedPayload = sanitizeEmailPayload(emailPayload)
  } catch (error) {
    console.error(
      'Los datos del correo son inválidos y no se pudo preparar el mensaje:',
      error
    )
    return false
  }

  return sendWithBrevo(sanitizedPayload)
}

// ==============================
// Envío código 2FA
// ==============================
export const sendTwoFactorCodeEmail = async ({ to, code, nombre }) => {
  if (!code) {
    throw new Error('El código de verificación es obligatorio.')
  }

  const greeting = nombre ? `Hola ${nombre},` : 'Hola,'

  const emailSent = await sendEmail({
    to,
    subject: 'Tu código de verificación',
    text: `${greeting}\n\nTu código de verificación es: ${code}\nEste código expirará en 10 minutos.`,
    html: `
      <p>${greeting}</p>
      <p>Tu código de verificación es:</p>
      <h2 style="font-size: 28px; letter-spacing: 6px;">${code}</h2>
      <p>Este código expirará en 10 minutos.</p>
    `
  })

  if (!emailSent) {
    console.warn('No se pudo enviar el correo con el código de verificación usando Brevo.')
  }

  return emailSent
}

// ==============================
// Envío correo de recuperación
// ==============================
export const sendPasswordResetEmail = async ({ to, token, nombre }) => {
  if (!token) {
    throw new Error('El token de recuperación es obligatorio.')
  }

  const greeting = nombre ? `Hola ${nombre},` : 'Hola,'
  const baseUrl = normalizeString(process.env.APP_PASSWORD_RESET_URL)

  const link = baseUrl
    ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}&email=${encodeURIComponent(
        to
      )}`
    : ''

  const textInstruction = link
    ? `Sigue este enlace para restablecer tu contraseña: ${link}`
    : `Utiliza el siguiente token para restablecer tu contraseña: ${token}`

  const htmlInstruction = link
    ? `
        <p>Puedes restablecer tu contraseña dando clic en el siguiente enlace:</p>
        <p><a href="${link}">Restablecer contraseña</a></p>
      `
    : `
        <p>Utiliza el siguiente token para restablecer tu contraseña:</p>
        <p style="font-size: 24px; letter-spacing: 4px; font-weight: 700;">${token}</p>
      `

  const emailSent = await sendEmail({
    to,
    subject: 'Recupera el acceso a tu cuenta',
    text: `${greeting}\n\n${textInstruction}\nEste enlace o token expirará en 60 minutos.`,
    html: `
      <p>${greeting}</p>
      ${htmlInstruction}
      <p>Este enlace o token expirará en 60 minutos.</p>
    `
  })

  if (!emailSent) {
    console.warn('No se pudo enviar el correo de recuperación de contraseña mediante Brevo.')
  }

  return emailSent
}
