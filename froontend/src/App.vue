<script setup>
import { computed, ref } from 'vue'
import LoginForm from './login/login.vue'
import RegistroForm from './Registro/registro.vue'
import RecoverPassword from './recucontrasena/contrasena.vue'

const views = {
  login: LoginForm,
  register: RegistroForm,
  recover: RecoverPassword,
}

const activeView = ref('login')

const CurrentView = computed(() => views[activeView.value] ?? views.login)

const handleNavigate = (view) => {
  if (view in views) {
    activeView.value = view
  }
}

</script>

<template>
  <main class="app-shell">
    <div class="app-shell__content">
      <transition name="app-shell-fade" mode="out-in">
        <component
          :is="CurrentView"
          :key="activeView"
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
  width: min(640px, 100%);
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
