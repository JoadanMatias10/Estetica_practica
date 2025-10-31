import { hashPassword, comparePassword } from '../../lib/bcrypt.js'
import { generateNumericCode } from '../../utils/otp.js'
import Usuario from '../../models/Usuario.js'

import {
  deleteTwoFactorChallenge,
  getTwoFactorChallenge,
  isFirebaseTwoFactorAvailable,
  saveTwoFactorChallenge,
} from './firebase-two-factor.service.js'

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

  const expiresAt = buildExpirationDate()

  if (isFirebaseTwoFactorAvailable()) {
    try {
      await saveTwoFactorChallenge({
        userId: usuario._id.toString(),
        codeHash: hashedCode,
        expiresAt,
        email: usuario.email,
      })

      if (usuario.twoFactor?.code || usuario.twoFactor?.expiresAt) {
        usuario.twoFactor = undefined
        await usuario.save()
      }

      return { code }
    } catch (error) {
      console.error('No se pudo guardar el reto 2FA en Firebase. Se usará el almacenamiento local:', error)
    }
  }

  usuario.twoFactor = {
    code: hashedCode,
    expiresAt,
  }

  await usuario.save()

  return { code }
}

export const verifyTwoFactorCode = async (usuario, code) => {
  if (!usuario){
    return { valid: false, reason: 'No hay un reto 2FA activo.' }
  }

  if (!code) {
    return { valid: false, reason: 'El código de verificación es obligatorio.' }
  }

  let challenge
  let storedInFirebase = false

  if (isFirebaseTwoFactorAvailable()) {
    try {
      const firebaseChallenge = await getTwoFactorChallenge(usuario._id.toString())

      if (firebaseChallenge?.code && firebaseChallenge?.expiresAt) {
        challenge = firebaseChallenge
        storedInFirebase = true
      }
    } catch (error) {
      console.error(
        'No se pudo recuperar el reto 2FA desde Firebase. Se intentará con el almacenamiento local:',
        error
      )
    }
  }

  if (!challenge?.code || !challenge?.expiresAt) {
    if (!usuario?.twoFactor?.code || !usuario?.twoFactor?.expiresAt) {
      return { valid: false, reason: 'No hay un reto 2FA activo.' }
    }

    challenge = usuario.twoFactor
  }

  const expiresAt =
    challenge.expiresAt instanceof Date ? challenge.expiresAt : new Date(challenge.expiresAt)

  if (Number.isNaN(expiresAt.getTime())) {
    return { valid: false, reason: 'El reto 2FA es inválido. Solicita un nuevo código.' }
  }

  if (expiresAt.getTime() < Date.now()) {
    if (storedInFirebase) {
      await deleteTwoFactorChallenge(usuario._id.toString()).catch((error) => {
        console.error('No se pudo limpiar el reto 2FA expirado en Firebase:', error)
      })
    }

    if (usuario?.twoFactor?.code || usuario?.twoFactor?.expiresAt) {
      usuario.twoFactor = undefined
      await usuario.save()
    }

    return { valid: false, reason: 'El código ha expirado.' }
  }

  const isMatch = await comparePassword(code, challenge.code)

  if (!isMatch) {
    return { valid: false, reason: 'El código es incorrecto.' }
  }

  if (storedInFirebase) {
    await deleteTwoFactorChallenge(usuario._id.toString()).catch((error) => {
      console.error('No se pudo eliminar el reto 2FA en Firebase:', error)
    })
  }

  if (usuario?.twoFactor?.code || usuario?.twoFactor?.expiresAt) {
    usuario.twoFactor = undefined
    await usuario.save()
  }

  return { valid: true }
}

export const clearTwoFactorChallenge = async (usuario) => {
  if (!usuario) return

  if (isFirebaseTwoFactorAvailable()) {
    await deleteTwoFactorChallenge(usuario._id.toString()).catch((error) => {
      console.error('No se pudo limpiar el reto 2FA en Firebase:', error)
    })
  }

  if (usuario.twoFactor) {
    usuario.twoFactor = undefined
    await usuario.save()
  }

}

export const findUserByEmail = async (email) => {
  if (!email) {
    throw new Error('El correo electrónico es obligatorio.')
  }

  return Usuario.findOne({ email })
}