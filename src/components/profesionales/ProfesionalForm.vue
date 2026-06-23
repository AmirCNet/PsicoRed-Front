<script setup>
import { ref, watch, onMounted } from 'vue'
import { getEspecializaciones } from '../../services/especializacionesService'

const props = defineProps({
  profesional: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['guardar', 'cerrar'])

const especializaciones = ref([])
const cargandoEsps = ref(true)

const form = ref({
  nombre: '',
  apellido: '',
  matricula: '',
  telefono: '',
  honorarios: null,
  biografia: '',
  especializacion_ids: []
})

const errores = ref({})

// ── Cargar especializaciones disponibles
onMounted(async () => {
  try {
    especializaciones.value = await getEspecializaciones()
  } catch (err) {
    console.error('Error al cargar especializaciones', err)
    especializaciones.value = []
  } finally {
    cargandoEsps.value = false
  }
})

// ── Prellenar el formulario cuando se recibe el profesional a editar
watch(
  () => props.profesional,
  (val) => {
    if (val) {
      form.value = {
        nombre:     val.nombre || '',
        apellido:   val.apellido || '',
        matricula:  val.matricula || '',
        telefono:   val.telefono || '',
        honorarios: val.honorarios ?? null,
        biografia:  val.biografia || '',
        especializacion_ids: val.especializaciones
          ? val.especializaciones.map(e => e.especializacion?.id).filter(Boolean)
          : []
      }
    } else {
      form.value = {
        nombre: '', apellido: '', matricula: '', telefono: '',
        honorarios: null, biografia: '', especializacion_ids: []
      }
    }
    errores.value = {}
  },
  { immediate: true }
)

// ── Toggle de especializaciones (checkbox)
const toggleEsp = (id) => {
  const idx = form.value.especializacion_ids.indexOf(id)
  if (idx === -1) {
    form.value.especializacion_ids.push(id)
  } else {
    form.value.especializacion_ids.splice(idx, 1)
  }
}

// ── Validaciones
const validarMatricula = (valor) => {
  if (!valor) return true // es opcional
  // Acepta formatos como: MP-1234, MN12345, M.P. 1234, MP 1234
  return /^[A-Za-z]{1,5}[.\-\s]?\s?\d{1,6}$/.test(valor.trim())
}

const validar = () => {
  const e = {}

  if (!form.value.nombre.trim()) {
    e.nombre = 'El nombre es obligatorio'
  }
  if (!form.value.apellido.trim()) {
    e.apellido = 'El apellido es obligatorio'
  }
  if (form.value.matricula && !validarMatricula(form.value.matricula)) {
    e.matricula = 'Formato inválido. Ej: MP-1234, MN 5678'
  }
  if (form.value.honorarios !== null && form.value.honorarios !== '' && form.value.honorarios < 0) {
    e.honorarios = 'Los honorarios no pueden ser negativos'
  }

  errores.value = e
  return Object.keys(e).length === 0
}

const guardar = () => {
  if (!validar()) return

  const datos = {
    nombre:     form.value.nombre.trim(),
    apellido:   form.value.apellido.trim(),
    matricula:  form.value.matricula.trim() || null,
    telefono:   form.value.telefono.trim() || null,
    honorarios: form.value.honorarios || null,
    biografia:  form.value.biografia.trim() || null,
    especializacion_ids: form.value.especializacion_ids
  }

  emit('guardar', datos)
}
</script>

<template>
  <!-- Fondo oscuro (backdrop) -->
  <div class="modal-backdrop" @click.self="emit('cerrar')">
    <!-- Ventana del modal -->
    <div class="modal">
      <div class="modal-header">
        <h2>Editar profesional</h2>
        <button class="btn-cerrar" @click="emit('cerrar')">✕</button>
      </div>

      <form class="modal-body" @submit.prevent="guardar">
        <div class="campo">
          <label>Nombre <span class="req">*</span></label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Juan"
            :class="{ 'input-error': errores.nombre }"
          />
          <span v-if="errores.nombre" class="error-msg">{{ errores.nombre }}</span>
        </div>

        <div class="campo">
          <label>Apellido <span class="req">*</span></label>
          <input
            v-model="form.apellido"
            type="text"
            placeholder="García"
            :class="{ 'input-error': errores.apellido }"
          />
          <span v-if="errores.apellido" class="error-msg">{{ errores.apellido }}</span>
        </div>

        <div class="campo">
          <label>Matrícula</label>
          <input
            v-model="form.matricula"
            type="text"
            placeholder="Ej: MP-1234"
            :class="{ 'input-error': errores.matricula }"
          />
          <span v-if="errores.matricula" class="error-msg">{{ errores.matricula }}</span>
        </div>

        <div class="campo">
          <label>Teléfono</label>
          <input
            v-model="form.telefono"
            type="tel"
            placeholder="+54 11 1234-5678"
          />
        </div>

        <div class="campo">
          <label>Honorarios por sesión ($)</label>
          <input
            v-model.number="form.honorarios"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            :class="{ 'input-error': errores.honorarios }"
          />
          <span v-if="errores.honorarios" class="error-msg">{{ errores.honorarios }}</span>
        </div>

        <!-- Especializaciones (checkboxes) -->
        <div class="campo campo-full">
          <label>Especializaciones</label>
          <div v-if="cargandoEsps" class="esp-loading">Cargando…</div>
          <div v-else-if="especializaciones.length === 0" class="esp-empty">
            No hay especializaciones registradas.
          </div>
          <div v-else class="esp-grid">
            <label
              v-for="esp in especializaciones"
              :key="esp.id"
              class="esp-chip"
              :class="{ 'esp-chip-active': form.especializacion_ids.includes(esp.id) }"
            >
              <input
                type="checkbox"
                :checked="form.especializacion_ids.includes(esp.id)"
                @change="toggleEsp(esp.id)"
                class="esp-checkbox"
              />
              <span>{{ esp.nombre }}</span>
            </label>
          </div>
        </div>

        <div class="campo campo-full">
          <label>Biografía / Presentación</label>
          <textarea
            v-model="form.biografia"
            rows="3"
            placeholder="Breve descripción de la práctica profesional..."
          ></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn-guardar">Guardar cambios</button>
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
  max-width: 640px;
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

.req { color: #c0392b; }

.campo input,
.campo textarea {
  border: 1.5px solid #e5d6db;
  border-radius: 8px;
  padding: 0.55rem 0.85rem;
  font-size: 0.95rem;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.campo textarea {
  resize: vertical;
}

.campo input:focus,
.campo textarea:focus {
  border-color: #8b1e3f;
}

.campo input::placeholder,
.campo textarea::placeholder {
  color: #bbb;
}

/* Error de validación */
.input-error {
  border-color: #e74c3c !important;
}

.error-msg {
  font-size: 0.78rem;
  color: #e74c3c;
  font-weight: 500;
}

/* ── Especializaciones (chips) */
.esp-loading,
.esp-empty {
  font-size: 0.85rem;
  color: #999;
  padding: 0.5rem 0;
}

.esp-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.esp-chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  border: 1.5px solid #e5d6db;
  background: white;
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.18s;
  user-select: none;
}

.esp-chip:hover {
  border-color: #c0496a;
  color: #8b1e3f;
}

.esp-chip-active {
  background: #fdf0f3;
  border-color: #c0496a;
  color: #8b1e3f;
  font-weight: 600;
}

.esp-checkbox {
  display: none;
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
