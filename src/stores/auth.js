import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'
import { useExpensesStore } from './expenses'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const status = ref('idle')
  const error = ref('')

  onAuthStateChanged(auth, async (u) => {
    user.value = u ? { uid: u.uid, email: u.email } : null
    if (u) {
      try {
        // Ensure default expense categories exist for this user
        const expenses = useExpensesStore()
        await expenses.ensureSeeded()
      } catch (e) {
        // Non-fatal; UI can still work and show errors if needed
        console.error('Failed to seed expense categories on login', e)
      }
    }
  })

  async function login(email, password) {
    status.value = 'loading'
    error.value = ''
    try {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await signInWithEmailAndPassword(auth, email, password)
      user.value = { uid: cred.user.uid, email: cred.user.email }
      try {
        const expenses = useExpensesStore()
        await expenses.ensureSeeded()
      } catch {}
      status.value = 'success'
    } catch (e) {
      error.value = e.message || 'Login failed'
      status.value = 'error'
      throw e
    }
  }

  async function signup(email, password) {
    status.value = 'loading'
    error.value = ''
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      user.value = { uid: cred.user.uid, email: cred.user.email }
      try {
        const expenses = useExpensesStore()
        await expenses.ensureSeeded()
      } catch {}
      status.value = 'success'
    } catch (e) {
      error.value = e.message || 'Sign up failed'
      status.value = 'error'
      throw e
    }
  }

  async function logout() {
    await signOut(auth)
    user.value = null
  }

  return { user, status, error, login, signup, logout }
})
