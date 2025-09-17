import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useUiStore } from './ui'
import { useAuthStore } from './auth'

function slugifyCategoryName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

function generateEntryId() {
  return `e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function storageKeysForUser(userId) {
  const uid = userId || 'guest'
  return {
    categoriesKey: `expenses:categories:${uid}`,
    entriesKey: `expenses:entries:${uid}`,
  }
}

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

  function loadForUser(userId) {
    const { categoriesKey, entriesKey } = storageKeysForUser(userId)
    try {
      const rawCats = localStorage.getItem(categoriesKey)
      const parsedCats = rawCats ? JSON.parse(rawCats) : null
      categories.value = Array.isArray(parsedCats) && parsedCats.length > 0 ? parsedCats : DEFAULT_CATEGORIES.slice()
    } catch {
      categories.value = DEFAULT_CATEGORIES.slice()
    }

    try {
      const rawEntries = localStorage.getItem(entriesKey)
      const parsedEntries = rawEntries ? JSON.parse(rawEntries) : null
      entries.value = Array.isArray(parsedEntries) ? parsedEntries : []
    } catch {
      entries.value = []
    }

    // Ensure defaults are saved for new users
    saveCategories()
    saveEntries()
  }

  function saveCategories() {
    const { categoriesKey } = storageKeysForUser(auth.user?.uid)
    localStorage.setItem(categoriesKey, JSON.stringify(categories.value))
  }

  function saveEntries() {
    const { entriesKey } = storageKeysForUser(auth.user?.uid)
    localStorage.setItem(entriesKey, JSON.stringify(entries.value))
  }

  // React to user change and (re)load data
  watch(
    () => auth.user?.uid,
    (uid) => {
      loadForUser(uid)
    },
    { immediate: true }
  )

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

  function addCategory(name) {
    const id = slugifyCategoryName(name)
    if (!id) return
    if (categories.value.some(c => c.id === id)) return
    categories.value = [...categories.value, { id, name: String(name || '').trim() || id }]
    saveCategories()
  }

  function removeCategory(categoryId) {
    categories.value = categories.value.filter(c => c.id !== categoryId)
    // Also remove entries that belonged to this category for cleanliness
    const before = entries.value.length
    entries.value = entries.value.filter(e => e.categoryId !== categoryId)
    if (before !== entries.value.length) saveEntries()
    saveCategories()
  }

  function addEntry({ categoryId, amount, currencyCode }) {
    if (!categoryId || !categories.value.some(c => c.id === categoryId)) return
    const amt = Number(amount || 0)
    if (!Number.isFinite(amt) || amt <= 0) return
    const code = String(currencyCode || 'GEL').toUpperCase()
    entries.value = [
      ...entries.value,
      { id: generateEntryId(), categoryId, amount: amt, currencyCode: code, month: ui.selectedMonth },
    ]
    saveEntries()
  }

  function removeEntry(entryId) {
    entries.value = entries.value.filter(e => e.id !== entryId)
    saveEntries()
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


