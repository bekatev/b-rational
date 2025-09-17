<script setup>
const props = defineProps({ as: { type: String, default: 'div' } })
</script>

<template>
  <component :is="props.as" class="card-glass p-6">
    <slot />
  </component>
</template>
