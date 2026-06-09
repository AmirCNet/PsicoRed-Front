import { defineStore } from 'pinia'
import * as authService from '../services/authService'
import { getMiPerfil } from '../services/profesionalService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token:          authService.getToken(),
    usuario:        authService.getUsuario(),
    perfilCompleto: JSON.parse(localStorage.getItem('perfilCompleto') ?? 'false')
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    rol:             (state) => state.usuario?.rol ?? null,
    esAdmin:         (state) => state.usuario?.rol === 'administrador',
    esProfesional:   (state) => state.usuario?.rol === 'profesional',
    esPendiente:     (state) => !!state.token && state.usuario?.rol === null
  },

  actions: {
    async login(email, password) {
      const data = await authService.login(email, password)
      this.token   = data.token
      this.usuario = data.usuario

      // Si es profesional, verificamos si ya tiene perfil completo
      if (data.usuario.rol === 'profesional') {
        await this.verificarPerfil()
      } else {
        this.perfilCompleto = false
        localStorage.setItem('perfilCompleto', 'false')
      }
    },

    async verificarPerfil() {
      try {
        const perfil = await getMiPerfil()
        this.perfilCompleto = perfil !== null
      } catch {
        this.perfilCompleto = false
      }
      localStorage.setItem('perfilCompleto', JSON.stringify(this.perfilCompleto))
    },

    // Llamar después de completar el perfil para desbloquear el acceso
    setPerfilCompleto() {
      this.perfilCompleto = true
      localStorage.setItem('perfilCompleto', 'true')
    },

    logout() {
      authService.logout()
      this.token          = null
      this.usuario        = null
      this.perfilCompleto = false
      localStorage.removeItem('perfilCompleto')
    }
  }
})
