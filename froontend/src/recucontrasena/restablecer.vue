<template>
 <div class="reset-shell">
  <section class="reset" aria-labelledby="reset-title">
    <header class="reset__header">
      <h1 id="reset-title" class="reset__title">Restablece tu contraseña</h1>
      <p class="reset__subtitle">
        Ingresa el token que recibiste por correo y define una nueva contraseña segura para tu cuenta.
      </p>
    </header>

    <form class="reset__form" @submit.prevent="handleSubmit" novalidate>
      <div class="reset__field">
        <label class="reset__label" for="reset-email">Correo electrónico</label>
        <input
          id="reset-email"
          v-model.trim="form.email"
          :class="['reset__input', { 'reset__input--invalid': errors.email }]"
          type="email"
          name="email"
          autocomplete="email"
          required
          :aria-invalid="Boolean(errors.email)"
          :aria-describedby="errors.email ? 'reset-email-error' : undefined"
          @blur="validateField('email')"
        />
        <p v-if="errors.email" id="reset-email-error" class="reset__error" role="alert">
          {{ errors.email }}
        </p>
      </div>

      <div class="reset__field">
        <label class="reset__label" for="reset-token">Token de recuperación</label>
        <input
          id="reset-token"
          v-model.trim="form.token"
          :class="['reset__input', { 'reset__input--invalid': errors.token }]"
          type="text"
          name="token"
          autocomplete="one-time-code"
          required
          :aria-invalid="Boolean(errors.token)"
          :aria-describedby="errors.token ? 'reset-token-error' : undefined"
          @blur="validateField('token')"
        />
        <p v-if="errors.token" id="reset-token-error" class="reset__error" role="alert">
          {{ errors.token }}
        </p>
      </div>

      <div class="reset__field">
        <label class="reset__label" for="reset-password">Nueva contraseña</label>
        <input
          id="reset-password"
          v-model="form.password"
          :class="['reset__input', { 'reset__input--invalid': errors.password }]"
          type="password"
          name="password"
          autocomplete="new-password"
          required
          minlength="8"
          :aria-invalid="Boolean(errors.password)"
          :aria-describedby="errors.password ? 'reset-password-error' : undefined"
          @blur="validateField('password')"
        />
        <p v-if="errors.password" id="reset-password-error" class="reset__error" role="alert">
          {{ errors.password }}
        </p>
      </div>

      <div class="reset__field">
        <label class="reset__label" for="reset-confirm">Confirma tu contraseña</label>
        <input
          id="reset-confirm"
          v-model="form.confirmPassword"
          :class="['reset__input', { 'reset__input--invalid': errors.confirmPassword }]"
          type="password"
          name="confirm-password"
          autocomplete="new-password"
          required
          minlength="8"
          :aria-invalid="Boolean(errors.confirmPassword)"
          :aria-describedby="errors.confirmPassword ? 'reset-confirm-error' : undefined"
          @blur="validateField('confirmPassword')"
        />
        <p v-if="errors.confirmPassword" id="reset-confirm-error" class="reset__error" role="alert">
          {{ errors.confirmPassword }}
        </p>
      </div>

       <div v-if="secretQuestionEnabled" class="reset__field">
        <label class="reset__label" for="reset-secret-answer">
          {{ secretQuestion || 'Pregunta secreta' }}
        </label>
        <input
          id="reset-secret-answer"
          v-model="form.secretAnswer"
          :class="['reset__input', { 'reset__input--invalid': errors.secretAnswer }]"
          type="text"
          name="secret-answer"
          autocomplete="off"
          :required="secretQuestionEnabled"
          :aria-invalid="Boolean(errors.secretAnswer)"
          :aria-describedby="errors.secretAnswer ? 'reset-secret-answer-error' : undefined"
          @blur="validateField('secretAnswer')"
        />
        <p
          v-if="errors.secretAnswer"
          id="reset-secret-answer-error"
          class="reset__error"
          role="alert"
        >
          {{ errors.secretAnswer }}
        </p>
      </div>

      <button class="reset__submit" type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="reset__spinner" aria-hidden="true"></span>
        <span>{{ isSubmitting ? 'Actualizando…' : 'Restablecer contraseña' }}</span>
      </button>

      <p v-if="statusMessage" :class="['reset__status', `reset__status--${statusType}`]" role="status">
        {{ statusMessage }}
      </p>
    </form>

    <nav class="reset__footer" aria-label="Enlaces relacionados">
      <p>
        ¿Necesitas solicitar un nuevo enlace?
        <a class="reset__link" href="#solicitar-enlace" @click.prevent="emit('navigate', 'recover', { email: form.email })">
          Volver a solicitarlo
        </a>
      </p>
      <p>
        ¿Ya recuerdas tu contraseña?
        <a class="reset__link" href="#iniciar-sesion" @click.prevent="emit('navigate', 'login')">
          Inicia sesión
        </a>
      </p>
    </nav>
  </section>
</div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useApiBaseUrl } from '../composables/useApiBaseUrl'

const props = defineProps({
  initialEmail: {
    type: String,
    default: '',
  },
  initialToken: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['navigate'])

const { apiBaseUrl } = useApiBaseUrl()

const form = reactive({
  email: props.initialEmail.trim(),
  token: props.initialToken.trim(),
  password: '',
  confirmPassword: '',
  secretAnswer: '',
})

watch(
  () => props.initialEmail,
  (value) => {
    form.email = (value ?? '').trim()
  },
)

watch(
  () => props.initialToken,
  (value) => {
    form.token = (value ?? '').trim()
  },
)

const errors = reactive({
  email: '',
  token: '',
  password: '',
  confirmPassword: '',
})

const statusMessage = ref('')
const statusType = ref('neutral')
const isSubmitting = ref(false)
const secretQuestion = ref('')
const secretQuestionEnabled = ref(false)
const lastSecretQueryKey = ref('')

const emailPattern = /^(?:[a-zA-Z0-9_'^&+{}-]+(?:\.[a-zA-Z0-9_'^&+{}-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
const tokenPattern = /^[a-f0-9]{64}$/i

const fieldValidators = {
  email(value) {
    if (!value) {
      return 'Ingresa tu correo electrónico.'
    }

    if (!emailPattern.test(value)) {
      return 'Ingresa un correo electrónico válido.'
    }

    return ''
  },
  token(value) {
    if (!value) {
      return 'Ingresa el token de recuperación.'
    }

    if (!tokenPattern.test(value)) {
      return 'El token debe tener 64 caracteres hexadecimales.'
    }

    return ''
  },
  password(value) {
    if (!value) {
      return 'Ingresa una nueva contraseña.'
    }

    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.'
    }

    return ''
  },
  confirmPassword(value) {
    if (!value) {
      return 'Confirma tu nueva contraseña.'
    }

    if (value !== form.password) {
      return 'Las contraseñas no coinciden.'
    }

    return ''
  },
  secretAnswer(value) {
    if (!secretQuestionEnabled.value) {
      errors.secretAnswer = ''
      return ''
    }

    if (!secretQuestion.value) {
      return ''
    }

    if (!value?.trim()) {
      return 'Ingresa la respuesta a tu pregunta secreta.'
    }

    return ''
  },
}

const validateField = (field) => {
  errors[field] = fieldValidators[field](form[field])
}

const validateForm = () => {
  validateField('email')
  validateField('token')
  validateField('password')
  validateField('confirmPassword')
  validateField('secretAnswer')

  return (
    !errors.email &&
    !errors.token &&
    !errors.password &&
    !errors.confirmPassword &&
    !errors.secretAnswer
  )
}

const resetSecretQuestionState = () => {
  secretQuestionEnabled.value = false
  secretQuestion.value = ''
  form.secretAnswer = ''
  errors.secretAnswer = ''
  lastSecretQueryKey.value = ''
}

watch(
  () => [form.email, form.token],
  async ([email, token]) => {
    if (!emailPattern.test(email) || !tokenPattern.test(token)) {
      resetSecretQuestionState()
      return
    }

    const queryKey = `${email}:${token}`

    if (queryKey === lastSecretQueryKey.value) {
      return
    }

    lastSecretQueryKey.value = queryKey

    try {
      const response = await fetch(`${apiBaseUrl.value}/api/auth/verify-secret-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data?.secretQuestionEnabled) {
        resetSecretQuestionState()
        return
      }

      secretQuestionEnabled.value = true
      secretQuestion.value = data.secretQuestion || 'Pregunta secreta'
      errors.secretAnswer = ''
    } catch (error) {
      resetSecretQuestionState()
    }
  },
  { immediate: true },
)

const handleSubmit = async () => {
  if (isSubmitting.value) return

  statusMessage.value = ''
  statusType.value = 'neutral'

  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {

    const payload = {
      email: form.email,
      token: form.token,
      password: form.password,
    }

    if (secretQuestionEnabled.value) {
      payload.secretAnswer = form.secretAnswer
    }

     const response = await fetch(`${apiBaseUrl.value}/api/auth/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
     body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {

      if (secretQuestionEnabled.value && data?.message) {
        errors.secretAnswer = data.message
      }

      statusMessage.value = data?.message || 'No fue posible restablecer tu contraseña. Intenta nuevamente.'
      statusType.value = 'error'
      return
    }

    statusMessage.value =
      data?.message || 'Tu contraseña se actualizó correctamente. Puedes iniciar sesión con tus nuevos datos.'
    statusType.value = 'success'
    form.password = ''
    form.confirmPassword = ''
    form.secretAnswer = ''
  } catch (error) {
    statusMessage.value = 'No fue posible restablecer tu contraseña. Intenta nuevamente.'
    statusType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>

.reset-shell{
  min-height: 100dvh;
  display: grid;
  place-items: center;              /* centra vertical y horizontal */
  padding: clamp(1rem, 4vw, 2rem);  /* respiro en bordes */
}

.reset {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: min(560px, 100%);
  padding: 3rem 2.25rem;
  border-radius: 1.5rem;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
}

.reset__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reset__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.reset__subtitle {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
  text-align: center;
}

.reset__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.reset__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reset__label {
  font-weight: 600;
  color: #1f2937;
}

.reset__input {
  display: block;
  width: auto;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #c7d2fe;
  background: #f8fafc;
  color: #111827;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.reset__input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.reset__input--invalid {
  border-color: #dc2626;
  background: rgba(254, 226, 226, 0.6);
}

.reset__error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
}

.reset__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.9rem 1.75rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.reset__submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.reset__submit:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px rgba(99, 102, 241, 0.35);
}

.reset__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  animation: reset-spin 0.9s linear infinite;
}

@keyframes reset-spin {
  to {
    transform: rotate(360deg);
  }
}

.reset__status {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
}

.reset__status--success {
  background: rgba(209, 250, 229, 0.7);
  color: #166534;
}

.reset__status--error {
  background: rgba(254, 226, 226, 0.7);
  color: #991b1b;
}

.reset__status--neutral {
  background: rgba(229, 231, 235, 0.85);
  color: #374151;
}

.reset__footer {
  margin: 0;
  display: grid;
  gap: 0.75rem;
  text-align: center;
  font-size: 0.95rem;
  color: #4b5563;
}

.reset__link {
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
}

.reset__link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .reset {
    padding: 2rem 1.5rem;
  }
}
</style>