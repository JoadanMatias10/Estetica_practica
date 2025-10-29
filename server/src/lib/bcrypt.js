import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const SALT_LENGTH = 16
const KEY_LENGTH = 64
const HASH_PREFIX = 'scrypt'
const SEPARATOR = ':'

const encode = (buffer) => buffer.toString('hex')
const decode = (hex) => Buffer.from(hex, 'hex')

export const hashPassword = async (password) => {
  if (!password) {
    throw new Error('La contraseña es obligatoria para generar el hash.')
  }

  const salt = randomBytes(SALT_LENGTH)
  const derivedKey = await scrypt(password, salt, KEY_LENGTH)

  return [HASH_PREFIX, encode(salt), encode(derivedKey)].join(SEPARATOR)
}

export const comparePassword = async (password, hash) => {
  if (!hash) {
    throw new Error('Se requiere el hash almacenado para validar la contraseña.')
  }

  const [prefix, saltHex, keyHex] = hash.split(SEPARATOR)

  if (prefix !== HASH_PREFIX || !saltHex || !keyHex) {
    throw new Error('El formato del hash almacenado no es válido.')
  }

  const salt = decode(saltHex)
  const storedKey = decode(keyHex)
  const derivedKey = await scrypt(password, salt, storedKey.length)

  if (derivedKey.length !== storedKey.length) {
    return false
  }

  return timingSafeEqual(derivedKey, storedKey)
}