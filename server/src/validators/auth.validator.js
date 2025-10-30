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