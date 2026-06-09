<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getDerivaciones,
  createDerivacion,
  updateDerivacion,
  deleteDerivacion
} from '../../services/derivacionesService'
import DerivacionForm from './DerivacionForm.vue'

const derivaciones = ref([])
const filtroEstado = ref('todos')

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    derivaciones.value = await getDerivaciones()
  } catch (err) {
    console.error('Error al obtener derivaciones', err)
    alert(err.message || 'Error al obtener derivaciones')
  }
})

// Derivaciones filtradas por estado
const derivacionesFiltradas = computed(() => {
  if (filtroEstado.value === 'todos') return derivaciones.value
  return derivaciones.value.filter(d => d.estado === filtroEstado.value)
})

// Modal
const modalAbierto = ref(false)
const derivacionEditando = ref(null)

const abrirAgregar = () => {
  derivacionEditando.value = null
  modalAbierto.value = true
}

const abrirEditar = (derivacion) => {
  derivacionEditando.value = { ...derivacion }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  derivacionEditando.value = null
}

const cargando = ref(false)

const guardar = async (datos) => {
  try {
    cargando.value = true
    if (derivacionEditando.value) {
      await updateDerivacion(derivacionEditando.value.id, datos)
    } else {
      await createDerivacion(datos)
    }
    derivaciones.value = await getDerivaciones()
    cerrarModal()
  } catch (err) {
    console.error('Error al guardar derivación', err)
    alert(err.message || 'Error al guardar derivación')
  } finally {
    cargando.value = false
  }
}

const eliminar = async (id) => {
  if (!confirm('¿Seguro que querés eliminar esta derivación?')) return
  try {
    cargando.value = true
    await deleteDerivacion(id)
    derivaciones.value = await getDerivaciones()
  } catch (err) {
    console.error('Error al eliminar derivación', err)
    alert(err.message || 'Error al eliminar derivación')
  } finally {
    cargando.value = false
  }
}

// Helpers
const nombrePaciente = (d) => {
  if (d.paciente) return `${d.paciente.nombre} ${d.paciente.apellido}`
  return 'Paciente desconocido'
}

const nombreProfesional = (d) => {
  if (d.profesional) return `${d.profesional.nombre} ${d.profesional.apellido}`
  return 'Profesional desconocido'
}

const inicialPaciente = (d) => {
  if (d.paciente) return d.paciente.nombre.charAt(0)
  return '?'
}

const formatFecha = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const estadoClase = (estado) => {
  const mapa = {
    pendiente: 'badge-pendiente',
    aceptada: 'badge-aceptada',
    rechazada: 'badge-rechazada',
    completada: 'badge-completada'
  }
  return mapa[estado] || ''
}

const estadoLabel = (estado) => {
  return estado ? estado.charAt(0).toUpperCase() + estado.slice(1) : ''
}
</script>

<template>
  <div class="derivaciones-page">
    <div class="page-header">
      <h1>Gestión de Derivaciones</h1>
      <div class="header-actions">
        <select v-model="filtroEstado" class="filtro-estado">
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
          <option value="completada">Completada</option>
        </select>
        <button class="btn-agregar" @click="abrirAgregar">+ Nueva derivación</button>
      </div>
    </div>

    <div class="grid">
      <div v-for="d in derivacionesFiltradas" :key="d.id" class="card">
        <div class="card-top">
          <div class="card-avatar">{{ inicialPaciente(d) }}</div>
          <span class="badge-estado" :class="estadoClase(d.estado)">
            {{ estadoLabel(d.estado) }}
          </span>
        </div>

        <div class="card-body">
          <h3 class="card-nombre">{{ nombrePaciente(d) }}</h3>

          <div class="card-info">
            <div class="info-row">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>{{ nombreProfesional(d) }}</span>
            </div>

            <div class="info-row">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>{{ formatFecha(d.creado_en) }}</span>
            </div>
          </div>

          <p v-if="d.motivo" class="card-motivo">{{ d.motivo }}</p>
        </div>

        <div class="card-actions">
          <button class="btn-editar" @click="abrirEditar(d)">Editar</button>
          <button class="btn-eliminar" @click="eliminar(d.id)">Eliminar</button>
        </div>
      </div>
    </div>

    <p v-if="derivacionesFiltradas.length === 0" class="empty-state">
      No hay derivaciones{{ filtroEstado !== 'todos' ? ` con estado "${filtroEstado}"` : '' }}.
    </p>

    <!-- Modal agregar / editar -->
    <DerivacionForm
      v-if="modalAbierto"
      :derivacion="derivacionEditando"
      @guardar="guardar"
      @cerrar="cerrarModal"
    />
  </div>
</template>

<style scoped>
.derivaciones-page {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a2e;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filtro-estado {
  border: 1.5px solid #e5d6db;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 0.9rem;
  color: #1a1a2e;
  outline: none;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.filtro-estado:focus {
  border-color: #8b1e3f;
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

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

/* Card */
.card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(139, 30, 63, 0.12);
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b1e3f, #c0496a);
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Badges de estado */
.badge-estado {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: capitalize;
}

.badge-pendiente {
  background: #fef3c7;
  color: #92400e;
}

.badge-aceptada {
  background: #d1fae5;
  color: #065f46;
}

.badge-rechazada {
  background: #fee2e2;
  color: #991b1b;
}

.badge-completada {
  background: #dbeafe;
  color: #1e40af;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-nombre {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #666;
}

.info-row svg {
  color: #999;
  flex-shrink: 0;
}

.card-motivo {
  font-size: 0.85rem;
  color: #555;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  background: #faf5f0;
  padding: 0.5rem 0.7rem;
  border-radius: 8px;
  border-left: 3px solid #e5d6db;
}

.card-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
}

.btn-editar,
.btn-eliminar {
  flex: 1;
  padding: 0.45rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;
}

.btn-editar {
  background: #f0f0f0;
  color: #333;
}

.btn-editar:hover {
  background: #e0e0e0;
}

.btn-eliminar {
  background: #fdecea;
  color: #c0392b;
}

.btn-eliminar:hover {
  background: #f5b7b1;
}

.empty-state {
  text-align: center;
  color: #999;
  margin-top: 3rem;
  font-size: 1rem;
}
</style>
