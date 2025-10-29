import { randomInt } from 'node:crypto'

export const generateNumericCode = (length = 6) => {
  if (length <= 0) {
    throw new Error('La longitud del código debe ser mayor que cero.')
  }

  const min = 10 ** (length - 1)
  const max = 10 ** length

  const code = randomInt(min, max)
  return code.toString().padStart(length, '0')
}