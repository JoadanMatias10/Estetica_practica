<script setup>
import { computed, reactive, ref } from 'vue'
import { useApiBaseUrl } from '../composables/useApiBaseUrl'

const emit = defineEmits(['navigate'])

const { apiBaseUrl } = useApiBaseUrl()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

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

const failedAttempts = ref([])
const lockExpiresAt = ref(0)

const RATE_LIMIT_COUNT = 5
const RATE_LIMIT_WINDOW_MS = 60000
const RATE_LIMIT_LOCK_MS = 60000

const isRateLimited = computed(() => lockExpiresAt.value > Date.now())
const rateLimitSeconds = computed(() =>
  isRateLimited.value ? Math.ceil((lockExpiresAt.value - Date.now()) / 1000) : 0,
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

const handleSubmit = async () => {
  if (isSubmitting.value) return

  statusMessage.value = ''
  statusType.value = 'neutral'
  showTwoFactorBanner.value = false
  resetTwoFactorFlow()

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

    const recommendedBanner = Boolean(data.twoFactorRecommended)

    if (data.twoFactorRequired) {
      isAwaitingTwoFactor.value = true
      statusMessage.value =
        data.message || 'Revisa tu correo e ingresa el código de verificación.'
      statusType.value = 'info'
    } else {
      statusMessage.value = data.message || 'Sesión iniciada correctamente.'
      statusType.value = 'success'
      showTwoFactorBanner.value = recommendedBanner
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
    statusMessage.value = data.message || 'Autenticación completada correctamente.'
    statusType.value = 'success'
    showTwoFactorBanner.value = Boolean(data.twoFactorRecommended)
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

.login__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  animation: login-spin 0.9s linear infinite;
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