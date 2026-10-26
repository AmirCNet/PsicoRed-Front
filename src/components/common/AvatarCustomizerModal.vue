<script setup>
import { ref, computed, watch } from 'vue'
import { Blobatar } from '@blobatar/vue'
import { 
  SHAPE_OPTIONS, 
  EXPRESSION_OPTIONS, 
  HUE_PRESETS,
  TONE_OPTIONS,
  palette,
  getStoredAvatar,
  saveStoredAvatar,
  removeStoredAvatar,
  resolveExpression,
  resolveShapeValue
} from '../../services/avatarConfig'
import { useToast } from '../../composables/useToast'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  userId: {
    type: [String, Number],
    required: true
  },
  userSeed: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'saved'])
const { success } = useToast()

// Estado editable
const selectedShape = ref('round')
const selectedExpression = ref('idle')
const customHueEnabled = ref(false)
const selectedHue = ref(350) // Por defecto tono vino PsicoRed
const selectedTone = ref(0.70) // Tono saturado por defecto
const activeTab = ref('expression') // 'expression' | 'shape' | 'hue'

// Cargar estado inicial
const loadCurrentSettings = () => {
  const stored = getStoredAvatar(props.userId)
  if (stored) {
    selectedShape.value = stored.shape || 'round'
    selectedExpression.value = stored.expression || 'idle'
    if (stored.hue !== null && stored.hue !== undefined) {
      customHueEnabled.value = true
      selectedHue.value = Number(stored.hue)
      selectedTone.value = stored.tone !== null && stored.tone !== undefined ? Number(stored.tone) : 0.70
    } else {
      customHueEnabled.value = false
      selectedHue.value = 350
      selectedTone.value = 0.70
    }
  } else {
    selectedShape.value = 'round'
    selectedExpression.value = 'idle'
    customHueEnabled.value = false
    selectedHue.value = 350
    selectedTone.value = 0.70
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    loadCurrentSettings()
  }
})

// Seed para el preview
const effectiveSeed = computed(() => {
  if (props.userSeed && props.userSeed.trim()) return props.userSeed.trim()
  return `user-${props.userId}`
})

// Objetos para el componente Blobatar en vivo
const previewExpression = computed(() => resolveExpression(selectedExpression.value))
const previewTraits = computed(() => {
  const shapeVal = resolveShapeValue(selectedShape.value)
  return shapeVal !== null ? { shape: shapeVal } : undefined
})
const previewHue = computed(() => customHueEnabled.value ? Number(selectedHue.value) : undefined)
const previewTone = computed(() => customHueEnabled.value ? Number(selectedTone.value) : undefined)

const previewHeadColor = computed(() => {
  if (!customHueEnabled.value) return ''
  try {
    return palette(Number(selectedHue.value), true, Number(selectedTone.value)).head
  } catch {
    return `hsl(${selectedHue.value}, 60%, 40%)`
  }
})

const selectHuePreset = (h) => {
  customHueEnabled.value = true
  selectedHue.value = h
}

const toggleCustomHue = () => {
  customHueEnabled.value = !customHueEnabled.value
}

const handleSave = () => {
  const config = {
    shape: selectedShape.value,
    expression: selectedExpression.value,
    hue: customHueEnabled.value ? Number(selectedHue.value) : null,
    tone: customHueEnabled.value ? Number(selectedTone.value) : null
  }
  saveStoredAvatar(props.userId, config)
  success('¡Tu avatar ha sido actualizado!')
  emit('saved', config)
  emit('close')
}

const handleReset = () => {
  removeStoredAvatar(props.userId)
  loadCurrentSettings()
  success('Avatar restablecido al diseño predeterminado')
  emit('saved', null)
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="avatar-modal-backdrop" @click.self="$emit('close')">
    <div class="avatar-modal-card">
      
      <!-- Encabezado -->
      <div class="modal-header">
        <div>
          <h3>Personalizar mi Avatar</h3>
          <p class="modal-subtitle">Modificá la expresión, forma y tono de tu Blobatar.</p>
        </div>
        <button class="btn-close" @click="$emit('close')" aria-label="Cerrar modal">&times;</button>
      </div>

      <!-- Preview central destacado -->
      <div class="preview-stage">
        <div class="preview-avatar-box">
          <Blobatar
            :name="effectiveSeed"
            :size="110"
            :expression="previewExpression"
            :traits="previewTraits"
            :hue="previewHue"
            :tone="previewTone"
            background="squircle"
            animate="always"
          />
        </div>
        <div class="preview-info">
          <span class="preview-tag expression-tag">
            Expresión: {{ EXPRESSION_OPTIONS.find(e => e.id === selectedExpression)?.label }}
          </span>
          <span class="preview-tag shape-tag">
            Forma: {{ SHAPE_OPTIONS.find(s => s.id === selectedShape)?.label }}
          </span>
          <span v-if="customHueEnabled" class="preview-tag hue-tag" :style="{ backgroundColor: previewHeadColor }">
            Color: {{ selectedHue }}° ({{ TONE_OPTIONS.find(t => t.value === selectedTone)?.label || 'Intenso' }})
          </span>
          <span v-else class="preview-tag hue-tag-auto">
            Color: Automático (Seed)
          </span>
        </div>
      </div>

      <!-- Pestañas de configuración -->
      <div class="tabs-nav">
        <button 
          type="button" 
          class="tab-btn" 
          :class="{ active: activeTab === 'expression' }"
          @click="activeTab = 'expression'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          Expresión
        </button>
        <button 
          type="button" 
          class="tab-btn" 
          :class="{ active: activeTab === 'shape' }"
          @click="activeTab = 'shape'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
          </svg>
          Forma
        </button>
        <button 
          type="button" 
          class="tab-btn" 
          :class="{ active: activeTab === 'hue' }"
          @click="activeTab = 'hue'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
          </svg>
          Tono de Color
        </button>
      </div>

      <!-- Contenido por pestaña -->
      <div class="tab-body">
        
        <!-- Pestaña 1: Expresión -->
        <div v-show="activeTab === 'expression'" class="tab-panel">
          <div class="options-grid">
            <button
              v-for="expr in EXPRESSION_OPTIONS"
              :key="expr.id"
              type="button"
              class="option-card"
              :class="{ selected: selectedExpression === expr.id }"
              @click="selectedExpression = expr.id"
            >
              <span class="shape-bullet"></span>
              <div class="expr-text">
                <span class="expr-title">{{ expr.label }}</span>
                <span class="expr-desc">{{ expr.desc }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Pestaña 2: Forma -->
        <div v-show="activeTab === 'shape'" class="tab-panel">
          <div class="shapes-grid">
            <button
              v-for="shp in SHAPE_OPTIONS"
              :key="shp.id"
              type="button"
              class="shape-card"
              :class="{ selected: selectedShape === shp.id }"
              @click="selectedShape = shp.id"
            >
              <span class="shape-bullet"></span>
              <div class="shape-text">
                <span class="shape-title">{{ shp.label }}</span>
                <span class="shape-desc">{{ shp.desc }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Pestaña 3: Tono de Color -->
        <div v-show="activeTab === 'hue'" class="tab-panel">
          <div class="hue-section">
            <div class="hue-mode-toggle">
              <label class="toggle-label">
                <input 
                  type="checkbox" 
                  :checked="customHueEnabled" 
                  @change="toggleCustomHue"
                />
                <span class="toggle-slider"></span>
                <span>Fijar color personalizado</span>
              </label>
              <span class="toggle-hint">
                {{ customHueEnabled ? 'Color manual activado' : 'Calculado automáticamente por tu seed' }}
              </span>
            </div>

            <div v-if="customHueEnabled" class="hue-controls">
              <!-- Slider con gradiente -->
              <div class="slider-container">
                <div class="slider-header">
                  <label for="hue-range">Ángulo de Tono (Hue):</label>
                  <span class="hue-value-badge">{{ selectedHue }}°</span>
                </div>
                <input 
                  id="hue-range"
                  v-model.number="selectedHue" 
                  type="range" 
                  min="0" 
                  max="360" 
                  step="1" 
                  class="hue-range-slider"
                />
              </div>

              <!-- Selector de Intensidad / Saturación (Tone) -->
              <div class="tones-section">
                <span class="tones-title">Intensidad / Saturación:</span>
                <div class="tones-grid">
                  <button
                    v-for="t in TONE_OPTIONS"
                    :key="t.id"
                    type="button"
                    class="tone-btn"
                    :class="{ active: selectedTone === t.value }"
                    @click="selectedTone = t.value"
                  >
                    <span class="tone-label">{{ t.label }}</span>
                    <span class="tone-desc">{{ t.desc }}</span>
                  </button>
                </div>
              </div>

              <!-- Paleta de accesos directos -->
              <div class="presets-section">
                <span class="presets-title">Colores predefinidos:</span>
                <div class="preset-buttons">
                  <button
                    v-for="preset in HUE_PRESETS"
                    :key="preset.hue"
                    type="button"
                    class="preset-btn"
                    :class="{ active: selectedHue === preset.hue }"
                    :style="{ backgroundColor: preset.color }"
                    :title="preset.label"
                    @click="selectHuePreset(preset.hue)"
                  >
                    <span v-if="selectedHue === preset.hue" class="preset-check">✓</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div v-else class="hue-auto-info">
              <p>El color de tu avatar se genera de forma única y armónica a partir de tu identificador de usuario.</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer de acciones -->
      <div class="modal-footer">
        <button type="button" class="btn-reset" @click="handleReset">
          Restaurar por defecto
        </button>
        <div class="modal-footer-right">
          <button type="button" class="btn-cancel" @click="$emit('close')">
            Cancelar
          </button>
          <button type="button" class="btn-save" @click="handleSave">
            Guardar cambios
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.avatar-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(40, 10, 10, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.avatar-modal-card {
  background: var(--white);
  border-radius: 18px;
  width: 100%;
  max-width: 580px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 90vh;
  border: 1px solid var(--border);
}

.modal-header {
  padding: 1.25rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  color: var(--wine);
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.modal-subtitle {
  color: var(--text-soft);
  font-size: 0.85rem;
  margin-top: 0.2rem;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  color: var(--text-soft);
  cursor: pointer;
  line-height: 1;
  padding: 0 0.4rem;
  border-radius: 6px;
  transition: all 0.15s;
}

.btn-close:hover {
  color: var(--wine);
  background: var(--cream);
}

/* Stage de preview central */
.preview-stage {
  background: linear-gradient(180deg, var(--cream) 0%, #f3ece0 100%);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.preview-avatar-box {
  filter: drop-shadow(0 6px 12px rgba(77, 14, 11, 0.12));
  transform: scale(1);
  transition: transform 0.2s ease;
}

.preview-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
}

.preview-tag {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  background: var(--white);
  color: var(--wine);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.hue-tag {
  color: white;
}

.hue-tag-auto {
  background: rgba(0, 0, 0, 0.07);
  color: var(--text);
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
}

/* Tabs */
.tabs-nav {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: #faf7f2;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem 0.5rem;
  border: none;
  background: transparent;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  color: var(--wine);
  background: rgba(77, 14, 11, 0.03);
}

.tab-btn.active {
  color: var(--wine);
  border-bottom-color: var(--wine);
  background: var(--white);
}

/* Tab body */
.tab-body {
  padding: 1.25rem;
  overflow-y: auto;
  max-height: 280px;
}

/* Grid de expresiones */
.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.75rem;
  background: #faf7f2;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.option-card:hover {
  border-color: var(--wine-light);
  background: #fdfaf6;
  transform: translateY(-1px);
}

.option-card.selected {
  border-color: var(--wine);
  background: #fff5f5;
  box-shadow: 0 0 0 1px var(--wine);
}

.expr-emoji {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.expr-text {
  display: flex;
  flex-direction: column;
}

.expr-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--text);
}

.expr-desc {
  font-size: 0.72rem;
  color: var(--text-soft);
}

/* Grid de formas */
.shapes-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

.shape-card {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.8rem;
  background: #faf7f2;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.shape-card:hover {
  border-color: var(--wine-light);
  transform: translateY(-1px);
}

.shape-card.selected {
  border-color: var(--wine);
  background: #fff5f5;
  box-shadow: 0 0 0 1px var(--wine);
}

.shape-bullet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--wine-light);
  opacity: 0.4;
  flex-shrink: 0;
}

.shape-card.selected .shape-bullet {
  background: var(--wine);
  opacity: 1;
}

.shape-text {
  display: flex;
  flex-direction: column;
}

.shape-title {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--text);
}

.shape-desc {
  font-size: 0.72rem;
  color: var(--text-soft);
}

/* Sección de Tono */
.hue-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hue-mode-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #faf7f2;
  border-radius: 10px;
  border: 1px solid var(--border);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--wine);
  cursor: pointer;
}

.toggle-hint {
  font-size: 0.76rem;
  color: var(--text-soft);
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text);
}

.hue-value-badge {
  background: var(--wine);
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.78rem;
  font-weight: 700;
}

.hue-range-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 18px;
  border-radius: 9px;
  outline: none;
  background: linear-gradient(
    to right,
    #d65365 0%,
    #d7703e 12%,
    #c48f2b 25%,
    #15a04c 42%,
    #009f90 52%,
    #0096af 60%,
    #607de8 75%,
    #af5fa9 88%,
    #cc5594 97%,
    #d65365 100%
  );
  cursor: pointer;
}

/* Selector de tonos / intensidad */
.tones-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tones-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-soft);
}

.tones-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.tone-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.5rem 0.65rem;
  background: #faf7f2;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
}

.tone-btn:hover {
  border-color: var(--wine-light);
  transform: translateY(-1px);
}

.tone-btn.active {
  border-color: var(--wine);
  background: #fff5f5;
  box-shadow: 0 0 0 1px var(--wine);
}

.tone-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text);
}

.tone-desc {
  font-size: 0.7rem;
  color: var(--text-soft);
  margin-top: 0.15rem;
}

.hue-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--wine);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}

.presets-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.presets-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-soft);
}

.preset-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preset-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease;
}

.preset-btn:hover {
  transform: scale(1.15);
}

.preset-btn.active {
  outline: 2px solid var(--wine);
  outline-offset: 2px;
}

.preset-check {
  color: white;
  font-size: 0.85rem;
  font-weight: 900;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.hue-auto-info {
  padding: 1.25rem;
  background: var(--cream);
  border-radius: 10px;
  color: var(--text-soft);
  font-size: 0.85rem;
  line-height: 1.4;
  text-align: center;
}

/* Footer */
.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #faf7f2;
}

.modal-footer-right {
  display: flex;
  gap: 0.6rem;
}

.btn-reset {
  background: transparent;
  border: none;
  color: var(--text-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0.4rem 0.2rem;
  transition: color 0.15s;
}

.btn-reset:hover {
  color: var(--wine);
}

.btn-cancel {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s;
}

.btn-cancel:hover {
  background: var(--cream);
}

.btn-save {
  background: var(--wine);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1.25rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-save:hover {
  background: var(--wine-light);
}

@media (max-width: 500px) {
  .options-grid, .shapes-grid {
    grid-template-columns: 1fr;
  }
}
</style>
