import { defineStore } from 'pinia'
import { ref, watchEffect } from 'vue'

const CURRENCY_KEY = 'ui:currency'
const DARK_KEY = 'ui:dark'
const GLOBAL_KEY = 'ui:globalCurrency'
const RATES_KEY = 'ui:fxRates'
const MONTH_KEY = 'ui:selectedMonth'

export const currencies = [
  { code: 'USD', locale: 'en-US', currency: 'USD', symbol: '$' },
  { code: 'EUR', locale: 'de-DE', currency: 'EUR', symbol: '€' },
  { code: 'GEL', locale: 'ka-GE', currency: 'GEL', symbol: '₾' },
]

function todayMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export function initDarkClass() {
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(DARK_KEY) : null
  const isDark = stored ? stored === 'true' : prefersDark
  const root = document.documentElement
  if (isDark) root.classList.add('dark')
  else root.classList.remove('dark')
}

export const useUiStore = defineStore('ui', () => {
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  const storedDark = typeof localStorage !== 'undefined' ? localStorage.getItem(DARK_KEY) : null
  const isDark = ref(storedDark ? storedDark === 'true' : prefersDark)

  const storedCurrency = typeof localStorage !== 'undefined' ? localStorage.getItem(CURRENCY_KEY) : null
  const currency = ref(storedCurrency ? JSON.parse(storedCurrency) : currencies.find(c => c.code === 'GEL'))

  const storedGlobal = typeof localStorage !== 'undefined' ? localStorage.getItem(GLOBAL_KEY) : null
  const globalCurrency = ref(storedGlobal ? JSON.parse(storedGlobal) : currencies.find(c => c.code === 'GEL'))

  let initialRates = null
  try { initialRates = JSON.parse(localStorage.getItem(RATES_KEY)) || null } catch { initialRates = null }
  const fx = ref(initialRates)

  const storedMonth = typeof localStorage !== 'undefined' ? localStorage.getItem(MONTH_KEY) : null
  const selectedMonth = ref(storedMonth || todayMonth())

  watchEffect(() => {
    localStorage.setItem(DARK_KEY, String(isDark.value))
    const root = document.documentElement
    if (isDark.value) root.classList.add('dark')
    else root.classList.remove('dark')
  })

  watchEffect(() => { localStorage.setItem(CURRENCY_KEY, JSON.stringify(currency.value)) })
  watchEffect(() => { localStorage.setItem(GLOBAL_KEY, JSON.stringify(globalCurrency.value)) })
  watchEffect(() => { if (fx.value) localStorage.setItem(RATES_KEY, JSON.stringify(fx.value)) })
  watchEffect(() => { if (selectedMonth.value) localStorage.setItem(MONTH_KEY, selectedMonth.value) })

  function toggleDark() { isDark.value = !isDark.value }

  function setCurrency(next) {
    const found = currencies.find(c => c.code === (next.code || next))
    if (found) currency.value = found
  }

  function setGlobalCurrency(next) {
    const found = currencies.find(c => c.code === (next.code || next))
    if (found) {
      globalCurrency.value = found
      ensureRates()
    }
  }

  async function fetchFromExchangerateHost(base) {
    const res = await fetch(`https://api.exchangerate.host/latest?base=${base}`)
    if (!res.ok) throw new Error('exchangerate.host failed')
    const data = await res.json()
    if (!data || !data.rates) throw new Error('exchangerate.host malformed')
    return { base: base, rates: data.rates, date: data.date }
  }

  async function fetchFromOpenER(base) {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`)
    if (!res.ok) throw new Error('open.er-api failed')
    const data = await res.json()
    if (data.result !== 'success' || !data.rates) throw new Error('open.er-api malformed')
    return { base: data.base_code, rates: data.rates, date: data.time_last_update_utc }
  }

  async function fetchFromFrankfurter(base) {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${base}`)
    if (!res.ok) throw new Error('frankfurter failed')
    const data = await res.json()
    if (!data || !data.rates) throw new Error('frankfurter malformed')
    // Frankfurter omits base in rates; add base=1
    return { base: data.base, rates: { [data.base]: 1, ...data.rates }, date: data.date }
  }

  function deriveBaseFromUSD(targetBase, usd) {
    // usd = { base: 'USD', rates: { USD:1, EUR:x, GEL:y, ... } }
    const rates = {}
    const denom = usd.rates[targetBase]
    if (!denom) return null
    for (const [code, val] of Object.entries(usd.rates)) {
      rates[code] = val / denom
    }
    rates[targetBase] = 1
    return { base: targetBase, rates, date: usd.date }
  }

  async function fetchRates() {
    const base = globalCurrency.value.code
    // Try providers in order; if provider doesn't support base, derive from USD
    try {
      const r = await fetchFromExchangerateHost(base)
      fx.value = r
      return
    } catch {}
    try {
      const r = await fetchFromOpenER(base)
      fx.value = r
      return
    } catch {}
    // Try USD then derive arbitrary base
    try {
      const usd = await fetchFromOpenER('USD')
      const derived = deriveBaseFromUSD(base, usd)
      if (derived) { fx.value = derived; return }
    } catch {}
    try {
      const r = await fetchFromFrankfurter(base)
      fx.value = r
      return
    } catch {}
    // Last resort: frankfurter USD -> derive
    try {
      const usd = await fetchFromFrankfurter('USD')
      const derived = deriveBaseFromUSD(base, usd)
      if (derived) { fx.value = derived; return }
    } catch {}
    // If everything fails, keep existing fx (if any)
  }

  function ensureRates() {
    const base = globalCurrency.value.code
    const stale = !fx.value || !fx.value.rates || fx.value.base !== base
    if (stale) fetchRates()
  }

  function convert(amount, fromCode, toCode = globalCurrency.value.code) {
    const num = Number(amount || 0)
    if (!fx.value || !fx.value.rates) return num
    if (fromCode === toCode) return num
    // Normalize: make sure we have rates for both
    const haveFrom = fx.value.rates[fromCode]
    const haveTo = fx.value.rates[toCode]
    if (!haveFrom || !haveTo) return num
    // Rates are expressed as 1 base = rate[code] units of code
    // Convert from -> base -> to
    const inBase = num / fx.value.rates[fromCode]
    return inBase * fx.value.rates[toCode]
  }

  return { isDark, toggleDark, currency, setCurrency, globalCurrency, setGlobalCurrency, fx, fetchRates, ensureRates, convert, selectedMonth }
})
