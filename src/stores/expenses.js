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
  { id: 'groceries', name: 'Groceries' },
  { id: 'shopping', name: 'Shopping' },
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
    let snap
    try {
      snap = await getDocs(col)
    } catch (e) {
      console.error('Failed to read categories for seeding', { uid, error: e })
      throw e
    }
    if (snap.empty) {
      for (const c of DEFAULT_CATEGORIES) {
        try {
          await setDoc(doc(db, `users/${uid}/categories/${c.id}`), { name: c.name })
          console.log('Seeded category', c.id, 'for uid', uid)
        } catch (e) {
          console.error('Failed to seed category', c.id, { uid, error: e })
          throw e
        }
      }
    }
  }

  async function ensureSeeded() {
    const uid = auth.user?.uid
    if (!uid) return
    await ensureDefaultCategories(uid)
  }

  let seededOnce = false
  function startWatchers() {
    const uid = auth.user?.uid
    if (!uid) { categories.value = []; entries.value = []; return }
    // categories
    const catsCol = collection(db, `users/${uid}/categories`)
    stopCats = onSnapshot(catsCol, async (snap) => {
      if (snap.empty && !seededOnce) {
        seededOnce = true
        await ensureDefaultCategories(uid)
        return
      }
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

  async function addEntry({ categoryId, name, amount, currencyCode }) {
    if (!auth.user?.uid) throw new Error('Please sign in to add expenses')
    if (!categoryId) throw new Error('Missing category')
    const amt = Number(amount || 0)
    if (!Number.isFinite(amt) || amt <= 0) throw new Error('Amount must be positive')
    const code = String(currencyCode || 'GEL').toUpperCase()
    const payload = {
      categoryId,
      name: String(name || '').trim(),
      amount: amt,
      currencyCode: code,
      month: ui.selectedMonth,
      createdAt: serverTimestamp(),
    }
    console.log('Adding expense for uid', auth.user.uid, payload)
    try {
      await addDoc(collection(db, `users/${auth.user.uid}/expenses`), payload)
    } catch (e) {
      console.error('Failed to write expense', { uid: auth.user.uid, payload, error: e })
      throw e
    }
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
    ensureSeeded,
  }
})


