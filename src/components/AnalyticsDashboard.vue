<script setup>
import { computed } from 'vue'
import { Bar, Pie, Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale,
  ArcElement, PointElement, LineElement,
} from 'chart.js'
import { useIncomeStore } from '../stores/income'
import { useExpensesStore } from '../stores/expenses'
import { useUiStore } from '../stores/ui'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement, PointElement, LineElement)

const income = useIncomeStore()
const expenses = useExpensesStore()
const ui = useUiStore()

const incomeVsExpense = computed(() => ({
  labels: ['Income', 'Expenses'],
  datasets: [{
    label: `Amount (${ui.globalCurrency.code})`,
    backgroundColor: ['#0ea5e9', '#ef4444'],
    data: [
      Object.entries(income.totalByCurrency).reduce((sum, [code, val]) => sum + ui.convert(val, code, ui.globalCurrency.code), 0),
      Object.entries(expenses.totalByCurrency).reduce((sum, [code, val]) => sum + ui.convert(val, code, ui.globalCurrency.code), 0),
    ],
    borderRadius: 12,
  }]
}))

const categoryDistribution = computed(() => {
  const labels = expenses.categories.map(c => c.name)
  const data = expenses.categories.map(c => {
    const map = expenses.totalsByCategoryCurrency[c.id] || {}
    return Object.entries(map).reduce((sum, [code, val]) => sum + ui.convert(val, code, ui.globalCurrency.code), 0)
  })
  return {
    labels,
    datasets: [{
      backgroundColor: ['#22c55e','#f59e0b','#3b82f6','#ef4444','#a78bfa','#14b8a6','#eab308'],
      data,
    }]
  }
})

const cumulativeByCategory = computed(() => {
  const labels = expenses.categories.map(c => c.name)
  const perCat = labels.map((_, idx) => {
    const subset = expenses.categories.slice(0, idx + 1)
    return subset.reduce((sum, c) => {
      const map = expenses.totalsByCategoryCurrency[c.id] || {}
      const converted = Object.entries(map).reduce((acc, [code, val]) => acc + ui.convert(val, code, ui.globalCurrency.code), 0)
      return sum + converted
    }, 0)
  })
  return {
    labels,
    datasets: [{ label: `Expenses (${ui.globalCurrency.code})`, borderColor: '#ef4444', data: perCat, tension: 0.35 }]
  }
})
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
    <div class="card-glass p-6">
      <div class="mb-3 font-medium">Income vs Expenses ({{ ui.selectedMonth }})</div>
      <Bar :data="incomeVsExpense" :options="{responsive:true, plugins:{legend:{display:false}}, scales:{y:{grid:{display:false}}}}" />
    </div>

    <div class="card-glass p-6">
      <div class="mb-3 font-medium">Category Distribution ({{ ui.selectedMonth }})</div>
      <Pie :data="categoryDistribution" :options="{responsive:true, plugins:{legend:{position:'bottom'}}}" />
    </div>

    <div class="card-glass p-6 xl:col-span-1">
      <div class="mb-3 font-medium">Cumulative by Category ({{ ui.selectedMonth }})</div>
      <Line :data="cumulativeByCategory" :options="{responsive:true, plugins:{legend:{display:false}}, scales:{y:{grid:{display:false}}}}" />
    </div>
  </div>
</template>
