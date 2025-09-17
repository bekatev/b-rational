import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { MotionPlugin } from '@vueuse/motion'
import { initDarkClass } from './stores/ui'
import { useIncomeStore } from './stores/income'
import { useExpensesStore } from './stores/expenses'

initDarkClass()

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(MotionPlugin)
// Initialize stores early so watchers run and categories seed promptly
useIncomeStore()
useExpensesStore()
app.mount('#app')
