<template>
  <div class="pendiente-screen">
    <div class="pendiente-card">

      <div class="icon-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>

      <h1 class="title">Cuenta en revisión</h1>

      <p class="subtitle">
        Tu registro fue recibido. Un administrador revisará tu solicitud
        y te asignará el rol de profesional en breve.
      </p>

      <div class="email-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        {{ authStore.usuario?.email }}
      </div>

      <div class="steps">
        <div class="step done">
          <span class="step-dot">✓</span>
          <span>Cuenta creada</span>
        </div>
        <div class="step-line"></div>
        <div class="step active">
          <span class="step-dot pulse">2</span>
          <span>Revisión del administrador</span>
        </div>
        <div class="step-line dimmed"></div>
        <div class="step dimmed">
          <span class="step-dot">3</span>
          <span>Completar perfil profesional</span>
        </div>
      </div>

      <button class="btn-logout" @click="cerrarSesion">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Cerrar sesión
      </button>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router    = useRouter()
const authStore = useAuthStore()

const cerrarSesion = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.pendiente-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
  padding: 2rem;
}

.pendiente-card {
  background: var(--white);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(77, 14, 11, 0.10);
  border: 1px solid var(--rose-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
}

/* ── Ícono */
.icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--rose-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--wine);
  margin-bottom: 0.25rem;
}

.icon-wrap svg {
  width: 40px;
  height: 40px;
}

/* ── Título */
.title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--wine);
  margin: 0;
}

.subtitle {
  font-size: 0.95rem;
  color: var(--text-soft);
  line-height: 1.65;
  max-width: 360px;
  margin: 0;
}

/* ── Badge email */
.email-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--wine);
  background: var(--rose-light);
  padding: 0.35rem 0.9rem;
  border-radius: 99px;
}

/* ── Steps */
.steps {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  width: 100%;
  max-width: 280px;
  margin: 0.5rem 0;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}

.step.done     { color: #16a34a; }
.step.active   { color: var(--wine); font-weight: 700; }
.step.dimmed   { color: var(--text-soft); }

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step.done   .step-dot { background: #dcfce7; color: #16a34a; }
.step.active .step-dot { background: var(--wine); color: white; }
.step.dimmed .step-dot { background: var(--border); color: var(--text-soft); }

.pulse {
  animation: pulse-ring 2s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(77, 14, 11, 0.3); }
  50%       { box-shadow: 0 0 0 8px rgba(77, 14, 11, 0); }
}

.step-line {
  width: 2px;
  height: 20px;
  background: #16a34a;
  margin-left: 13px;
}

.step-line.dimmed {
  background: var(--border);
}

/* ── Botón */
.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  background: transparent;
  color: var(--wine);
  border: 1.5px solid var(--rose-light);
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
  margin-top: 0.5rem;
}

.btn-logout:hover {
  background: var(--rose-light);
  border-color: var(--rose);
}
</style>
