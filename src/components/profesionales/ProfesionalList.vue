<script setup>
import { ref, onMounted } from 'vue'
import { getProfesionales, updateProfesional, deleteProfesional } from '../../services/profesionalService'
import { getUsuario } from '../../services/authService'
import ProfesionalForm from './ProfesionalForm.vue'

const profesionales = ref([])
const cargando = ref(true)
const esAdmin = ref(getUsuario()?.rol === 'administrador')

// Cargar datos al montar el componente
onMounted(async () => {
  try {
    profesionales.value = await getProfesionales()
  } catch (err) {
    console.error('Error al obtener profesionales', err)
    alert(err.message || 'Error al obtener profesionales')
  } finally {
    cargando.value = false
  }
})

// Modal (solo edición, la creación se hace desde CompletarPerfil)
const modalAbierto = ref(false)
const profesionalEditando = ref(null)

const abrirEditar = (profesional) => {
  profesionalEditando.value = { ...profesional }
  modalAbierto.value = true
}

const cerrarModal = () => {
  modalAbierto.value = false
  profesionalEditando.value = null
}

const guardar = async (datos) => {
  try {
    await updateProfesional(profesionalEditando.value.id, datos)
    profesionales.value = await getProfesionales()
    cerrarModal()
  } catch (err) {
    console.error('Error al guardar profesional', err)
    alert(err.message || 'Error al guardar profesional')
  }
}

const eliminar = async (id) => {
  if (!confirm('¿Seguro que querés eliminar este profesional?')) return
  try {
    await deleteProfesional(id)
    profesionales.value = await getProfesionales()
  } catch (err) {
    console.error('Error al eliminar profesional', err)
    alert(err.message || 'Error al eliminar profesional')
  }
}

// ── Helpers
const nombreCompleto = (p) => `${p.nombre} ${p.apellido}`

const inicialProfesional = (p) => p.nombre ? p.nombre.charAt(0) : '?'

const listaEspecializaciones = (p) => {
  if (!p.especializaciones || p.especializaciones.length === 0) return []
  return p.especializaciones
    .map(e => e.especializacion?.nombre)
    .filter(Boolean)
}

const formatHonorarios = (valor) => {
  if (valor === null || valor === undefined) return null
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(valor)
}
</script>

<template>
  <div class="profesionales-page">
    <div class="page-header">
      <h1>Gestión de Profesionales</h1>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading-state">Cargando profesionales…</div>

    <!-- Grid de cards -->
    <div v-else class="grid">
      <div v-for="p in profesionales" :key="p.id" class="card">

        <div class="card-top">
          <div class="card-avatar">{{ inicialProfesional(p) }}</div>
          <div v-if="formatHonorarios(p.honorarios)" class="card-honorarios">
            {{ formatHonorarios(p.honorarios) }}
            <span class="honorarios-label">/sesión</span>
          </div>
        </div>

        <div class="card-body">
          <h3 class="card-nombre">{{ nombreCompleto(p) }}</h3>

          <!-- Especializaciones como badges -->
          <div v-if="listaEspecializaciones(p).length > 0" class="card-esps">
            <span v-for="esp in listaEspecializaciones(p)" :key="esp" class="badge-esp">
              {{ esp }}
            </span>
          </div>

          <div class="card-info">
            <span v-if="p.matricula">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              {{ p.matricula }}
            </span>
            <span v-if="p.usuario?.email">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              {{ p.usuario.email }}
            </span>
            <span v-if="p.telefono">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              {{ p.telefono }}
            </span>
          </div>
        </div>

        <div class="card-actions" v-if="esAdmin">
          <button class="btn-editar" @click="abrirEditar(p)">Editar</button>
          <button class="btn-eliminar" @click="eliminar(p.id)">Eliminar</button>
        </div>
      </div>
    </div>

    <p v-if="!cargando && profesionales.length === 0" class="empty-state">
      No hay profesionales registrados.
    </p>

    <!-- Modal editar -->
    <ProfesionalForm
      v-if="modalAbierto"
      :profesional="profesionalEditando"
      @guardar="guardar"
      @cerrar="cerrarModal"
    />
  </div>
</template>

<style scoped>
.profesionales-page {
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

.loading-state {
  text-align: center;
  color: #999;
  padding: 3rem;
  font-size: 1rem;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  flex-shrink: 0;
}

.card-honorarios {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1a1a2e;
}

.honorarios-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #999;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-nombre {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

/* Badges de especialización */
.card-esps {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.badge-esp {
  display: inline-block;
  background: #fdf0f3;
  color: #8b1e3f;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #555;
}

.card-info span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.card-info svg {
  color: #999;
  flex-shrink: 0;
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