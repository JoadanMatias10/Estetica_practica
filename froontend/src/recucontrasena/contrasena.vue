<template>
  <section class="recover" aria-labelledby="recover-title">
    <header class="recover__header">
      <h1 id="recover-title" class="recover__title">Recupera tu contraseña</h1>
      <p class="recover__subtitle">
        Ingresa el correo asociado a tu cuenta y te enviaremos instrucciones para restablecerla.
      </p>
    </header>

    <form class="recover__form" @submit.prevent="handleSubmit" novalidate>
      <div class="recover__field">
        <label class="recover__label" for="recover-email">Correo electrónico</label>
        <input
          id="recover-email"
          v-model.trim="form.email"
          :class="['recover__input', { 'recover__input--invalid': emailError }]"
          type="email"
          name="email"
          autocomplete="email"
          required
          :aria-invalid="Boolean(emailError)"
          :aria-describedby="emailError ? 'recover-email-error' : undefined"
          @blur="validateEmail"
        />
        <p
          v-if="emailError"
          id="recover-email-error"
          class="recover__error"
          role="alert"
        >
          {{ emailError }}
        </p>
      </div>

      <button class="recover__submit" type="submit" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="recover__spinner" aria-hidden="true"></span>
        <span>{{ isSubmitting ? 'Enviando…' : 'Enviar enlace' }}</span>
      </button>

      <p v-if="statusMessage" :class="['recover__status', `recover__status--${statusType}`]" role="status">
        {{ statusMessage }}
      </p>
    </form>

    <nav class="recover__footer" aria-label="Enlaces relacionados">
      <p>
        ¿Recordaste tu contraseña?
        <a class="recover__link" href="#iniciar-sesion" @click.prevent="emit('navigate', 'login')">
          Inicia sesión
        </a>
      </p>
      <p>
        ¿Necesitas una cuenta nueva?
        <a class="recover__link" href="#crear-cuenta" @click.prevent="emit('navigate', 'register')">
          Crea una cuenta
        </a>
      </p>
    </nav>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useApiBaseUrl } from '../composables/useApiBaseUrl'

const emit = defineEmits(['navigate'])

const { apiBaseUrl } = useApiBaseUrl()

const form = reactive({
  email: '',
})

const emailError = ref('')
const statusMessage = ref('')
const statusType = ref('neutral')
const isSubmitting = ref(false)

const emailPattern = /^(?:[a-zA-Z0-9_'^&+{}-]+(?:\.[a-zA-Z0-9_'^&+{}-]+)*|".+")@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/

const validateEmail = () => {
  if (!form.email) {
    emailError.value = 'Ingresa tu correo electrónico.'
    return false
  }

  if (!emailPattern.test(form.email)) {
    emailError.value = 'Ingresa un correo electrónico válido.'
    return false
  }

  emailError.value = ''
  return true
}

const handleSubmit = async () => {
  statusMessage.value = ''
  statusType.value = 'neutral'

  if (!validateEmail()) {
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch(`${apiBaseUrl.value}/api/auth/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: form.email }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        data.message || 'No fue posible enviar el enlace. Intenta nuevamente.',
      )
    }

    statusMessage.value =
      data.message ||
      'Si tu correo está registrado, recibirás un mensaje con los siguientes pasos en los próximos minutos.'
    statusType.value = 'success'
  } catch (error) {
    statusMessage.value =
      error instanceof Error
        ? error.message
        : 'No fue posible enviar el enlace. Intenta nuevamente.'
    statusType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.recover {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: min(420px, 100%);
  padding: 2.5rem 2rem;
  border-radius: 1.5rem;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(79, 70, 229, 0.1);
}

.recover__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recover__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

.recover__subtitle {
  margin: 0;
  color: #4b5563;
  font-size: 0.95rem;
}

.recover__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.recover__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recover__label {
  font-weight: 600;
  color: #1f2937;
}

.recover__input {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #c7d2fe;
  background: #f8fafc;
  color: #111827;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.recover__input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.recover__input--invalid {
  border-color: #dc2626;
  background: rgba(254, 226, 226, 0.6);
}

.recover__error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.875rem;
}

.recover__submit {
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

.recover__submit:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  box-shadow: none;
}

.recover__submit:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px rgba(99, 102, 241, 0.35);
}

.recover__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.4);
  border-top-color: #ffffff;
  animation: recover-spin 0.9s linear infinite;
}

@keyframes recover-spin {
  to {
    transform: rotate(360deg);
  }
}

.recover__status {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  font-size: 0.9rem;
}

.recover__status--success {
  background: rgba(209, 250, 229, 0.7);
  color: #166534;
}

.recover__status--error {
  background: rgba(254, 226, 226, 0.7);
  color: #991b1b;
}

.recover__status--neutral {
  background: rgba(229, 231, 235, 0.85);
  color: #374151;
}

.recover__footer {
  margin: 0;
  display: grid;
  gap: 0.75rem;
  text-align: center;
  font-size: 0.95rem;
  color: #4b5563;
}

.recover__link {
  color: #4f46e5;
  font-weight: 600;
  text-decoration: none;
}

.recover__link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .recover {
    padding: 2rem 1.5rem;
  }
}
</style>