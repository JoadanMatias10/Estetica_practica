import Usuario from '../models/Usuario.js'

const parseNumberEnv = (name, fallback) => {
  const value = Number.parseInt(process.env[name] || '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const MAX_FAILED_ATTEMPTS = parseNumberEnv('LOGIN_MAX_FAILED_ATTEMPTS', 5)
const LOCKOUT_WINDOW_MS = parseNumberEnv('LOGIN_LOCKOUT_WINDOW_MS', 5 * 60 * 1000)
const ANON_LOCKOUT_WINDOW_MS = parseNumberEnv('LOGIN_ANON_LOCKOUT_WINDOW_MS', 5 * 60 * 1000)
const ANON_MAX_FAILED_ATTEMPTS = parseNumberEnv('LOGIN_ANON_MAX_FAILED_ATTEMPTS', 8)

const anonymousAttempts = new Map()

export const isUserLockedOut = (usuario) => {
  if (!usuario?.loginAttempts?.lockUntil) {
    return { locked: false }
  }

  const retryAfterMs = usuario.loginAttempts.lockUntil.getTime() - Date.now()

  if (retryAfterMs > 0) {
    return { locked: true, retryAfterMs }
  }

  return { locked: false }
}

export const registerFailedLoginAttempt = async (usuario) => {
  if (!usuario) return { locked: false }

  const now = Date.now()
  const attempts = usuario.loginAttempts || { count: 0 }
  const newCount = attempts.count + 1
  const lockUntil = newCount >= MAX_FAILED_ATTEMPTS ? new Date(now + LOCKOUT_WINDOW_MS) : undefined

  usuario.loginAttempts = {
    count: newCount,
    lastAttempt: new Date(now),
    lockUntil: lockUntil || attempts.lockUntil
  }

  await usuario.save().catch((error) => {
    console.error('No se pudo registrar el intento fallido de inicio de sesión:', error)
  })

  return {
    locked: !!lockUntil,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - newCount),
    retryAfterMs: lockUntil ? lockUntil.getTime() - now : undefined
  }
}

export const resetLoginAttempts = async (usuario) => {
  if (!usuario?.loginAttempts?.count) return

  usuario.loginAttempts = undefined

  await usuario.save().catch((error) => {
    console.error('No se pudo limpiar los intentos de inicio de sesión:', error)
  })
}

export const registerUnknownLoginAttempt = (ip) => {
  const key = ip || 'unknown'
  const now = Date.now()
  const record = anonymousAttempts.get(key) || { count: 0, start: now }

  if (now - record.start >= ANON_LOCKOUT_WINDOW_MS) {
    anonymousAttempts.set(key, { count: 1, start: now })
    return { locked: false }
  }

  record.count += 1

  if (record.count >= ANON_MAX_FAILED_ATTEMPTS) {
    record.lockUntil = now + ANON_LOCKOUT_WINDOW_MS
    anonymousAttempts.set(key, record)
    return { locked: true, retryAfterMs: record.lockUntil - now }
  }

  anonymousAttempts.set(key, record)
  return { locked: false }
}

export const isAnonymousLocked = (ip) => {
  const key = ip || 'unknown'
  const record = anonymousAttempts.get(key)

  if (!record?.lockUntil) return { locked: false }

  const retryAfterMs = record.lockUntil - Date.now()

  if (retryAfterMs > 0) {
    return { locked: true, retryAfterMs }
  }

  anonymousAttempts.delete(key)
  return { locked: false }
}

export const revokeSessionsForUserId = async (userId) => {
  if (!userId) return

  await Usuario.updateOne({ _id: userId }, { $set: { 'loginAttempts.lockUntil': undefined } }).catch(
    (error) => {
      console.error('No se pudo limpiar los bloqueos de login para el usuario:', error)
    }
  )
}