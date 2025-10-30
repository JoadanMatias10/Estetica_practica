import { computed } from 'vue'

export const useApiBaseUrl = () => {
  const apiBaseUrl = computed(() => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    return base.endsWith('/') ? base.slice(0, -1) : base
  })

  return { apiBaseUrl }
}