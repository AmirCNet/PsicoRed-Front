<template>
  <div class="not-found-screen">
    <div class="not-found-card">
      <div class="icon-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h1 class="code">404</h1>
      <p class="title">Página no encontrada</p>
      <p class="subtitle">La ruta <code>{{ $route.path }}</code> no existe en el sistema.</p>
      <router-link to="/dashboard" class="btn-home">Volver al inicio</router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const $route = useRoute()
</script>

<style scoped>
.not-found-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream);
  padding: 2rem;
}

.not-found-card {
  background: var(--white);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(77, 14, 11, 0.10);
  border: 1px solid var(--rose-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--rose-light);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--wine);
  margin-bottom: 0.25rem;
}

.icon-wrap svg {
  width: 36px;
  height: 36px;
}

.code {
  font-size: 4rem;
  font-weight: 800;
  color: var(--wine);
  margin: 0;
  line-height: 1;
  letter-spacing: -2px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.subtitle {
  font-size: 0.9rem;
  color: var(--text-soft);
  margin: 0;
  line-height: 1.5;
}

.subtitle code {
  background: var(--rose-light);
  color: var(--wine);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.85rem;
}

.btn-home {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.7rem 1.75rem;
  background: var(--wine);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-home:hover {
  background: var(--wine-light);
}
</style>
