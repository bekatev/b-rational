import { defineStore } from 'pinia'
import { computed, ref, watch, onUnmounted } from 'vue'
import { useUiStore } from './ui'
import { useAuthStore } from './auth'
import { db } from '../firebase'
import { collection, addDoc, doc, deleteDoc, onSnapshot, query, where, serverTimestamp, updateDoc } from 'firebase/firestore'

export const useIncomeStore = defineStore('income', () => {
  const ui = useUiStore()
  const auth = useAuthStore()
  const sources = ref([])
  let stop = null

  function startWatch() {
    if (!auth.user?.uid) { sources.value = []; return }
    const col = collection(db, `users/${auth.user.uid}/incomes`)
    const q = query(col, where('month', '==', ui.selectedMonth))
    stop = onSnapshot(q, (snap) => {
      sources.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  }

  watch(() => auth.user?.uid, () => {
    if (stop) { stop(); stop = null }
    startWatch()
  }, { immediate: true })

  watch(() => ui.selectedMonth, () => {
    if (stop) { stop(); stop = null }
    startWatch()
  })

  onUnmounted(() => { if (stop) stop() })

  const sourcesForMonth = computed(() => sources.value.filter(s => (s.month || '').startsWith(ui.selectedMonth)))

  const totalByCurrency = computed(() => {
    const map = {}
    for (const s of sourcesForMonth.value) {
      const code = s.currencyCode || 'USD'
      map[code] = (map[code] || 0) + Number(s.amount || 0)
    }
    return map
  })

  async function addSource(source) {
    if (!auth.user?.uid) throw new Error('Please sign in to add income')
    const col = collection(db, `users/${auth.user.uid}/incomes`)
    await addDoc(col, {
      name: '',
      category: '',
      amount: 0,
      currencyCode: 'USD',
      month: ui.selectedMonth,
      createdAt: serverTimestamp(),
      ...source,
      amount: Number(source.amount || 0),
      currencyCode: String(source.currencyCode || 'USD').toUpperCase(),
    })
  }

  async function removeSource(id) {
    if (!auth.user?.uid || !id) return
    await deleteDoc(doc(db, `users/${auth.user.uid}/incomes/${id}`))
  }

  async function updateSource(id, patch) {
    if (!auth.user?.uid || !id) return
    const ref = doc(db, `users/${auth.user.uid}/incomes/${id}`)
    const out = { ...patch }
    if (out.amount != null) out.amount = Number(out.amount)
    if (out.currencyCode) out.currencyCode = String(out.currencyCode).toUpperCase()
    await updateDoc(ref, out)
  }

  function totalFor(code) {
    return totalByCurrency.value[code] || 0
  }

  function reset() { sources.value = [] }

  return { sources, sourcesForMonth, addSource, removeSource, updateSource, totalByCurrency, totalFor, reset }
})
