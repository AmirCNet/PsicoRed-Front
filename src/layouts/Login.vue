<template>
  <div class="auth-container">
    <div class="auth-box">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--cream);
}

.auth-box {
  background: var(--white);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 24px rgba(77, 14, 11, 0.10);
  border: 1px solid var(--rose-light);
  overflow: hidden;   /* Slide del registro */
  position: relative;
}
</style>
