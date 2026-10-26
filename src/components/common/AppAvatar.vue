<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { Blobatar } from '@blobatar/vue'
import { 
  getStoredAvatar, 
  resolveExpression, 
  resolveShapeValue 
} from '../../services/avatarConfig'

const props = defineProps({
  seed: {
    type: String,
    required: false,
    default: ''
  },
  userId: {
    type: [String, Number],
    default: null
  },
  size: {
    type: Number,
    default: 40
  },
  shape: {
    type: String,
    default: null
  },
  expression: {
    type: String,
    default: null
  },
  hue: {
    type: Number,
    default: null
  },
  background: {
    type: [String, Boolean],
    default: 'squircle'
  },
  animate: {
    type: [String, Boolean],
    default: 'hover'
  },
  title: {
    type: String,
    default: ''
  }
})

// Configuración personalizada cargada desde localStorage (si existe para el userId)
const customConfig = ref(props.userId ? getStoredAvatar(props.userId) : null)

const refreshCustomConfig = (event) => {
  if (props.userId && (!event || event.detail?.userId === props.userId)) {
    customConfig.value = getStoredAvatar(props.userId)
  }
}

onMounted(() => {
  refreshCustomConfig()
  window.addEventListener('psicored:avatar-updated', refreshCustomConfig)
})

onUnmounted(() => {
  window.removeEventListener('psicored:avatar-updated', refreshCustomConfig)
})

watch(() => props.userId, () => {
  refreshCustomConfig()
})

// Seed final: prioriza userId/email/nombre, o fallback consistente
const effectiveSeed = computed(() => {
  if (props.seed && props.seed.trim()) return props.seed.trim()
  if (props.userId) return `user-${props.userId}`
  return 'psicored-avatar'
})

// Resolver expresión activa (prop explícita > config de usuario > default null)
const effectiveExpression = computed(() => {
  const exprId = props.expression ?? customConfig.value?.expression
  return exprId ? resolveExpression(exprId) : undefined
})

// Resolver tono/hue activo (prop explícita > config de usuario > hash de blobatar)
const effectiveHue = computed(() => {
  if (props.hue !== null && props.hue !== undefined) return props.hue
  if (customConfig.value?.hue !== null && customConfig.value?.hue !== undefined) {
    return customConfig.value.hue
  }
  return undefined
})

// Resolver traits de forma
const effectiveTraits = computed(() => {
  const shapeId = props.shape ?? customConfig.value?.shape
  const shapeVal = resolveShapeValue(shapeId)
  if (shapeVal !== null && shapeVal !== undefined) {
    return { shape: shapeVal }
  }
  return undefined
})
</script>

<template>
  <div class="app-avatar-wrapper" :style="{ width: `${size}px`, height: `${size}px` }">
    <Blobatar
      :name="effectiveSeed"
      :size="size"
      :expression="effectiveExpression"
      :hue="effectiveHue"
      :traits="effectiveTraits"
      :background="background"
      :animate="animate"
      :title="title"
      class="app-avatar-svg"
    />
  </div>
</template>

<style scoped>
.app-avatar-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 24%;
  overflow: hidden;
  user-select: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.app-avatar-wrapper:hover {
  transform: translateY(-1px);
}

.app-avatar-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
