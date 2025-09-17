<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const localError = ref('')
const loading = computed(() => auth.status === 'loading')

async function onSubmit() {
  localError.value = ''
  if (!email.value || !password.value) { localError.value = 'Enter email and password.'; return }
  try {
    await auth.login(email.value, password.value)
    await router.replace({ name: 'Dashboard' })
  } catch (e) {
    // auth.error is set by store too
    localError.value = e?.message || 'Login failed.'
  }
}
</script>

<template>
  <div class="min-h-dvh grid place-items-center p-6">
    <div class="w-full max-w-md card-glass p-6 space-y-4">
      <h1 class="section-title">Log in</h1>
      <input v-model="email" type="email" placeholder="Email" class="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10" />
      <input v-model="password" type="password" placeholder="Password" class="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10" />
      <button class="button-primary w-full disabled:opacity-50 disabled:cursor-not-allowed" :disabled="loading" @click="onSubmit">
        <span v-if="!loading">Log in</span>
        <span v-else>Signing in…</span>
      </button>
      <div class="text-sm text-neutral-500">Don't have an account? <router-link to="/register" class="underline">Sign up</router-link></div>
      <div v-if="localError || auth.error" class="text-sm text-red-500">{{ localError || auth.error }}</div>
    </div>
  </div>
</template>
