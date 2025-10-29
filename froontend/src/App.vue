<script setup>
import RegistroForm from './Registro/registro.vue'
</script>

<template>
  <main class="app-shell">
    <RegistroForm />
  </main>
</template>

<style scoped>
..app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2.5rem 1rem;
  background: linear-gradient(145deg, #eef2ff, #e0e7ff 55%, #c7d2fe);
}
</style>
