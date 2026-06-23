<template>
  <div class="completar-screen">
    <div class="completar-card">

      <div class="card-header">
        <div class="icon-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div>
          <h1 class="title">Completá tu perfil</h1>
          <p class="subtitle">Tu cuenta fue aprobada. Completá tus datos para ingresar al sistema.</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="perfil-form">

        <div class="form-row">
          <div class="form-group">
            <label for="nombre">Nombre <span class="required">*</span></label>
            <input id="nombre" v-model="form.nombre" type="text" placeholder="Juan" required />
          </div>
          <div class="form-group">
            <label for="apellido">Apellido <span class="required">*</span></label>
            <input id="apellido" v-model="form.apellido" type="text" placeholder="García" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="matricula">Matrícula</label>
            <input
              id="matricula"
              v-model="form.matricula"
              type="text"
              placeholder="Ej: MP-1234"
              :class="{ 'input-error': errores.matricula }"
            />
            <span v-if="errores.matricula" class="error-hint">{{ errores.matricula }}</span>
          </div>
          <div class="form-group">
            <label for="telefono">Teléfono</label>
            <input id="telefono" v-model="form.telefono" type="tel" placeholder="+54 11 1234-5678" />
          </div>
        </div>

        <div class="form-group full">
          <label for="biografia">Biografía / Presentación</label>
          <textarea
            id="biografia"
            v-model="form.biografia"
            rows="3"
            placeholder="Breve descripción de tu práctica profesional..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="honorarios">Honorarios por sesión ($)</label>
          <input id="honorarios" v-model.number="form.honorarios" type="number" min="0" step="0.01" placeholder="0.00" />
        </div>

        <!-- Especializaciones (checkboxes) -->
        <div class="form-group full">
          <label>Especializaciones</label>
          <div v-if="cargandoEsps" class="esp-loading">Cargando especializaciones…</div>
          <div v-else-if="todasEspecializaciones.length === 0" class="esp-loading">
            No hay especializaciones registradas aún.
          </div>
          <div v-else class="esp-grid">
            <label
              v-for="esp in todasEspecializaciones"
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

        <div v-if="error" class="form-error">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Guardar y acceder al sistema</span>
        </button>

      </form>

      <button class="btn-ghost" @click="cerrarSesion">Cerrar sesión</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { crearMiPerfil } from '../services/profesionalService'
import { getEspecializaciones } from '../services/especializacionesService'

const router    = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error   = ref('')
const errores = ref({})

const todasEspecializaciones = ref([])
const cargandoEsps = ref(true)

const form = ref({
  nombre:     '',
  apellido:   '',
  matricula:  '',
  telefono:   '',
  biografia:  '',
  honorarios: null,
  especializacion_ids: []
})

// ── Cargar especializaciones disponibles
onMounted(async () => {
  try {
    todasEspecializaciones.value = await getEspecializaciones()
  } catch (err) {
    console.error('Error al cargar especializaciones', err)
    todasEspecializaciones.value = []
  } finally {
    cargandoEsps.value = false
  }
})

// ── Toggle de especializaciones
const toggleEsp = (id) => {
  const idx = form.value.especializacion_ids.indexOf(id)
  if (idx === -1) {
    form.value.especializacion_ids.push(id)
  } else {
    form.value.especializacion_ids.splice(idx, 1)
  }
}

// ── Validación de matrícula
const validarMatricula = (valor) => {
  if (!valor) return true // es opcional
  return /^[A-Za-z]{1,5}[.\-\s]?\s?\d{1,6}$/.test(valor.trim())
}

const handleSubmit = async () => {
  error.value = ''
  errores.value = {}

  if (!form.value.nombre.trim() || !form.value.apellido.trim()) {
    error.value = 'El nombre y apellido son obligatorios.'
    return
  }

  if (form.value.matricula && !validarMatricula(form.value.matricula)) {
    errores.value.matricula = 'Formato inválido. Ej: MP-1234, MN 5678'
    return
  }

  loading.value = true
  try {
    const datos = {
      usuario_id: authStore.usuario.id,
      nombre:     form.value.nombre.trim(),
      apellido:   form.value.apellido.trim(),
      matricula:  form.value.matricula.trim() || null,
      telefono:   form.value.telefono.trim() || null,
      biografia:  form.value.biografia.trim() || null,
      honorarios: form.value.honorarios || null,
      especializacion_ids: form.value.especializacion_ids
    }

    await crearMiPerfil(datos)
    authStore.setPerfilCompleto()
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Error al guardar el perfil.'
  } finally {
    loading.value = false
  }
}

const cerrarSesion = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.completar-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
  padding: 2rem;
}

.completar-card {
  background: var(--white);
  border-radius: 20px;
  padding: 2.5rem 2.25rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(77, 14, 11, 0.10);
  border: 1px solid var(--rose-light);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--rose-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--wine);
  flex-shrink: 0;
}

.icon-wrap svg {
  width: 28px;
  height: 28px;
}

.title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--wine);
  margin: 0 0 0.2rem;
}

.subtitle {
  font-size: 0.85rem;
  color: var(--text-soft);
  margin: 0;
  line-height: 1.5;
}

/* ── Formulario */
.perfil-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--wine);
}

.required {
  color: var(--error);
}

.form-group input,
.form-group textarea {
  padding: 0.6rem 0.85rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.92rem;
  color: var(--text);
  background: var(--cream);
  transition: border-color 0.2s, background 0.2s;
  outline: none;
  font-family: inherit;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--rose);
  background: var(--white);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #b8a8a0;
}

/* ── Validación inline */
.input-error {
  border-color: var(--error) !important;
}

.error-hint {
  font-size: 0.78rem;
  color: var(--error);
  font-weight: 500;
}

/* ── Especializaciones (chips) */
.esp-loading {
  font-size: 0.85rem;
  color: var(--text-soft);
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
  border: 1.5px solid var(--border);
  background: var(--white);
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-soft);
  cursor: pointer;
  transition: all 0.18s;
  user-select: none;
}

.esp-chip:hover {
  border-color: var(--rose);
  color: var(--wine);
}

.esp-chip-active {
  background: var(--rose-light);
  border-color: var(--rose);
  color: var(--wine);
  font-weight: 600;
}

.esp-checkbox {
  display: none;
}

/* ── Error */
.form-error {
  background: var(--error-bg);
  color: var(--error);
  font-size: 0.85rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border-left: 3px solid var(--error);
}

/* ── Botones */
.btn-primary {
  padding: 0.8rem;
  background: var(--wine);
  color: var(--white);
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) { background: var(--wine-light); }
.btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-ghost {
  align-self: center;
  background: transparent;
  color: var(--text-soft);
  border: none;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  transition: color 0.2s;
}

.btn-ghost:hover { color: var(--wine); }

/* ── Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
