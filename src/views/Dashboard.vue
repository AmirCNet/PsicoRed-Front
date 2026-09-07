<template>
  <div class="dashboard">

    <!-- Header -->
    <div class="dash-header">
      <div class="dash-welcome">
        <div class="avatar">{{ iniciales }}</div>
        <div>
          <h1>¡Bienvenido/a, {{ nombreUsuario }}!</h1>
          <p class="email">{{ authStore.usuario?.email }}</p>
        </div>
        <span class="badge" :class="authStore.esAdmin ? 'badge-admin' : 'badge-pro'">
          {{ authStore.esAdmin ? 'Administrador' : 'Profesional' }}
        </span>
      </div>
    </div>

    <!-- Stats cards (solo admin) -->
    <div v-if="authStore.esAdmin" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon--blue">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.profesionales ?? '—' }}</span>
          <span class="stat-label">Profesionales</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--green">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.pacientes ?? '—' }}</span>
          <span class="stat-label">Pacientes activos</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--purple">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.turnos ?? '—' }}</span>
          <span class="stat-label">Turnos programados</span>
        </div>
      </div>

      <div class="stat-card stat-card--alert" v-if="pendientes.length > 0">
        <div class="stat-icon stat-icon--orange">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ pendientes.length }}</span>
          <span class="stat-label">Pendientes de aprobación</span>
        </div>
      </div>
    </div>

    <!-- Accesos rápidos -->
    <div class="quick-access">
      <h2 class="section-title">Accesos rápidos</h2>
      <div class="quick-grid">
        <router-link to="/profesionales" class="quick-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>Profesionales</span>
        </router-link>
        <router-link to="/pacientes" class="quick-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <span>Pacientes</span>
        </router-link>
        <router-link to="/turnos" class="quick-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>Agenda / Turnos</span>
        </router-link>
        <router-link v-if="authStore.esAdmin" to="/derivaciones" class="quick-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
          </svg>
          <span>Derivaciones</span>
        </router-link>
      </div>
    </div>

    <!-- Panel de pendientes: solo visible para el administrador -->
    <div v-if="authStore.esAdmin && pendientes.length > 0" class="pendientes-panel">
      <div class="panel-header">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Usuarios pendientes de aprobación
        </h2>
        <span class="badge-count">{{ pendientes.length }}</span>
      </div>

      <!-- Cargando -->
      <div v-if="cargando" class="panel-loading">Cargando...</div>

      <!-- Lista de pendientes -->
      <ul v-else class="pendientes-list">
        <li v-for="u in pendientes" :key="u.id" class="pendiente-item">
          <div class="pendiente-info">
            <div class="pendiente-avatar">{{ u.email.slice(0, 2).toUpperCase() }}</div>
            <div>
              <p class="pendiente-email">{{ u.email }}</p>
              <p class="pendiente-fecha">Registrado {{ formatFecha(u.creado_en) }}</p>
            </div>
          </div>
          <button
            class="btn-aprobar"
            :disabled="aprobando === u.id"
            @click="aprobar(u.id)"
          >
            <span v-if="aprobando === u.id" class="spinner-sm"></span>
            <span v-else>Aprobar</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import { getPendientes, aprobarUsuario } from '../services/usuariosService'
import { getProfesionales } from '../services/profesionalService'
import { getPacientes } from '../services/pacientesService'
import { getTurnos } from '../services/turnosService'

const authStore = useAuthStore()
const { success, error: toastError } = useToast()

const iniciales = computed(() => {
  const email = authStore.usuario?.email ?? ''
  return email.slice(0, 2).toUpperCase()
})

// Nombre de usuario a partir del email (parte antes del @)
const nombreUsuario = computed(() => {
  const email = authStore.usuario?.email ?? ''
  return email.split('@')[0] || 'Usuario'
})

// ── Stats
const stats = ref({ profesionales: null, pacientes: null, turnos: null })

const cargarStats = async () => {
  if (!authStore.esAdmin) return
  try {
    const [profs, pacs, turns] = await Promise.all([
      getProfesionales(),
      getPacientes(),
      getTurnos({ estado: 'programado' })
    ])
    stats.value.profesionales = profs.length
    stats.value.pacientes = pacs.filter(p => p.estado === 'activo').length
    stats.value.turnos = turns.length
  } catch {
    // silencioso — las stats son informativas
  }
}

// ── Panel de pendientes
const pendientes = ref([])
const cargando   = ref(false)
const aprobando  = ref(null)

const cargarPendientes = async () => {
  if (!authStore.esAdmin) return
  cargando.value = true
  try {
    pendientes.value = await getPendientes()
  } catch (err) {
    console.error('Error al cargar pendientes:', err)
    toastError('Error al cargar usuarios pendientes')
  } finally {
    cargando.value = false
  }
}

const aprobar = async (id) => {
  aprobando.value = id
  try {
    await aprobarUsuario(id)
    // Eliminar de la lista local tras aprobar
    pendientes.value = pendientes.value.filter(u => u.id !== id)
    success('Usuario aprobado correctamente')
  } catch (err) {
    console.error('Error al aprobar usuario:', err)
    toastError(err.message || 'Error al aprobar el usuario')
  } finally {
    aprobando.value = null
  }
}

const formatFecha = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(() => {
  cargarPendientes()
  cargarStats()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 2rem;
  background: var(--cream);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Header */
.dash-header {
  background: var(--white);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
}

.dash-welcome {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dash-welcome h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--wine);
  margin: 0;
}

.email {
  color: var(--text-soft);
  font-size: 0.88rem;
  margin: 0.1rem 0 0;
}

/* ── Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--white);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid var(--border);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.10);
}

.stat-card--alert {
  border-color: #fde68a;
  background: #fffbeb;
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon--blue   { background: #dbeafe; color: #1d4ed8; }
.stat-icon--green  { background: #dcfce7; color: #15803d; }
.stat-icon--purple { background: #ede9fe; color: #7c3aed; }
.stat-icon--orange { background: #fef9c3; color: #a16207; }

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-soft);
  font-weight: 500;
}

/* ── Quick access */
.quick-access {
  background: var(--white);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--wine);
  margin: 0 0 1.25rem;
}

.quick-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.quick-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  background: var(--cream);
  border: 1.5px solid var(--border);
  color: var(--text);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.quick-card:hover {
  background: var(--rose-light);
  border-color: var(--rose);
  color: var(--wine);
  transform: translateY(-1px);
}

/* Avatar (reutilizado en header) */
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--wine);
  color: white;
  font-size: 1.15rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  margin-left: auto;
}

.badge-admin { background: #fce8e8; color: #b91c1c; }
.badge-pro   { background: #e8f0fc; color: #1c4bb9; }


/* ── Panel pendientes */
.pendientes-panel {
  background: var(--white);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  border: 1px solid var(--rose-light);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.panel-header h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--wine);
  margin: 0;
}

.badge-count {
  background: var(--wine);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 99px;
}

.panel-loading {
  text-align: center;
  color: var(--text-soft);
  font-size: 0.9rem;
  padding: 1rem 0;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 0;
  color: var(--text-soft);
}

.panel-empty p {
  font-size: 0.9rem;
  margin: 0;
}

/* ── Lista */
.pendientes-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0;
  margin: 0;
}

.pendiente-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--cream);
  border: 1px solid var(--border);
  gap: 1rem;
}

.pendiente-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.pendiente-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--rose-light);
  color: var(--wine);
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pendiente-email {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pendiente-fecha {
  font-size: 0.78rem;
  color: var(--text-soft);
  margin: 0;
}

.btn-aprobar {
  padding: 0.45rem 1rem;
  background: var(--wine);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-aprobar:hover:not(:disabled) { background: var(--wine-light); }
.btn-aprobar:disabled { opacity: 0.55; cursor: not-allowed; }

.spinner-sm {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>