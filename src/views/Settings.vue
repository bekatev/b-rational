<script setup>
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import { useUiStore } from '../stores/ui'
import { useIncomeStore } from '../stores/income'
import { useExpensesStore } from '../stores/expenses'

const ui = useUiStore()
const income = useIncomeStore()
const expenses = useExpensesStore()

function resetData() {
  try {
    localStorage.removeItem('income:sources')
    localStorage.removeItem('expenses:entries')
    localStorage.removeItem('expenses:categories')
    localStorage.removeItem('ui:currency')
    localStorage.removeItem('ui:globalCurrency')
    localStorage.removeItem('ui:fxRates')
    // Reset stores in-memory
    income.$reset && income.$reset()
    expenses.$reset && expenses.$reset()
    // Manual fallback resets
    if (income.sources) income.sources = []
    if (expenses.entries) expenses.entries = []
    if (expenses.categories) expenses.categories = [
      { id: 'bank-payments', name: 'Bank Payments' },
      { id: 'food', name: 'Food' },
      { id: 'unexpected-expenses', name: 'Unexpected expenses' },
    ]
    // Trigger rates refetch for current global
    ui.fetchRates()
  } catch {}
}
</script>

<template>
  <div class="min-h-dvh">
    <Navbar />
    <div class="flex">
      <Sidebar />
      <main class="flex-1 p-6 space-y-6">
        <h1 class="section-title">Settings</h1>
        <div class="card-glass p-6 flex items-center justify-between">
          <div>
            <div class="font-medium">Appearance</div>
            <div class="text-sm text-neutral-500">Switch between light and dark</div>
          </div>
          <button class="button-primary" @click="ui.toggleDark()">
            {{ ui.isDark ? 'Dark' : 'Light' }} Mode
          </button>
        </div>

        <div class="card-glass p-6 flex items-center justify-between">
          <div>
            <div class="font-medium">Data</div>
            <div class="text-sm text-neutral-500">Clear all incomes, expenses, and preferences</div>
          </div>
          <button class="button-primary" @click="resetData">Reset Data</button>
        </div>
      </main>
    </div>
  </div>
</template>
