<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTurnos, createTurno, updateTurno, cancelarTurno } from '../../services/turnosService'
import { getUsuario } from '../../services/authService'
import TurnoForm from './TurnoForm.vue'

const turnos = ref([])
const cargando = ref(true)
const esAdmin = ref(getUsuario()?.rol === 'administrador')

// Filters
const filterEstado = ref('')
const filterPaciente = ref('')
const filterFechaDesde = ref('')
const filterFechaHasta = ref('')

const cargarTurnos = async () => {
  try {
    cargando.value = true
    const filters = {}
    if (filterEstado.value) filters.estado = filterEstado.value
    if (filterFechaDesde.value) filters.fecha_desde = new Date(filterFechaDesde.value).toISOString()
    if (filterFechaHasta.value) filters.fecha_hasta = new Date(filterFechaHasta.value).toISOString()
    
    // Si es profesional y no es admin, filtramos por su propio id?
    // El backend maneja la query. En el servicio, getTurnos le pasa los filtros.
    // Dejemos que el backend responda con todos los turnos correspondientes.
    
    turnos.value = await getTurnos(filters)
  } catch (err) {
    console.error('Error al obtener turnos:', err)
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  await cargarTurnos()
})

// Client-side text filter on patient name
const turnosFiltrados = computed(() => {
  return turnos.value.filter(t => {
    if (!filterPaciente.value) return true
    const query = filterPaciente.value.toLowerCase()
    const nombrePaciente = `${t.paciente?.nombre || ''} ${t.paciente?.apellido || ''}`.toLowerCase()
    return nombrePaciente.includes(query)
  })
})

// Modals
const modalAbierto = ref(false)
const turnoEditando = ref(null)

const abrirAgregar = () => {
  turnoEditando.value = null
  modalAbierto.value = true
}

const abrirEditar = (turno) => {
  turnoEditando.value = { ...turno }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  turnoEditando.value = null
}

const guardar = async (datos) => {
  try {
    if (turnoEditando.value) {
      await updateTurno(turnoEditando.value.id, datos)
    } else {
      await createTurno(datos)
    }
    await cargarTurnos()
    cerrarModal()
  } catch (err) {
    console.error('Error al guardar turno:', err)
    alert(err.message || 'Error al guardar turno')
  }
}

const cancelar = async (id) => {
  if (!confirm('¿Seguro que querés cancelar este turno?')) return
  try {
    await cancelarTurno(id)
    await cargarTurnos()
  } catch (err) {
    console.error('Error al cancelar turno:', err)
    alert(err.message || 'Error al cancelar turno')
  }
}

// Helpers
const formatFechaHora = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const format = date.toLocaleString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
  return format.charAt(0).toUpperCase() + format.slice(1) + ' hs'
}
</script>

<template>
  <div class="turnos-page">
    <div class="page-header">
      <h1>Agenda y Turnos</h1>
      <button class="btn-agregar" @click="abrirAgregar">+ Programar Turno</button>
    </div>

    <!-- Barra de Filtros -->
    <div class="filters-bar">
      <div class="filter-group search-group">
        <label>Buscar Paciente</label>
        <input type="text" v-model="filterPaciente" placeholder="🔍 Nombre o apellido..." />
      </div>

      <div class="filter-group">
        <label>Estado</label>
        <select v-model="filterEstado" @change="cargarTurnos">
          <option value="">Todos</option>
          <option value="programado">Programados</option>
          <option value="completado">Completados</option>
          <option value="cancelado">Cancelados</option>
          <option value="ausente">Ausentes</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Desde</label>
        <input type="date" v-model="filterFechaDesde" @change="cargarTurnos" />
      </div>

      <div class="filter-group">
        <label>Hasta</label>
        <input type="date" v-model="filterFechaHasta" @change="cargarTurnos" />
      </div>
    </div>

    <!-- Lista de Turnos -->
    <div v-if="cargando" class="loading-state">
      Cargando turnos…
    </div>

    <div v-else class="lista-turnos">
      <div v-for="t in turnosFiltrados" :key="t.id" class="turno-item" :class="t.estado">
        <div class="turno-time">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="time-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span class="fecha-texto">{{ formatFechaHora(t.fecha_hora) }}</span>
          <span class="duracion">({{ t.duracion_minutos }} min)</span>
        </div>

        <div class="turno-info">
          <div class="paciente-nombre">
            <span class="label">Paciente:</span>
            <strong>{{ t.paciente?.nombre }} {{ t.paciente?.apellido }}</strong>
          </div>
          <div class="profesional-nombre" v-if="esAdmin || t.profesional">
            <span class="label">Profesional:</span>
            <span>{{ t.profesional?.nombre }} {{ t.profesional?.apellido }}</span>
          </div>
          <div v-if="t.notas_sesion" class="turno-notas">
            <span class="label">Notas:</span>
            <span class="notas-texto">{{ t.notas_sesion }}</span>
          </div>
        </div>

        <div class="turno-status">
          <span :class="['badge-estado', t.estado]">
            {{ t.estado }}
          </span>
        </div>

        <div class="turno-actions">
          <button class="btn-icon btn-editar" @click="abrirEditar(t)" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>

          <button v-if="t.estado !== 'cancelado'" class="btn-icon btn-cancelar-turno" @click="cancelar(t.id)" title="Cancelar Turno">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line></svg>
          </button>
        </div>
      </div>

      <p v-if="turnosFiltrados.length === 0" class="empty-state">
        No hay turnos programados que coincidan con la búsqueda.
      </p>
    </div>

    <!-- Modal agregar / editar -->
    <TurnoForm v-if="modalAbierto" :turno="turnoEditando" @guardar="guardar" @cerrar="cerrarModal" />
  </div>
</template>

<style scoped>
.turnos-page {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.btn-agregar {
  background: #8b1e3f;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-agregar:hover {
  background: #6e1832;
}

/* Filtros */
.filters-bar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-group label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filters-bar input,
.filters-bar select {
  border: 1.5px solid #e5d6db;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 0.95rem;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s;
  background-color: white;
}

.filters-bar input:focus,
.filters-bar select:focus {
  border-color: #8b1e3f;
}

@media (max-width: 768px) {
  .filters-bar {
    grid-template-columns: 1fr;
  }
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1rem;
}

/* Lista de Turnos */
.lista-turnos {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.turno-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 5px solid #8b1e3f; /* Color por defecto */
}

/* Colores de bordes según estado */
.turno-item.programado { border-left-color: #3498db; }
.turno-item.completado { border-left-color: #2ecc71; }
.turno-item.cancelado { border-left-color: #95a5a6; opacity: 0.7; }
.turno-item.ausente { border-left-color: #e74c3c; }

.turno-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(139, 30, 63, 0.08);
}

.turno-time {
  display: flex;
  flex-direction: column;
  width: 200px;
  gap: 0.25rem;
  flex-shrink: 0;
}

.time-icon {
  color: #888;
  margin-bottom: 0.2rem;
}

.fecha-texto {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a1a2e;
}

.duracion {
  font-size: 0.8rem;
  color: #666;
}

.turno-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.turno-info div {
  font-size: 0.95rem;
}

.label {
  font-size: 0.8rem;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  margin-right: 0.5rem;
}

.turno-notas {
  margin-top: 0.25rem;
  background: #fdfafa;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #f2e7eb;
}

.notas-texto {
  font-style: italic;
  color: #555;
  font-size: 0.85rem;
}

.turno-status {
  width: 120px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.badge-estado {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.05em;
}

.badge-estado.programado { background: #e8f4fd; color: #3498db; }
.badge-estado.completado { background: #eafaf1; color: #2ecc71; }
.badge-estado.cancelado { background: #f2f4f4; color: #95a5a6; }
.badge-estado.ausente { background: #fdedec; color: #e74c3c; }

.turno-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-editar { background: #f0f0f0; color: #555; }
.btn-editar:hover { background: #e0e0e0; color: #1a1a2e; }

.btn-cancelar-turno { background: #fdecea; color: #c0392b; }
.btn-cancelar-turno:hover { background: #f5b7b1; color: #a93226; }

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1rem;
}
</style>
