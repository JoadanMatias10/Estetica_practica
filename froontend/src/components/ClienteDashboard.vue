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

// Catálogo destacado
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

// Líneas Avyna (panel hero)
const productLines = [
  {
    name: 'Línea Avyna Nutri-Repair',
    description:
      'Champú vegano, mascarilla concentrada y sérum protector con aceite de marula y proteína de seda.',
    badge: 'Top ventas',
    price: 'Desde $480 MXN',
  },
  {
    name: 'Colección Avyna Brillo Diamante',
    description:
      'Ritual iluminador que sella cutícula, controla frizz y aporta brillo espejo en un solo paso.',
    badge: 'Novedad',
    price: 'Ritual express 35 min',
  },
  {
    name: 'Avyna Styling Pro',
    description:
      'Spray de acabado, crema de ondas suaves y cera mate para looks urbanos de larga duración.',
    badge: 'Edición lounge',
    price: 'Combo desde $520 MXN',
  },
]

// Experiencia en salón
const experienceNotes = [
  {
    title: 'Estética Panamericana',
    detail: 'Cabina sensorial con aromas cítricos, música downtempo y asesoría personalizada.',
  },
  {
    title: 'Diagnóstico luminoso',
    detail: 'Analizamos cuero cabelludo y fibra capilar para combinar la rutina Avyna ideal.',
  },
  {
    title: 'Look & Shop',
    detail: 'Prueba los productos en salón y llévate tu kit curado con beneficios de membresía.',
  },
]

// Especialidades en cortes
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

// Rituales / servicios
const rituals = [
  {
    title: 'Ritual Urban Glow',
    text: 'Hidratación profunda + masaje relajante + plan de styling Avyna para tu siguiente evento.',
  },
  {
    title: 'Corte de autor',
    text: 'Técnicas precisas, contornos limpios y acabado fotográfico para tu día a día.',
  },
  {
    title: 'Color Studio',
    text: 'Balayage luminoso, matices fríos o cálidos y sellado con Brillo Diamante.',
  },
]

const navigateToLogin = () => {
  emit('navigate', 'login')
}
</script>

<template>
  <section class="home" aria-labelledby="home-title">
    <div class="home__shell">
      <!-- HERO PRINCIPAL -->
      <header class="hero">
        <div class="hero__badge">Estética Panamericana · Avyna</div>
        <p class="hero__eyebrow">Bienvenida, {{ safeName }}</p>

        <div class="hero__headline">
          <h1 id="home-title">Un Home pensado para tu glow urbano</h1>
          <p>
            Experiencias de belleza sensorial, productos Avyna curados y un espacio para descubrir tu mejor
            versión.
          </p>
        </div>

        <div class="hero__actions">
          <button class="button button--primary" type="button">Agendar mi ritual</button>
          <button class="button button--ghost" type="button" @click="navigateToLogin">
            Cerrar sesión
          </button>
        </div>

        <!-- Panel Avyna -->
        <div class="hero__panel" aria-label="Selección destacada Avyna">
          <div class="hero__panel-title">Selección Avyna</div>
          <div class="hero__panel-grid">
            <div v-for="item in productLines" :key="item.name" class="hero__panel-card">
              <span class="tag">{{ item.badge }}</span>
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <span class="price">{{ item.price }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- CATÁLOGO DESTACADO -->
      <section class="section" aria-labelledby="catalogo-title">
        <div class="section__header">
          <h2 id="catalogo-title">Catálogo destacado</h2>
          <p>Selección premium inspirada en la estética urbana de Panamericana.</p>
        </div>

        <div class="grid">
          <article
            v-for="item in productHighlights"
            :key="item.title"
            class="card"
            aria-label="Vista previa de catálogo"
          >
            <span class="tag">{{ item.badge }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
            <button class="link" type="button">Explorar colección</button>
          </article>
        </div>
      </section>

      <!-- EXPERIENCIA EN SALÓN -->
      <section class="section" aria-labelledby="section-experiencia">
        <div class="section__header">
          <h2 id="section-experiencia">Home Estética Panamericana</h2>
          <p>Servicios, ambientación sensorial y venta de productos Avyna en un solo lugar.</p>
        </div>

        <div class="grid">
          <article v-for="note in experienceNotes" :key="note.title" class="card">
            <h3>{{ note.title }}</h3>
            <p>{{ note.detail }}</p>
          </article>
        </div>
      </section>

      <!-- ESPECIALIDADES EN CORTES -->
      <section class="section section--accent" aria-labelledby="cortes-title">
        <div class="section__header">
          <h2 id="cortes-title">Especialidades en cortes</h2>
          <p>Técnicas insignia diseñadas para realzar tus facciones y estilo.</p>
        </div>

        <ul class="cuts-list">
          <li v-for="specialty in cutSpecialties" :key="specialty.name" class="cuts-list__item">
            <div class="cuts-list__marker" aria-hidden="true"></div>
            <div class="cuts-list__content">
              <h3 class="cuts-list__title">{{ specialty.name }}</h3>
              <p class="cuts-list__description">{{ specialty.detail }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- RITUALES / SERVICIOS -->
      <section class="section section--accent" aria-labelledby="section-rituales">
        <div class="section__header">
          <h2 id="section-rituales">Rituales y servicios</h2>
          <p>Agenda, compra tus productos Avyna y disfruta una experiencia boutique.</p>
        </div>

        <div class="grid grid--compact">
          <article v-for="ritual in rituals" :key="ritual.title" class="card card--glass">
            <h3>{{ ritual.title }}</h3>
            <p>{{ ritual.text }}</p>
            <button class="link" type="button">Ver detalles</button>
          </article>
        </div>
      </section>

      <!-- CTA FINAL / RECOMENDACIONES -->
      <section class="cta" aria-label="Asesoría personalizada">
        <div>
          <p class="cta__eyebrow">Hola, {{ firstName }}</p>
          <h2>Hagamos tu kit Avyna a medida</h2>
          <p>
            Te preparamos una rutina exclusiva según tu mood, agenda y estilo de vida. Descubre las ventajas de
            Estética Panamericana con envíos rápidos y citas prioritarias.
          </p>
        </div>
        <div class="cta__actions">
          <button class="button button--primary" type="button">Solicitar asesoría</button>
          <button class="button button--ghost" type="button">Conocer membresía</button>
        </div>
      </section>
    </div>

    <!-- FOOTER COMPLETO -->
    <footer class="site-footer">
      <div class="site-footer__inner">
        <div class="site-footer__brand">
          <span class="site-footer__logo-circle">EP</span>
          <div>
            <p class="site-footer__title">Estética Panamericana</p>
            <p class="site-footer__subtitle">Glow urbano · Cuidado profesional</p>
          </div>
        </div>

        <nav class="site-footer__nav">
          <a href="#" class="site-footer__link">Servicios</a>
          <a href="#" class="site-footer__link">Productos Avyna</a>
          <a href="#" class="site-footer__link">Agenda</a>
          <a href="#" class="site-footer__link">Contacto</a>
        </nav>

        <p class="site-footer__copy">
          © {{ new Date().getFullYear() }} Estética Panamericana. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  </section>
</template>

<style scoped>
:root {
  --page-bg: radial-gradient(circle at 0 0, #111827, #020617 55%);
}

/* Layout general: pantalla completa */
.home {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: var(--page-bg);
}

/* Contenido principal */
.home__shell {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1.8rem, 5vw, 4rem);
}

/* HERO */
.hero {
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.28), transparent 45%),
    radial-gradient(circle at 75% 20%, rgba(16, 185, 129, 0.25), transparent 45%),
    linear-gradient(135deg, #0f172a, #111827 35%, #0b1222 80%);
  color: #f8fafc;
  padding: clamp(1.75rem, 4vw, 3rem);
  border-radius: 32px;
  box-shadow: 0 35px 70px -55px rgba(15, 23, 42, 0.75);
  display: grid;
  gap: 1.5rem;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.08), transparent 70%);
  pointer-events: none;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 1;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.66);
  border: 1px solid rgba(148, 163, 184, 0.5);
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero__eyebrow {
  margin: 0.8rem 0 0;
  font-size: 0.95rem;
  letter-spacing: 0.16em;
  color: rgba(248, 250, 252, 0.75);
  text-transform: uppercase;
  position: relative;
  z-index: 1;
}

.hero__headline {
  margin-top: 1rem;
  display: grid;
  gap: 0.85rem;
  max-width: 640px;
  position: relative;
  z-index: 1;
}

.hero__headline h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  letter-spacing: -0.02em;
}

.hero__headline p {
  margin: 0;
  font-size: clamp(1rem, 2.4vw, 1.1rem);
  line-height: 1.6;
  color: rgba(226, 232, 240, 0.85);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1.25rem 0 1rem;
  position: relative;
  z-index: 1;
}

/* Panel Avyna */
.hero__panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.hero__panel-title {
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #e0e7ff;
  text-transform: uppercase;
  font-size: 0.8rem;
}

.hero__panel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.hero__panel-card {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1rem;
  display: grid;
  gap: 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.hero__panel-card h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #f8fafc;
}

.hero__panel-card p {
  margin: 0;
  color: rgba(226, 232, 240, 0.78);
  line-height: 1.5;
}

/* Chips / precio */
.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.18);
  color: #a7f3d0;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

.price {
  color: #c7d2fe;
  font-weight: 600;
  letter-spacing: 0.04em;
}

/* Secciones genéricas */
.section {
  display: grid;
  gap: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
  padding: clamp(1.5rem, 3vw, 2.25rem);
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 28px 60px -48px rgba(15, 23, 42, 0.4);
}

.section--accent {
  background: linear-gradient(140deg, #111827, #0f172a 60%, #1f2937);
  color: #e5e7eb;
}

.section__header h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 1.9rem);
}

.section__header p {
  margin: 0.35rem 0 0;
  color: rgba(15, 23, 42, 0.7);
}

.section--accent .section__header p {
  color: rgba(229, 231, 235, 0.8);
}

/* Grid / cards */
.grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.grid--compact {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 1.25rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 18px 40px -32px rgba(15, 23, 42, 0.35);
  display: grid;
  gap: 0.4rem;
}

.card h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: #0f172a;
}

.card p {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.7);
  line-height: 1.55;
}

.section--accent .card {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(55, 65, 81, 0.8);
}

.section--accent .card h3,
.section--accent .card p {
  color: #e5e7eb;
}

.card--glass {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Links / botones */
.link {
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

.section--accent .link {
  color: #a5b4fc;
}

.button {
  border: none;
  border-radius: 999px;
  padding: 0.9rem 1.6rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.button--primary {
  background: linear-gradient(135deg, #22c55e, #10b981);
  color: #041214;
  box-shadow: 0 24px 50px -26px rgba(16, 185, 129, 0.7);
}

.button--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.button:hover {
  transform: translateY(-2px);
}

/* Lista de cortes */
.cuts-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 1.4rem;
}

.cuts-list__item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: flex-start;
}

.cuts-list__marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #f97316);
  box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.25);
  margin-top: 0.35rem;
}

.cuts-list__title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.cuts-list__description {
  margin: 0.35rem 0 0;
  font-size: 0.95rem;
  line-height: 1.55;
  color: rgba(248, 250, 252, 0.8);
}

/* CTA final */
.cta {
  display: grid;
  gap: 1rem;
  padding: clamp(1.5rem, 3vw, 2.5rem);
  border-radius: 26px;
  background: linear-gradient(135deg, #ecfeff, #eef2ff);
  border: 1px solid rgba(148, 163, 184, 0.3);
  align-items: center;
  box-shadow: 0 28px 50px -42px rgba(15, 23, 42, 0.4);
}

.cta__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #16a34a;
  font-weight: 700;
  margin: 0 0 0.35rem;
}

.cta h2 {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #0f172a;
}

.cta p {
  margin: 0.35rem 0 0;
  color: rgba(15, 23, 42, 0.75);
  line-height: 1.6;
}

.cta__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* FOOTER */
.site-footer {
  border-top: 1px solid rgba(15, 23, 42, 0.8);
  background: #020617;
  color: #e5e7eb;
  padding: 1.5rem clamp(1.8rem, 5vw, 4rem);
}

.site-footer__inner {
  display: grid;
  gap: 1rem;
}

.site-footer__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.site-footer__logo-circle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #6366f1, #22c55e);
  color: #0b1120;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
}

.site-footer__title {
  margin: 0;
  font-weight: 600;
}

.site-footer__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(148, 163, 184, 0.9);
}

.site-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.site-footer__link {
  font-size: 0.9rem;
  color: rgba(209, 213, 219, 0.9);
  text-decoration: none;
}

.site-footer__link:hover {
  text-decoration: underline;
}

.site-footer__copy {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.85);
}

/* Responsivo */
@media (max-width: 720px) {
  .hero,
  .section,
  .cta {
    padding: 1.25rem;
  }

  .hero__panel-grid,
  .grid,
  .grid--compact {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .home__shell {
    padding: 1.25rem 1.25rem 1.75rem;
  }

  .hero__actions,
  .cta__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .button {
    width: 100%;
    text-align: center;
  }

  .site-footer__inner {
    gap: 0.75rem;
  }
}
</style>
