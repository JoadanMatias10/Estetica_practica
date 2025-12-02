import Usuario from '../models/Usuario.js'
import { hashPassword } from '../lib/bcrypt.js'
//NUEVO
import {
  buildSecretAnswerHash,
  isTrivialSecretAnswer
} from '../services/secret-question/secret-question.service.js'
//------------------

const requiredFields = [
  'nombre',
  'apellidoPaterno',
  'apellidoMaterno',
  'email',
  'telefono',
  'password',
  'rol',
  'aceptaTerminos'
]

const validatePayload = (payload) => {
  const missing = requiredFields.filter((field) =>
    payload[field] === undefined || payload[field] === null || payload[field] === ''
  )

  if (missing.length) {
    return `Faltan campos obligatorios: ${missing.join(', ')}`
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'El correo electrónico no tiene un formato válido.'
  }

  if (!/^[0-9+()\s-]{10,}$/.test(payload.telefono)) {
    return 'El teléfono debe contener al menos 10 caracteres y solo símbolos permitidos.'
  }

  if (payload.rol !== 'cliente' && payload.rol !== 'admin') {
    return 'El rol proporcionado no es válido.'
  }

  if (payload.password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.'
  }

  if (payload.aceptaTerminos !== true) {
    return 'Es necesario aceptar los términos y el aviso de privacidad.'
  }

  return ''
}

export const registrarUsuario = async (req, res) => {
  try {
    const validationMessage = validatePayload(req.body)
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage })
    }

    //const { email, password, confirmPassword, ...rest } = req.body
    const { email, password, confirmPassword, secretQuestion, secretAnswer, ...rest } = req.body

    if (confirmPassword && confirmPassword !== password) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden.' })
    }

    const existingUser = await Usuario.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado.' })
    }

    const hashedPassword = await hashPassword(password)

    //const usuario = new Usuario({
     const usuarioData = {
      ...rest,
      email,
      password: hashedPassword
    }
    //NUEVO
     const hasSecretQuestion =
      typeof secretQuestion === 'string' && typeof secretAnswer === 'string'

    if (hasSecretQuestion) {
      const question = secretQuestion.trim()
      const answer = secretAnswer.trim()

      if (!question) {
        return res.status(400).json({ message: 'La pregunta secreta no puede estar vacía.' })
      }

      if (isTrivialSecretAnswer(answer)) {
        return res.status(400).json({ message: 'La respuesta secreta es demasiado fácil de adivinar.' })
      }

      usuarioData.secretQuestion = question
      usuarioData.secretAnswerHash = await buildSecretAnswerHash(answer)
      usuarioData.secretQuestionEnabled = true
    }

    const usuario = new Usuario(usuarioData)
    //--------------------------------------------

    await usuario.save()

    return res.status(201).json({ message: 'Usuario registrado correctamente.' })
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return res.status(500).json({ message: 'No fue posible completar el registro. Intenta nuevamente.' })
  }
}