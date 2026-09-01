<script setup>
import { useToast } from '../composables/useToast'

const { toasts, remove } = useToast()

const iconMap = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['toast', `toast-${t.type}`]"
        >
          <span class="toast-icon" v-html="iconMap[t.type]" />
          <span class="toast-msg">{{ t.message }}</span>
          <button class="toast-close" @click="remove(t.id)">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 9999;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  min-width: 280px;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  font-size: 0.9rem;
  font-weight: 500;
  pointer-events: all;
  backdrop-filter: blur(4px);
}

.toast-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
.toast-error   { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
.toast-warning { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
.toast-info    { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.toast-msg {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  opacity: 0.6;
  padding: 0 0.2rem;
  flex-shrink: 0;
  color: inherit;
  transition: opacity 0.15s;
}
.toast-close:hover { opacity: 1; }

/* Transición */
.toast-enter-active,
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(12px) scale(0.95); }
.toast-leave-to     { opacity: 0; transform: translateX(20px); }
</style>
