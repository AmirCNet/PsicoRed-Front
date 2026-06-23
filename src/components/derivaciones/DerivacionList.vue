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
      // Validación en Frontend para evitar duplicaciones activas (pendiente o aceptada)
      const existeDuplicada = derivaciones.value.some(d => 
        d.paciente_id === datos.paciente_id && 
        d.profesional_id === datos.profesional_id && 
        ['pendiente', 'aceptada'].includes(d.estado)
      )
      if (existeDuplicada) {
        alert('Este paciente ya tiene una derivación pendiente o activa con el mismo profesional.')
        return
      }
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
  const date = new Date(iso)
  if (isNaN(date.getTime())) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
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

    <!-- Lista de Derivaciones en Formato Fila Horizontal -->
    <div class="lista-derivaciones">
      <div v-for="d in derivacionesFiltradas" :key="d.id" class="derivacion-item" :class="d.estado">
        
        <div class="derivacion-paciente">
          <div class="card-avatar">{{ inicialPaciente(d) }}</div>
          <div class="nombre-box">
            <span class="label-seccion">Paciente</span>
            <strong class="paciente-nombre">{{ nombrePaciente(d) }}</strong>
          </div>
        </div>

        <div class="derivacion-profesional">
          <div class="nombre-box">
            <span class="label-seccion">Profesional Destino</span>
            <strong>{{ nombreProfesional(d) }}</strong>
          </div>
        </div>

        <div class="derivacion-meta">
          <div class="nombre-box">
            <span class="label-seccion">Fecha Derivación</span>
            <span>{{ formatFecha(d.creado_en) }}</span>
          </div>
        </div>

        <div class="derivacion-motivo" v-if="d.motivo">
          <span class="label-seccion">Motivo</span>
          <span class="motivo-texto" :title="d.motivo">{{ d.motivo }}</span>
        </div>

        <div class="derivacion-status">
          <span class="badge-estado" :class="estadoClase(d.estado)">
            {{ estadoLabel(d.estado) }}
          </span>
        </div>

        <div class="derivacion-actions">
          <button class="btn-icon btn-editar" @click="abrirEditar(d)" title="Editar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          
          <button class="btn-icon btn-eliminar" @click="eliminar(d.id)" title="Eliminar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
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

/* Layout List (Row design matching pacients & turnos) */
.lista-derivaciones {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.derivacion-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 5px solid #8b1e3f;
}

/* Border colors according to status */
.derivacion-item.pendiente { border-left-color: #f1c40f; }
.derivacion-item.aceptada { border-left-color: #2ecc71; }
.derivacion-item.rechazada { border-left-color: #e74c3c; }
.derivacion-item.completada { border-left-color: #3498db; }

.derivacion-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(139, 30, 63, 0.08);
}

.derivacion-paciente {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 220px;
  flex-shrink: 0;
}

.card-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b1e3f, #c0496a);
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nombre-box {
  display: flex;
  flex-direction: column;
}

.label-seccion {
  font-size: 0.72rem;
  color: #888;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 0.15rem;
}

.derivacion-profesional {
  width: 220px;
  flex-shrink: 0;
}

.derivacion-meta {
  width: 140px;
  flex-shrink: 0;
}

.derivacion-motivo {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.motivo-texto {
  font-size: 0.9rem;
  color: #555;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-style: italic;
}

.derivacion-status {
  width: 110px;
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

/* Badges */
.badge-estado {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  letter-spacing: 0.05em;
}

.badge-pendiente { background: #fef9e7; color: #f1c40f; }
.badge-aceptada { background: #eafaf1; color: #2ecc71; }
.badge-rechazada { background: #fdedec; color: #e74c3c; }
.badge-completada { background: #e8f4fd; color: #3498db; }

.derivacion-actions {
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

.btn-eliminar { background: #fdecea; color: #c0392b; }
.btn-eliminar:hover { background: #f5b7b1; color: #a93226; }

.empty-state {
  text-align: center;
  color: #999;
  margin-top: 3rem;
  font-size: 1rem;
}
</style>
