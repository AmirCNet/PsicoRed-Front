<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  profesional: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['guardar', 'cerrar'])

const form = ref({
  nombre: '',
  especialidad: '',
  matricula: '',
  email: '',
  telefono: ''
})

// Si viene un profesional (modo edición), prellenar el formulario
watch(
  () => props.profesional,
  (val) => {
    if (val) {
      form.value = { ...val }
    } else {
      form.value = { nombre: '', especialidad: '', matricula: '', email: '', telefono: '' }
    }
  },
  { immediate: true }
)

const guardar = () => {
  if (!form.value.nombre || !form.value.especialidad || !form.value.matricula) return
  emit('guardar', { ...form.value })
}
</script>

<template>
  <!-- Fondo oscuro (backdrop) -->
  <div class="modal-backdrop" @click.self="emit('cerrar')">
    <!-- Ventana del modal -->
    <div class="modal">
      <div class="modal-header">
        <h2>{{ profesional ? 'Editar profesional' : 'Agregar profesional' }}</h2>
        <button class="btn-cerrar" @click="emit('cerrar')">✕</button>
      </div>

      <form class="modal-body" @submit.prevent="guardar">
        <div class="campo">
          <label>Nombre *</label>
          <input v-model="form.nombre" type="text" placeholder="Dr. Apellido" />
        </div>

        <div class="campo">
          <label>Especialidad *</label>
          <input v-model="form.especialidad" type="text" placeholder="Ej: Ansiedad, Psicología Infantil" />
        </div>

        <div class="campo">
          <label>Matrícula *</label>
          <input v-model="form.matricula" type="text" placeholder="MP-0000" />
        </div>

        <div class="campo">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="correo@psicored.com" />
        </div>

        <div class="campo">
          <label>Teléfono</label>
          <input v-model="form.telefono" type="text" placeholder="+54 9 11 0000-0000" />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn-cancelar" @click="emit('cerrar')">Cancelar</button>
          <button type="submit" class="btn-guardar">
            {{ profesional ? 'Guardar cambios' : 'Agregar' }}
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
  max-width: 460px;
  margin: 1rem;
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

/* Cuerpo del formulario */
.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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

.campo input:focus {
  border-color: #8b1e3f;
}

.campo input::placeholder {
  color: #bbb;
}

/* Pie del modal */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
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

.btn-guardar:hover {
  background: #6e1832;
}
</style>
