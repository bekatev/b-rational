<script setup>
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import Card from '../components/Card.vue'
import AnalyticsDashboard from '../components/AnalyticsDashboard.vue'
import { useIncomeStore } from '../stores/income'
import { useExpensesStore } from '../stores/expenses'
import { useUiStore } from '../stores/ui'
import { useCurrency } from '../composables/useCurrency'

const income = useIncomeStore()
const expenses = useExpensesStore()
const ui = useUiStore()
const { format } = useCurrency()

function sumConverted(map) {
  let total = 0
  for (const code in map) total += ui.convert(map[code], code, ui.globalCurrency.code)
  return total
}
</script>

<template>
  <div class="min-h-dvh">
    <Navbar />
    <div class="flex">
      <Sidebar />
      <main class="flex-1 p-6 space-y-6">
        <h1 class="section-title">Dashboard</h1>
        <div class="text-sm text-neutral-500">Month: {{ ui.selectedMonth }}</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div class="text-sm text-neutral-500">Income Totals ({{ ui.globalCurrency.code }})</div>
            <div class="text-2xl font-semibold mt-1">{{ format(sumConverted(income.totalByCurrency), ui.globalCurrency.code) }}</div>
          </Card>
          <Card>
            <div class="text-sm text-neutral-500">Expense Totals ({{ ui.globalCurrency.code }})</div>
            <div class="text-2xl font-semibold mt-1">{{ format(sumConverted(expenses.totalByCurrency), ui.globalCurrency.code) }}</div>
          </Card>
          <Card>
            <div class="text-sm text-neutral-500">Net ({{ ui.globalCurrency.code }})</div>
            <div class="text-2xl font-semibold mt-1">{{ format(sumConverted(income.totalByCurrency) - sumConverted(expenses.totalByCurrency), ui.globalCurrency.code) }}</div>
          </Card>
        </div>
        <AnalyticsDashboard />
      </main>
    </div>
  </div>
</template>
