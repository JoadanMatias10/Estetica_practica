import { hashPassword, comparePassword } from '../../lib/bcrypt.js'
import { generateNumericCode } from '../../utils/otp.js'
import Usuario from '../../models/Usuario.js'

const TWO_FACTOR_EXPIRATION_MINUTES = 10

const buildExpirationDate = () => {
  const expires = new Date()
  expires.setMinutes(expires.getMinutes() + TWO_FACTOR_EXPIRATION_MINUTES)
  return expires
}

export const createTwoFactorChallenge = async (usuario) => {
  if (!usuario) {
    throw new Error('Se requiere un usuario para generar el código 2FA.')
  }

  const code = generateNumericCode(6)
  const hashedCode = await hashPassword(code)

  usuario.twoFactor = {
    code: hashedCode,
    expiresAt: buildExpirationDate()
  }

  await usuario.save()

  return { code }
}

export const verifyTwoFactorCode = async (usuario, code) => {
  if (!usuario?.twoFactor?.code || !usuario?.twoFactor?.expiresAt) {
    return { valid: false, reason: 'No hay un reto 2FA activo.' }
  }

  if (!code) {
    return { valid: false, reason: 'El código de verificación es obligatorio.' }
  }

  if (usuario.twoFactor.expiresAt.getTime() < Date.now()) {
    return { valid: false, reason: 'El código ha expirado.' }
  }

  const isMatch = await comparePassword(code, usuario.twoFactor.code)

  if (!isMatch) {
    return { valid: false, reason: 'El código es incorrecto.' }
  }

  usuario.twoFactor = undefined
  await usuario.save()

  return { valid: true }
}

export const clearTwoFactorChallenge = async (usuario) => {
  if (!usuario) return

  usuario.twoFactor = undefined
  await usuario.save()
}

export const findUserByEmail = async (email) => {
  if (!email) {
    throw new Error('El correo electrónico es obligatorio.')
  }

  return Usuario.findOne({ email })
}