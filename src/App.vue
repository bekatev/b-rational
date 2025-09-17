<script setup>
import { onMounted } from 'vue'
import { useUiStore } from './stores/ui'
const ui = useUiStore()

onMounted(() => {
  ui.ensureRates()
})
</script>

<template>
  <div :class="{ dark: ui.isDark }" class="min-h-dvh bg-white text-neutral-900 dark:bg-black dark:text-neutral-100 transition-colors" v-motion :initial="{ opacity: 0, y: 8 }" :enter="{ opacity: 1, y: 0, transition: { duration: 0.4 } }">
    <router-view />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
