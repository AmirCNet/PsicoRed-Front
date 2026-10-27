<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import ToastContainer from './components/ToastContainer.vue'
import AppAvatar from './components/common/AppAvatar.vue'

import { useTheme } from './composables/useTheme'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

// Manejo centralizado y reactivo del tema
const { isDark, showQuickToggle, toggleTheme, initTheme } = useTheme()

// Estado retraído de la barra lateral persistido en localStorage
const isSidebarCollapsed = ref(JSON.parse(localStorage.getItem('sidebar_collapsed') ?? 'false'))

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebar_collapsed', JSON.stringify(isSidebarCollapsed.value))
}

// Al iniciar, si hay un token guardado, validar que siga siendo válido
onMounted(async () => {
  initTheme()

  if (!authStore.isAuthenticated) return

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
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

const cerrarSesion = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div 
    class="app-shell" 
    :class="{ 
      'with-sidebar': showSidebar, 
      'sidebar-collapsed': showSidebar && isSidebarCollapsed 
    }"
  >

    <!-- ══ SIDEBAR ══ -->
    <aside v-if="showSidebar" class="sidebar" :class="{ 'collapsed': isSidebarCollapsed }">

      <!-- Lengüeta interactiva para expandir la barra colapsada -->
      <button 
        v-if="isSidebarCollapsed" 
        type="button" 
        class="sidebar-edge-tab" 
        @click="toggleSidebar" 
        title="Expandir barra lateral"
        aria-label="Expandir barra lateral"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      <!-- Encabezado de Sidebar: Marca Psicomunidad + Botón Retraer -->
      <div class="sidebar-header">
        <div class="sidebar-brand" :title="isSidebarCollapsed ? 'Psicomunidad' : ''" @click="isSidebarCollapsed && toggleSidebar()">
          <span v-if="!isSidebarCollapsed" class="brand-wordmark">Psicomunidad</span>
          <!-- Opción 4: Acento / Dot minimalista tenue -->
          <div v-else class="brand-dot-container" title="Expandir barra lateral">
            <span class="brand-dot"></span>
          </div>
        </div>

        <button 
          v-if="!isSidebarCollapsed"
          type="button" 
          class="btn-toggle-sidebar" 
          @click="toggleSidebar" 
          title="Retraer barra lateral"
          aria-label="Retraer barra lateral"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Nav links -->
      <nav class="sidebar-nav">
        <p v-if="!isSidebarCollapsed" class="nav-section-label">Principal</p>

        <router-link to="/dashboard" class="nav-item" title="Dashboard">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span v-if="!isSidebarCollapsed">Dashboard</span>
        </router-link>

        <router-link to="/profesionales" class="nav-item" title="Profesionales">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span v-if="!isSidebarCollapsed">Profesionales</span>
        </router-link>

        <router-link to="/pacientes" class="nav-item" title="Pacientes">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <span v-if="!isSidebarCollapsed">Pacientes</span>
        </router-link>

        <router-link to="/turnos" class="nav-item" title="Agenda / Turnos">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span v-if="!isSidebarCollapsed">Agenda / Turnos</span>
        </router-link>

        <router-link v-if="authStore.esAdmin" to="/derivaciones" class="nav-item" title="Derivaciones">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 14 20 9 15 4"/>
            <path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
          </svg>
          <span v-if="!isSidebarCollapsed">Derivaciones</span>
        </router-link>
      </nav>

      <!-- Footer: usuario + flyout + logout -->
      <div class="sidebar-footer">
        <!-- Ancla de perfil de usuario -->
        <div class="user-profile-anchor">
          <div 
            class="user-info user-info--clickable" 
            @click="router.push('/perfil')" 
            :title="isSidebarCollapsed ? '' : 'Ir a mi perfil'"
          >
            <AppAvatar 
              :userId="authStore.usuario?.id" 
              :seed="authStore.usuario?.id ? String(authStore.usuario.id) : (authStore.usuario?.email || '')" 
              :size="36" 
              background="squircle"
            />
            <div v-if="!isSidebarCollapsed" class="user-details">
              <p class="user-email">{{ authStore.usuario?.email }}</p>
              <span class="user-rol">{{ authStore.esAdmin ? 'Administrador' : 'Profesional' }}</span>
            </div>
          </div>

          <!-- Flyout flotante hacia la derecha cuando la barra está colapsada -->
          <div v-if="isSidebarCollapsed" class="user-flyout-card">
            <div class="flyout-header">
              <AppAvatar 
                :userId="authStore.usuario?.id" 
                :seed="authStore.usuario?.id ? String(authStore.usuario.id) : (authStore.usuario?.email || '')" 
                :size="42" 
                background="squircle"
              />
              <div class="flyout-user-meta">
                <p class="flyout-email" :title="authStore.usuario?.email">{{ authStore.usuario?.email }}</p>
                <span class="flyout-rol-badge">{{ authStore.esAdmin ? 'Administrador' : 'Profesional' }}</span>
              </div>
            </div>

            <div class="flyout-divider"></div>

            <div class="flyout-actions">
              <button type="button" class="flyout-btn flyout-btn--profile" @click="router.push('/perfil')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Mi Perfil</span>
              </button>

              <button type="button" class="flyout-btn flyout-btn--theme" @click="toggleTheme">
                <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <span>{{ isDark ? 'Modo claro' : 'Modo oscuro' }}</span>
              </button>

              <button type="button" class="flyout-btn flyout-btn--logout" @click="cerrarSesion">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </aside>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-content">
      <!-- Botón de cambio de tema en la parte superior derecha de cada página -->
      <button
        v-if="showQuickToggle"
        type="button"
        class="quick-theme-toggle"
        :class="{ 'is-dark': isDark }"
        @click="toggleTheme"
        :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
        :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      >
        <div class="toggle-icon-wrap">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </div>
        <span class="toggle-label">{{ isDark ? 'Modo claro' : 'Modo oscuro' }}</span>
      </button>

      <router-view />
    </main>

    <!-- Toasts globales -->
    <ToastContainer />

  </div>
</template>

<style scoped>

/* ── Shell */
.app-shell {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 100vh;
}

.app-shell.with-sidebar .main-content {
  margin-left: 240px;
  width: calc(100% - 240px);
  transition: margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-shell.with-sidebar.sidebar-collapsed .main-content {
  margin-left: 68px;
  width: calc(100% - 68px);
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
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed {
  width: 68px;
}

/* ── Brand & Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 0.5rem;
}

.sidebar.collapsed .sidebar-header {
  padding: 1rem 0.5rem;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow: hidden;
  min-width: 0;
}

/* ── Botón de cambio rápido de tema (superior derecha) */
.quick-theme-toggle {
  position: fixed;
  top: 1.15rem;
  right: 1.5rem;
  z-index: 95;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.42rem 0.85rem;
  border-radius: 999px;
  background: var(--white);
  border: 1.5px solid var(--border);
  color: var(--wine);
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}

.quick-theme-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  border-color: var(--rose);
  color: var(--rose);
}

.quick-theme-toggle:active {
  transform: translateY(0);
}

.toggle-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--cream);
  color: inherit;
  transition: background-color 0.2s ease, transform 0.25s ease;
}

.quick-theme-toggle:hover .toggle-icon-wrap {
  transform: rotate(15deg);
}

.toggle-label {
  font-size: 0.78rem;
  letter-spacing: 0.01em;
  font-weight: 600;
}

.btn-toggle-sidebar {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.btn-toggle-sidebar:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.brand-wordmark {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #fffaf5;
  white-space: nowrap;
  user-select: none;
}

.brand-dot-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s ease, transform 0.2s ease;
}

.brand-dot-container:hover {
  background: rgba(255, 255, 255, 0.08);
}

.brand-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
}

.brand-dot-container:hover .brand-dot {
  background: #ffffff;
  transform: scale(1.4);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.85);
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

.sidebar.collapsed .sidebar-nav {
  padding: 1rem 0.4rem;
}

.nav-section-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.45);
  padding: 0 0.5rem;
  margin: 0.5rem 0 0.5rem;
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
  white-space: nowrap;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem 0;
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

/* ── Flecha sutil para expandir la barra colapsada */
.sidebar-edge-tab {
  position: absolute;
  top: 50%;
  right: -38px;
  transform: translateY(-50%);
  width: 52px;
  height: 180px;
  background: transparent;
  border: none;
  box-shadow: none;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease, color 0.15s ease;
  z-index: 105;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
}

.sidebar.collapsed:hover .sidebar-edge-tab {
  opacity: 1;
  pointer-events: auto;
}

.sidebar-edge-tab:hover {
  color: #111827;
  transform: translateY(-50%) translateX(4px) scale(1.18);
}

/* ── Footer */
.sidebar-footer {
  padding: 1rem 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.sidebar.collapsed .sidebar-footer {
  padding: 1rem 0.4rem;
  flex-direction: column;
  gap: 0.75rem;
}

.user-profile-anchor {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
}

.sidebar.collapsed .user-profile-anchor {
  justify-content: center;
  width: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  min-width: 0;
}

.user-info--clickable {
  cursor: pointer;
  padding: 0.25rem 0.35rem;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.user-info--clickable:hover {
  background: rgba(255, 255, 255, 0.08);
}

.sidebar.collapsed .user-info {
  justify-content: center;
  width: auto;
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

/* Flyout flotante del perfil hacia la derecha */
.user-flyout-card {
  position: absolute;
  left: calc(100% + 14px);
  bottom: -6px;
  width: 230px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 1rem;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-6px) scale(0.97);
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.2s;
  z-index: 200;
  pointer-events: none;
}

/* Flechita / triángulo decorativo hacia el avatar */
.user-flyout-card::before {
  content: '';
  position: absolute;
  left: -6px;
  bottom: 16px;
  width: 12px;
  height: 12px;
  background: #ffffff;
  transform: rotate(45deg);
  border-left: 1px solid rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

/* Puente invisible de hover entre avatar y flyout */
.user-flyout-card::after {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  bottom: 0;
  width: 20px;
}

.user-profile-anchor:hover .user-flyout-card {
  opacity: 1;
  visibility: visible;
  transform: translateX(0) scale(1);
  pointer-events: auto;
}

.flyout-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.flyout-user-meta {
  min-width: 0;
  flex: 1;
}

.flyout-email {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.flyout-rol-badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--wine, #7d1c3a);
  background: #fff0f3;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  margin-top: 0.25rem;
}

.flyout-divider {
  height: 1px;
  background: #f1f1f1;
  margin: 0.8rem 0;
}

.flyout-actions {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.flyout-btn {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  border: none;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  background: transparent;
  text-align: left;
}

.flyout-btn--profile {
  color: #374151;
}

.flyout-btn--profile:hover {
  background: #f9f6f3;
  color: var(--wine, #7d1c3a);
}

.flyout-btn--theme {
  color: #374151;
}

.flyout-btn--theme:hover {
  background: #f9f6f3;
  color: var(--wine, #7d1c3a);
}

.flyout-btn--logout {
  color: #dc2626;
}

.flyout-btn--logout:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.btn-logout {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}
</style>