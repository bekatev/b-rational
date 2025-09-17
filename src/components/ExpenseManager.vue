<script setup>
import { ref } from 'vue'
import { useExpensesStore } from '../stores/expenses'
import { currencies, useUiStore } from '../stores/ui'
import { useCurrency } from '../composables/useCurrency'

const expenses = useExpensesStore()
const ui = useUiStore()
const { format, formatRaw } = useCurrency()

const newCategory = ref('')

function addEntryFor(categoryId) {
  expenses.addEntry({ categoryId, amount: Number(forms[categoryId].amount || 0), currencyCode: forms[categoryId].currencyCode || 'GEL' })
  forms[categoryId] = { amount: 0, currencyCode: 'GEL' }
}

function totalForCategoryGlobal(categoryId) {
  let sum = 0
  for (const e of expenses.entriesForMonth) {
    if (e.categoryId === categoryId) sum += ui.convert(Number(e.amount || 0), e.currencyCode, ui.globalCurrency.code)
  }
  return sum
}

function totalAllGlobal() {
  let sum = 0
  for (const e of expenses.entriesForMonth) sum += ui.convert(Number(e.amount || 0), e.currencyCode, ui.globalCurrency.code)
  return sum
}

function convertedBreakdownOverall() {
  const out = []
  for (const [code, total] of Object.entries(expenses.totalByCurrency)) {
    const conv = ui.convert(total, code, ui.globalCurrency.code)
    out.push({ code, total, conv })
  }
  return out
}

function convertedBreakdownFor(catId) {
  const map = expenses.totalsByCategoryCurrency[catId] || {}
  const out = []
  for (const [code, total] of Object.entries(map)) {
    const conv = ui.convert(total, code, ui.globalCurrency.code)
    out.push({ code, total, conv })
  }
  return out
}

const forms = {}
for (const c of expenses.categories) forms[c.id] = { amount: 0, currencyCode: 'GEL' }
</script>

<template>
  <div class="space-y-6">
    <div class="flex gap-2">
      <input v-model="newCategory" placeholder="Add category" class="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10" @keyup.enter="() => { if (newCategory) { expenses.addCategory(newCategory); forms[newCategory.trim().toLowerCase().replace(/\s+/g,'-')] = { amount: 0, currencyCode: 'GEL' }; newCategory='' } }" />
      <button class="button-primary" @click="() => { if (newCategory) { expenses.addCategory(newCategory); forms[newCategory.trim().toLowerCase().replace(/\s+/g,'-')] = { amount: 0, currencyCode: 'GEL' }; newCategory='' } }">Add</button>
    </div>

    <div class="text-sm text-neutral-500">Month: {{ ui.selectedMonth }}</div>

    <div class="grid md:grid-cols-3 gap-6">
      <div v-for="c in expenses.categories" :key="c.id" class="card-glass p-0 overflow-hidden">
        <div class="px-4 py-3 flex items-center justify-between bg-black/5 dark:bg-white/10">
          <div class="font-medium">{{ c.name }}</div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-neutral-500">{{ ui.globalCurrency.code }}: {{ format(totalForCategoryGlobal(c.id), ui.globalCurrency.code) }}</span>
            <button class="px-3 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" @click="expenses.removeCategory(c.id)">Remove</button>
          </div>
        </div>

        <div class="p-4 space-y-3">
          <div class="grid grid-cols-3 gap-2 items-end">
            <input v-model.number="forms[c.id].amount" type="number" min="0" step="0.01" placeholder="Amount" class="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10" />
            <select v-model="forms[c.id].currencyCode" class="px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10">
              <option v-for="cur in currencies" :key="cur.code" :value="cur.code">{{ cur.code }}</option>
            </select>
            <button class="button-primary" @click="addEntryFor(c.id)">Add</button>
          </div>

          <div class="card-glass p-0 overflow-hidden">
            <table class="w-full text-left">
              <thead class="bg-black/5 dark:bg:white/10">
                <tr>
                  <th class="px-4 py-3">Amount</th>
                  <th class="px-4 py-3">Currency</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="e in expenses.entriesForMonth.filter(e => e.categoryId === c.id)" :key="e.id" class="border-t border-black/5 dark:border-white/10">
                  <td class="px-4 py-3 font-medium">{{ formatRaw(e.amount, e.currencyCode) }}</td>
                  <td class="px-4 py-3">{{ e.currencyCode }}</td>
                  <td class="px-4 py-3 text-right">
                    <button class="px-3 py-1 rounded-lg hover:bg-black/5 dark:hover:bg:white/10" @click="expenses.removeEntry(e.id)">Remove</button>
                  </td>
                </tr>
                <tr v-if="expenses.entriesForMonth.filter(e => e.categoryId === c.id).length === 0">
                  <td colspan="3" class="px-4 py-6 text-center text-neutral-500">No entries</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="text-right text-sm text-neutral-500 flex flex-col gap-1 items-end">
            <div class="flex flex-wrap gap-2 justify-end">
              <template v-for="(total, code) in expenses.totalsByCategoryCurrency[c.id] || {}" :key="code">
                <span class="px-2 py-1 rounded-lg bg-black/5 dark:bg:white/10">{{ code }}: {{ total.toFixed(2) }}</span>
              </template>
            </div>
            <div class="text-xs">
              <template v-for="b in convertedBreakdownFor(c.id)" :key="b.code">
                <div>{{ b.code }} {{ b.total.toFixed(2) }} → {{ ui.globalCurrency.code }} {{ b.conv.toFixed(2) }}</div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-right text-lg font-semibold">Total ({{ ui.globalCurrency.code }}): {{ format(totalAllGlobal(), ui.globalCurrency.code) }}</div>
    <div class="text-right text-xs text-neutral-500">
      <template v-for="b in convertedBreakdownOverall()" :key="b.code">
        <div>{{ b.code }} {{ b.total.toFixed(2) }} → {{ ui.globalCurrency.code }} {{ b.conv.toFixed(2) }}</div>
      </template>
    </div>
  </div>
</template>
