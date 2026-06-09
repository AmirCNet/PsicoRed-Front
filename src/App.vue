<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

// Al iniciar, si hay un token guardado, validar que siga siendo válido
onMounted(async () => {
  if (!authStore.isAuthenticated) return

  try {
    const res = await fetch('http://localhost:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error('Token inválido')
  } catch {
    // Token expirado o inválido → cerrar sesión y redirigir al login
    authStore.logout()
    router.push('/login')
  }
})

// Mostrar sidebar solo en rutas del sistema (no en auth ni en estados intermedios)
const showSidebar = computed(() => {
  const rutasSinSidebar = ['/login', '/pendiente', '/completar-perfil']
  return !rutasSinSidebar.includes(route.path) && authStore.isAuthenticated
})

const iniciales = computed(() => {
  const email = authStore.usuario?.email ?? ''
  return email.slice(0, 2).toUpperCase()
})

const cerrarSesion = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-shell" :class="{ 'with-sidebar': showSidebar }">

    <!-- ══ SIDEBAR ══ -->
    <aside v-if="showSidebar" class="sidebar">

      <!-- Logo / Marca -->
      <div class="sidebar-brand">
        <div class="brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z"/>
            <path d="M12 14c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z"/>
          </svg>
        </div>
        <span class="brand-name">PsicoRed</span>
      </div>

      <!-- Nav links -->
      <nav class="sidebar-nav">
        <p class="nav-section-label">Principal</p>

        <router-link to="/dashboard" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Dashboard</span>
        </router-link>

        <router-link to="/profesionales" class="nav-item">
          <!-- xmlns: Identificador obligatorio para que el navegador sepa que esto es un gráfico SVG y no HTML común -->
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Profesionales</span>
        </router-link>

        <router-link to="/pacientes" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <span>Pacientes</span>
        </router-link>

        <router-link v-if="authStore.esAdmin" to="/derivaciones" class="nav-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 14 20 9 15 4"/>
            <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
          </svg>
          <span>Derivaciones</span>
        </router-link>
      </nav>

      <!-- Footer: usuario + logout -->
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ iniciales }}</div>
          <div class="user-details">
            <p class="user-email">{{ authStore.usuario?.email }}</p>
            <span class="user-rol">{{ authStore.esAdmin ? 'Administrador' : 'Profesional' }}</span>
          </div>
        </div>
        <button class="btn-logout" @click="cerrarSesion" title="Cerrar sesión">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>

    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
      <router-view />
    </main>

  </div>
</template>

<style scoped>

/* ── Shell */
.app-shell {
  display: flex;
  min-height: 100vh;
}

.app-shell.with-sidebar .main-content {
  margin-left: 240px;
}

/* ── Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 240px;
  background: var(--wine);
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

/* ── Brand */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.brand-icon svg {
  width: 20px;
  height: 20px;
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.3px;
}

/* ── Nav */
.sidebar-nav {
  flex: 1;
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  padding: 0 0.5rem;
  margin: 0 0 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.18s, color 0.18s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 600;
}

/* ── Footer */
.sidebar-footer {
  padding: 1rem 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
}

.user-email {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-rol {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: capitalize;
}

.btn-logout {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
  flex-shrink: 0;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border-color: rgba(255, 255, 255, 0.4);
}

/* ── Contenido */
.main-content {
  flex: 1;
  min-height: 100vh;
}
</style>