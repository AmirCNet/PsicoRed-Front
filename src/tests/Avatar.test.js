import { describe, it, expect, beforeEach } from 'vitest'
import { 
  SHAPE_OPTIONS, 
  EXPRESSION_OPTIONS, 
  resolveExpression, 
  resolveShapeValue,
  saveStoredAvatar,
  getStoredAvatar,
  removeStoredAvatar
} from '../services/avatarConfig'

describe('avatarConfig & customization service', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('proporciona listas válidas de formas y expresiones', () => {
    expect(SHAPE_OPTIONS.length).toBeGreaterThan(5)
    expect(EXPRESSION_OPTIONS.length).toBeGreaterThan(10)
    expect(SHAPE_OPTIONS.some(s => s.id === 'round')).toBe(true)
    expect(EXPRESSION_OPTIONS.some(e => e.id === 'happy')).toBe(true)
  })

  it('resuelve correctamente valores de forma numéricos de blobatar', () => {
    expect(resolveShapeValue('round')).toBe(0.10)
    expect(resolveShapeValue('organic')).toBe(0.35)
    expect(resolveShapeValue('non-existent')).toBeNull()
  })

  it('resuelve correctamente objetos de expresión de blobatar', () => {
    const exprIdle = resolveExpression('idle')
    const exprHappy = resolveExpression('happy')
    expect(exprIdle).toBeDefined()
    expect(exprHappy).toBeDefined()
    expect(exprIdle).toHaveProperty('p')
  })

  it('persiste, recupera y limpia la configuración de avatar por usuario en localStorage', () => {
    const userId = 'usr-123'
    expect(getStoredAvatar(userId)).toBeNull()

    const config = { shape: 'capsule', expression: 'smug', hue: 215 }
    saveStoredAvatar(userId, config)

    const retrieved = getStoredAvatar(userId)
    expect(retrieved).toEqual(config)

    removeStoredAvatar(userId)
    expect(getStoredAvatar(userId)).toBeNull()
  })
})
