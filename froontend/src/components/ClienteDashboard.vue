<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  userName: {
    type: String,
    default: 'Cliente Panamericana',
  },
})

const emit = defineEmits(['navigate'])
const scrolled = ref(false)

const safeName = computed(() => {
  const trimmed = (props.userName || '').trim()
  if (!trimmed) return 'Cliente Panamericana'
  return trimmed
})

const firstName = computed(() => {
  const [firstWord] = safeName.value.split(/\s+/)
  return firstWord || safeName.value
})

// Cortes de cabello destacados
const haircuts = [
  {
    name: 'Corte Pixie Moderno',
    description: 'Estilo atrevido y sofisticado con capas texturizadas',
    price: '$350',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    image: new URL('@/img/pixie.jpg', import.meta.url).href,
  },
  {
    name: 'Bob Asimétrico',
    description: 'Elegancia contemporánea con líneas definidas',
    price: '$380',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    image: new URL('@/img/Bob.jpg', import.meta.url).href,
  },
  {
    name: 'Fade Ejecutivo',
    description: 'Degradado perfecto para el profesional moderno',
    price: '$280',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    image: new URL('@/img/recto.jpg', import.meta.url).href,
  },
  {
    name: 'Capas Largas',
    description: 'Movimiento natural con volumen equilibrado',
    price: '$420',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    image: new URL('@/img/capa.jpg', import.meta.url).href,
  },
]

// Productos Avyna
const avynaProducts = [
  {
    name: 'Champú Nutritivo',
    line: 'Nutri-Repair',
    description: 'Restauración profunda con aceite de marula',
    price: '$480',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
  {
    name: 'Mascarilla Hidratante',
    line: 'Hydra-Silk',
    description: 'Hidratación intensiva y brillo diamante',
    price: '$560',
    gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  },
  {
    name: 'Sérum Reparador',
    line: 'Pro-Restore',
    description: 'Protección térmica y anti-frizz',
    price: '$640',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  {
    name: 'Spray de Acabado',
    line: 'Styling Pro',
    description: 'Fijación flexible con brillo natural',
    price: '$390',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  },
]

// Servicios
const services = [
  {
    icon: '✂️',
    title: 'Corte & Estilo',
    description: 'Técnicas de vanguardia personalizadas para tu rostro',
  },
  {
    icon: '🎨',
    title: 'Coloración',
    description: 'Balayage, mechas y tonos de última tendencia',
  },
  {
    icon: '💆',
    title: 'Tratamientos',
    description: 'Hidratación profunda y recuperación capilar',
  },
  {
    icon: '👰',
    title: 'Peinados',
    description: 'Recogidos elegantes para eventos especiales',
  },
]

const navigateToLogin = () => {
  emit('navigate', 'login')
}

// NUEVO: botón de cerrar sesión
const logout = () => {
  emit('navigate', 'logout')
}
</script>

<template>
  <div class="page">
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="navbar__container">
        <div class="navbar__brand">
          <div class="navbar__logo">
            <span class="navbar__logo-text">EP</span>
          </div>
          <div class="navbar__brand-text">
            <h1 class="navbar__title">Estética Panamericana</h1>
            <p class="navbar__subtitle">Beauty & Style</p>
          </div>
        </div>

        <div class="navbar__menu">
          <a href="#inicio" class="navbar__link">Inicio</a>
          <a href="#cortes" class="navbar__link">Cortes</a>
          <a href="#productos" class="navbar__link">Productos</a>
          <a href="#servicios" class="navbar__link">Servicios</a>
          <a href="#contacto" class="navbar__link">Contacto</a>
        </div>

        <div class="navbar__actions">
          <button class="navbar__btn navbar__btn--outline" type="button">
            Agendar Cita
          </button>

          <!-- NUEVO BOTÓN CERRAR SESIÓN -->
          <button class="navbar__btn navbar__btn--outline" type="button" @click="logout">
            Cerrar sesión
          </button>

          <button class="navbar__btn navbar__btn--primary" type="button" @click="navigateToLogin">
            {{ firstName }}
          </button>
        </div>
      </div>
    </nav>

    <!-- HERO SECTION -->
    <section id="inicio" class="hero">
      <div class="hero__bg"></div>
      <div class="hero__content">
        <span class="hero__badge">✨ Bienvenida a tu transformación</span>
        <h2 class="hero__title">
          Descubre tu Mejor<br />
          <span class="hero__title-accent">Versión</span>
        </h2>
        <p class="hero__description">
          Estética profesional con más de 15 años creando experiencias únicas de belleza. Expertos en corte,
          color y tratamientos capilares de vanguardia.
        </p>
        <div class="hero__cta">
          <button class="btn btn--large btn--primary">Reserva tu Cita</button>
          <button class="btn btn--large btn--outline">Ver Galería</button>
        </div>
      </div>
    </section>

    <!-- CORTES DE CABELLO -->
    <section id="cortes" class="section">
      <div class="section__container">
        <div class="section__header">
          <span class="section__badge">Nuestras Especialidades</span>
          <h2 class="section__title">Cortes de Cabello</h2>
          <p class="section__description">
            Cada corte es una obra de arte diseñada exclusivamente para realzar tu personalidad y estilo
          </p>
        </div>

        <div class="haircuts">
          <article v-for="cut in haircuts" :key="cut.name" class="haircut-card">
            <div class="haircut-card__image" :style="{ background: cut.gradient }">
              <div class="haircut-card__overlay"></div>
            </div>
            <div class="haircut-card__content">
              <h3 class="haircut-card__name">{{ cut.name }}</h3>
              <p class="haircut-card__description">{{ cut.description }}</p>
              <div class="haircut-card__footer">
                <span class="haircut-card__price">{{ cut.price }}</span>
                <button class="haircut-card__btn">Agendar</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- PRODUCTOS AVYNA -->
    <section id="productos" class="section section--dark">
      <div class="section__container">
        <div class="section__header">
          <span class="section__badge section__badge--light">Línea Exclusiva</span>
          <h2 class="section__title section__title--light">Productos Avyna</h2>
          <p class="section__description section__description--light">
            Cosméticos profesionales de alta gama formulados con ingredientes naturales y tecnología avanzada
          </p>
        </div>

        <div class="products">
          <article v-for="product in avynaProducts" :key="product.name" class="product-card">
            <div class="product-card__image" :style="{ background: product.gradient }">
              <span class="product-card__line">{{ product.line }}</span>
            </div>
            <div class="product-card__content">
              <h3 class="product-card__name">{{ product.name }}</h3>
              <p class="product-card__description">{{ product.description }}</p>
              <div class="product-card__footer">
                <span class="product-card__price">{{ product.price }}</span>
                <button class="product-card__btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.35 3.65A1 1 0 007.5 18h9a1 1 0 00.85-1.35L16 13M16 13H7"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Añadir
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- SERVICIOS -->
    <section id="servicios" class="section">
      <div class="section__container">
        <div class="section__header">
          <span class="section__badge">Todo lo que Necesitas</span>
          <h2 class="section__title">Nuestros Servicios</h2>
          <p class="section__description">
            Experiencias completas de belleza con atención personalizada y productos premium
          </p>
        </div>

        <div class="services">
          <article v-for="service in services" :key="service.title" class="service-card">
            <div class="service-card__icon">{{ service.icon }}</div>
            <h3 class="service-card__title">{{ service.title }}</h3>
            <p class="service-card__description">{{ service.description }}</p>
            <button class="service-card__link">
              Más información
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 12l4-4-4-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="cta-section">
      <div class="cta-section__container">
        <div class="cta-section__content">
          <h2 class="cta-section__title">¿Lista para tu Transformación?</h2>
          <p class="cta-section__description">
            Agenda tu cita hoy y recibe un 20% de descuento en tu primer servicio. Incluye consulta
            personalizada y diagnóstico capilar gratuito.
          </p>
          <div class="cta-section__actions">
            <button class="btn btn--large btn--primary">Agendar Ahora</button>
            <div class="cta-section__contact">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>(555) 123-4567</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer id="contacto" class="footer">
      <div class="footer__container">
        <div class="footer__main">
          <div class="footer__brand">
            <div class="footer__logo">
              <span class="footer__logo-text">EP</span>
            </div>
            <h3 class="footer__brand-name">Estética Panamericana</h3>
            <p class="footer__tagline">Tu belleza, nuestra pasión</p>
            <div class="footer__social">
              <a href="#" class="footer__social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
              <a href="#" class="footer__social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                  />
                </svg>
              </a>
              <a href="#" class="footer__social-link" aria-label="WhatsApp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div class="footer__section">
            <h4 class="footer__title">Navegación</h4>
            <ul class="footer__list">
              <li><a href="#inicio" class="footer__link">Inicio</a></li>
              <li><a href="#cortes" class="footer__link">Cortes</a></li>
              <li><a href="#productos" class="footer__link">Productos</a></li>
              <li><a href="#servicios" class="footer__link">Servicios</a></li>
            </ul>
          </div>

          <div class="footer__section">
            <h4 class="footer__title">Productos Avyna</h4>
            <ul class="footer__list">
              <li><a href="#" class="footer__link">Línea Nutri-Repair</a></li>
              <li><a href="#" class="footer__link">Hydra-Silk</a></li>
              <li><a href="#" class="footer__link">Pro-Restore</a></li>
              <li><a href="#" class="footer__link">Styling Pro</a></li>
            </ul>
          </div>

          <div class="footer__section">
            <h4 class="footer__title">Contacto</h4>
            <ul class="footer__list footer__list--contact">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="10" r="3" stroke-width="2" />
                </svg>
                <span>Av. Panamericana 123, CDMX</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span>(555) 123-4567</span>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path d="M22 6l-10 7L2 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>info@panamericana.mx</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="footer__bottom">
          <p class="footer__copyright">
            © {{ new Date().getFullYear() }} Estética Panamericana. Todos los derechos reservados.
          </p>
          <div class="footer__legal">
            <a href="#" class="footer__legal-link">Política de Privacidad</a>
            <span>·</span>
            <a href="#" class="footer__legal-link">Términos y Condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;
  overflow-x: hidden;
}

/* NAVBAR */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  padding: 1rem 0;
}

.navbar__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar__brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.navbar__logo {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.navbar__logo-text {
  color: white;
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: 1px;
}

.navbar__brand-text {
  display: flex;
  flex-direction: column;
}

.navbar__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
}

.navbar__subtitle {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0;
}

.navbar__menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.navbar__link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.3s ease;
  position: relative;
}

.navbar__link:hover {
  color: #667eea;
}

.navbar__link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.navbar__link:hover::after {
  width: 100%;
}

.navbar__actions {
  display: flex;
  gap: 0.75rem;
}

.navbar__btn {
  padding: 0.65rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.navbar__btn--outline {
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
}

.navbar__btn--outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.navbar__btn--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.navbar__btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* HERO SECTION */
.hero {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero__bg {
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  padding: 4rem 2rem;
  text-align: center;
  color: white;
}

.hero__badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1.5rem;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero__title {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 1.5rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.hero__title-accent {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.8;
  max-width: 700px;
  margin: 0 auto 2.5rem;
  opacity: 0.95;
}

.hero__cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* BUTTONS */
.btn {
  padding: 0.75rem 2rem;
  border-radius: 30px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn--large {
  padding: 1rem 2.5rem;
  font-size: 1.05rem;
}

.btn--primary {
  background: white;
  color: #667eea;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.btn--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.3);
}

.btn--outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn--outline:hover {
  background: white;
  color: #667eea;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
}

/* SECTION */
.section {
  padding: 6rem 0;
}

.section--dark {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
}

.section__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section__header {
  text-align: center;
  margin-bottom: 4rem;
}

.section__badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.section__badge--light {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

.section__title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0 0 1rem;
  color: #1a1a1a;
}

.section__title--light {
  color: white;
}

.section__description {
  font-size: 1.15rem;
  line-height: 1.7;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
}

.section__description--light {
  color: rgba(255, 255, 255, 0.8);
}

/* HAIRCUTS */
.haircuts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.haircut-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.haircut-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.haircut-card__image {
  height: 280px;
  position: relative;
  overflow: hidden;
}

.haircut-card__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.6) 100%);
}

.haircut-card__content {
  padding: 1.5rem;
}

.haircut-card__name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #1a1a1a;
}

.haircut-card__description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #666;
  margin: 0 0 1.5rem;
}

.haircut-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.haircut-card__price {
  font-size: 1.75rem;
  font-weight: 800;
  color: #667eea;
}

.haircut-card__btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.haircut-card__btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* PRODUCTS */
.products {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.product-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.product-card__image {
  height: 220px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-card__line {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: white;
}

.product-card__content {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
}

.product-card__name {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: white;
}

.product-card__description {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1.5rem;
}

.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card__price {
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.product-card__btn {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.65rem 1.25rem;
  border-radius: 25px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-card__btn:hover {
  background: white;
  color: #667eea;
  transform: scale(1.05);
}

/* SERVICES */
.services {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.service-card {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.service-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.service-card__icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.service-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  color: #1a1a1a;
}

.service-card__description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #666;
  margin: 0 0 1.5rem;
}

.service-card__link {
  background: none;
  border: none;
  color: #667eea;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: gap 0.3s ease;
}

.service-card__link:hover {
  gap: 0.75rem;
}

/* CTA SECTION */
.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 6rem 0;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.05)"/></svg>');
  opacity: 0.3;
}

.cta-section__container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.cta-section__content {
  text-align: center;
  color: white;
}

.cta-section__title {
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  margin: 0 0 1rem;
}

.cta-section__description {
  font-size: 1.15rem;
  line-height: 1.8;
  margin: 0 0 2.5rem;
  opacity: 0.95;
}

.cta-section__actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.cta-section__contact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.15rem;
  font-weight: 600;
}

/* FOOTER */
.footer {
  background: #0a0a0a;
  color: white;
  padding: 4rem 0 2rem;
}

.footer__container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer__main {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer__brand {
  max-width: 300px;
}

.footer__logo {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.footer__logo-text {
  color: white;
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: 1px;
}

.footer__brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.footer__tagline {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 1.5rem;
}

.footer__social {
  display: flex;
  gap: 1rem;
}

.footer__social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.footer__social-link:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: translateY(-3px);
}

.footer__title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  color: white;
}

.footer__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer__list--contact {
  gap: 1rem;
}

.footer__list--contact li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.footer__list--contact svg {
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.footer__link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.footer__link:hover {
  color: #667eea;
}

.footer__bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer__copyright {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.footer__legal {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
}

.footer__legal-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer__legal-link:hover {
  color: white;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .navbar__menu {
    display: none;
  }

  .hero {
    min-height: 70vh;
  }

  .section {
    padding: 4rem 0;
  }

  .haircuts,
  .products,
  .services {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
}

@media (max-width: 640px) {
  .navbar__container {
    padding: 0 1rem;
  }

  .navbar__actions {
    gap: 0.5rem;
  }

  .navbar__btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }

  .section__container {
    padding: 0 1rem;
  }

  .hero__content {
    padding: 3rem 1rem;
  }

  .hero__cta {
    flex-direction: column;
  }

  .btn--large {
    width: 100%;
  }

  .haircuts,
  .products,
  .services {
    grid-template-columns: 1fr;
  }

  .footer__main {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .footer__bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
