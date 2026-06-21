<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPacientes, createPaciente, updatePaciente, deletePaciente } from '../../services/pacientesService'
import { getProfesionales } from '../../services/profesionalService'
import PacienteForm from './PacienteForm.vue'

const pacientes = ref([])
const profesionales = ref([])

// Variables reactivas para los filtros
const searchQuery = ref('')
const filterEstado = ref('')
const filterProfesional = ref('')

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    pacientes.value = await getPacientes()
    profesionales.value = await getProfesionales()
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
    const coincideEstado = filterEstado.value === '' || p.estado === filterEstado.value
    const coincideProf = filterProfesional.value === '' || 
      (filterProfesional.value === 'sin_asignar' && !p.profesional_id) ||
      (p.profesional_id == filterProfesional.value)

    return coincideTexto && coincideEstado && coincideProf
  })

  return filtrados.sort((a, b) => {
    if (a.estado === 'activo' && b.estado !== 'activo') return -1
    if (a.estado !== 'activo' && b.estado === 'activo') return 1

    const nombreA = `${a.nombre || ''} ${a.apellido || ''}`.toLowerCase()
    const nombreB = `${b.nombre || ''} ${b.apellido || ''}`.toLowerCase()

    return nombreA.localeCompare(nombreB)
  })
})



// Modal
const modalAbierto = ref(false)
const pacienteEditando = ref(null)
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
      <button class="btn-agregar" @click="abrirAgregar">+ Agregar paciente</button>
    </div>

    <div class="filters-bar">
      <div class="filter-group search-group">
        <input type="text" v-model="searchQuery" placeholder="🔍 Buscar por nombre o apellido..." />
      </div>
      
      <div class="filter-group">
        <select v-model="filterEstado">
          <option value="">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="derivado">Derivados</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div class="filter-group">
        <select v-model="filterProfesional">
          <option value="">Cualquier profesional</option>
          <option value="sin_asignar">Sin asignar</option>
          <option v-for="prof in profesionales" :key="prof.id" :value="prof.id">
            {{ prof.nombre }} {{ prof.apellido }}
          </option>
        </select>
      </div>
    </div>

    <div class="lista-pacientes">
      <div v-for="p in pacientesFiltrados" :key="p.id" class="list-item">
        
        <div class="card-avatar">{{ p.nombre.charAt(0) }}</div>
        
        <div class="card-body">
          <h3 class="card-nombre">{{ p.nombre || '' }} {{ p.apellido || '' }}</h3>
          <div class="card-info" v-if="p.profesional?.nombre">
            <span class="card-especialidad">{{ p.profesional.nombre }}</span>
          </div>
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
/* Lista Horizontal */
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
  align-items: center; /* Alinea todo al medio verticalmente */
  gap: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.list-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(139, 30, 63, 0.08);
}

.card-avatar {
  width: 45px; /* Un poco más chico para la lista */
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

/* El cuerpo toma el espacio disponible */
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
  margin: 0 0 0.25rem;
}

.card-especialidad {
  display: inline-block;
  background: #fdf0f3;
  color: #8b1e3f;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
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

/* Colores dinámicos para los estados */
.badge-estado.activo { background: #e8f8f5; color: #1abc9c; }
.badge-estado.inactivo { background: #fdecea; color: #e74c3c; }
.badge-estado.derivado { background: #fef9e7; color: #f39c12; }

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
</style>