import { randomBytes } from 'node:crypto'
import { comparePassword, hashPassword } from '../../lib/bcrypt.js'

const RESET_EXPIRATION_MINUTES = 60

const buildExpirationDate = () => {
  const expires = new Date()
  expires.setMinutes(expires.getMinutes() + RESET_EXPIRATION_MINUTES)
  return expires
}

const generateToken = () => randomBytes(32).toString('hex')

export const createPasswordResetChallenge = async (usuario) => {
  if (!usuario) {
    throw new Error('Se requiere un usuario para generar la recuperación de contraseña.')
  }

  const token = generateToken()
  const hashedToken = await hashPassword(token)

  usuario.passwordReset = {
    token: hashedToken,
    expiresAt: buildExpirationDate(),
  }

  await usuario.save()

  return { token }
}

export const clearPasswordResetChallenge = async (usuario) => {
  if (!usuario) return

  usuario.passwordReset = undefined
  await usuario.save()
}

export const validatePasswordResetChallenge = async (usuario, token) => {
  if (!usuario) {
    return {
      valid: false,
      reason: 'No se encontró el usuario solicitado.',
    }
  }

  if (!token) {
    return {
      valid: false,
      reason: 'El token de recuperación es obligatorio.',
    }
  }

  const challenge = usuario.passwordReset

  if (!challenge?.token || !challenge?.expiresAt) {
    return {
      valid: false,
      reason: 'No hay una recuperación de contraseña activa. Solicita un nuevo enlace.',
    }
  }

  const expiresAt =
    challenge.expiresAt instanceof Date
      ? challenge.expiresAt
      : new Date(challenge.expiresAt)

  if (Number.isNaN(expiresAt.getTime())) {
    return {
      valid: false,
      reason: 'El token de recuperación es inválido. Solicita uno nuevo.',
    }
  }

  if (expiresAt.getTime() < Date.now()) {
    return {
      valid: false,
      reason: 'El enlace para restablecer ha expirado. Solicita uno nuevo.',
      expired: true,
    }
  }

  const isMatch = await comparePassword(token, challenge.token)

  if (!isMatch) {
    return {
      valid: false,
      reason: 'El token proporcionado no es válido.',
    }
  }

  return { valid: true }
}

export const updateUserPassword = async (usuario, password) => {
  if (!usuario) {
    throw new Error('Se requiere un usuario para actualizar la contraseña.')
  }

  if (!password) {
    throw new Error('La nueva contraseña es obligatoria para la actualización.')
  }

  usuario.password = await hashPassword(password)
  await usuario.save()
}