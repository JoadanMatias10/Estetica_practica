<script setup>
import { computed, reactive, ref } from 'vue'

const emit = defineEmits(['navigate'])

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

const recommendedTwoFactor = true
const userHasTwoFactorEnabled = ref(false)

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

  if (isRateLimited.value) {
    statusMessage.value = `Demasiados intentos. Intenta de nuevo en ${rateLimitSeconds.value} segundos.`
    statusType.value = 'warning'
    return
  }

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  await new Promise((resolve) => setTimeout(resolve, 600))

  const credentialsAreValid =
    form.email.toLowerCase() === 'demo@ejemplo.com' && form.password === 'Password123!'

  if (!credentialsAreValid) {
    statusMessage.value = 'Correo o contraseña inválidos.'
    statusType.value = 'error'
    registerFailedAttempt()
    isSubmitting.value = false
    return
  }

  resetRateLimit()
  statusMessage.value = 'Sesión iniciada correctamente.'
  statusType.value = 'success'

  const shouldSuggestTwoFactor = recommendedTwoFactor && !userHasTwoFactorEnabled.value
  showTwoFactorBanner.value = shouldSuggestTwoFactor

  isSubmitting.value = false
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