import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getFirebaseAuth } from '../../lib/firebase-admin.js'
import { sendMailWithConfiguredTransport, isTransportReady } from './transporter.js'
import { sendWithSmtp, isSmtpConfigured } from './smtp.transport.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FIRESTORE_COLLECTION = process.env.FIREBASE_MAIL_COLLECTION || 'mail'

let cachedFirestore = undefined
let warnedNoFirestore = false

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim() : '')

/*const assertEmail = (value, message) => {
  const email = normalizeEmail(value)
   if (!EMAIL_REGEX.test(email)) {
    throw new Error(message)
}

 return email
}*/

const resolveFirestore = () => {
  if (cachedFirestore !== undefined) {
    return cachedFirestore
  }
  const auth = getFirebaseAuth()

  if (!auth) {
    cachedFirestore = null
    return cachedFirestore
  }
   try {
    cachedFirestore = getFirestore()
    return cachedFirestore
  } catch (error) {
    console.error('No fue posible inicializar Firestore para el envío de correos:', error)
    cachedFirestore = null
    return cachedFirestore
  }
}

const getFirestoreOrNull = () => {
  const firestore = resolveFirestore()
if (!firestore) {
    if (!warnedNoFirestore) {
      console.warn(
        'Firebase no está configurado para enviar correos. Verifica las credenciales y la extensión Trigger Email.'
      )
      warnedNoFirestore = true
    }
    return null
  }

  warnedNoFirestore = false
  return firestore
}

const extractEmailAddress = (value) => {
  const normalized = normalizeEmail(value)

  if (!normalized) {
    return { address: '', raw: '' }
  }

  const angleStart = normalized.lastIndexOf('<')
  const angleEnd = normalized.lastIndexOf('>')

  if (angleStart !== -1 && angleEnd !== -1 && angleEnd > angleStart) {
    const candidate = normalizeEmail(normalized.slice(angleStart + 1, angleEnd))

    if (EMAIL_REGEX.test(candidate)) {
      return { address: candidate, raw: normalized }
    }
  }

  if (EMAIL_REGEX.test(normalized)) {
    return { address: normalized, raw: normalized }
  }

  return { address: '', raw: normalized }
}

const sanitizeEmailPayload = ({ to, subject, text, html, from }) => {

   const toAddress = extractEmailAddress(to)

  if (!toAddress.address) {
    throw new Error('El destinatario debe ser un correo electrónico válido.')
  }

  const sanitized = {
    to: toAddress.address,
    subject,
    text,
    html
  }

  if (from) {
     const fromAddress = extractEmailAddress(from)

    if (!fromAddress.address) {
      throw new Error('El remitente debe ser un correo electrónico válido.')
    }

    sanitized.from = fromAddress.raw
  }

  return sanitized
}

const enqueueEmailWithFirebase = async ({ to, subject, text, html, from }) => {
  const firestore = getFirestoreOrNull()

  if (!firestore) {
    return false
  }

  const document = {
    to,
    message: { subject },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }

  if (from) {
    document.from = from
  }

  if (text) {
    document.message.text = text
  }

  if (html) {
    document.message.html = html
  }

  try {
    await firestore.collection(FIRESTORE_COLLECTION).add(document)
    return true
  } catch (error) {
    const errorMessage = error?.message ?? ''

    if (typeof errorMessage === 'string' && errorMessage.includes('DECODER routines')) {
      cachedFirestore = null
      warnedNoFirestore = false
      console.warn(
        'No fue posible conectar con Firestore porque las credenciales de Firebase son inválidas o están mal formateadas.'
      )
    } else {
      console.error('No fue posible encolar el correo en Firestore:', error)
    }

    return false
  }

}

const registerDeliveryInFirestore = (payload, provider) => {
  enqueueEmailWithFirebase(payload)
    .then((enqueued) => {
      if (!enqueued) {
        console.warn(
          `El correo se envió correctamente con ${provider}, pero no se pudo registrar en Firestore para seguimiento.`
        )
      }
    })
    .catch((error) => {
      console.warn(`No se pudo registrar en Firestore el correo enviado con ${provider}:`, error)
    })
}

const sendEmail = async (emailPayload) => {
  let sanitizedPayload

   try {
    sanitizedPayload = sanitizeEmailPayload(emailPayload)
  } catch (error) {
    console.error('Los datos del correo son inválidos y no se pudo preparar el mensaje:', error)
    return false
  }

  const sentDirectly = await sendMailWithConfiguredTransport(sanitizedPayload)

  if (sentDirectly) {
    registerDeliveryInFirestore(sanitizedPayload, 'Nodemailer')
    return true
  }

   const enqueued = await enqueueEmailWithFirebase(sanitizedPayload)

  /*if (enqueued) {
    registerDeliveryInFirestore(sanitizedPayload, 'Gmail')
    return true
  }*/
  
  //const enqueued = await enqueueEmailWithFirebase(sanitizedPayload)

  if (enqueued) {
    return true
  }

  if (!isTransportReady()) {
    console.warn(
      [
        'No se pudo enviar el correo porque no hay un proveedor configurado correctamente.',
        'Configura un servidor SMTP o las variables GMAIL_USER y GMAIL_APP_PASSWORD,',
        'o habilita Firebase Trigger Email.'
      ].join(' ')
    )
  }

  return false
}

export const sendTwoFactorCodeEmail = async ({ to, code, nombre }) => {
  if (!code) {
    throw new Error('El código de verificación es obligatorio.')
  }

  const greeting = nombre ? `Hola ${nombre},` : 'Hola,'

  const emailQueued = await sendEmail({
    to,
    subject: 'Tu código de verificación',
      text: `${greeting}\n\nTu código de verificación es: ${code}\nEste código expirará en 10 minutos.`,
    html: `
      <p>${greeting}</p>
      <p>Tu código de verificación es:</p>
      <h2 style="font-size: 28px; letter-spacing: 6px;">${code}</h2>
      <p>Este código expirará en 10 minutos.</p>
      `,
  })

  if (!emailQueued) {
    console.warn(
      'No se pudo enviar el correo con el código de verificación. Verifica la configuración de Firebase, SMTP o Gmail.'
    )
  }

  return emailQueued
  
}

export const sendPasswordResetEmail = async ({ to, token, nombre }) => {
  if (!token) {
    throw new Error('El token de recuperación es obligatorio.')
  }

  const greeting = nombre ? `Hola ${nombre},` : 'Hola,'
  const baseUrl = process.env.APP_PASSWORD_RESET_URL
  const link = baseUrl
    ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}&email=${encodeURIComponent(to)}`
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
  const emailQueued = await sendEmail({
    to,
    subject: 'Recupera el acceso a tu cuenta',
    text: `${greeting}\n\n${textInstruction}\nEste enlace o token expirará en 60 minutos.`,
    html: `
    <p>${greeting}</p>
      ${htmlInstruction}
      <p>Este enlace o token expirará en 60 minutos.</p>
`,
  })

  if (!emailQueued) {
    console.warn(
      'No se pudo enviar el correo de recuperación de contraseña. Verifica la configuración de Firebase, SMTP o Gmail.'
    )
  }

}

