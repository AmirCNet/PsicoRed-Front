import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Profesionales from '../views/Profesionales.vue'
import Pacientes from '../views/Pacientes.vue'
import Derivaciones from '../views/Derivaciones.vue'
import Pendiente from '../views/Pendiente.vue'
import CompletarPerfil from '../views/CompletarPerfil.vue'
import { isAuthenticated, getUsuario } from '../services/authService'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    // Vista para usuarios con registro aprobado pero sin rol (esperando)
    path: '/pendiente',
    component: Pendiente,
    meta: { requiresPendiente: true }
  },
  {
    // Vista para usuarios aprobados que aún no completaron su perfil profesional
    path: '/completar-perfil',
    component: CompletarPerfil,
    meta: { requiresPerfilIncompleto: true }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/profesionales',
    component: Profesionales,
    meta: { requiresAuth: true }
  },
  {
    path: '/pacientes',
    component: Pacientes,
    meta: { requiresAuth: true }
  },
  {
    path: '/derivaciones',
    component: Derivaciones,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

// ── Guard de navegación
router.beforeEach((to, from, next) => {
  const loggedIn = isAuthenticated()
  const usuario = getUsuario()
  const rol = usuario?.rol ?? null

  const perfilCompleto = JSON.parse(localStorage.getItem('perfilCompleto') ?? 'false')

  // No logueado → solo puede ir al login
  if (!loggedIn) {
    if (to.meta.requiresGuest || to.path === '/login') return next()
    return next('/login')
  }

  // Logueado con rol=null (pendiente de aprobación) → solo devuelve a la ruta /pendiente
  if (rol === null) {
    if (to.path === '/pendiente') return next()
    return next('/pendiente')
  }

  // Logueado como profesional sin perfil completo → solo /completar-perfil
  if (rol === 'profesional' && !perfilCompleto) {
    if (to.path === '/completar-perfil') return next()
    return next('/completar-perfil')
  }

  // Ya logueado con rol válido y perfil completo → no puede ir al login ni a rutas de estado
  if (to.meta.requiresGuest) return next('/dashboard')
  if (to.meta.requiresPendiente) return next('/dashboard')
  if (to.meta.requiresPerfilIncompleto) return next('/dashboard')

  // Rutas solo para administradores
  if (to.meta.requiresAdmin && usuario?.rol !== 'administrador') {
    return next('/dashboard')
  }

  // Ruta protegida normal
  return next()
})
