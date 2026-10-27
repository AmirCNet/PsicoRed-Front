import { ref, computed } from 'vue'

const STORAGE_THEME_KEY = 'psicored_theme_mode' // 'light' | 'dark' | 'system'
const STORAGE_TOGGLE_VISIBLE_KEY = 'psicored_show_theme_toggle' // 'true' | 'false'

// Recuperar modo inicial
const getStoredTheme = () => {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(STORAGE_THEME_KEY)
  if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  
  // Retrocompatibilidad con psicored_theme previo
  const legacy = localStorage.getItem('psicored_theme')
  if (legacy === 'dark' || legacy === 'light') return legacy
  return 'system'
}

// Recuperar visibilidad del botón rápido
const getStoredToggleVisibility = () => {
  if (typeof window === 'undefined') return true
  const saved = localStorage.getItem(STORAGE_TOGGLE_VISIBLE_KEY)
  return saved === null ? true : saved === 'true'
}

// Estado reactivo global singleton
const themeMode = ref(getStoredTheme())
const showQuickToggle = ref(getStoredToggleVisibility())
const systemPrefersDark = ref(
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false
)

// Aplicar cambios en el DOM (<html class="dark" data-theme="dark">)
const applyThemeDOM = (dark) => {
  if (typeof document === 'undefined') return
  if (dark) {
    document.documentElement.classList.add('dark')
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.documentElement.setAttribute('data-theme', 'light')
  }
}

// Escuchar cambios de preferencia a nivel sistema operativo
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    systemPrefersDark.value = e.matches
    if (themeMode.value === 'system') {
      applyThemeDOM(e.matches)
    }
  })
}

// Determina si en este momento debe mostrarse oscuro
const isDark = computed(() => {
  if (themeMode.value === 'dark') return true
  if (themeMode.value === 'light') return false
  return systemPrefersDark.value
})

export const useTheme = () => {
  const setThemeMode = (mode) => {
    if (!['light', 'dark', 'system'].includes(mode)) return
    themeMode.value = mode
    localStorage.setItem(STORAGE_THEME_KEY, mode)
    localStorage.setItem('psicored_theme', isDark.value ? 'dark' : 'light')
    applyThemeDOM(isDark.value)
  }

  const toggleTheme = () => {
    // Si actualmente está oscuro, pasa a claro; de lo contrario pasa a oscuro
    const nextMode = isDark.value ? 'light' : 'dark'
    setThemeMode(nextMode)
  }

  const setShowQuickToggle = (val) => {
    showQuickToggle.value = Boolean(val)
    localStorage.setItem(STORAGE_TOGGLE_VISIBLE_KEY, String(showQuickToggle.value))
  }

  const initTheme = () => {
    applyThemeDOM(isDark.value)
  }

  return {
    themeMode,
    isDark,
    showQuickToggle,
    setThemeMode,
    toggleTheme,
    setShowQuickToggle,
    initTheme
  }
}
