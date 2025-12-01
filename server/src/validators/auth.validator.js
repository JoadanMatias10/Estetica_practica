import { PASSWORD_PATTERN, PASSWORD_PATTERN_MESSAGE } from '../utils/password-pattern.js'

const validateRequiredFields = (payload, fields) => {
  const missing = fields.filter((field) => {
    const value = payload[field]
    return value === undefined || value === null || value === ''
  })

  if (missing.length) {
    return `Faltan campos obligatorios: ${missing.join(', ')}`
  }

  return ''
}

export const validateLoginPayload = (payload) => {
  const message = validateRequiredFields(payload, ['email', 'password'])
  if (message) return message

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'El correo electrónico no tiene un formato válido.'
  }

  return ''
}

export const validateTwoFactorPayload = (payload) => {
  const message = validateRequiredFields(payload, ['email', 'code'])
  if (message) return message

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'El correo electrónico no tiene un formato válido.'
  }

  if (!/^\d{6}$/.test(payload.code)) {
    return 'El código debe tener 6 dígitos.'
  }

  return ''
}

export const validateRecoverPayload = (payload) => {
  const message = validateRequiredFields(payload, ['email'])
  if (message) return message

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'El correo electrónico no tiene un formato válido.'
  }

  return ''
}
export const validateResetPasswordPayload = (payload) => {
  const message = validateRequiredFields(payload, ['email', 'token', 'password'])
  if (message) return message

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return 'El correo electrónico no tiene un formato válido.'
  }

  const token = String(payload.token || '').trim()

  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return 'El token de recuperación no es válido.'
  }

  if (typeof payload.password !== 'string' || !PASSWORD_PATTERN.test(payload.password)) {
    return PASSWORD_PATTERN_MESSAGE
  }
  
  return ''
}