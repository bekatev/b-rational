<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <aside class="w-64 p-4 border-r border-black/5 dark:border-white/10 hidden md:block">
    <div class="space-y-1">
      <RouterLink to="/" class="block px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Dashboard</RouterLink>
      <RouterLink to="/income" class="block px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Income</RouterLink>
      <RouterLink to="/expenses" class="block px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Expenses</RouterLink>
      <RouterLink to="/analytics" class="block px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Analytics</RouterLink>
      <RouterLink to="/settings" class="block px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Settings</RouterLink>
    </div>
  </aside>
</template>
