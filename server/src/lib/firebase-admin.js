import admin from 'firebase-admin'

let firebaseAuth = null

const sanitizePrivateKey = (key) => {
  if (!key) return key

  let sanitized = key

  if (sanitized.startsWith('"') && sanitized.endsWith('"')) {
    sanitized = sanitized.slice(1, -1)
  }

  return sanitized.replace(/\\n/g, '\n')
}

const initializeFirebaseAdmin = () => {
  if (firebaseAuth) {
    return firebaseAuth
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = sanitizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      'Firebase Admin no está configurado. Establece FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY para habilitar el inicio de sesión con Google.'
    )
    return null
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    })

    firebaseAuth = admin.auth(app)
    return firebaseAuth
  } catch (error) {
    console.error('No fue posible inicializar Firebase Admin:', error)
    firebaseAuth = null
    return null
  }
}

export const getFirebaseAuth = () => initializeFirebaseAdmin()

export const isFirebaseConfigured = () => Boolean(firebaseAuth || initializeFirebaseAdmin())