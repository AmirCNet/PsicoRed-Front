<template>
  <div class="auth-wrapper">
    <div class="slides-track" :class="{ 'slide-left': showRegister }">

      <!--PANEL LOGIN-->
      <div class="auth-panel">
      <div class="login-header">
        <h1 class="login-title">PsicoRed</h1>
        <p class="login-subtitle">Iniciá sesión para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email-login">Correo electrónico</label>
          <input
            id="email-login"
            v-model="loginEmail"
            type="email"
            placeholder="tu@correo.com"
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="password-login">Contraseña</label>
          <input
            id="password-login"
            v-model="loginPassword"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
          />
        </div>

        <div v-if="loginError" class="form-error">
          {{ loginError }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loginLoading">
          <span v-if="loginLoading" class="spinner"></span>
          <span v-else>Ingresar</span>
        </button>
      </form>

      <div class="auth-divider">
        <span>¿No tenés cuenta?</span>
      </div>

      <button type="button" class="btn-ghost" @click="irARegistro">
        Registrarme
      </button>
      </div>

      <!-- PANEL REGISTRO -->
      <div class="auth-panel">

      <!-- Formulario de registro -->
      <template v-if="!registroDone">
        <div class="login-header">
          <h1 class="login-title">Crear cuenta</h1>
          <p class="login-subtitle">Completá tus datos para registrarte</p>
        </div>

        <form @submit.prevent="handleRegister" class="login-form">
          <div class="form-group">
            <label for="email-register">Correo electrónico</label>
            <input
              id="email-register"
              v-model="regEmail"
              type="email"
              placeholder="tu@correo.com"
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password-register">Contraseña</label>
            <input
              id="password-register"
              v-model="regPassword"
              type="password"
              placeholder="Mínimo 8 caracteres"
              autocomplete="new-password"
            />
          </div>

          <div class="form-group">
            <label for="password-confirm">Confirmá la contraseña</label>
            <input
              id="password-confirm"
              v-model="regPasswordConfirm"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </div>

          <div v-if="regError" class="form-error">
            {{ regError }}
          </div>

          <button type="submit" class="btn-primary" :disabled="regLoading">
            <span v-if="regLoading" class="spinner"></span>
            <span v-else>Crear cuenta</span>
          </button>
        </form>

        <div class="auth-divider">
          <span>¿Ya tenés cuenta?</span>
        </div>

        <button type="button" class="btn-ghost" @click="irALogin">
          Iniciar sesión
        </button>
      </template>

      <!-- Pantalla de cuenta pendiente -->
      <template v-else>
        <div class="pending-screen">
          <div class="pending-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          </div>
          <h2 class="pending-title">Cuenta en revisión</h2>
          <p class="pending-msg">
            Tu cuenta fue creada con éxito. Un administrador va a revisar tu solicitud
            y te va a asignar el rol correspondiente.
          </p>
          <p class="pending-email">{{ regEmail }}</p>
          <button type="button" class="btn-primary" @click="volverAlLogin">
            Volver al inicio de sesión
          </button>
        </div>
      </template>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { register } from '../services/authService'

const router    = useRouter()
const authStore = useAuthStore()

// ── Estados de navegación
const showRegister = ref(false)
const registroDone = ref(false)

// ── Login
const loginEmail    = ref('')
const loginPassword = ref('')
const loginError    = ref('')
const loginLoading  = ref(false)

// ── Registro
const regEmail           = ref('')
const regPassword        = ref('')
const regPasswordConfirm = ref('')
const regError           = ref('')
const regLoading         = ref(false)

// ── Navegación entre paneles
const irARegistro = () => {
  loginError.value = ''
  showRegister.value = true
}

const irALogin = () => {
  regError.value = ''
  showRegister.value = false
}

const volverAlLogin = () => {
  registroDone.value = false
  showRegister.value = false
  regEmail.value           = ''
  regPassword.value        = ''
  regPasswordConfirm.value = ''
}

// ── Handlers
const handleLogin = async () => {
  loginError.value  = ''
  loginLoading.value = true
  try {
    await authStore.login(loginEmail.value, loginPassword.value)
    router.push('/dashboard')
  } catch (err) {
    loginError.value = err.message || 'Usuario o contraseña incorrectos.'
  } finally {
    loginLoading.value = false
  }
}

const handleRegister = async () => {
  regError.value = ''

  if (!regEmail.value || !regPassword.value || !regPasswordConfirm.value) {
    regError.value = 'Completá todos los campos.'
    return
  }

  if (regPassword.value !== regPasswordConfirm.value) {
    regError.value = 'Las contraseñas no coinciden.'
    return
  }

  if (regPassword.value.length < 8) {
    regError.value = 'La contraseña debe tener al menos 8 caracteres.'
    return
  }

  regLoading.value = true
  try {
    await register(regEmail.value, regPassword.value)
    registroDone.value = true
  } catch (err) {
    regError.value = err.message || 'Error al crear la cuenta.'
  } finally {
    regLoading.value = false
  }
}
</script>

<style scoped>
/* ── Contenedor con el slide */
.auth-wrapper {
  width: 100%;
  overflow: hidden;
}

/* ── Track: Ambos paneles lado a lado */
.slides-track {
  display: flex;
  width: 200%;
  transition: transform 0.42s cubic-bezier(0.4, 0, 0.2, 1);
}

.slides-track.slide-left {
  transform: translateX(-50%);
}

/* ── Cada panel ocupa la mitad del track = 100% del card */
.auth-panel {
  width: 50%;
  flex-shrink: 0;
}

/* ── Tipografía y header */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--wine);
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 0.9rem;
  color: var(--text-soft);
  margin-top: 4px;
}

/* ── Formulario */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--wine);
}

.form-group input {
  padding: 0.65rem 0.9rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  font-size: 0.95rem;
  color: var(--text);
  background: var(--cream);
  transition: border-color 0.2s, background 0.2s;
  outline: none;
}

.form-group input:focus {
  border-color: var(--rose);
  background: var(--white);
}

.form-group input::placeholder {
  color: #b8a8a0;
}

/* ── Error */
.form-error {
  background: var(--error-bg);
  color: var(--error);
  font-size: 0.85rem;
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  border-left: 3px solid var(--error);
}

/* ── Botones */
.btn-primary {
  margin-top: 0.4rem;
  padding: 0.75rem;
  background: var(--wine);
  color: var(--white);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: var(--wine-light);
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-ghost {
  width: 100%;
  padding: 0.65rem;
  background: transparent;
  color: var(--wine);
  border: 1.5px solid var(--rose-light);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn-ghost:hover {
  background: var(--rose-light);
  border-color: var(--rose);
}

/* ── Divider */
.auth-divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0 0.75rem;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.auth-divider span {
  font-size: 0.8rem;
  color: var(--text-soft);
  white-space: nowrap;
}

/* ── Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Pantalla de cuenta pendiente */
.pending-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.pending-icon {
  width: 72px;
  height: 72px;
  background: var(--rose-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--wine);
  margin-bottom: 0.5rem;
}

.pending-icon svg {
  width: 38px;
  height: 38px;
}

.pending-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--wine);
}

.pending-msg {
  font-size: 0.9rem;
  color: var(--text-soft);
  line-height: 1.6;
}

.pending-email {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--rose);
  background: var(--rose-light);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
}

.pending-screen .btn-primary {
  width: 100%;
  margin-top: 0.5rem;
}
</style>