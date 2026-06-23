<script setup>
import { ref, watch, onMounted } from 'vue'
import { getPacientes } from '../../services/pacientesService'
import { getProfesionales, getMiPerfil } from '../../services/profesionalService'
import { getUsuario } from '../../services/authService'
import { getDerivaciones } from '../../services/derivacionesService'

const props = defineProps({
  turno: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['guardar', 'cerrar'])

const esAdmin = ref(getUsuario()?.rol === 'administrador')
const pacientes = ref([])
const profesionales = ref([])
const profesionalesFiltrados = ref([])
const miPerfil = ref(null)
const derivaciones = ref([])
const loading = ref(true)

// Separate date and time parts for cleaner UI selection
const fechaPart = ref('')
const horaPart = ref('')

const form = ref({
  paciente_id: '',
  profesional_id: '',
  duracion_minutos: 50,
  estado: 'programado',
  notas_sesion: ''
})

watch(
  () => props.turno,
  (val) => {
    if (val) {
      // Split ISO string to local Date and Time parts
      const d = new Date(val.fecha_hora)
      const pad = (num) => String(num).padStart(2, '0')
      fechaPart.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      horaPart.value = `${pad(d.getHours())}:${pad(d.getMinutes())}`

      // Assign only writeable fields to form, stripping out joined relations like creado_por_usuario, paciente, etc.
      form.value = {
        paciente_id: val.paciente_id,
        profesional_id: val.profesional_id,
        duracion_minutos: val.duracion_minutos,
        estado: val.estado,
        notas_sesion: val.notas_sesion || ''
      }
    } else {
      fechaPart.value = ''
      horaPart.value = ''
      form.value = {
        paciente_id: '',
        profesional_id: esAdmin.value ? '' : (miPerfil.value?.id || ''),
        duracion_minutos: 50,
        estado: 'programado',
        notas_sesion: ''
      }
    }
  },
  { immediate: true }
)

// Watch patient selection to filter professionals based on accepted derivations
watch(
  () => form.value.paciente_id,
  (newPacienteId) => {
    if (!esAdmin.value && !props.turno) return // If not admin and not editing, professional is locked to miPerfil
    if (loading.value) return // Exit early if initial data is still loading
    
    if (!newPacienteId) {
      profesionalesFiltrados.value = []
      return
    }
    
    // Find professionals that have an accepted derivation for this patient
    const derivsPaciente = derivaciones.value.filter(d => d.paciente_id === newPacienteId)
    const profIds = derivsPaciente.map(d => d.profesional_id)
    
    profesionalesFiltrados.value = profesionales.value.filter(p => profIds.includes(p.id))
    
    // Auto-select professional if there is only one
    if (profesionalesFiltrados.value.length === 1) {
      form.value.profesional_id = profesionalesFiltrados.value[0].id
    } else if (!profIds.includes(form.value.profesional_id)) {
      form.value.profesional_id = ''
    }
  }
)

onMounted(async () => {
  try {
    loading.value = true
    // 1. Fetch all accepted derivations
    const allDerivs = await getDerivaciones({ estado: 'aceptada' })
    derivaciones.value = allDerivs

    // Fetch all professionals (needed by both admin and professional in edit mode)
    profesionales.value = await getProfesionales()

    if (esAdmin.value) {
      // Admin sees all patients who have at least one accepted derivation
      const uniquePatients = []
      const seenIds = new Set()
      for (const d of allDerivs) {
        if (d.paciente && !seenIds.has(d.paciente.id)) {
          seenIds.add(d.paciente.id)
          uniquePatients.push(d.paciente)
        }
      }
      pacientes.value = uniquePatients
    } else {
      miPerfil.value = await getMiPerfil()
      if (miPerfil.value) {
        if (!form.value.profesional_id) {
          form.value.profesional_id = miPerfil.value.id
        }
        
        // Professional only sees patients derived to them (accepted derivations)
        const uniquePatients = []
        const seenIds = new Set()
        const misDerivs = allDerivs.filter(d => d.profesional_id === miPerfil.value.id)
        for (const d of misDerivs) {
          if (d.paciente && !seenIds.has(d.paciente.id)) {
            seenIds.add(d.paciente.id)
            uniquePatients.push(d.paciente)
          }
        }
        pacientes.value = uniquePatients
      }
    }

    // Pre-filter professionals for edit mode if patient is already selected (for both admin and professional)
    if (form.value.paciente_id) {
      const derivsPaciente = allDerivs.filter(d => d.paciente_id === form.value.paciente_id)
      const profIds = derivsPaciente.map(d => d.profesional_id)
      profesionalesFiltrados.value = profesionales.value.filter(p => profIds.includes(p.id))
    }
  } catch (err) {
    console.error('Error al cargar datos del formulario de turnos:', err)
  } finally {
    loading.value = false
  }
})

const formValido = () => {
  return form.value.paciente_id && form.value.profesional_id && fechaPart.value && horaPart.value && form.value.duracion_minutos > 0
}

const guardar = () => {
  if (!formValido()) {
    alert('Por favor complete todos los campos obligatorios.')
    return
  }

  // Combine the date and time strings into a single Date object
  const dateObj = new Date(`${fechaPart.value}T${horaPart.value}`)
  if (isNaN(dateObj.getTime())) {
    alert('La fecha u hora ingresada no es válida.')
    return
  }

  const datos = {
    paciente_id: form.value.paciente_id,
    profesional_id: form.value.profesional_id,
    fecha_hora: dateObj.toISOString(),
    duracion_minutos: form.value.duracion_minutos,
    estado: form.value.estado,
    notas_sesion: form.value.notas_sesion
  }

  emit('guardar', datos)
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('cerrar')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ turno ? 'Modificar Turno' : 'Programar Turno' }}</h2>
        <button class="btn-cerrar" @click="emit('cerrar')">✕</button>
      </div>

      <form class="modal-body" @submit.prevent="guardar">
        <div class="campo">
          <label>Paciente *</label>
          <select v-model="form.paciente_id" required :disabled="turno">
            <option value="" disabled>Seleccione un paciente</option>
            <option v-for="pac in pacientes" :key="pac.id" :value="pac.id">
              {{ pac.nombre }} {{ pac.apellido }}
            </option>
          </select>
          <p v-if="pacientes.length === 0" class="campo-ayuda">
            No tenés pacientes asignados con derivación aceptada.
          </p>
        </div>

        <div class="campo" v-if="esAdmin || (turno && profesionalesFiltrados.length > 1)">
          <label>Profesional *</label>
          <select v-model="form.profesional_id" required :disabled="(turno && turno.estado !== 'programado') || !form.paciente_id">
            <option value="" disabled>
              {{ form.paciente_id ? 'Seleccione un profesional' : 'Primero seleccione un paciente' }}
            </option>
            <option v-for="prof in profesionalesFiltrados" :key="prof.id" :value="prof.id">
              {{ prof.nombre }} {{ prof.apellido }}
            </option>
          </select>
          <p v-if="form.paciente_id && profesionalesFiltrados.length === 0" class="campo-ayuda error">
            Este paciente no tiene profesionales asignados con derivación aceptada.
          </p>
        </div>

        <div class="campo-datetime-row">
          <div class="campo">
            <label>Fecha *</label>
            <input v-model="fechaPart" type="date" required />
          </div>
          <div class="campo">
            <label>Hora *</label>
            <input v-model="horaPart" type="time" required />
          </div>
        </div>

        <div class="campo">
          <label>Duración (minutos) *</label>
          <input v-model.number="form.duracion_minutos" type="number" min="1" required />
        </div>

        <div class="campo">
          <label>Estado</label>
          <select v-model="form.estado">
            <option value="programado">Programado</option>
            <option value="completado">Completado</option>
            <option value="cancelado">Cancelado</option>
            <option value="ausente">Ausente</option>
          </select>
        </div>

        <div class="campo">
          <label>Notas de Sesión</label>
          <textarea v-model="form.notas_sesion" placeholder="Escriba las observaciones o evolución de la sesión..." rows="4"></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn-guardar" :disabled="!formValido()">
            {{ turno ? 'Guardar Cambios' : 'Programar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
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
  max-width: 650px;
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

.modal-body {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.campo:has(textarea) {
  grid-column: 1 / -1;
}

.campo-datetime-row {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.campo label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.campo input,
.campo select,
.campo textarea {
  border: 1.5px solid #e5d6db;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 0.95rem;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s;
  background-color: white;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus {
  border-color: #8b1e3f;
}

.campo-ayuda {
  font-size: 0.75rem;
  color: #777;
  margin: 0.15rem 0 0;
}

.campo-ayuda.error {
  color: #c0392b;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
  grid-column: 1 / -1;
  padding-top: 1rem;
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

.btn-guardar {
  background: #8b1e3f;
  color: white;
  border: none;
  padding: 0.55rem 1.3rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-guardar:hover:not(:disabled) {
  background: #6e1832;
}

.btn-guardar:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
