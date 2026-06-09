<template>
  <div class="dashboard">
    <div class="dashboard-card">
      <div class="avatar">
        {{ iniciales }}
      </div>
      <h1>¡Bienvenido/a!</h1>
      <p class="email">{{ authStore.usuario?.email }}</p>
      <span class="badge" :class="authStore.esAdmin ? 'badge-admin' : 'badge-pro'">
        {{ authStore.esAdmin ? 'Administrador' : 'Profesional' }}
      </span>
      <p class="msg">Ingresaste correctamente al sistema.</p>
    </div>

    <!-- Panel de pendientes: solo visible para el administrador -->
    <div v-if="authStore.esAdmin" class="pendientes-panel">
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
        <span v-if="pendientes.length" class="badge-count">{{ pendientes.length }}</span>
      </div>

      <!-- Cargando -->
      <div v-if="cargando" class="panel-loading">Cargando...</div>

      <!-- Sin pendientes -->
      <div v-else-if="pendientes.length === 0" class="panel-empty">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <p>No hay usuarios pendientes de aprobación.</p>
      </div>

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
import { getPendientes, aprobarUsuario } from '../services/usuariosService'

const authStore = useAuthStore()

const iniciales = computed(() => {
  const email = authStore.usuario?.email ?? ''
  return email.slice(0, 2).toUpperCase()
})

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
  } catch (err) {
    console.error('Error al aprobar usuario:', err)
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

onMounted(cargarPendientes)
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: var(--cream);
  padding: 2rem;
}

.dashboard-card {
  background: var(--white);
  border-radius: 16px;
  padding: 2.5rem 3rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  min-width: 300px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--wine);
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

h1 {
  font-size: 1.6rem;
  color: var(--wine);
  margin: 0;
}

.email {
  color: var(--text-soft);
  font-size: 0.9rem;
  margin: 0;
}

.msg {
  color: var(--text-soft);
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-admin { background: #fce8e8; color: #b91c1c; }
.badge-pro   { background: #e8f0fc; color: #1c4bb9; }


/* ── Panel pendientes */
.pendientes-panel {
  background: var(--white);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 560px;
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