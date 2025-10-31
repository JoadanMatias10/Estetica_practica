<script setup>
import { computed } from 'vue'

const props = defineProps({
  userName: {
    type: String,
    default: 'Cliente Panamericana',
  },
})

const emit = defineEmits(['navigate'])

const safeName = computed(() => {
  const trimmed = (props.userName || '').trim()
  if (!trimmed) return 'Cliente Panamericana'
  return trimmed
})

const firstName = computed(() => {
  const [firstWord] = safeName.value.split(/\s+/)
  return firstWord || safeName.value
})

const productHighlights = [
  {
    title: 'Línea Capilar Premium',
    description:
      'Champús nutritivos, tratamientos hidratantes y aceites reparadores diseñados para cada tipo de cabello.',
    badge: 'Productos estrella',
  },
  {
    title: 'Spa Facial Signature',
    description:
      'Protocolos rejuvenecedores, mascarillas iluminadoras y masajes drenantes para un glow inmediato.',
    badge: 'Experiencia sensorial',
  },
  {
    title: 'Colección Styling',
    description:
      'Herramientas profesionales, sprays de acabado y texturizantes para looks versátiles y duraderos.',
    badge: 'Novedades',
  },
]

const cutSpecialties = [
  {
    name: 'Corte Contour Femenino',
    detail: 'Diseño estratégico para realzar pómulos y mandíbula con acabados suaves y luminosos.',
  },
  {
    name: 'Fade Ejecutivo',
    detail: 'Degradado limpio y preciso con toques mates, ideal para agendas dinámicas y cosmopolitas.',
  },
  {
    name: 'Rizos Esculpidos',
    detail: 'Definición natural con técnica de hidratación profunda y estilizado anti-frizz.',
  },
]

const navigateToLogin = () => {
  emit('navigate', 'login')
}
</script>

<template>
  <section class="dashboard" aria-labelledby="dashboard-title">
    <div class="dashboard__canvas">
      <header class="dashboard__hero">
        <div class="dashboard__brand" role="presentation">
          <div class="dashboard__logo" aria-hidden="true">
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img">
              <defs>
                <radialGradient id="logoGlow" cx="50%" cy="50%" r="65%">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#111827" stop-opacity="0.05" />
                </radialGradient>
              </defs>
              <circle cx="60" cy="60" r="58" fill="url(#logoGlow)" />
              <path
                d="M61 91c17.4 0 31.5-14.1 31.5-31.5S78.4 28 61 28 29.5 42.1 29.5 59.5 43.6 91 61 91Zm-2.6-53.6c6.3 3.2 10.8 9.1 10.8 17 0 8.9-5.3 15.7-12.8 18.4 1.4-2.8 2.4-6.3 2.4-10.5 0-8.6-3.9-15.4-9.8-19.3 2.1-3.4 5.3-5.6 9.4-5.6Z"
                fill="#1f2937"
              />
              <path
                d="M51.3 41.7c5.6 4 9.3 10.5 9.3 18.7 0 5.2-1.4 9.6-3.5 12.9-1.3 2-3.5 4-5.9 5-5.9-3.8-9.9-10.4-9.9-18.8 0-6.8 2.9-12.6 7.5-16.4 0.8-0.6 1.7-1 2.5-1.4Z"
                fill="#374151"
                opacity="0.85"
              />
            </svg>
          </div>
          <div class="dashboard__brand-text">
            <span class="dashboard__brand-title">Panamericana</span>
            <span class="dashboard__brand-subtitle">Estética</span>
          </div>
        </div>

        <div class="dashboard__welcome">
          <p class="dashboard__eyebrow">Bienvenido de nuevo</p>
          <h1 id="dashboard-title" class="dashboard__title">
            {{ safeName }}
          </h1>
          <p class="dashboard__subtitle">
            Diseñamos experiencias de belleza personalizadas para resaltar tu esencia. Explora el catálogo
            curado para ti y agenda tu próxima visita.
          </p>
        </div>

        <div class="dashboard__cta">
          <button class="dashboard__button" type="button">Ver agenda disponible</button>
          <button class="dashboard__button dashboard__button--outline" type="button" @click="navigateToLogin">
            Cerrar sesión
          </button>
        </div>
      </header>

      <section class="dashboard__section" aria-labelledby="catalogo-title">
        <header class="dashboard__section-header">
          <h2 id="catalogo-title" class="dashboard__section-title">Catálogo destacado</h2>
          <p class="dashboard__section-subtitle">
            Selección premium inspirada en la estética urbana de Panamericana.
          </p>
        </header>

        <div class="dashboard__cards">
          <article
            v-for="item in productHighlights"
            :key="item.title"
            class="dashboard__card"
            aria-label="Vista previa de catálogo"
          >
            <span class="dashboard__card-badge">{{ item.badge }}</span>
            <h3 class="dashboard__card-title">{{ item.title }}</h3>
            <p class="dashboard__card-description">{{ item.description }}</p>
            <button class="dashboard__card-action" type="button">Explorar colección</button>
          </article>
        </div>
      </section>

      <section class="dashboard__section dashboard__section--accent" aria-labelledby="cortes-title">
        <header class="dashboard__section-header">
          <h2 id="cortes-title" class="dashboard__section-title">Especialidades en cortes</h2>
          <p class="dashboard__section-subtitle">
            Técnicas insignia diseñadas para realzar tus facciones y estilo.
          </p>
        </header>

        <ul class="dashboard__list">
          <li v-for="specialty in cutSpecialties" :key="specialty.name" class="dashboard__list-item">
            <div class="dashboard__list-marker" aria-hidden="true"></div>
            <div class="dashboard__list-content">
              <h3 class="dashboard__list-title">{{ specialty.name }}</h3>
              <p class="dashboard__list-description">{{ specialty.detail }}</p>
            </div>
          </li>
        </ul>
      </section>

      <footer class="dashboard__footer" aria-label="Sugerencias personalizadas">
        <div class="dashboard__footer-card">
          <h2 class="dashboard__footer-title">Hola, {{ firstName }}</h2>
          <p class="dashboard__footer-text">
            Próximamente verás aquí recomendaciones inteligentes basadas en tu historial y mood del día. ¡Estamos
            preparando algo especial para tu próxima cita!
          </p>
          <button class="dashboard__footer-button" type="button">Solicitar asesoría personalizada</button>
        </div>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.dashboard {
  width: min(100%, 1100px);
  margin: 0 auto;
  padding: clamp(1.5rem, 3vw, 2.5rem);
}

.dashboard__canvas {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(229, 231, 235, 0.78));
  border-radius: 32px;
  box-shadow: 0 45px 85px -60px rgba(15, 23, 42, 0.6);
  padding: clamp(1.75rem, 3vw, 2.75rem);
  backdrop-filter: blur(6px);
}

.dashboard__hero {
  display: grid;
  gap: clamp(1.75rem, 3vw, 2.5rem);
  background: radial-gradient(circle at top right, rgba(79, 70, 229, 0.18), transparent 65%);
  padding: clamp(1.75rem, 4vw, 3rem);
  border-radius: 28px;
  position: relative;
  overflow: hidden;
}

.dashboard__hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.25), transparent 65%);
  opacity: 0.35;
  pointer-events: none;
}

.dashboard__brand {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.dashboard__logo {
  width: clamp(72px, 10vw, 108px);
  height: clamp(72px, 10vw, 108px);
  display: grid;
  place-items: center;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.75), rgba(229, 231, 235, 0.25));
  border-radius: 50%;
  box-shadow: 0 20px 45px -30px rgba(17, 24, 39, 0.8);
}

.dashboard__brand-text {
  display: grid;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  color: #111827;
}

.dashboard__brand-title {
  font-size: clamp(0.85rem, 1vw, 1rem);
  font-weight: 700;
}

.dashboard__brand-subtitle {
  font-size: clamp(0.75rem, 0.9vw, 0.95rem);
  font-weight: 500;
  letter-spacing: 0.42em;
}

.dashboard__welcome {
  position: relative;
  z-index: 1;
  max-width: 540px;
  color: #0f172a;
}

.dashboard__eyebrow {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.6);
}

.dashboard__title {
  margin: 0.5rem 0 0;
  font-size: clamp(2.1rem, 5vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.dashboard__subtitle {
  margin: 1rem 0 0;
  font-size: clamp(1rem, 2.2vw, 1.15rem);
  line-height: 1.6;
  color: rgba(15, 23, 42, 0.74);
}

.dashboard__cta {
  display: inline-flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.dashboard__button {
  appearance: none;
  border: none;
  border-radius: 999px;
  padding: 0.85rem 1.6rem;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #ffffff;
  background: linear-gradient(135deg, #4338ca, #6366f1);
  box-shadow: 0 18px 35px -22px rgba(79, 70, 229, 0.9);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.dashboard__button:hover {
  transform: translateY(-2px);
  box-shadow: 0 26px 48px -28px rgba(79, 70, 229, 0.95);
}

.dashboard__button:focus-visible {
  outline: 3px solid rgba(99, 102, 241, 0.35);
  outline-offset: 2px;
}

.dashboard__button--outline {
  color: #1f2937;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.35);
}

.dashboard__button--outline:hover {
  background: rgba(255, 255, 255, 0.9);
}

.dashboard__section {
  display: grid;
  gap: 1.75rem;
  background: rgba(255, 255, 255, 0.9);
  padding: clamp(1.5rem, 3vw, 2.25rem);
  border-radius: 26px;
  box-shadow: 0 20px 45px -40px rgba(15, 23, 42, 0.35);
}

.dashboard__section--accent {
  background: linear-gradient(155deg, rgba(15, 23, 42, 0.92), rgba(30, 64, 175, 0.65));
  color: #f8fafc;
  box-shadow: 0 35px 65px -45px rgba(15, 23, 42, 0.65);
}

.dashboard__section-header {
  display: grid;
  gap: 0.65rem;
}

.dashboard__section-title {
  margin: 0;
  font-size: clamp(1.4rem, 3vw, 1.75rem);
  letter-spacing: -0.01em;
}

.dashboard__section-subtitle {
  margin: 0;
  font-size: clamp(0.95rem, 2.2vw, 1.05rem);
  color: rgba(15, 23, 42, 0.65);
}

.dashboard__section--accent .dashboard__section-subtitle {
  color: rgba(248, 250, 252, 0.75);
}

.dashboard__cards {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.dashboard__card {
  display: grid;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 22px;
  background: linear-gradient(145deg, #f9fafb, #f3f4f6);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 18px 35px -28px rgba(15, 23, 42, 0.4);
}

.dashboard__card-badge {
  align-self: flex-start;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4338ca;
  background: rgba(79, 70, 229, 0.12);
}

.dashboard__card-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #0f172a;
}

.dashboard__card-description {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(15, 23, 42, 0.7);
}

.dashboard__card-action {
  justify-self: flex-start;
  border: none;
  background: none;
  color: #4338ca;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
}

.dashboard__card-action:hover {
  text-decoration: underline;
}

.dashboard__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 1.4rem;
}

.dashboard__list-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: flex-start;
}

.dashboard__list-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.25);
  margin-top: 0.35rem;
}

.dashboard__list-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.dashboard__list-description {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(248, 250, 252, 0.8);
}

.dashboard__footer {
  display: grid;
}

.dashboard__footer-card {
  padding: clamp(1.75rem, 3vw, 2.5rem);
  border-radius: 24px;
  background: linear-gradient(140deg, rgba(99, 102, 241, 0.28), rgba(59, 130, 246, 0.25));
  color: #0f172a;
  display: grid;
  gap: 1rem;
}

.dashboard__footer-title {
  margin: 0;
  font-size: clamp(1.35rem, 2.6vw, 1.65rem);
  font-weight: 700;
}

.dashboard__footer-text {
  margin: 0;
  font-size: clamp(0.95rem, 2.1vw, 1.05rem);
  line-height: 1.6;
  color: rgba(15, 23, 42, 0.75);
}

.dashboard__footer-button {
  justify-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
  background: linear-gradient(135deg, #4338ca, #6366f1);
  cursor: pointer;
  box-shadow: 0 16px 35px -26px rgba(79, 70, 229, 0.85);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.dashboard__footer-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 24px 45px -28px rgba(79, 70, 229, 0.9);
}

@media (max-width: 768px) {
  .dashboard__hero {
    padding: clamp(1.5rem, 4vw, 2.5rem);
  }

  .dashboard__cta {
    width: 100%;
    justify-content: flex-start;
  }

  .dashboard__cards {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 560px) {
  .dashboard__logo {
    width: 72px;
    height: 72px;
  }

  .dashboard__brand {
    justify-content: center;
  }

  .dashboard__cta {
    justify-content: center;
  }
}
</style>