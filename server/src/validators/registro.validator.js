const sanitizeValue = (value) => {
  if (value === undefined || value === null) return ''

  if (typeof value === 'object') {
    throw new Error('El formato del campo no es válido.')
  }

  const stringValue = String(value)

  if (/\$[a-zA-Z0-9_]+/.test(stringValue)) {
    throw new Error('El formato del campo no es válido.')
  }

  if (/<\/?\s*script/gi.test(stringValue)) {
    throw new Error('El formato del campo no es válido.')
  }

  return stringValue.replace(/[<>]/g, '').trim()
}

export const validarRegistroUsuario = (req, res, next) => {
  const campos = ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'email', 'telefono', 'password']
  const errores = []

  const contrasenaComun = ['123456', 'password', 'qwerty', '12345678']

  campos.forEach((campo) => {
    try {
      req.body[campo] = sanitizeValue(req.body[campo])
    } catch (error) {
      errores.push({ campo, mensaje: error.message })
    }
  })

  const password = req.body.password || ''
  const requisitosContrasena = []

  if (password.length < 8) {
    requisitosContrasena.push('tener al menos 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    requisitosContrasena.push('incluir al menos una letra mayúscula')
  }

  if (!/[a-z]/.test(password)) {
    requisitosContrasena.push('incluir al menos una letra minúscula')
  }

  if (!/[0-9]/.test(password)) {
    requisitosContrasena.push('incluir al menos un número')
  }

  if (!/[!@#$%^&*(),.?":{}|<>\[\]\\/;'+\-=]/.test(password)) {
    requisitosContrasena.push('incluir al menos un carácter especial')
  }

  if (contrasenaComun.includes(password)) {
    requisitosContrasena.push('no usar contraseñas comunes (ej. 123456, password, qwerty, 12345678)')
  }

  if (requisitosContrasena.length) {
    errores.push({
      campo: 'password',
      mensaje: `La contraseña debe ${requisitosContrasena.join(', ')}.`
    })
  }

  if (errores.length) {
    return res.status(400).json({ errores })
  }

  return next()
}