import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const Dashboard = () => import('../views/Dashboard.vue')
const Income = () => import('../views/Income.vue')
const Expenses = () => import('../views/Expenses.vue')
const Analytics = () => import('../views/Analytics.vue')
const Settings = () => import('../views/Settings.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'Login', component: Login, meta: { guestOnly: true } },
    { path: '/register', name: 'Register', component: Register, meta: { guestOnly: true } },
    { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/income', name: 'Income', component: Income, meta: { requiresAuth: true } },
    { path: '/expenses', name: 'Expenses', component: Expenses, meta: { requiresAuth: true } },
    { path: '/analytics', name: 'Analytics', component: Analytics, meta: { requiresAuth: true } },
    { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } },
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.user) return { name: 'Login' }
  if (to.meta.guestOnly && auth.user) return { name: 'Dashboard' }
})

export default router
