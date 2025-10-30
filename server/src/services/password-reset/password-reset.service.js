import { randomBytes } from 'node:crypto'
import { hashPassword } from '../../lib/bcrypt.js'

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