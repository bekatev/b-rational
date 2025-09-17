<script setup>
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import ExpenseManager from '../components/ExpenseManager.vue'
</script>

<template>
  <div class="min-h-dvh">
    <Navbar />
    <div class="flex">
      <Sidebar />
      <main class="flex-1 p-6 space-y-6">
        <h1 class="section-title">Expenses</h1>
        <ExpenseManager />
      </main>
    </div>
  </div>
</template>
