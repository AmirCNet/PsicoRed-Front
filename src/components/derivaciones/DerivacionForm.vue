<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { getPacientes } from '../../services/pacientesService'
import { getProfesionales } from '../../services/profesionalService'

const props = defineProps({
  derivacion: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['guardar', 'cerrar'])

const form = ref({
  paciente_id: '',
  profesional_id: '',
  motivo: '',
  estado: 'pendiente',
  notas: ''
})

const pacientes = ref([])
const profesionales = ref([])
const cargandoDatos = ref(true)

const formEl = ref(null)

const autoResize = (e) => {
  const ta = e.target
  ta.style.height = 'auto'
  ta.style.height = (ta.scrollHeight) + 'px'
}

const adjustAllTextareas = () => {
  if (!formEl.value) return
  const tas = formEl.value.querySelectorAll('textarea')
  tas.forEach((ta) => {
    ta.style.height = 'auto'
    ta.style.height = (ta.scrollHeight) + 'px'
  })
}

// Cargar listas de pacientes y profesionales para los selects
onMounted(async () => {
  try {
    const [pacs, profs] = await Promise.all([
      getPacientes(),
      getProfesionales()
    ])
    pacientes.value = pacs
    profesionales.value = profs
  } catch (err) {
    console.error('Error al cargar datos para el formulario:', err)
  } finally {
    cargandoDatos.value = false
  }
})

// Si viene una derivación (modo edición), prellenar el formulario
watch(
  () => props.derivacion,
  (val) => {
    if (val) {
      form.value = {
        paciente_id: val.paciente_id,
        profesional_id: val.profesional_id,
        motivo: val.motivo || '',
        estado: val.estado || 'pendiente',
        notas: val.notas || ''
      }
      nextTick(() => adjustAllTextareas())
    } else {
      form.value = {
        paciente_id: '',
        profesional_id: '',
        motivo: '',
        estado: 'pendiente',
        notas: ''
      }
    }
  },
  { immediate: true }
)

const formValido = () => {
  return form.value.paciente_id && form.value.profesional_id
}

const guardar = () => {
  if (!formValido()) {
    alert('Debés seleccionar un paciente y un profesional')
    return
  }
  emit('guardar', { ...form.value })
}
</script>

<template>
  <!-- Fondo oscuro (backdrop) -->
  <div class="modal-backdrop" @click.self="emit('cerrar')">
    <!-- Ventana del modal -->
    <div class="modal">
      <div class="modal-header">
        <h2>{{ derivacion ? 'Editar derivación' : 'Nueva derivación' }}</h2>
        <button class="btn-cerrar" @click="emit('cerrar')">✕</button>
      </div>

      <!-- Cargando datos -->
      <div v-if="cargandoDatos" class="modal-loading">
        <div class="spinner"></div>
        <p>Cargando datos…</p>
      </div>

      <form v-else ref="formEl" class="modal-body" @submit.prevent="guardar">
        <div class="campo">
          <label>Paciente *</label>
          <select v-model="form.paciente_id" required>
            <option value="" disabled>Seleccioná un paciente</option>
            <option v-for="p in pacientes" :key="p.id" :value="p.id">
              {{ p.apellido }}, {{ p.nombre }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label>Profesional destino *</label>
          <select v-model="form.profesional_id" required>
            <option value="" disabled>Seleccioná un profesional</option>
            <option v-for="prof in profesionales" :key="prof.id" :value="prof.id">
              {{ prof.apellido }}, {{ prof.nombre }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label>Estado</label>
          <select v-model="form.estado">
            <option value="pendiente">Pendiente</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        <div class="campo campo-full">
          <label>Motivo</label>
          <textarea
            v-model="form.motivo"
            placeholder="Motivo de la derivación"
            rows="3"
            @input="autoResize"
          ></textarea>
        </div>

        <div class="campo campo-full">
          <label>Notas</label>
          <textarea
            v-model="form.notas"
            placeholder="Notas adicionales"
            rows="3"
            @input="autoResize"
          ></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn-guardar">
            {{ derivacion ? 'Guardar cambios' : 'Crear derivación' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Fondo oscuro semitransparente */
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

/* Ventana flotante */
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
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}

/* Encabezado */
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

/* Loading */
.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  color: #888;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5d6db;
  border-top-color: #8b1e3f;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Cuerpo del formulario */
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

.campo-full {
  grid-column: 1 / -1;
}

.campo label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.campo select {
  border: 1.5px solid #e5d6db;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 0.95rem;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s;
  background-color: white;
  cursor: pointer;
}

.campo textarea {
  border: 1.5px solid #e5d6db;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 0.95rem;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
  font-family: inherit;
}

.campo select:focus,
.campo textarea:focus {
  border-color: #8b1e3f;
}

.campo textarea::placeholder {
  color: #bbb;
}

/* Pie del modal */
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
