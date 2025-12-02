import { useSessionManager } from './useSessionManager'

const SESSION_ERROR_PATTERNS = [
  'token expirado',
  'sesión expirada',
  'sesion expirada',
  'sesión inválida',
  'sesion invalida',
  'sesión cerrada',
  'sesion cerrada',
  'sesión inválida o cerrada',
]

const extractMessage = async (response) => {
  const clonedResponse = response.clone()

  try {
    const data = await clonedResponse.json()
    const messageCandidate = data?.message || data?.error || data

    if (typeof messageCandidate === 'string') return messageCandidate
  } catch (error) {
    // If JSON parsing fails, try reading raw text
  }

  try {
    return await response.clone().text()
  } catch (error) {
    return ''
  }
}

const isSessionExpiredResponse = async (response) => {
  if (response.status !== 401) return false

  const message = (await extractMessage(response))?.toLowerCase() || ''

  return SESSION_ERROR_PATTERNS.some((pattern) => message.includes(pattern))
}

export const useApiClient = () => {
  const { notifySessionExpired } = useSessionManager()

  const apiFetch = async (input, init) => {
    const response = await fetch(input, init)

    if (await isSessionExpiredResponse(response)) {
      notifySessionExpired()
    }

    return response
  }

  return { apiFetch }
}