<script setup>
import { ref, computed } from 'vue'
import { useIncomeStore } from '../stores/income'
import { currencies, useUiStore } from '../stores/ui'
import { useCurrency } from '../composables/useCurrency'
import { useAuthStore } from '../stores/auth'

const ui = useUiStore()
const income = useIncomeStore()
const auth = useAuthStore()
const { format, formatRaw } = useCurrency()
const form = ref({ name: '', category: '', amount: 0, currencyCode: 'GEL' })
const errorMsg = ref('')

const canAdd = computed(() => {
  return !!auth.user && !!form.value.name && Number(form.value.amount) > 0
})

async function add() {
  errorMsg.value = ''
  if (!canAdd.value) {
    errorMsg.value = auth.user ? 'Please fill name and a positive amount.' : 'Please sign in to add income.'
    return
  }
  try {
    await income.addSource({ ...form.value, amount: Number(form.value.amount) })
    form.value = { name: '', category: '', amount: 0, currencyCode: 'GEL' }
  } catch (e) {
    errorMsg.value = e?.message || 'Failed to add income. Check your connection and Firestore rules.'
  }
}

function totalAllGlobal() {
  let sum = 0
  for (const s of income.sourcesForMonth) sum += format ? 0 : 0 // placeholder to avoid unused import warning
  // compute using store and ui directly for clarity
  sum = 0
  for (const s of income.sourcesForMonth) sum += ui.convert(Number(s.amount || 0), s.currencyCode, ui.globalCurrency.code)
  return sum
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
      <input v-model="form.name" placeholder="Source name" class="input-base" />
      <input v-model="form.category" placeholder="Category (optional)" class="input-base" />
      <input v-model.number="form.amount" type="number" min="0" step="0.01" placeholder="Amount" class="input-base" />
      <select v-model="form.currencyCode" class="input-base">
        <option v-for="cur in currencies" :key="cur.code" :value="cur.code">{{ cur.code }}</option>
      </select>
      <button class="button-primary disabled:opacity-50 disabled:cursor-not-allowed" :disabled="!canAdd" @click="add">Add Source</button>
    </div>

    <div v-if="!auth.user" class="text-xs text-amber-600 dark:text-amber-400">Sign in to add and save income.</div>
    <div v-if="errorMsg" class="text-xs text-red-600 dark:text-red-400">{{ errorMsg }}</div>

    <div class="text-sm text-neutral-500">Month: {{ ui.selectedMonth }}</div>

    <div class="card-glass p-0 overflow-x-auto">
      <table class="w-full text-left table-styled">
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Currency</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in income.sourcesForMonth" :key="s.id">
            <td>{{ s.name }}</td>
            <td class="font-medium">{{ formatRaw(s.amount, s.currencyCode) }}</td>
            <td>{{ s.currencyCode }}</td>
            <td class="text-right">
              <button class="px-3 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" @click="income.removeSource(s.id)">Remove</button>
            </td>
          </tr>
          <tr v-if="income.sourcesForMonth.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-neutral-500">No sources this month</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="text-right text-lg font-semibold">Total ({{ ui.globalCurrency.code }}): {{ format(totalAllGlobal(), ui.globalCurrency.code) }}</div>

    <div class="text-right text-sm text-neutral-500 flex flex-wrap gap-2 justify-end">
      <template v-for="(total, code) in income.totalByCurrency" :key="code">
        <span class="px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10">{{ code }}: {{ total.toFixed(2) }}</span>
      </template>
    </div>
  </div>
</template>
