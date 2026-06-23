<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { getProfesionales } from '../../services/profesionalService'
import { getUsuario } from '../../services/authService'

const esAdmin = ref(getUsuario()?.rol === 'administrador')

const props = defineProps({
  paciente: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['guardar', 'cerrar'])

const profesionales = ref([])

const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  fecha_nacimiento: '',
  motivo_consulta: '',
  estado: 'activo',
  profesional_id: null,
  notas: ''
})

const formEl = ref(null)

// Fecha máxima (hoy) para el input date en formato YYYY-MM-DD
const today = new Date().toISOString().split('T')[0]

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

// Si viene un paciente (modo edición), prellenar el formulario
watch(
  () => props.paciente,
  (val) => {
    if (val) {
      form.value = { ...val }
      // Después de precargar, ajustar textareas al contenido
      nextTick(() => adjustAllTextareas())
    } else {
      form.value = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        fecha_nacimiento: '',
        motivo_consulta: '',
        estado: 'activo',
        profesional_id: '',
        notas: ''
      }
    }
  },
  { immediate: true }
)

const formValido = () => {
  return form.value.nombre && form.value.apellido && form.value.email && form.value.telefono && form.value.direccion
}

const cargarProfesionales = async () => {
  try {
    profesionales.value = await getProfesionales()
  } catch (err) {
    console.error('Error al cargar profesionales', err)
    profesionales.value = []
  }
}

onMounted(() => {
  cargarProfesionales()
})

const guardar = () => {
  if (!formValido()) {
    alert('Todos los campos son obligatorios')
    return
  }
  // Validación: la fecha de nacimiento no puede ser mayor a hoy
  if (form.value.fecha_nacimiento && form.value.fecha_nacimiento > today) {
    alert('La fecha de nacimiento no puede ser posterior a hoy')
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
        <h2>{{ paciente ? 'Editar paciente' : 'Agregar paciente' }}</h2>
        <button class="btn-cerrar" @click="emit('cerrar')">✕</button>
      </div>

      <form ref="formEl" class="modal-body" @submit.prevent="guardar">
        <div class="campo">
          <label>Nombre *</label>
          <input v-model="form.nombre" type="text" :readonly="!esAdmin" placeholder="Nombre" required />
        </div>

        <div class="campo">
          <label>Apellido *</label>
          <input v-model="form.apellido" type="text" :readonly="!esAdmin" placeholder="Apellido" required />
        </div>

        <div class="campo">
          <label>Email *</label>
          <input v-model="form.email" type="email" :readonly="!esAdmin" placeholder="correo@psicored.com" required />
        </div>

        <div class="campo">
          <label>Teléfono *</label>
          <input v-model="form.telefono" type="text" :readonly="!esAdmin" placeholder="+54 9 11 0000-0000" required />
        </div>

        <div class="campo">
          <label>Dirección *</label>
          <input v-model="form.direccion" type="text" :readonly="!esAdmin" placeholder="Dirección" required />
        </div>

        <div class="campo">
          <label>Fecha de nacimiento</label>
          <input v-model="form.fecha_nacimiento" type="date" :readonly="!esAdmin" :max="today" />
        </div>

        <div class="campo">
          <label>Motivo de consulta</label>
          <textarea v-model="form.motivo_consulta" placeholder="Motivo por el que consulta" rows="3" @input="autoResize"></textarea>
        </div>

        <div class="campo">
          <label>Estado</label>
          <select v-model="form.estado">
            <option value="activo">Activo</option>
            <option value="derivado">Derivado</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        
        <div class="campo" v-if="esAdmin">
          <label>Profesional asignado</label>
          <select v-model="form.profesional_id">
            <option :value="null">Sin asignar</option>
            <option v-for="prof in profesionales" :key="prof.id" :value="prof.id">
              {{ prof.nombre }} {{ prof.apellido }}
            </option>
          </select>
        </div>

        <div class="campo">
          <label>Notas particulares</label>
          <textarea v-model="form.notas" placeholder="Notas internas" rows="3" @input="autoResize"></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn-guardar">
            {{ paciente ? 'Guardar cambios' : 'Agregar' }}
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
  /* Animación de entrada */
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
  /* Animación de entrada con leve efecto de escala */
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

/* Tamaños del formulario */
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

/* Los campos de textarea ocupan 2 columnas */
.campo:has(textarea) {
  grid-column: 1 / -1;
}

.campo label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.campo input {
  border: 1.5px solid #e5d6db;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 0.95rem;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s;
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
}

.campo input:focus,
.campo textarea:focus,
.campo select:focus {
  border-color: #8b1e3f;
}

.campo input::placeholder {
  color: #bbb;
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
