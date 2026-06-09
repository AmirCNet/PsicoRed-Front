<script setup>
import { ref, onMounted } from 'vue'
import { getPacientes, createPaciente, updatePaciente, deletePaciente } from '../../services/pacientesService'
import PacienteForm from './PacienteForm.vue'

const pacientes = ref([])

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    pacientes.value = await getPacientes()
  } catch (err) {
    console.error('Error al obtener pacientes', err)
    alert(err.message || 'Error al obtener pacientes')
  }
})

// Modal
const modalAbierto = ref(false)
const pacienteEditando = ref(null)

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

const cargando = ref(false)

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

    <div class="grid">
      <div v-for="p in pacientes" :key="p.id" class="card">
        <div class="card-avatar">{{ p.nombre.charAt(0) }}</div>
        <div class="card-body">
          <h3 class="card-nombre">{{ p.nombre }}</h3>
        </div>
        <div class="card-actions">
          <button class="btn-editar" @click="abrirEditar(p)">Editar</button>
          <button class="btn-eliminar" @click="eliminar(p.id)">Eliminar</button>
        </div>
      </div>
    </div>

    <p v-if="pacientes.length === 0" class="empty-state">
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

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.card-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8b1e3f, #c0496a);
  color: white;
  font-size: 1.4rem;
  font-weight: 700;
  display: flex;
  align-items: center;
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
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  margin-bottom: 0.75rem;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #555;
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