import { defineStore } from 'pinia'
import { ref, computed, watch, onUnmounted } from 'vue'
import { useUiStore } from './ui'
import { useAuthStore } from './auth'
import { db } from '../firebase'
import { collection, doc, setDoc, addDoc, deleteDoc, onSnapshot, query, where, serverTimestamp, getDocs } from 'firebase/firestore'

function slugifyCategoryName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

// Firestore-backed store now; IDs come from Firestore

const DEFAULT_CATEGORIES = [
  { id: 'bank-payments', name: 'Bank Payments' },
  { id: 'food', name: 'Food' },
  { id: 'unexpected-expenses', name: 'Unexpected expenses' },
]

export const useExpensesStore = defineStore('expenses', () => {
  const ui = useUiStore()
  const auth = useAuthStore()

  const categories = ref([])
  const entries = ref([])
  let stopCats = null
  let stopEntries = null

  async function ensureDefaultCategories(uid) {
    if (!uid) return
    const col = collection(db, `users/${uid}/categories`)
    const snap = await getDocs(col)
    if (snap.empty) {
      for (const c of DEFAULT_CATEGORIES) {
        await setDoc(doc(db, `users/${uid}/categories/${c.id}`), { name: c.name })
      }
    }
  }

  function startWatchers() {
    const uid = auth.user?.uid
    if (!uid) { categories.value = []; entries.value = []; return }
    // categories
    const catsCol = collection(db, `users/${uid}/categories`)
    stopCats = onSnapshot(catsCol, (snap) => {
      categories.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
    // entries for selected month
    const entriesCol = collection(db, `users/${uid}/expenses`)
    const qEntries = query(entriesCol, where('month', '==', ui.selectedMonth))
    stopEntries = onSnapshot(qEntries, (snap) => {
      entries.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  }

  // React to user change and (re)load data
  watch(
    () => auth.user?.uid,
    async (uid) => {
      if (stopCats) { stopCats(); stopCats = null }
      if (stopEntries) { stopEntries(); stopEntries = null }
      if (uid) await ensureDefaultCategories(uid)
      startWatchers()
    },
    { immediate: true }
  )

  watch(() => ui.selectedMonth, () => {
    if (stopEntries) { stopEntries(); stopEntries = null }
    const uid = auth.user?.uid
    if (!uid) { entries.value = []; return }
    const entriesCol = collection(db, `users/${uid}/expenses`)
    const qEntries = query(entriesCol, where('month', '==', ui.selectedMonth))
    stopEntries = onSnapshot(qEntries, (snap) => {
      entries.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  })

  onUnmounted(() => { if (stopCats) stopCats(); if (stopEntries) stopEntries() })

  // Entries filtered by selected month
  const entriesForMonth = computed(() => {
    const month = ui.selectedMonth
    return entries.value.filter(e => e.month === month)
  })

  // Totals per currency across all categories for the selected month
  const totalByCurrency = computed(() => {
    const map = {}
    for (const e of entriesForMonth.value) {
      const code = e.currencyCode || 'GEL'
      map[code] = (map[code] || 0) + Number(e.amount || 0)
    }
    return map
  })

  // Totals per category, broken down by currency, for the selected month
  const totalsByCategoryCurrency = computed(() => {
    const out = {}
    for (const c of categories.value) out[c.id] = {}
    for (const e of entriesForMonth.value) {
      if (!out[e.categoryId]) out[e.categoryId] = {}
      const code = e.currencyCode || 'GEL'
      out[e.categoryId][code] = (out[e.categoryId][code] || 0) + Number(e.amount || 0)
    }
    return out
  })

  async function addCategory(name) {
    if (!auth.user?.uid) return
    const id = slugifyCategoryName(name)
    if (!id) return
    await setDoc(doc(db, `users/${auth.user.uid}/categories/${id}`), { name: String(name || '').trim() || id })
  }

  async function removeCategory(categoryId) {
    if (!auth.user?.uid) return
    // Remove category doc; entries cleanup is optional here (can be handled by UI)
    await deleteDoc(doc(db, `users/${auth.user.uid}/categories/${categoryId}`))
  }

  async function addEntry({ categoryId, amount, currencyCode }) {
    if (!auth.user?.uid) return
    if (!categoryId || !categories.value.some(c => c.id === categoryId)) return
    const amt = Number(amount || 0)
    if (!Number.isFinite(amt) || amt <= 0) return
    const code = String(currencyCode || 'GEL').toUpperCase()
    await addDoc(collection(db, `users/${auth.user.uid}/expenses`), {
      categoryId,
      amount: amt,
      currencyCode: code,
      month: ui.selectedMonth,
      createdAt: serverTimestamp(),
    })
  }

  async function removeEntry(entryId) {
    if (!auth.user?.uid) return
    await deleteDoc(doc(db, `users/${auth.user.uid}/expenses/${entryId}`))
  }

  return {
    categories,
    entries,
    entriesForMonth,
    totalByCurrency,
    totalsByCategoryCurrency,
    addCategory,
    removeCategory,
    addEntry,
    removeEntry,
  }
})


