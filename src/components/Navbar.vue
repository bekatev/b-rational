<script setup>
import { RouterLink } from 'vue-router'
import { useUiStore, currencies } from '../stores/ui'
import { useAuthStore } from '../stores/auth'

const ui = useUiStore()
const auth = useAuthStore()
if (!ui.fx) ui.fetchRates()
</script>

<template>
  <header class="flex flex-wrap gap-3 items-center justify-between p-4 border-b border-black/5 dark:border-white/10 backdrop-blur-md sticky top-0 z-20">
    <div class="flex items-center gap-3">
      <div class="h-9 w-9 rounded-xl bg-black dark:bg-white"></div>
      <span class="text-lg font-semibold tracking-tight">B-Rational</span>
    </div>
    <nav class="hidden md:flex items-center gap-2">
      <RouterLink to="/" class="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Dashboard</RouterLink>
      <RouterLink to="/income" class="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Income</RouterLink>
      <RouterLink to="/expenses" class="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Expenses</RouterLink>
      <RouterLink to="/analytics" class="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Analytics</RouterLink>
      <RouterLink to="/settings" class="px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10">Settings</RouterLink>
    </nav>
    <div class="flex items-center gap-2">
      <input type="month" class="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10" :value="ui.selectedMonth" @change="(e) => ui.selectedMonth = e.target.value" />
      <select class="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10" :value="ui.globalCurrency.code" @change="(e) => ui.setGlobalCurrency(e.target.value)">
        <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.code }}</option>
      </select>
      <button class="h-10 w-10 rounded-xl bg-black/5 dark:bg-white/10 grid place-items-center" @click="ui.toggleDark()" :title="ui.isDark ? 'Switch to Light' : 'Switch to Dark'" aria-label="Toggle theme">
        <svg v-if="ui.isDark" viewBox="0 0 1024 1024" class="h-5 w-5" xmlns="http://www.w3.org/2000/svg"><path d="M365.6 864.7c-22.7-9.4-38.5-10.4-69.9-7.1-32.2 3.3-45.1 3.2-64.5-4.1-13.1-4.9-25.2-13-36.7-24.4-11.5-11.5-19.5-23.6-24.5-36.7-7.3-19.4-7.4-32.3-4.1-64.5 3.2-31.5 2.3-47.3-7.1-69.9-7.4-17.9-17-30.6-31.4-43.5-3-2.7-6.2-5.4-10.4-8.9 1.9 1.6-8.5-7-11.2-9.1-29.4-24.6-42.9-47-42.9-84.7s13.5-60.1 42.9-84.7c2.6-2.2 13.1-10.7 11.2-9.1 4.3-3.5 7.4-6.2 10.4-8.9 14.3-12.9 23.9-25.5 31.4-43.5 9.4-22.7 10.4-38.5 7.1-69.9-3.3-32.2-3.2-45.1 4.1-64.5 4.9-13.1 13-25.2 24.4-36.7C205.9 183 218 175 231.2 170c19.4-7.3 32.3-7.4 64.5-4.1 31.5 3.2 47.3 2.3 69.9-7.1 17.9-7.4 30.6-17 43.5-31.4 2.7-3 5.4-6.2 8.9-10.4-1.6 1.9 7-8.5 9.1-11.2 24.6-29.4 47-42.9 84.7-42.9s60.1 13.5 84.7 42.9c2.2 2.6 10.7 13.1 9.1 11.2 3.5 4.3 6.2 7.4 8.9 10.4C627.4 141.7 640 151.3 658 158.8c22.7 9.4 38.5 10.4 69.9 7.1 32.2-3.3 45.1-3.2 64.5 4.1 13.1 4.9 25.2 13 36.7 24.4 11.5 11.5 19.5 23.6 24.4 36.7 7.3 19.4 7.4 32.3 4.1 64.5-3.2 31.5-2.3 47.3 7.1 69.9 7.4 17.9 17 30.6 31.4 43.5 3 2.7 6.2 5.4 10.4 8.9-1.9-1.6 8.5 7 11.2 9.1 29.4 24.6 42.9 47 42.9 84.7s-13.5 60.1-42.9 84.7c-2.6 2.2-13.1 10.7-11.2 9.1-4.3 3.5-7.4 6.2-10.4 8.9-14.3 12.9-23.9 25.5-31.4 43.5-9.4 22.7-10.4 38.5-7.1 69.9 3.3 32.2 3.2 45.1-4.1 64.5-4.9 13.1-13 25.2-24.4 36.7-11.5 11.5-23.6 19.5-36.7 24.4-19.4 7.3-32.3 7.4-64.5 4.1-31.5-3.2-47.3-2.3-69.9 7.1-17.9 7.4-30.6 17-43.5 31.4-2.7 3-5.4 6.2-8.9 10.4 1.6-1.9-7 8.5-9.1 11.2-24.6 29.4-47 42.9-84.7 42.9s-60.1-13.5-84.7-42.9c-2.2-2.6-10.7-13.1-9.1-11.2-3.5-4.3-6.2-7.4-8.9-10.4-12.9-14.3-25.6-23.9-43.5-31.3z" fill="#5E676F"/><path d="M376.3 838.8c74.4 30.8 67.7 93.7 135.4 93.7s61.1-62.9 135.4-93.7c74.4-30.8 114.1 18.4 162-29.5s-1.3-87.7 29.5-162c30.8-74.4 93.7-67.7 93.7-135.4s-62.9-61.1-93.7-135.4c-30.8-74.4 18.4-114.1-29.5-162s-87.7 1.3-162-29.5c-74.4-30.8-67.7-93.7-135.4-93.7S450.6 154.2 376.3 185c-74.4 30.8-114.1-18.4-162 29.5s1.3 87.7-29.5 162c-30.8 74.2-93.7 67.5-93.7 135.3s62.9 61.1 93.7 135.4c30.8 74.4-18.4 114.1 29.5 162s87.6-1.3 162 29.6z" fill="#FFFFFF"/><path d="M511.8 792.2c-154.9 0-280.5-125.6-280.5-280.5S356.9 231.2 511.8 231.2s280.5 125.6 280.5 280.5-125.7 280.5-280.5 280.5z" fill="#5E676F"/><path d="M511.8 736.1c123.9 0 224.4-100.5 224.4-224.4S635.7 287.4 511.8 287.4 287.4 387.8 287.4 511.8s100.4 224.3 224.4 224.3z" fill="#FFFFFF"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5"><path d="M21.64 13a1 1 0 0 0-1.05-1 7 7 0 0 1-8.59-8.59 1 1 0 0 0-1-1.05A9 9 0 1 0 21.64 13Z"/></svg>
      </button>
      <template v-if="auth.user">
        <span class="text-sm text-neutral-500 hidden md:inline">{{ auth.user.email }}</span>
        <button class="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10" @click="auth.logout()">Sign out</button>
      </template>
      <template v-else>
        <RouterLink to="/login" class="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10">Log in</RouterLink>
      </template>
    </div>
  </header>
</template>
