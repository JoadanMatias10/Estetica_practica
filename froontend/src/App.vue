<script setup>
import { computed, reactive, ref } from 'vue'
import LoginForm from './login/login.vue'
import RegistroForm from './Registro/registro.vue'
import RecoverPassword from './recucontrasena/contrasena.vue'
import ResetPassword from './recucontrasena/restablecer.vue'
import ClienteDashboard from './components/ClienteDashboard.vue'



const views = {
  login: LoginForm,
  register: RegistroForm,
  recover: RecoverPassword,
  reset: ResetPassword,
  dashboard: ClienteDashboard,
}

const activeView = ref('login')

const resetParams = reactive({
  token: '',
  email: '',
})

const session = reactive({
  userName: '',
})



if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token') || ''
  const email = params.get('email') || ''

  if (token || email) {
    resetParams.token = token
    resetParams.email = email
    activeView.value = 'reset'
  }
}

const CurrentView = computed(() => views[activeView.value] ?? views.login)

const componentProps = computed(() => {
  if (activeView.value === 'reset') {
    return {
      initialToken: resetParams.token,
      initialEmail: resetParams.email,
    }
  }

  if (activeView.value === 'dashboard') {
    return {
      userName: session.userName,
    }
  }

  return {}
})

const syncUrl = () => {
  if (typeof window === 'undefined') return

  const url = new URL(window.location.href)
  url.searchParams.delete('token')
  url.searchParams.delete('email')

  if (activeView.value === 'reset') {
    if (resetParams.token) {
      url.searchParams.set('token', resetParams.token)
    }

    if (resetParams.email) {
      url.searchParams.set('email', resetParams.email)
    }
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`
  window.history.replaceState({}, '', nextUrl)
}

const handleNavigate = (view, payload = {}) => {
  if (!(view in views)) {
    return
  }

  if (view === 'reset') {
    if (payload && typeof payload === 'object') {
      if (Object.prototype.hasOwnProperty.call(payload, 'token')) {
        resetParams.token = payload.token ?? ''
      }

      if (Object.prototype.hasOwnProperty.call(payload, 'email')) {
        resetParams.email = payload.email ?? ''
      }
    }
  } else {
    resetParams.token = ''
    resetParams.email = ''
  }

  if (view === 'dashboard') {
    if (payload && typeof payload === 'object' && 'userName' in payload) {
      session.userName = payload.userName ?? ''
    }
  } else if (view !== 'reset') {
    session.userName = ''
  }

  activeView.value = view
  syncUrl()
}

</script>

<template>
  <main class="app-shell">
    <div class="app-shell__content">
      <transition name="app-shell-fade" mode="out-in">
        <component
          :is="CurrentView"
          :key="activeView"
           v-bind="componentProps"
          @navigate="handleNavigate"
        />
      </transition>
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2.5rem 1rem;
  background: linear-gradient(145deg, #eef2ff, #e0e7ff 55%, #c7d2fe);
}

.app-shell__content {
  width: min(1120px, 100%);
}

.app-shell-fade-enter-active,
.app-shell-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.app-shell-fade-enter-from,
.app-shell-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

</style>
