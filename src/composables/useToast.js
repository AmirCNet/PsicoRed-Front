import { reactive } from 'vue'

// Estado reactivo compartido globalmente (singleton fuera del composable)
const toasts = reactive([])
let _nextId = 0

export const useToast = () => {
  const add = (message, type = 'info', duration = 4000) => {
    const id = ++_nextId
    toasts.push({ id, message, type })
    setTimeout(() => remove(id), duration)
    return id
  }

  const remove = (id) => {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  const success = (msg, duration) => add(msg, 'success', duration)
  const error   = (msg, duration) => add(msg, 'error',   duration)
  const info    = (msg, duration) => add(msg, 'info',    duration)
  const warning = (msg, duration) => add(msg, 'warning', duration)

  return { toasts, add, remove, success, error, info, warning }
}
