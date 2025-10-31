import { getFirebaseAuth, isFirebaseConfigured } from '../../lib/firebase-admin.js'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'

let firestoreInstance

const getFirestoreInstance = () => {
  if (!isFirebaseConfigured()) {
    return null
  }

  if (firestoreInstance) {
    return firestoreInstance
  }

  try {
    getFirebaseAuth()
    firestoreInstance = getFirestore()
    return firestoreInstance
  } catch (error) {
    console.error('No fue posible inicializar Firestore para 2FA:', error)
    firestoreInstance = undefined
    return null
  }
}

export const isFirebaseTwoFactorAvailable = () => Boolean(getFirestoreInstance())

const getChallengesCollection = () => {
  const firestore = getFirestoreInstance()

  if (!firestore) {
    return null
  }

  return firestore.collection('twoFactorChallenges')
}

export const saveTwoFactorChallenge = async ({ userId, codeHash, expiresAt, email }) => {
  const collection = getChallengesCollection()

  if (!collection) {
    throw new Error('Firestore no está disponible para guardar el reto 2FA.')
  }

  await collection.doc(userId).set(
    {
      code: codeHash,
      expiresAt: Timestamp.fromDate(expiresAt),
      email: email?.toLowerCase() ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )
}

const normalizeExpiration = (value) => {
  if (!value) return undefined

  if (value instanceof Date) {
    return value
  }

  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export const getTwoFactorChallenge = async (userId) => {
  const collection = getChallengesCollection()

  if (!collection) {
    return null
  }

  const snapshot = await collection.doc(userId).get()

  if (!snapshot.exists) {
    return null
  }

  const data = snapshot.data() || {}

  return {
    code: data.code,
    expiresAt: normalizeExpiration(data.expiresAt),
  }
}

export const deleteTwoFactorChallenge = async (userId) => {
  const collection = getChallengesCollection()

  if (!collection) {
    return
  }

  await collection.doc(userId).delete()
}