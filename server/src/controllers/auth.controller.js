import { comparePassword } from '../lib/bcrypt.js'
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase-admin.js'
import { sendPasswordResetEmail, sendTwoFactorCodeEmail } from '../services/email/email.service.js'
import {
  createTwoFactorChallenge,
  verifyTwoFactorCode,
  findUserByEmail,
  clearTwoFactorChallenge
} from '../services/two-factor/two-factor.service.js'

import {
  createPasswordResetChallenge,
  clearPasswordResetChallenge,
  updateUserPassword,
  validatePasswordResetChallenge,
} from '../services/password-reset/password-reset.service.js'
//Nuevo
import {
  isRecoveryRateLimited,
  registerRecoveryAttempt,
} from '../services/password-reset/recovery-attempt.service.js'
//-------------------
import {
  validateLoginPayload,
  validateTwoFactorPayload,
  validateRecoverPayload,
  validateResetPasswordPayload,
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

     let requireTwoFactor = usuario.twoFactorEnabled === true

    if (!requireTwoFactor) {
      requireTwoFactor = true

      if (usuario.twoFactorEnabled !== true) {
        usuario.twoFactorEnabled = true

        await usuario
          .save()
          .catch((error) => {
            console.error('No se pudo habilitar el segundo factor automáticamente para el usuario:', error)
          })
      }
    }

    if (requireTwoFactor) {
      const { code } = await createTwoFactorChallenge(usuario)

    const emailSent = await sendTwoFactorCodeEmail({
        to: usuario.email,
        code,
        nombre: usuario.nombre
      })

      
      if (!emailSent) {
        await clearTwoFactorChallenge(usuario).catch((error) => {
          console.error('No se pudo revertir el reto 2FA después de fallar el envío del correo:', error)
        })

        return res.status(503).json({
          message: 'Se ha enviado un código de verificación a tu correo electrónico.',
          twoFactorRequired: true,
          twoFactorRecommended: false
        })
      }


      return res.status(200).json({
        message: 'Se ha enviado un código de verificación a tu correo electrónico.',
        twoFactorRequired: true,
        twoFactorRecommended: false
      })
    }

    return res.status(200).json({
      message: 'Sesión iniciada correctamente.',
      twoFactorRequired: false,
      twoFactorRecommended: true
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
    //const usuario = await findUserByEmail(email)

    const responseMessage =
      'Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.'

      //Nuevo
    const isRateLimited = await isRecoveryRateLimited(email)

    if (isRateLimited) {
      return res.status(200).json({ message: responseMessage })
    }

    const usuario = await findUserByEmail(email)
    //------------------------------------------

    if (!usuario) {
      //Nuevo
       await registerRecoveryAttempt(email, req.ip).catch((error) => {
        console.error('No se pudo registrar el intento de recuperación:', error)
      })
      //--------------------------
      return res.status(200).json({ message: responseMessage })
    }

    const { token } = await createPasswordResetChallenge(usuario)

    await sendPasswordResetEmail({
      to: usuario.email,
      token,
      nombre: usuario.nombre
    })

    //Nuevo
    await registerRecoveryAttempt(email, req.ip).catch((error) => {
      console.error('No se pudo registrar el intento de recuperación:', error)
    })
    //----------------------

    return res.status(200).json({ message: responseMessage })
  } catch (error) {
    console.error('Error al solicitar la recuperación de contraseña:', error)
    return res
      .status(500)
      .json({ message: 'No fue posible procesar la recuperación. Intenta nuevamente.' })
  }

  }

  export const resetPassword = async (req, res) => {
  try {
    const validationMessage = validateResetPasswordPayload(req.body)
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage })
    }

    const { email, token, password } = req.body

    const usuario = await findUserByEmail(email)

    if (!usuario) {
      return res.status(400).json({
        message:
          'El enlace para restablecer tu contraseña es inválido o ha expirado. Solicita uno nuevo.',
      })
    }

    const { valid, reason, expired } = await validatePasswordResetChallenge(usuario, token)

    if (!valid) {
      if (expired) {
        await clearPasswordResetChallenge(usuario)
      }

      return res.status(400).json({
        message: reason || 'El token para restablecer tu contraseña no es válido.',
      })
    }

    await updateUserPassword(usuario, password)
    await clearPasswordResetChallenge(usuario)

    return res.status(200).json({
      message:
        'Tu contraseña se actualizó correctamente. Ahora puedes iniciar sesión con tus nuevos datos.',
    })
  } catch (error) {
    console.error('Error al restablecer la contraseña:', error)
    return res
      .status(500)
      .json({ message: 'No fue posible restablecer la contraseña. Intenta nuevamente.' })
  }
}

export const loginWithGoogle = async (req, res) => {
  if (!isFirebaseConfigured()) {
    return res.status(503).json({
      message:
        'El servidor no tiene configuradas las credenciales de Firebase. Comunícate con el administrador.'
    })
  }

  const { token } = req.body || {}

  if (!token) {
    return res.status(400).json({ message: 'El token de autenticación de Google es obligatorio.' })
  }

  try {
    const firebaseAuth = getFirebaseAuth()

    if (!firebaseAuth) {
      return res.status(503).json({
        message:
          'El servidor no pudo inicializar Firebase correctamente. Intenta de nuevo más tarde.'
      })
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token)

    const email = decodedToken?.email?.toLowerCase()

    if (!email) {
      return res.status(400).json({ message: 'El token de Google no incluye un correo electrónico válido.' })
    }

    const usuario = await findUserByEmail(email).catch(() => null)

    if (!usuario) {
     return res.status(200).json({
        message: 'Sesión iniciada con Google correctamente.',
        twoFactorRequired: false,
        twoFactorRecommended: false,
        user: {
          nombre:
            decodedToken?.name || decodedToken?.given_name || decodedToken?.family_name || email,
          email
        }
      })
    }

    return res.status(200).json({
      message: 'Sesión iniciada con Google correctamente.',
      twoFactorRequired: false,
      twoFactorRecommended: !usuario.twoFactorEnabled,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    })
  } catch (error) {
    console.error('Error al verificar el token de Google:', error)

    return res
      .status(401)
      .json({ message: 'El token de Google no es válido o ha expirado. Intenta nuevamente.' })
  }
}

