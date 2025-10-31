import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getFirebaseAuth } from '../../lib/firebase-admin.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FIRESTORE_COLLECTION = process.env.FIREBASE_MAIL_COLLECTION || 'mail'

let cachedFirestore = undefined

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim() : '')

const assertEmail = (value, message) => {
  const email = normalizeEmail(value)
   if (!EMAIL_REGEX.test(email)) {
    throw new Error(message)
}

 return email
}

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

const getFirestoreOrThrow = () => {
  const firestore = resolveFirestore()
if (!firestore) {
    throw new Error(
      'Firebase no está configurado para enviar correos. Verifica las credenciales y la extensión Trigger Email.'
    )
  }

  return firestore
}

const enqueueEmail = async ({ to, subject, text, html, from }) => {
  const firestore = getFirestoreOrThrow()
const document = {
    to: assertEmail(to, 'El destinatario debe ser un correo electrónico válido.'),
    message: { subject },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }

  if (from) {
    document.from = assertEmail(from, 'El remitente debe ser un correo electrónico válido.')
  }

  if (text) {
    document.message.text = text
  }

   if (html) {
    document.message.html = html
  }

  await firestore.collection(EMAIL_COLLECTION).add(document)
}

export const sendTwoFactorCodeEmail = async ({ to, code, nombre }) => {
  if (!code) {
    throw new Error('El código de verificación es obligatorio.')
  }
const greeting = nombre ? `Hola ${nombre},` : 'Hola,'
await enqueueEmail({
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
      await enqueueEmail({
    to,
    subject: 'Recupera el acceso a tu cuenta',
    text: `${greeting}\n\n${textInstruction}\nEste enlace o token expirará en 60 minutos.`,
    html: `
    <p>${greeting}</p>
      ${htmlInstruction}
      <p>Este enlace o token expirará en 60 minutos.</p>
`,
  })
}