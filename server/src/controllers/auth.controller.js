import { comparePassword } from '../lib/bcrypt.js'
import { sendPasswordResetEmail, sendTwoFactorCodeEmail } from '../services/email/email.service.js'
import {
  createTwoFactorChallenge,
  verifyTwoFactorCode,
  findUserByEmail
} from '../services/two-factor/two-factor.service.js'

import { createPasswordResetChallenge } from '../services/password-reset/password-reset.service.js'
import {
  validateLoginPayload,
  validateTwoFactorPayload,
  validateRecoverPayload
} from '../validators/auth.validator.js'

export const login = async (req, res) => {
  try {
    const validationMessage = validateLoginPayload(req.body)
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage })
    }

    const { email, password } = req.body

    const usuario = await findUserByEmail(email)
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas.' })
    }

    const isValidPassword = await comparePassword(password, usuario.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas.' })
    }

    if (usuario.twoFactorEnabled) {
      const { code } = await createTwoFactorChallenge(usuario)

    await sendTwoFactorCodeEmail({
        to: usuario.email,
        code,
        nombre: usuario.nombre
      })

      return res.status(200).json({
        message: 'Sesión iniciada correctamente.',
        twoFactorRequired: false,
        twoFactorRecommended: true
      })
    }

    return res.status(200).json({
      message: 'Se ha enviado un código de verificación a tu correo electrónico.',
      twoFactorRequired: true
    })
  } catch (error) {
    console.error('Error en el inicio de sesión:', error)
    return res.status(500).json({ message: 'No fue posible iniciar sesión. Intenta nuevamente.' })
  }
}

export const verifyTwoFactor = async (req, res) => {
  try {
    const validationMessage = validateTwoFactorPayload(req.body)
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage })
    }

    const { email, code } = req.body

    const usuario = await findUserByEmail(email)
    if (!usuario) {
      return res.status(404).json({ message: 'No se encontró un usuario con el correo proporcionado.' })
    }

    const { valid, reason } = await verifyTwoFactorCode(usuario, code)
    if (!valid) {
      return res.status(400).json({ message: reason })
    }

    return res.status(200).json({
      message: 'Autenticación completada correctamente.',
      twoFactorRecommended: false
    })

  } catch (error) {
    console.error('Error al verificar el código 2FA:', error)
    return res.status(500).json({ message: 'No fue posible verificar el código. Intenta nuevamente.' })
  }
}

export const recoverPassword = async (req, res) => {
  try {
    const validationMessage = validateRecoverPayload(req.body)
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage })
    }

    const { email } = req.body
    const usuario = await findUserByEmail(email)

    const responseMessage =
      'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.'

    if (!usuario) {
      return res.status(200).json({ message: responseMessage })
    }

    const { token } = await createPasswordResetChallenge(usuario)

    await sendPasswordResetEmail({
      to: usuario.email,
      token,
      nombre: usuario.nombre
    })

    return res.status(200).json({ message: responseMessage })
  } catch (error) {
    console.error('Error al solicitar la recuperación de contraseña:', error)
    return res
      .status(500)
      .json({ message: 'No fue posible procesar la recuperación. Intenta nuevamente.' })
  }

}