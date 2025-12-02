import { comparePassword, hashPassword } from '../../lib/bcrypt.js'

const TRIVIAL_ANSWERS = [
  '123456',
  '12345678',
  '123456789',
  'password',
  'qwerty',
  'abc',
  'abc123',
  'contraseña',
  'mi contraseña',
  '000000'
]

const normalize = (value = '') => value.normalize('NFKC').trim().toLowerCase()

export const isTrivialSecretAnswer = (answer = '') => {
  const normalized = normalize(answer)
  return normalized.length === 0 || TRIVIAL_ANSWERS.includes(normalized)
}

export const buildSecretAnswerHash = async (answer) => {
  if (!answer) {
    throw new Error('La respuesta secreta es obligatoria para generar el hash.')
  }

  return hashPassword(answer)
}

export const verifySecretAnswer = async (answer, hash) => {
  if (!hash) return false
  if (!answer) return false

  return comparePassword(answer, hash)
}