import crypto from 'crypto'
import Usuario from '../models/Usuario.js'
import { hashPassword } from '../lib/bcrypt.js'
import { sendEmailVerificationLink } from '../services/verification.service.js'
import { PASSWORD_PATTERN, PASSWORD_PATTERN_MESSAGE } from '../utils/password-pattern.js'

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

const sanitizeText = (value) => (typeof value === 'string' ? value.replace(/<[^>]*>?/g, '').trim() : value)

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

  if (!PASSWORD_PATTERN.test(payload.password)) {
    return PASSWORD_PATTERN_MESSAGE
  }

  if (payload.aceptaTerminos !== true) {
    return 'Es necesario aceptar los términos y el aviso de privacidad.'
  }

  return ''
}

export const registrarUsuario = async (req, res) => {
  try {

    const sanitizedPayload = Object.fromEntries(
      Object.entries(req.body || {}).map(([key, value]) => [key, sanitizeText(value)])
    )

    if (typeof sanitizedPayload.email === 'string') {
      sanitizedPayload.email = sanitizedPayload.email.toLowerCase()
    }

    const validationMessage = validatePayload(sanitizedPayload)
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage })
    }

     const { email, password, confirmPassword, ...rest } = sanitizedPayload

    if (confirmPassword && confirmPassword !== password) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden.' })
    }

    const existingUser = await Usuario.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ message: 'El correo electrónico ya se encuentra registrado.' })
    }

    const hashedPassword = await hashPassword(password)

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex')

    const usuario = new Usuario({
      ...rest,
      email,
      password: hashedPassword,
      emailVerified: false,
      verification: {
        token: hashedVerificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })

    await usuario.save()

    await sendEmailVerificationLink({ to: email, token: verificationToken })

    return res.status(201).json({ message: 'Usuario registrado correctamente.' })
  } catch (error) {
    console.error('Error al registrar usuario:', error)
    return res.status(500).json({ message: 'No fue posible completar el registro. Intenta nuevamente.' })
  }
}