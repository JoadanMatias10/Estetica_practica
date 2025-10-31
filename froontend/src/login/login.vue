<script setup>
import { computed, reactive, ref } from 'vue'
import { signInWithPopup } from 'firebase/auth'
import { useApiBaseUrl } from '../composables/useApiBaseUrl'
import { auth, googleProvider } from '../firebase/client'

const emit = defineEmits(['navigate'])

const { apiBaseUrl } = useApiBaseUrl()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const sessionUserName = ref('')

const errors = reactive({
  email: '',
  password: '',
})

const statusMessage = ref('')
const statusType = ref('neutral')
const isSubmitting = ref(false)
const isAwaitingTwoFactor = ref(false)
const isVerifyingTwoFactor = ref(false)
const twoFactorCode = ref('')
const twoFactorError = ref('')
const showTwoFactorBanner = ref(false)
const isGoogleSubmitting = ref(false)

const failedAttempts = ref([])
const lockExpiresAt = ref(0)

const RATE_LIMIT_COUNT = 5
const RATE_LIMIT_WINDOW_MS = 60000
const RATE_LIMIT_LOCK_MS = 60000

const isRateLimited = computed(() => lockExpiresAt.value > Date.now())
const rateLimitSeconds = computed(() =>
  isRateLimited.value ? Math.ceil((lockExpiresAt.value - Date.now()) / 1000) : 0,
)

const googleSignInAvailable = computed(
  () => Boolean(auth) && Boolean(googleProvider),
)

const fieldValidators = {
  email(value) {
    if (!value) {
      return 'Ingresa tu correo electrónico.'
    }

    const emailPattern = /^(?:[a-zA-Z0-9_'^&+{}-]+(?:\.[a-zA-Z0-9_'^&+{}-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
    if (!emailPattern.test(value)) {
      return 'Ingresa un correo electrónico válido.'
    }

    return ''
  },
  password(value) {
    if (!value) {
      return 'Ingresa tu contraseña.'
    }

    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.'
    }

    return ''
  },
}

const validateField = (field) => {
  errors[field] = fieldValidators[field](form[field])
}

const validateForm = () => {
  validateField('email')
  validateField('password')

  return !errors.email && !errors.password
}

const validateTwoFactorCode = () => {
  const value = twoFactorCode.value.trim()

  if (!value) {
    twoFactorError.value = 'Ingresa el código de verificación.'
    return false
  }

  if (!/^\d{6}$/.test(value)) {
    twoFactorError.value = 'El código debe tener 6 dígitos.'
    return false
  }

  twoFactorError.value = ''
  return true
}

const resetTwoFactorFlow = () => {
  isAwaitingTwoFactor.value = false
  isVerifyingTwoFactor.value = false
  twoFactorCode.value = ''
  twoFactorError.value = ''
}

const resetRateLimit = () => {
  failedAttempts.value = []
  lockExpiresAt.value = 0
}

const registerFailedAttempt = () => {
  const now = Date.now()
  failedAttempts.value = failedAttempts.value.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  )
  failedAttempts.value.push(now)

  if (failedAttempts.value.length >= RATE_LIMIT_COUNT) {
    lockExpiresAt.value = now + RATE_LIMIT_LOCK_MS
    failedAttempts.value = []
  }
}

const toTitleCase = (input) =>
  input
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

const formatDisplayName = (value) => {
  const trimmed = (value || '').trim()

  if (!trimmed) {
    return 'Cliente Panamericana'
  }

  if (trimmed.includes('@')) {
    const [local] = trimmed.split('@')
    if (!local) {
      return 'Cliente Panamericana'
    }

    const cleaned = local.replace(/[._-]+/g, ' ')
    const normalised = cleaned.replace(/\s+/g, ' ').trim()
    return normalised ? toTitleCase(normalised) : 'Cliente Panamericana'
  }

  return toTitleCase(trimmed)
}

const navigateToClientExperience = (rawName) => {
  const displayName = formatDisplayName(rawName || sessionUserName.value || form.email)
  sessionUserName.value = displayName
  statusMessage.value = ''
  statusType.value = 'neutral'
  showTwoFactorBanner.value = false
  resetTwoFactorFlow()
  emit('navigate', 'dashboard', { userName: displayName })
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  statusMessage.value = ''
  statusType.value = 'neutral'
  showTwoFactorBanner.value = false
  resetTwoFactorFlow()
  sessionUserName.value = ''

  if (isRateLimited.value) {
    statusMessage.value = `Demasiados intentos. Intenta de nuevo en ${rateLimitSeconds.value} segundos.`
    statusType.value = 'warning'
    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch(`${apiBaseUrl.value}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        remember: form.remember,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      if (response.status === 401) {
        registerFailedAttempt()
        statusMessage.value = 'Correo o contraseña inválidos.'
      } else if (data?.message) {
        statusMessage.value = data.message
      } else {
        statusMessage.value = 'No fue posible iniciar sesión. Intenta nuevamente.'
      }

      statusType.value = 'error'
      return
    }

    resetRateLimit()

   const candidateName =
      data?.user?.nombre || data?.user?.name || data?.nombre || data?.name || form.email

    if (data.twoFactorRequired) {
      isAwaitingTwoFactor.value = true
      sessionUserName.value = formatDisplayName(candidateName)
      statusMessage.value =
        data.message || 'Revisa tu correo e ingresa el código de verificación.'
      statusType.value = 'info'
    } else {
      resetTwoFactorFlow()
      resetRateLimit()
      navigateToClientExperience(candidateName)
      return
    }
  } catch (error) {
    statusMessage.value = 'No fue posible iniciar sesión. Intenta nuevamente.'
    statusType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

const handleVerifyTwoFactor = async () => {
  if (isVerifyingTwoFactor.value) return

  statusMessage.value = ''
  statusType.value = 'neutral'

  if (!validateTwoFactorCode()) {
    statusMessage.value = twoFactorError.value
    statusType.value = 'error'
    return
  }

  isVerifyingTwoFactor.value = true

  try {
    const response = await fetch(`${apiBaseUrl.value}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        code: twoFactorCode.value.trim(),
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message = data?.message || 'El código no es válido.'
      twoFactorError.value = message
      statusMessage.value = message
      statusType.value = 'error'
      return
    }

    resetRateLimit()
    twoFactorError.value = ''
    twoFactorCode.value = ''
    isAwaitingTwoFactor.value = false
    navigateToClientExperience(sessionUserName.value || form.email)
    return
  } catch (error) {
    statusMessage.value = 'No fue posible verificar el código. Intenta nuevamente.'
    statusType.value = 'error'
  } finally {
    isVerifyingTwoFactor.value = false
  }
}

const handleCancelTwoFactor = () => {
  resetTwoFactorFlow()
  statusMessage.value = ''
  statusType.value = 'neutral'
  form.password = ''
  sessionUserName.value = ''
}

const handleGoogleSignIn = async () => {
  if (isGoogleSubmitting.value) return

  if (!googleSignInAvailable.value) {
    statusMessage.value =
      'La autenticación con Google no está disponible en este momento. Intenta más tarde.'
    statusType.value = 'error'
    return
  }

  statusMessage.value = ''
  statusType.value = 'neutral'
  showTwoFactorBanner.value = false
  isGoogleSubmitting.value = true

  try {
    const result = await signInWithPopup(auth, googleProvider)
    const token = await result.user.getIdToken()

    if (!token) {
      statusMessage.value =
        'Google no devolvió un token de autenticación válido. Intenta nuevamente.'
      statusType.value = 'error'
      return
    }

    const response = await fetch(`${apiBaseUrl.value}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      statusMessage.value =
        data?.message ||
        'El servidor rechazó el inicio de sesión con Google. Intenta nuevamente más tarde.'
      statusType.value = response.status === 503 ? 'warning' : 'error'
      return
    }

      const googleName =
      data?.user?.nombre || result.user.displayName || data?.user?.name || result.user.email

    resetRateLimit()
    navigateToClientExperience(googleName)
    return
  } catch (error) {
    if (error?.code === 'auth/popup-closed-by-user') {
      statusMessage.value = 'Cerraste la ventana de Google antes de finalizar.'
    } else if (error?.code === 'auth/cancelled-popup-request') {
      statusMessage.value = 'Ya hay una ventana de Google activa. Intenta nuevamente.'
    } else if (error?.code === 'auth/network-request-failed') {
      statusMessage.value = 'No hay conexión con Google. Verifica tu red e inténtalo otra vez.'
    } else {
      statusMessage.value =
        'No fue posible iniciar sesión con Google. Verifica tu conexión e inténtalo otra vez.'
    }

    statusType.value = 'error'
  } finally {
    isGoogleSubmitting.value = false
  }
}

</script>

<template>
  <section class="login" aria-labelledby="login-title">
    <header class="login__header">
      <h1 id="login-title" class="login__title">Inicio de sesión</h1>
      <p class="login__subtitle">
        Ingresa tus credenciales para continuar.
      </p>
    </header>

    <form
      v-if="!isAwaitingTwoFactor"
      class="login__form"
      :aria-busy="isSubmitting"
      @submit.prevent="handleSubmit"
      novalidate
    >
      <div class="login__field">
        <label class="login__label" for="login-email">
          Correo electrónico
        </label>
        <input
          id="login-email"
          v-model.trim="form.email"
          :class="['login__input', { 'login__input--invalid': errors.email }]"
          type="email"
          name="email"
          autocomplete="email"
          inputmode="email"
          required
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? 'login-email-error' : undefined"
          @blur="() => validateField('email')"
        />
        <p v-if="errors.email" id="login-email-error" class="login__error" role="alert">
          {{ errors.email }}
        </p>
      </div>

      <div class="login__field">
        <label class="login__label" for="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          v-model="form.password"
          :class="['login__input', { 'login__input--invalid': errors.password }]"
          type="password"
          name="password"
          autocomplete="current-password"
          minlength="8"
          required
          :aria-invalid="Boolean(errors.password)"
          :aria-describedby="errors.password ? 'login-password-error' : undefined"
          @blur="() => validateField('password')"
        />
        <p v-if="errors.password" id="login-password-error" class="login__error" role="alert">
          {{ errors.password }}
        </p>
      </div>

      <div class="login__options">
        <label class="login__checkbox" for="login-remember">
          <input
            id="login-remember"
            v-model="form.remember"
            class="login__checkbox-input"
            type="checkbox"
            name="remember"
          />
          <span>Recuérdame</span>
        </label>
        <a
          class="login__link"
          href="#recuperar"
          @click.prevent="emit('navigate', 'recover')"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <button
        class="login__submit"
        type="submit"
        :disabled="isSubmitting || isRateLimited"
      >
        <span v-if="isSubmitting" class="login__spinner" aria-hidden="true"></span>
        <span>{{ isSubmitting ? 'Iniciando…' : 'Iniciar sesión' }}</span>
      </button>

    <div class="login__divider" role="presentation">
        <span class="login__divider-line"></span>
        <span class="login__divider-label">O</span>
        <span class="login__divider-line"></span>
      </div>

      <button
        class="login__google"
        type="button"
        :disabled="
          isGoogleSubmitting || !googleSignInAvailable || isSubmitting || isRateLimited
        "
        @click="handleGoogleSignIn"
      >
        <span class="login__google-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path
              d="M21.35 11.1H12v2.91h5.35c-.23 1.27-.94 2.35-2.01 3.07v2.56h3.24c1.9-1.75 2.87-4.34 2.87-7.4 0-.71-.06-1.4-.1-2.14Z"
              fill="#4285F4"
            />
            <path
              d="M12 22c2.43 0 4.47-.8 5.96-2.18l-3.24-2.56c-.9.6-2.05.97-2.72.97-2.07 0-3.82-1.4-4.45-3.28H4.21v2.65C5.68 19.98 8.62 22 12 22Z"
              fill="#34A853"
            />
            <path
              d="M7.55 14.95c-.2-.6-.32-1.24-.32-1.95 0-.68.12-1.33.3-1.95V8.4H4.21C3.44 9.93 3 11.52 3 13c0 1.52.44 3.07 1.21 4.6l3.34-2.65Z"
              fill="#FBBC05"
            />
            <path
              d="M12 7.58c1.32 0 2.5.45 3.44 1.35l2.56-2.56C16.46 4.61 14.42 3.7 12 3.7 8.62 3.7 5.68 5.72 4.21 8.4l3.32 2.65C8.18 8.98 9.93 7.58 12 7.58Z"
              fill="#EA4335"
            />
          </svg>
        </span>
        <span class="login__google-label">
          <span
            v-if="isGoogleSubmitting"
            class="login__spinner login__spinner--dark"
            aria-hidden="true"
          ></span>
          <span>{{ isGoogleSubmitting ? 'Conectando…' : 'Iniciar sesión con Google' }}</span>
        </span>
      </button>

      <p v-if="!googleSignInAvailable" class="login__hint" role="note">
        Configura tus credenciales de Firebase para habilitar el acceso con Google.
      </p>

      <p
        v-if="statusMessage"
        :class="['login__status', `login__status--${statusType}`]"
        role="status"
        aria-live="polite"
      >
        {{ statusMessage }}
      </p>

      <p v-if="isRateLimited" class="login__status login__status--warning" role="status">
        Vuelve a intentarlo en {{ rateLimitSeconds }} segundos.
      </p>
    </form>

    <form
      v-else
      class="login__form"
      :aria-busy="isVerifyingTwoFactor"
      @submit.prevent="handleVerifyTwoFactor"
      novalidate
    >
      <p class="login__info">
        Introduce el código de 6 dígitos que enviamos a
        <span class="login__info-email">{{ form.email }}</span>.
      </p>

      <div class="login__field">
        <label class="login__label" for="login-two-factor">Código de verificación</label>
        <input
          id="login-two-factor"
          v-model.trim="twoFactorCode"
          :class="['login__input', { 'login__input--invalid': twoFactorError }]"
          type="text"
          name="twoFactorCode"
          inputmode="numeric"
          autocomplete="one-time-code"
          pattern="\d*"
          maxlength="6"
          required
          :aria-invalid="Boolean(twoFactorError)"
          :aria-describedby="twoFactorError ? 'login-two-factor-error' : undefined"
          @blur="validateTwoFactorCode"
        />
        <p
          v-if="twoFactorError"
          id="login-two-factor-error"
          class="login__error"
          role="alert"
        >
          {{ twoFactorError }}
        </p>
      </div>

      <button class="login__submit" type="submit" :disabled="isVerifyingTwoFactor">
        <span v-if="isVerifyingTwoFactor" class="login__spinner" aria-hidden="true"></span>
        <span>{{ isVerifyingTwoFactor ? 'Verificando…' : 'Verificar código' }}</span>
      </button>

      <button
        class="login__secondary"
        type="button"
        :disabled="isVerifyingTwoFactor"
        @click="handleCancelTwoFactor"
      >
        Usar otra cuenta
      </button>

      <p
        v-if="statusMessage"
        :class="['login__status', `login__status--${statusType}`]"
        role="status"
        aria-live="polite"
      >
        {{ statusMessage }}
      </p>
    </form>

    <nav class="login__footer" aria-label="Enlaces relacionados">
      <p>
        ¿No tienes cuenta?
        <a
          class="login__link"
          href="#crear-cuenta"
          @click.prevent="emit('navigate', 'register')"
        >
          Crear cuenta
        </a>
      </p>
    </nav>

    <div
      v-if="showTwoFactorBanner"
      class="login__two-factor"
      role="status"
      aria-live="polite"
    >
      Protege tu cuenta con 2FA.
    </div>
  </section>
</template>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: min(420px, 100%);
  padding: 2.5rem 2rem;
  border-radius: 1.5rem;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
}

.login__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login__title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
}

.login__subtitle {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.login__label {
  font-weight: 600;
  color: #1f2937;
}

.login__input {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #c7d2fe;
  background: #f8fafc;
  color: #111827;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.login__input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.login__input--invalid {
  border-color: #dc2626;
  background: rgba(254, 226, 226, 0.6);
}

.login__error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
}

.login__options {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.login__checkbox {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  cursor: pointer;
}

.login__checkbox-input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #4f46e5;
}

.login__link {
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
}

.login__link:hover {
  text-decoration: underline;
}

.login__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.login__submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.login__submit:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px rgba(99, 102, 241, 0.35);
}

.login__divider {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.login__divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(156, 163, 175, 0.1), rgba(156, 163, 175, 0.7));
}

.login__google {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.85rem 1.5rem;
  border-radius: 999px;
  border: 1px solid rgba(156, 163, 175, 0.5);
  background-color: #ffffff;
  color: #1f2937;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}

.login__google:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.login__google:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px rgba(107, 114, 128, 0.25);
}

.login__google-icon {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
}

.login__google-icon svg {
  width: 100%;
  height: 100%;
}

.login__google-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.login__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  animation: login-spin 0.9s linear infinite;
}

.login__spinner--dark {
  border-color: rgba(107, 114, 128, 0.3);
  border-top-color: rgba(31, 41, 55, 0.95);
}

@keyframes login-spin {
  to {
    transform: rotate(360deg);
  }
}

.login__status {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
}

.login__status--error {
  background: rgba(254, 226, 226, 0.6);
  color: #991b1b;
}

.login__status--success {
  background: rgba(209, 250, 229, 0.7);
  color: #166534;
}

.login__status--warning {
  background: rgba(254, 249, 195, 0.8);
  color: #854d0e;
}

.login__status--info {
  background: rgba(191, 219, 254, 0.65);
  color: #1d4ed8;
}

.login__status--neutral {
  background: rgba(229, 231, 235, 0.85);
  color: #374151;
}

.login__hint {
  margin: 0.5rem 0 0;
  color: #6b7280;
  font-size: 0.85rem;
  text-align: center;
}

.login__info {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.login__info-email {
  font-weight: 600;
  color: #1f2937;
}

.login__secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  border: 1px solid rgba(79, 70, 229, 0.35);
  background: transparent;
  color: #4f46e5;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
}

.login__secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login__secondary:not(:disabled):hover {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.08);
}

.login__footer {
  font-size: 0.95rem;
  color: #4b5563;
}

.login__two-factor {
  padding: 1rem 1.25rem;
  border-radius: 0.85rem;
  background: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
  font-weight: 600;
}

@media (max-width: 600px) {
  .login {
    padding: 2rem 1.5rem;
  }
}
</style>