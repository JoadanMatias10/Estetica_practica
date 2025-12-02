const SESSION_EXPIRED_EVENT = 'session-expired'

const sessionStorageKeys = ['token', 'user', 'role']

export const useSessionManager = () => {
  const clearStoredSession = () => {
    if (typeof window === 'undefined' || !window?.localStorage) return

    sessionStorageKeys.forEach((key) => {
      try {
        window.localStorage.removeItem(key)
      } catch (error) {
        // Ignore storage errors to avoid breaking logout flow
      }
    })
  }

  const notifySessionExpired = () => {
    clearStoredSession()

    if (typeof window === 'undefined') return

    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
  }

  return {
    clearStoredSession,
    notifySessionExpired,
  }
}

export { SESSION_EXPIRED_EVENT }