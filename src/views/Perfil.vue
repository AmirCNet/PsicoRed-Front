<template>
  <div class="perfil-view">

    <!-- Header de página -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Configuración de Perfil</h1>
        <p class="page-subtitle">Gestioná tu avatar, datos de contacto y preferencias de tu cuenta.</p>
      </div>
    </div>

    <div class="perfil-layout">

      <!-- Columna izquierda: Tarjeta de Avatar y Resumen -->
      <div class="perfil-card avatar-card">
        <h2 class="card-section-title">Avatar de Usuario</h2>
        <p class="card-section-desc">Configuración visual basada en la herramienta Blobatar.</p>

        <div class="avatar-display-box">
          <AppAvatar
            :userId="authStore.usuario?.id"
            :seed="effectiveSeed"
            :size="96"
            background="squircle"
            animate="always"
          />
        </div>

        <div class="avatar-config-summary">
          <div class="config-row">
            <span class="config-label">Forma:</span>
            <span class="config-val">{{ currentShapeLabel }}</span>
          </div>
          <div class="config-row">
            <span class="config-label">Expresión:</span>
            <span class="config-val">{{ currentExpressionLabel }}</span>
          </div>
          <div class="config-row">
            <span class="config-label">Tono de color:</span>
            <span class="config-val">{{ currentHueLabel }}</span>
          </div>
        </div>

        <div class="avatar-actions">
          <button 
            type="button" 
            class="btn-customize-avatar" 
            @click="isAvatarModalOpen = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Personalizar Avatar
          </button>
        </div>

        <!-- Botón de Cerrar Sesión en Perfil -->
        <div class="logout-section">
          <button 
            type="button" 
            class="btn-logout-perfil" 
            @click="cerrarSesion"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <!-- Columna derecha: Datos de Usuario y Seguridad -->
      <div class="perfil-main-column">

        <!-- Sección 1: Datos de la Cuenta -->
        <div class="perfil-card">
          <h2 class="card-section-title">Datos de la Cuenta</h2>
          <p class="card-section-desc">Identificación de acceso al sistema PsicoRed.</p>

          <div class="form-grid">
            <div class="form-group full">
              <label for="perfil-email">Dirección de correo electrónico</label>
              <input 
                id="perfil-email"
                v-model="cuentaForm.email" 
                type="email" 
                placeholder="usuario@ejemplo.com"
              />
              <div class="notice-box notice-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span><strong>Aviso:</strong> La modificación de correo electrónico queda pendiente de implementar confirmación obligatoria mediante enlace enviado a la nueva casilla.</span>
              </div>
            </div>

            <div class="form-group">
              <label>Rol asignado</label>
              <input 
                type="text" 
                :value="authStore.esAdmin ? 'Administrador' : 'Profesional'" 
                disabled 
                class="input-disabled"
              />
            </div>

            <div class="form-group">
              <label>ID de Usuario</label>
              <input 
                type="text" 
                :value="authStore.usuario?.id || '—'" 
                disabled 
                class="input-disabled"
              />
            </div>
          </div>
        <!-- Sección: Apariencia y Tema -->
        <div class="perfil-card">
          <div class="card-header-flex">
            <div>
              <h2 class="card-section-title">Apariencia y Tema</h2>
              <p class="card-section-desc">Personalizá cómo visualizás la interfaz y la presencia del botón de cambio rápido.</p>
            </div>
            <span class="theme-current-badge">{{ isDark ? 'Modo Oscuro' : 'Modo Claro' }}</span>
          </div>

          <div class="theme-config-section">
            <label class="theme-field-label">Preferencia de tema</label>
            <div class="theme-options-grid">
              <!-- Opción Claro -->
              <button 
                type="button" 
                class="theme-option-card" 
                :class="{ 'active': themeMode === 'light' }"
                @click="cambiarModoTema('light')"
              >
                <div class="theme-option-preview theme-preview--light">
                  <div class="preview-sidebar"></div>
                  <div class="preview-content">
                    <div class="preview-line"></div>
                    <div class="preview-card"></div>
                  </div>
                </div>
                <div class="theme-option-info">
                  <span class="theme-option-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                    Claro
                  </span>
                  <span class="theme-option-desc">Tonalidades crema clásicas</span>
                </div>
                <div class="theme-check-icon" v-if="themeMode === 'light'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </button>

              <!-- Opción Oscuro -->
              <button 
                type="button" 
                class="theme-option-card" 
                :class="{ 'active': themeMode === 'dark' }"
                @click="cambiarModoTema('dark')"
              >
                <div class="theme-option-preview theme-preview--dark">
                  <div class="preview-sidebar"></div>
                  <div class="preview-content">
                    <div class="preview-line"></div>
                    <div class="preview-card"></div>
                  </div>
                </div>
                <div class="theme-option-info">
                  <span class="theme-option-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                    Oscuro
                  </span>
                  <span class="theme-option-desc">Fondo profundo y descanso visual</span>
                </div>
                <div class="theme-check-icon" v-if="themeMode === 'dark'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </button>

              <!-- Opción Sistema -->
              <button 
                type="button" 
                class="theme-option-card" 
                :class="{ 'active': themeMode === 'system' }"
                @click="cambiarModoTema('system')"
              >
                <div class="theme-option-preview theme-preview--system">
                  <div class="preview-split-left"></div>
                  <div class="preview-split-right"></div>
                </div>
                <div class="theme-option-info">
                  <span class="theme-option-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    Sistema
                  </span>
                  <span class="theme-option-desc">Sincronizado con tu dispositivo</span>
                </div>
                <div class="theme-check-icon" v-if="themeMode === 'system'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </button>
            </div>

            <!-- Fila de activación del botón flotante -->
            <div class="theme-toggle-switch-row">
              <div class="switch-meta">
                <span class="switch-title">Botón rápido en la esquina superior derecha</span>
                <p class="switch-desc">
                  Muestra un acceso directo visible en la parte superior derecha de cada página para alternar rápidamente entre tema claro y oscuro.
                </p>
              </div>

              <label class="toggle-switch" for="toggle-quick-theme" title="Mostrar u ocultar botón de tema">
                <input 
                  id="toggle-quick-theme"
                  type="checkbox" 
                  :checked="showQuickToggle" 
                  @change="toggleVisibilidadBoton"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Sección 2: Seguridad y Contraseña -->
        <div class="perfil-card">
          <h2 class="card-section-title">Seguridad y Contraseña</h2>
          <p class="card-section-desc">Actualización de tus credenciales de inicio de sesión.</p>

          <form @submit.prevent="solicitarCambioPassword" class="form-grid">
            <div class="form-group full">
              <label for="pass-actual">Contraseña actual</label>
              <input 
                id="pass-actual"
                v-model="passwordForm.actual" 
                type="password" 
                placeholder="••••••••"
              />
            </div>

            <div class="form-group">
              <label for="pass-nueva">Nueva contraseña</label>
              <input 
                id="pass-nueva"
                v-model="passwordForm.nueva" 
                type="password" 
                placeholder="••••••••"
              />
            </div>

            <div class="form-group">
              <label for="pass-confirmar">Confirmar nueva contraseña</label>
              <input 
                id="pass-confirmar"
                v-model="passwordForm.confirmacion" 
                type="password" 
                placeholder="••••••••"
              />
            </div>

            <div class="form-group full">
              <div class="notice-box notice-warning">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span><strong>Aviso:</strong> El cambio definitivo de contraseña requerirá confirmación por correo electrónico. Se enviará un enlace de seguridad a tu casilla antes de registrar el cambio.</span>
              </div>
            </div>

            <div class="form-actions full">
              <button type="submit" class="btn-primary">
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>

        <!-- Sección 3: Datos Personales / Profesionales -->
        <div class="perfil-card">
          <h2 class="card-section-title">Datos Personales y Profesionales</h2>
          <p class="card-section-desc">Identificación de contacto, nombre y datos visibles en el sistema.</p>

          <form @submit.prevent="guardarDatosProfesional" class="form-grid">
            <div class="form-group">
              <label for="prof-nombre">Nombre</label>
              <input id="prof-nombre" v-model="profForm.nombre" type="text" required placeholder="Tu nombre" />
            </div>

            <div class="form-group">
              <label for="prof-apellido">Apellido</label>
              <input id="prof-apellido" v-model="profForm.apellido" type="text" required placeholder="Tu apellido" />
            </div>

            <div class="form-group">
              <label for="prof-matricula">Matrícula <span v-if="authStore.esAdmin" class="optional-tag">(opcional)</span></label>
              <input id="prof-matricula" v-model="profForm.matricula" type="text" placeholder="Ej: MP-1234" />
            </div>

            <div class="form-group">
              <label for="prof-telefono">Teléfono</label>
              <input id="prof-telefono" v-model="profForm.telefono" type="tel" placeholder="+54 9 11 ..." />
            </div>

            <div class="form-group full">
              <label for="prof-biografia">Presentación / Biografía</label>
              <textarea id="prof-biografia" v-model="profForm.biografia" rows="3" placeholder="Breve presentación o descripción..."></textarea>
            </div>

            <div class="form-actions full">
              <button type="submit" class="btn-primary" :disabled="guardandoProf">
                <span v-if="guardandoProf">Guardando...</span>
                <span v-else>Guardar Datos</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>

    <!-- Modal de personalización de Avatar -->
    <AvatarCustomizerModal
      v-if="authStore.usuario"
      :isOpen="isAvatarModalOpen"
      :userId="authStore.usuario.id"
      :userSeed="effectiveSeed"
      @close="isAvatarModalOpen = false"
      @saved="onAvatarSaved"
    />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import { useTheme } from '../composables/useTheme'
import { getMiPerfil, crearMiPerfil, updateProfesional } from '../services/profesionalService'
import { 
  getStoredAvatar, 
  SHAPE_OPTIONS, 
  EXPRESSION_OPTIONS 
} from '../services/avatarConfig'
import AppAvatar from '../components/common/AppAvatar.vue'
import AvatarCustomizerModal from '../components/common/AvatarCustomizerModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const { success, error: toastError, info } = useToast()
const { themeMode, isDark, showQuickToggle, setThemeMode, setShowQuickToggle } = useTheme()

const cambiarModoTema = (modo) => {
  setThemeMode(modo)
  const nombres = {
    light: 'Modo claro',
    dark: 'Modo oscuro',
    system: 'Tema sincronizado con el sistema'
  }
  success(`${nombres[modo]} activado`)
}

const toggleVisibilidadBoton = (e) => {
  const visible = e.target.checked
  setShowQuickToggle(visible)
  if (visible) {
    success('Botón de tema visible en la esquina superior derecha')
  } else {
    info('Botón de tema ocultado de la pantalla')
  }
}

const cerrarSesion = () => {
  authStore.logout()
  router.push('/login')
}

const isAvatarModalOpen = ref(false)
const savedConfig = ref(authStore.usuario ? getStoredAvatar(authStore.usuario.id) : null)

const cuentaForm = ref({
  email: authStore.usuario?.email || ''
})

const passwordForm = ref({
  actual: '',
  nueva: '',
  confirmacion: ''
})

const perfilProfesional = ref(null)
const profForm = ref({
  nombre: '',
  apellido: '',
  matricula: '',
  telefono: '',
  biografia: ''
})
const guardandoProf = ref(false)

const effectiveSeed = computed(() => {
  return authStore.usuario?.id 
    ? String(authStore.usuario.id) 
    : (authStore.usuario?.email || 'psicored-user')
})

const currentShapeLabel = computed(() => {
  const shapeId = savedConfig.value?.shape
  if (!shapeId) return 'Por defecto'
  return SHAPE_OPTIONS.find(s => s.id === shapeId)?.label || shapeId
})

const currentExpressionLabel = computed(() => {
  const exprId = savedConfig.value?.expression
  if (!exprId) return 'Neutral'
  return EXPRESSION_OPTIONS.find(e => e.id === exprId)?.label || exprId
})

const currentHueLabel = computed(() => {
  const hueVal = savedConfig.value?.hue
  if (hueVal === null || hueVal === undefined) return 'Automático (Seed)'
  return `${hueVal}°`
})

const onAvatarSaved = (newConfig) => {
  savedConfig.value = newConfig
}

const solicitarCambioPassword = () => {
  if (!passwordForm.value.actual || !passwordForm.value.nueva) {
    toastError('Completá la contraseña actual y la nueva')
    return
  }
  if (passwordForm.value.nueva !== passwordForm.value.confirmacion) {
    toastError('Las contraseñas no coinciden')
    return
  }
  success('Solicitud enviada. En la próxima actualización recibirás un correo de confirmación.')
  passwordForm.value = { actual: '', nueva: '', confirmacion: '' }
}

const cargarPerfilProfesional = async () => {
  try {
    const data = await getMiPerfil()
    if (data) {
      perfilProfesional.value = data
      profForm.value = {
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        matricula: data.matricula || '',
        telefono: data.telefono || '',
        biografia: data.biografia || ''
      }
    }
  } catch (err) {
    console.error('Error al cargar perfil personal/profesional', err)
  }
}

const guardarDatosProfesional = async () => {
  if (!profForm.value.nombre?.trim() || !profForm.value.apellido?.trim()) {
    toastError('El nombre y apellido son obligatorios')
    return
  }
  guardandoProf.value = true
  try {
    if (perfilProfesional.value?.id) {
      const updated = await updateProfesional(perfilProfesional.value.id, profForm.value)
      perfilProfesional.value = updated || perfilProfesional.value
    } else {
      const created = await crearMiPerfil({
        usuario_id: authStore.usuario.id,
        nombre: profForm.value.nombre.trim(),
        apellido: profForm.value.apellido.trim(),
        matricula: profForm.value.matricula?.trim() || null,
        telefono: profForm.value.telefono?.trim() || null,
        biografia: profForm.value.biografia?.trim() || null
      })
      perfilProfesional.value = created
    }
    success('Datos guardados correctamente')
  } catch (err) {
    toastError(err.message || 'Error al guardar datos')
  } finally {
    guardandoProf.value = false
  }
}

onMounted(() => {
  cargarPerfilProfesional()
})
</script>

<style scoped>
.perfil-view {
  padding: 1.75rem 2rem 3rem;
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--wine);
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: var(--text-soft);
  font-size: 0.9rem;
}

.perfil-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.perfil-card {
  background: var(--white);
  border-radius: 14px;
  padding: 1.5rem;
  border: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--wine);
  margin-bottom: 0.25rem;
}

.card-section-desc {
  color: var(--text-soft);
  font-size: 0.8rem;
  margin-bottom: 1.25rem;
}

/* ── Apariencia y Tema */
.card-header-flex {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.theme-current-badge {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  background: var(--rose-light);
  color: var(--wine);
  white-space: nowrap;
}

.theme-config-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 0.5rem;
}

.theme-field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
}

.theme-options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
}

.theme-option-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.85rem;
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
  font-family: inherit;
  color: var(--text);
}

.theme-option-card:hover {
  border-color: var(--rose);
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.theme-option-card.active {
  border-color: var(--wine);
  background: var(--white);
  box-shadow: 0 4px 18px rgba(77, 14, 11, 0.1);
}

/* Previews miniatura */
.theme-option-preview {
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border);
  display: flex;
}

.theme-preview--light {
  background: #f8f2e2;
}

.theme-preview--light .preview-sidebar {
  width: 28%;
  height: 100%;
  background: #4d0e0b;
}

.theme-preview--light .preview-content {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-preview--light .preview-line {
  height: 6px;
  width: 60%;
  background: #c97b84;
  border-radius: 3px;
}

.theme-preview--light .preview-card {
  flex: 1;
  background: #ffffff;
  border-radius: 4px;
  border: 1px solid #e0d0c8;
}

.theme-preview--dark {
  background: #121215;
}

.theme-preview--dark .preview-sidebar {
  width: 28%;
  height: 100%;
  background: #1a0809;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.theme-preview--dark .preview-content {
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-preview--dark .preview-line {
  height: 6px;
  width: 60%;
  background: #e2848c;
  border-radius: 3px;
}

.theme-preview--dark .preview-card {
  flex: 1;
  background: #1b1b22;
  border-radius: 4px;
  border: 1px solid #2e2a33;
}

.theme-preview--system {
  display: flex;
  position: relative;
}

.preview-split-left {
  width: 50%;
  height: 100%;
  background: #f8f2e2;
  border-right: 1px solid #e0d0c8;
}

.preview-split-right {
  width: 50%;
  height: 100%;
  background: #121215;
}

.theme-option-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.theme-option-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
}

.theme-option-desc {
  font-size: 0.73rem;
  color: var(--text-soft);
  line-height: 1.25;
}

.theme-check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--wine);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Fila de switch para botón flotante */
.theme-toggle-switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem 1.15rem;
  border-radius: 10px;
  background: var(--cream);
  border: 1.5px solid var(--border);
  margin-top: 0.5rem;
}

.switch-meta {
  flex: 1;
}

.switch-title {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 0.2rem;
}

.switch-desc {
  font-size: 0.78rem;
  color: var(--text-soft);
  margin: 0;
  line-height: 1.35;
}

/* Modern Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 26px;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch .slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1c7c2;
  transition: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 999px;
}

.toggle-switch .slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.toggle-switch input:checked + .slider {
  background-color: var(--wine);
}

.toggle-switch input:checked + .slider:before {
  transform: translateX(20px);
}

/* Avatar Card */
.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-display-box {
  margin: 0.75rem 0 1.25rem;
  padding: 0.5rem;
  border-radius: 20px;
  background: var(--cream);
  filter: drop-shadow(0 4px 10px rgba(77, 14, 11, 0.1));
}

.avatar-config-summary {
  width: 100%;
  background: #faf7f2;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid var(--border);
}

.config-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.config-label {
  color: var(--text-soft);
  font-weight: 500;
}

.config-val {
  color: var(--wine);
  font-weight: 700;
}

.avatar-actions {
  width: 100%;
}

.btn-customize-avatar {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: var(--wine);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-customize-avatar:hover {
  background: var(--wine-light);
  transform: translateY(-1px);
}

.logout-section {
  width: 100%;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.btn-logout-perfil {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: #fff5f5;
  color: #dc2626;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-logout-perfil:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #b91c1c;
  transform: translateY(-1px);
}

/* Columna principal */
.perfil-main-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group.full {
  grid-column: span 2;
}

label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
}

input, textarea {
  padding: 0.6rem 0.85rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.88rem;
  color: var(--text);
  background: var(--white);
  transition: border-color 0.15s;
  font-family: inherit;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--wine);
}

.input-disabled {
  background: #f5f5f5;
  color: var(--text-soft);
  cursor: not-allowed;
}

/* Notice boxes */
.notice-box {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  line-height: 1.35;
  margin-top: 0.4rem;
}

.notice-info {
  background: #f0f7ff;
  border: 1px solid #cce3ff;
  color: #1e5ba3;
}

.notice-info svg {
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.notice-warning {
  background: #fff9ea;
  border: 1px solid #ffe8b3;
  color: #8c5b00;
}

.notice-warning svg {
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-primary {
  padding: 0.65rem 1.4rem;
  background: var(--wine);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-primary:hover {
  background: var(--wine-light);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.optional-tag {
  font-size: 0.75rem;
  font-weight: normal;
  color: var(--text-soft);
  margin-left: 0.25rem;
}

@media (max-width: 860px) {
  .perfil-layout {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .form-group.full {
    grid-column: span 1;
  }
}
</style>
