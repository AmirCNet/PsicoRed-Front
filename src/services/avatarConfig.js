import * as expressions from 'blobatar/expression'

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
  { id: 'idle', label: 'Neutral', emoji: '😐', desc: 'Mirada en reposo' },
  { id: 'happy', label: 'Feliz', emoji: '😄', desc: 'Ojos achinados sonrientes' },
  { id: 'wink', label: 'Guiño', emoji: '😉', desc: 'Un ojo cerrado en complicidad' },
  { id: 'smug', label: 'Confiado', emoji: '😏', desc: 'Inclinación sutil' },
  { id: 'love', label: 'Afecto', emoji: '🥰', desc: 'Mirada cálida y cercana' },
  { id: 'thinking', label: 'Pensativo', emoji: '🤔', desc: 'Atención oscilante' },
  { id: 'surprised', label: 'Sorprendido', emoji: '😲', desc: 'Ojos bien abiertos' },
  { id: 'sleepy', label: 'Somnoliento', emoji: '😴', desc: 'Ojos relajados' },
  { id: 'shy', label: 'Tímido', emoji: '😊', desc: 'Ojos discretos con rubor' },
  { id: 'unsure', label: 'Dudoso', emoji: '🤨', desc: 'Cejas asimétricas' },
  { id: 'sad', label: 'Melancólico', emoji: '🥺', desc: 'Ojos caídos y distanciados' },
  { id: 'mad', label: 'Enojado', emoji: '😤', desc: 'Mirada intensa en V' },
  { id: 'scared', label: 'Alerta', emoji: '😨', desc: 'Ojos concentrados' },
  { id: 'sick', label: 'Indispuesto', emoji: '🤢', desc: 'Ligera indisposición' }
]

export const HUE_PRESETS = [
  { hue: 350, label: 'Vino PsicoRed', color: '#882233' },
  { hue: 15, label: 'Coral', color: '#e0533c' },
  { hue: 45, label: 'Ámbar', color: '#d98b16' },
  { hue: 150, label: 'Esmeralda', color: '#169b62' },
  { hue: 185, label: 'Turquesa', color: '#12a4a9' },
  { hue: 215, label: 'Azul', color: '#2770d4' },
  { hue: 270, label: 'Púrpura', color: '#7b3bd4' },
  { hue: 320, label: 'Rosa', color: '#c93b95' }
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
