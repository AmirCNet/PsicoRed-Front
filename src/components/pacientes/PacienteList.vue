<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPacientes, createPaciente, updatePaciente, deletePaciente } from '../../services/pacientesService'
import { getUsuario } from '../../services/authService'
import PacienteForm from './PacienteForm.vue'

const pacientes = ref([])
const esAdmin = ref(getUsuario()?.rol === 'administrador')

// Variables reactivas para los filtros
const searchQuery = ref('')
const filterEstado = ref('')

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    pacientes.value = await getPacientes()
  } catch (err) {
    console.error('Error al obtener pacientes', err)
    alert(err.message || 'Error al obtener pacientes')
  }
})

// Lógica de filtrado y ordenamiento reactiva
const pacientesFiltrados = computed(() => {
  const filtrados = pacientes.value.filter(p => {
    const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase()
    const coincideTexto = nombreCompleto.includes(searchQuery.value.toLowerCase())
    const estadoDB = (p.estado || '').toLowerCase() 
    const coincideEstado = filterEstado.value === '' || estadoDB === filterEstado.value

    return coincideTexto && coincideEstado
  })

  return filtrados.sort((a, b) => {
    if (a.estado === 'activo' && b.estado !== 'activo') return -1
    if (a.estado !== 'activo' && b.estado === 'activo') return 1

    const nombreA = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase()
    const nombreB = `${b.nombre || ''} ${b.apellido || ''}`.toLowerCase()

    return nombreA.localeCompare(nombreB)
  })
})

// Modales
const modalAbierto = ref(false)
const pacienteEditando = ref(null)
const modalDetallesAbierto = ref(false)
const pacienteDetalle = ref(null)
const cargando = ref(false)

const abrirAgregar = () => {
  pacienteEditando.value = null
  modalAbierto.value = true
}

const abrirEditar = (paciente) => {
  pacienteEditando.value = { ...paciente }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  pacienteEditando.value = null
}

const abrirDetalles = (paciente) => {
  pacienteDetalle.value = paciente
  modalDetallesAbierto.value = true
}

const cerrarDetalles = () => {
  modalDetallesAbierto.value = false
  pacienteDetalle.value = null
}

const guardar = async (datos) => {
  try {
    cargando.value = true
    if (pacienteEditando.value) {
      await updatePaciente(pacienteEditando.value.id, datos)
    } else {
      await createPaciente(datos)
    }
    pacientes.value = await getPacientes()
    cerrarModal()
  } catch (err) {
    console.error('Error al guardar paciente', err)
    alert(err.message || 'Error al guardar paciente')
  } finally {
    cargando.value = false
  }
}

const eliminar = async (id) => {
  if (!confirm('¿Seguro que querés eliminar este paciente?')) return
  try {
    cargando.value = true
    await deletePaciente(id)
    pacientes.value = await getPacientes()
  } catch (err) {
    console.error('Error al eliminar paciente', err)
    alert(err.message || 'Error al eliminar paciente')
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="pacientes-page">
    <div class="page-header">
      <h1>Gestión de Pacientes</h1>
      <button class="btn-agregar" @click="abrirAgregar" v-if="esAdmin">+ Agregar paciente</button>
    </div>

    <div class="filters-bar">
      <div class="filter-group search-group">
        <input type="text" v-model="searchQuery" placeholder="🔍 Buscar por nombre o apellido..." />
      </div>
      
      <div class="filter-group">
        <select v-model="filterEstado">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="alta">Alta</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
    </div>

    <div class="lista-pacientes">
      <div v-for="p in pacientesFiltrados" :key="p.id" class="list-item">
        
        <div class="card-avatar">{{ p.nombre.charAt(0) }}</div>
        
        <div class="card-body">
          <h3 class="card-nombre">
            {{ p.nombre || '' }} {{ p.apellido || '' }}
            <button type="button" class="btn-info-inline" @click.stop="abrirDetalles(p)" title="Ver detalle">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="info-svg">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
          </h3>
        </div>

        <div class="card-estado">
          <span :class="['badge-estado', p.estado]">
            {{ p.estado.charAt(0).toUpperCase() + p.estado.slice(1) }}
          </span>
        </div>

        <div class="card-actions">
          <button class="btn-icon btn-editar" @click="abrirEditar(p)" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          
          <button class="btn-icon btn-eliminar" @click="eliminar(p.id)" title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>

      </div>
    </div>

    <p v-if="pacientesFiltrados.length === 0" class="empty-state">
      No hay pacientes registrados.
    </p>

    <!-- Modal agregar / editar -->
    <PacienteForm v-if="modalAbierto" :paciente="pacienteEditando" @guardar="guardar" @cerrar="cerrarModal" />

    <!-- Modal de Detalles -->
    <div v-if="modalDetallesAbierto && pacienteDetalle" class="modal-backdrop" @click.self="cerrarDetalles">
      <div class="modal detalle-modal">
        <div class="modal-header">
          <h2>Detalles del Paciente</h2>
          <button class="btn-cerrar" @click="cerrarDetalles">✕</button>
        </div>
        <div class="modal-body detalle-body">
          <div class="detalle-campo">
            <label>Nombre Completo</label>
            <p>{{ pacienteDetalle.nombre }} {{ pacienteDetalle.apellido }}</p>
          </div>
          <div class="detalle-campo">
            <label>Email</label>
            <p>{{ pacienteDetalle.email || 'No registrado' }}</p>
          </div>
          <div class="detalle-campo">
            <label>Teléfono</label>
            <p>{{ pacienteDetalle.telefono || 'No registrado' }}</p>
          </div>
          <div class="detalle-campo">
            <label>Fecha de nacimiento</label>
            <p>{{ pacienteDetalle.fecha_nacimiento || 'No registrada' }}</p>
          </div>
          <div class="detalle-campo full-width">
            <label>Motivo de Consulta</label>
            <p class="detalle-text">{{ pacienteDetalle.motivo_consulta || 'Sin motivo registrado' }}</p>
          </div>
          <div class="detalle-campo">
            <label>Estado</label>
            <p>
              <span :class="['badge-estado', pacienteDetalle.estado]">
                {{ pacienteDetalle.estado.charAt(0).toUpperCase() + pacienteDetalle.estado.slice(1) }}
              </span>
            </p>
          </div>
          <div class="detalle-campo full-width">
            <label>Notas Particulares</label>
            <p class="detalle-text">{{ pacienteDetalle.notas || 'Sin notas particulares' }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancelar" @click="cerrarDetalles">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pacientes-page {
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

/* Barra de Filtros */
.filters-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  align-items: center;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.search-group {
  flex: 1; 
}

.filters-bar input,
.filters-bar select {
  border: 1.5px solid #e5d6db;
  border-radius: 8px;
  padding: 0.65rem 1rem;
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
    flex-direction: column;
  }
  .filter-group {
    width: 100%;
  }
}

/* Grid */
.lista-pacientes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Fila individual */
.list-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(139, 30, 63, 0.08);
}

.card-avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b1e3f, #c0496a);
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-nombre {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-info-inline {
  background: none;
  border: none;
  color: #8b1e3f;
  cursor: pointer;
  padding: 0 0.25rem;
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  transition: color 0.2s, transform 0.2s;
}

.btn-info-inline:hover {
  color: #c0496a;
  transform: scale(1.15);
}

.info-svg {
  stroke: currentColor;
}

/* Estado del paciente */
.card-estado {
  width: 100px;
  text-align: center;
}

.badge-estado {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
}

.badge-estado.activo { background: #e8f8f5; color: #1abc9c; }
.badge-estado.inactivo { background: #fdecea; color: #e74c3c; }
.badge-estado.alta { background: #e4d7eb; color: #7909b1; }

/* Botones Iconos */
.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0;
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

.btn-eliminar { background: #fdecea; color: #c0392b; }
.btn-eliminar:hover { background: #f5b7b1; color: #a93226; }

/* Modal styles (shared with PacienteForm but adapted for details) */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 900px;
  margin: 1rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f0e6ea;
}

.modal-header h2 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1rem;
  color: #888;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}

.btn-cerrar:hover {
  background: #fdf0f3;
  color: #8b1e3f;
}

.detalle-modal {
  max-width: 600px;
}

.detalle-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.detalle-campo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detalle-campo.full-width {
  grid-column: 1 / -1;
}

.detalle-campo label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detalle-campo p {
  font-size: 0.95rem;
  color: #1a1a2e;
  margin: 0;
  font-weight: 500;
}

.detalle-text {
  background: #fdfafb;
  border: 1px solid #f0e6ea;
  border-radius: 8px;
  padding: 0.75rem;
  white-space: pre-wrap;
  min-height: 50px;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f0e6ea;
}

.btn-cancelar {
  background: #f0f0f0;
  color: #555;
  border: none;
  padding: 0.55rem 1.1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancelar:hover {
  background: #e0e0e0;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1rem;
}
</style>