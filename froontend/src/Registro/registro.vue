<template>
  <section class="registro" aria-labelledby="registro-title">
    <h1 id="registro-title" class="registro__title">Registro de usuario</h1>

    <form
      class="registro__form"
      :aria-busy="isSubmitting"
      @submit.prevent="handleSubmit"
      novalidate
    >
      <div class="registro__field">
        <label class="registro__label" for="nombre">
          Nombre <span class="registro__required" aria-hidden="true">*</span>
        </label>
        <input
          id="nombre"
          v-model.trim="form.nombre"
          :class="['registro__input', { 'registro__input--invalid': errors.nombre }]"
          type="text"
          name="nombre"
          autocomplete="given-name"
          :aria-invalid="Boolean(errors.nombre)"
          @blur="() => validateField('nombre')"
          required
        />
        <p v-if="errors.nombre" id="error-nombre" class="registro__error" role="alert">
          {{ errors.nombre }}
        </p>
      </div>

      <div class="registro__field">
        <label class="registro__label" for="apellido-paterno">
          Apellido paterno <span class="registro__required" aria-hidden="true">*</span>
        </label>
        <input
          id="apellido-paterno"
          v-model.trim="form.apellidoPaterno"
          :class="['registro__input', { 'registro__input--invalid': errors.apellidoPaterno }]"
          type="text"
          name="apellido-paterno"
          autocomplete="family-name"
          :aria-invalid="Boolean(errors.apellidoPaterno)"
          @blur="() => validateField('apellidoPaterno')"
          required
        />
        <p v-if="errors.apellidoPaterno" class="registro__error" role="alert">
          {{ errors.apellidoPaterno }}
        </p>
      </div>

      <div class="registro__field">
        <label class="registro__label" for="apellido-materno">
          Apellido materno <span class="registro__required" aria-hidden="true">*</span>
        </label>
        <input
          id="apellido-materno"
          v-model.trim="form.apellidoMaterno"
          :class="['registro__input', { 'registro__input--invalid': errors.apellidoMaterno }]"
          type="text"
          name="apellido-materno"
          :aria-invalid="Boolean(errors.apellidoMaterno)"
          @blur="() => validateField('apellidoMaterno')"
          required
        />
        <p v-if="errors.apellidoMaterno" class="registro__error" role="alert">
          {{ errors.apellidoMaterno }}
        </p>
      </div>

      <div class="registro__field">
        <label class="registro__label" for="email">
          Correo electrónico <span class="registro__required" aria-hidden="true">*</span>
        </label>
        <input
          id="email"
          v-model.trim="form.email"
          :class="['registro__input', { 'registro__input--invalid': errors.email }]"
          type="email"
          name="email"
          autocomplete="email"
          inputmode="email"
          :aria-invalid="Boolean(errors.email)"
          @blur="() => validateField('email')"
          required
        />
        <p v-if="errors.email" class="registro__error" role="alert">
          {{ errors.email }}
        </p>
      </div>

      <div class="registro__field">
        <label class="registro__label" for="telefono">
          Teléfono <span class="registro__required" aria-hidden="true">*</span>
        </label>
        <input
          id="telefono"
          v-model.trim="form.telefono"
          :class="['registro__input', { 'registro__input--invalid': errors.telefono }]"
          type="tel"
          name="telefono"
          autocomplete="tel"
          inputmode="tel"
          :aria-invalid="Boolean(errors.telefono)"
          @blur="() => validateField('telefono')"
          required
        />
        <small class="registro__helper">Incluye lada si es necesario.</small>
        <p v-if="errors.telefono" class="registro__error" role="alert">
          {{ errors.telefono }}
        </p>
      </div>

      <div class="registro__field">
        <label class="registro__label" for="password">
          Contraseña <span class="registro__required" aria-hidden="true">*</span>
        </label>
        <input
          id="password"
          v-model="form.password"
          :class="['registro__input', { 'registro__input--invalid': errors.password }]"
          type="password"
          name="password"
          autocomplete="new-password"
          minlength="8"
          :aria-invalid="Boolean(errors.password)"
          @blur="() => validateField('password')"
          required
        />
        <small class="registro__helper">Mínimo 8 caracteres, combina letras y números.</small>
        <p v-if="errors.password" class="registro__error" role="alert">
          {{ errors.password }}
        </p>
      </div>

      <div class="registro__field">
        <label class="registro__label" for="confirm-password">
          Confirmar contraseña <span class="registro__required" aria-hidden="true">*</span>
        </label>
        <input
          id="confirm-password"
          v-model="form.confirmPassword"
          :class="['registro__input', { 'registro__input--invalid': errors.confirmPassword }]"
          type="password"
          name="confirm-password"
          autocomplete="new-password"
          minlength="8"
          :aria-invalid="Boolean(errors.confirmPassword)"
          @blur="() => validateField('confirmPassword')"
          required
        />
        <p v-if="errors.confirmPassword" class="registro__error" role="alert">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <div class="registro__field">
        <label class="registro__label" for="rol">
          Rol <span class="registro__required" aria-hidden="true">*</span>
        </label>
        <select
          id="rol"
          v-model="form.rol"
          :class="['registro__input', 'registro__input--select', { 'registro__input--invalid': errors.rol }]"
          name="rol"
          :aria-invalid="Boolean(errors.rol)"
          @change="() => validateField('rol')"
          required
        >
          <option disabled value="">Selecciona un rol</option>
          <option value="cliente">Cliente</option>
          <option value="admin">Administrador</option>
        </select>
        <p v-if="errors.rol" class="registro__error" role="alert">
          {{ errors.rol }}
        </p>
      </div>

      <div class="registro__agreements">
        <label class="registro__checkbox" for="terminos">
          <input
            id="terminos"
            v-model="form.aceptaTerminos"
            class="registro__checkbox-input"
            type="checkbox"
            name="terminos"
            :aria-invalid="Boolean(errors.aceptaTerminos)"
            @change="() => validateField('aceptaTerminos')"
            required
          />
          <span class="registro__checkbox-text">
            Acepto los
            <a class="registro__link" href="#terminos" target="_blank" rel="noopener noreferrer">Términos</a>
            y el
            <a class="registro__link" href="#aviso" target="_blank" rel="noopener noreferrer">Aviso de privacidad</a>
          </span>
        </label>
        <p v-if="errors.aceptaTerminos" class="registro__error" role="alert">
          {{ errors.aceptaTerminos }}
        </p>
      </div>

      <p v-if="error" class="registro__feedback registro__feedback--error" role="alert">
        {{ error }}
      </p>
      <p
        v-if="successMessage"
        class="registro__feedback registro__feedback--success"
        role="status"
      >
        {{ successMessage }}
      </p>

      <button class="registro__submit" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Enviando…' : 'Crear cuenta' }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'

const initialState = () => ({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  telefono: '',
  password: '',
  confirmPassword: '',
  aceptaTerminos: false,
  rol: ''
})

const form = reactive(initialState())
const error = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const initialErrors = () => ({
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  email: '',
  telefono: '',
  password: '',
  confirmPassword: '',
  rol: '',
  aceptaTerminos: ''
})
const errors = reactive(initialErrors())

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^[0-9+()\s-]{10,}$/
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

const validators = {
  nombre: (value) => (value ? '' : 'Ingresa tu nombre.'),
  apellidoPaterno: (value) => (value ? '' : 'Ingresa tu apellido paterno.'),
  apellidoMaterno: (value) => (value ? '' : 'Ingresa tu apellido materno.'),
  email: (value) => {
    if (!value) return 'Ingresa tu correo electrónico.'
    if (!emailPattern.test(value)) return 'Usa un correo electrónico válido.'
    return ''
  },
  telefono: (value) => {
    if (!value) return 'Ingresa tu número de teléfono.'
    if (!phonePattern.test(value)) {
      return 'Ingresa un teléfono válido (10 dígitos, se permiten + - () y espacios).'
    }
    return ''
  },
  password: (value) => {
    if (!value) return 'Crea una contraseña.'
    if (!passwordPattern.test(value)) {
      return 'La contraseña debe tener al menos 8 caracteres e incluir una letra y un número.'
    }
    return ''
  },
  confirmPassword: (value) => {
    if (!value) return 'Confirma tu contraseña.'
    if (value !== form.password) return 'Las contraseñas no coinciden.'
    return ''
  },
  rol: (value) => (value ? '' : 'Selecciona un rol.'),
  aceptaTerminos: (value) => (value ? '' : 'Debes aceptar los términos y el aviso de privacidad.')
}

const validateField = (field) => {
  const value = field === 'aceptaTerminos' ? form.aceptaTerminos : form[field]
  const message = validators[field](value)
  errors[field] = message
  return !message
}

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach((field) => {
    const fieldIsValid = validateField(field)
    if (!fieldIsValid) isValid = false
  })
  return isValid
}

watch(
  () => form.password,
  () => {
    if (errors.password) validateField('password')
    if (errors.confirmPassword) validateField('confirmPassword')
  }
)

watch(
  () => form.confirmPassword,
  () => {
    if (errors.confirmPassword) validateField('confirmPassword')
  }
)

watch(
  () => form.email,
  () => {
    if (errors.email) validateField('email')
  }
)

const apiBaseUrl = computed(() => {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  return base.endsWith('/') ? base.slice(0, -1) : base
})

const handleSubmit = async () => {
  error.value = ''
  successMessage.value = ''

  if (!validateForm()) {
    error.value = 'Revisa los campos marcados para continuar.'
    return
  }

  isSubmitting.value = true

  try {
    const payload = {
      nombre: form.nombre,
      apellidoPaterno: form.apellidoPaterno,
      apellidoMaterno: form.apellidoMaterno,
      email: form.email,
      telefono: form.telefono,
      password: form.password,
      confirmPassword: form.confirmPassword,
      aceptaTerminos: form.aceptaTerminos,
      rol: form.rol
    }

    const response = await fetch(`${apiBaseUrl.value}/api/registro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || 'No fue posible completar el registro.')
    }

    successMessage.value = data.message ||
      '¡Registro enviado! Revisa tu correo para continuar con el proceso.'

    Object.assign(form, initialState())
    Object.assign(errors, initialErrors())
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No fue posible completar el registro.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.registro {
  width: min(100%, 540px);
  margin-inline: auto;
  padding: 2.5rem clamp(1.5rem, 5vw, 2.25rem);
  background-color: #ffffff;
  border-radius: 18px;
  box-shadow: 0 20px 45px -25px rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
}

.registro__title {
  margin: 0;
  text-align: center;
  font-size: clamp(1.75rem, 4vw, 2rem);
  color: #1f2937;
}

.registro__form {
  display: grid;
  gap: 1.25rem;
  width: min(100%, 420px);
  margin-inline: auto;
}

.registro__field {
  display: grid;
  gap: 0.5rem;
}

.registro__label {
  font-weight: 600;
  color: #1f2937;
}

.registro__required {
  color: #ef4444;
}

.registro__input {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.registro__input:focus-visible {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.registro__input--invalid {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.18);
}

.registro__input--select {
  appearance: none;
  background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="%236366f1" d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
}

.registro__helper {
  font-size: 0.85rem;
  color: #6b7280;
}

.registro__error {
  margin: 0;
  font-size: 0.85rem;
  color: #b91c1c;
}

.registro__agreements {
  display: grid;
  gap: 0.45rem;
}

.registro__checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  font-size: 0.95rem;
  color: #374151;
}

.registro__checkbox-input {
  margin-top: 0.2rem;
  width: 1.1rem;
  height: 1.1rem;
  accent-color: #6366f1;
}

.registro__link {
  color: #4f46e5;
}

.registro__feedback {
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.95rem;
  width: 100%;
}

.registro__feedback--error {
  background-color: rgba(220, 38, 38, 0.1);
  color: #b91c1c;
}

.registro__feedback--success {
  background-color: rgba(16, 185, 129, 0.12);
  color: #047857;
}

.registro__submit {
  margin-top: 0.5rem;
  padding: 0.85rem 1.2rem;
  width: 100%;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.registro__submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 25px -15px rgba(79, 70, 229, 0.75);
}

.registro__submit:focus-visible {
  outline: 3px solid rgba(79, 70, 229, 0.35);
  outline-offset: 2px;
}

.registro__submit:disabled {
  cursor: not-allowed;
  opacity: 0.75;
  box-shadow: none;
  transform: none;
}

@media (max-width: 540px) {
  .registro {
    padding-block: 2rem;
  }
}
</style>