import { computed } from 'vue'
import { useUiStore, currencies } from '../stores/ui'

function metaFor(code) {
  return currencies.find(c => c.code === code) || { locale: 'en-US', currency: code, symbol: '' }
}

export function useCurrency() {
  const ui = useUiStore()
  const formatter = computed(() => new Intl.NumberFormat(ui.globalCurrency.locale, { style: 'currency', currency: ui.globalCurrency.currency, maximumFractionDigits: 2 }))

  function format(amount, fromCode = ui.globalCurrency.code) {
    const num = Number(amount || 0)
    try {
      const converted = ui.convert(num, fromCode, ui.globalCurrency.code)
      return formatter.value.format(converted)
    } catch {
      return `${ui.globalCurrency.symbol}${num.toFixed(2)}`
    }
  }

  function formatRaw(amount, code) {
    const num = Number(amount || 0)
    try {
      const m = metaFor(code)
      return new Intl.NumberFormat(m.locale, { style: 'currency', currency: m.currency, maximumFractionDigits: 2 }).format(num)
    } catch {
      return `${code} ${num.toFixed(2)}`
    }
  }

  return { format, formatRaw, currency: ui.globalCurrency }
}
