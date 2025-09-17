<script setup>
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
import AnalyticsDashboard from '../components/AnalyticsDashboard.vue'
</script>

<template>
  <div class="min-h-dvh">
    <Navbar />
    <div class="flex">
      <Sidebar />
      <main class="flex-1 p-6 space-y-6">
        <h1 class="section-title">Analytics</h1>
        <AnalyticsDashboard />
      </main>
    </div>
  </div>
</template>
