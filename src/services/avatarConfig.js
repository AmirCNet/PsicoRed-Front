import * as expressions from 'blobatar/expression'
export { palette } from 'blobatar'

export const SHAPE_OPTIONS = [
  { id: 'round', label: 'Redondo', value: 0.10, desc: 'Silueta circular suave' },
  { id: 'organic', label: 'Orgánico', value: 0.35, desc: 'Curvas biológicas dinámicas' },
  { id: 'boxy', label: 'Cuadrado', value: 0.55, desc: 'Esquinas redondeadas compactas' },
  { id: 'capsule', label: 'Cápsula', value: 0.65, desc: 'Alargado horizontal' },
  { id: 'nub', label: 'Nub', value: 0.75, desc: 'Con protuberancias lúdicas' },
  { id: 'cloud', label: 'Nube', value: 0.82, desc: 'Múltiples arcos esponjosos' },
  { id: 'droplet', label: 'Gota', value: 0.88, desc: 'Punta superior estilizada' },
  { id: 'hexagon', label: 'Hexágono', value: 0.93, desc: 'Poligonal geométrico' },
  { id: 'sun', label: 'Sol', value: 0.965, desc: 'Con rayos perimetrales' },
  { id: 'triangle', label: 'Triángulo', value: 0.99, desc: 'Pirámide amigable' }
]

export const EXPRESSION_OPTIONS = [
  { id: 'idle', label: 'Neutral', desc: 'Mirada en reposo' },
  { id: 'happy', label: 'Feliz', desc: 'Ojos achinados sonrientes' },
  { id: 'wink', label: 'Guiño', desc: 'Un ojo cerrado en complicidad' },
  { id: 'smug', label: 'Confiado', desc: 'Inclinación sutil' },
  { id: 'love', label: 'Afecto', desc: 'Mirada cálida y cercana' },
  { id: 'thinking', label: 'Pensativo', desc: 'Atención oscilante' },
  { id: 'surprised', label: 'Sorprendido', desc: 'Ojos bien abiertos' },
  { id: 'sleepy', label: 'Somnoliento', desc: 'Ojos relajados' },
  { id: 'shy', label: 'Tímido', desc: 'Ojos discretos con rubor' },
  { id: 'unsure', label: 'Dudoso', desc: 'Cejas asimétricas' },
  { id: 'sad', label: 'Melancólico', desc: 'Ojos caídos y distanciados' },
  { id: 'mad', label: 'Enojado', desc: 'Mirada intensa en V' },
  { id: 'scared', label: 'Alerta', desc: 'Ojos concentrados' },
  { id: 'sick', label: 'Indispuesto', desc: 'Ligera indisposición' }
]

export const TONE_OPTIONS = [
  { id: 'deep', label: 'Intenso', value: 0.70, desc: 'Color rico y con buen contraste' },
  { id: 'bright', label: 'Luminoso', value: 0.85, desc: 'Color vivo y claro' },
  { id: 'pastel', label: 'Suave / Pastel', value: 0.15, desc: 'Tono atenuado' }
]

export const HUE_PRESETS = [
  { hue: 350, label: 'Vino PsicoRed', color: '#cc5594' },
  { hue: 15, label: 'Coral', color: '#d65365' },
  { hue: 45, label: 'Ámbar', color: '#d7703e' },
  { hue: 150, label: 'Esmeralda', color: '#15a04c' },
  { hue: 185, label: 'Turquesa', color: '#009f90' },
  { hue: 215, label: 'Azul', color: '#0096af' },
  { hue: 270, label: 'Púrpura', color: '#607de8' },
  { hue: 320, label: 'Rosa', color: '#af5fa9' }
]

const STORAGE_PREFIX = 'psicored_avatar_'

/**
 * Obtiene la configuración de avatar guardada para un usuario
 * @param {string|number} userId 
 * @returns {{ shape: string|null, expression: string|null, hue: number|null }|null}
 */
export const getStoredAvatar = (userId) => {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Guarda la configuración de avatar para un usuario
 */
export const saveStoredAvatar = (userId, config) => {
  if (!userId) return
  localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(config))
  window.dispatchEvent(new CustomEvent('psicored:avatar-updated', { detail: { userId, config } }))
}

/**
 * Restaura la configuración al estado predeterminado
 */
export const removeStoredAvatar = (userId) => {
  if (!userId) return
  localStorage.removeItem(`${STORAGE_PREFIX}${userId}`)
  window.dispatchEvent(new CustomEvent('psicored:avatar-updated', { detail: { userId, config: null } }))
}

/**
 * Resuelve el objeto Expression de blobatar para un id dado
 */
export const resolveExpression = (exprId) => {
  if (!exprId || exprId === 'idle') return expressions.idle
  return expressions[exprId] || expressions.idle
}

/**
 * Resuelve el valor numérico de forma (0-1) para un id de shape dado
 */
export const resolveShapeValue = (shapeId) => {
  if (!shapeId) return null
  const found = SHAPE_OPTIONS.find(s => s.id === shapeId)
  return found ? found.value : null
}
