import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth } from '../firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const status = ref('idle')
  const error = ref('')

  onAuthStateChanged(auth, (u) => {
    user.value = u ? { uid: u.uid, email: u.email } : null
  })

  async function login(email, password) {
    status.value = 'loading'
    error.value = ''
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      user.value = { uid: cred.user.uid, email: cred.user.email }
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
