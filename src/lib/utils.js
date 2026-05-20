import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

// Matches US zip codes and UK/CA/AU-style postcodes
const POSTCODE_RE = /^\d{4,6}(-\d{4})?$|^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i

// Normalises any address string for display:
// - Already multi-line (has \n): returned as-is
// - Comma-separated Nominatim display_name: intelligently rebuilt into
//   "street\ncity, state zip\ncountry", skipping suburbs/counties
// - Plain string with no commas: returned as-is (user-typed)
export function displayAddress(addr) {
  if (!addr) return ''
  if (addr.includes('\n')) return addr

  const parts = addr.split(', ').map(s => s.trim()).filter(Boolean)
  if (parts.length <= 2) return addr

  // Nominatim sometimes emits house number as its own segment, e.g. "1622, Latrobe Street, ..."
  const streetEnd = /^\d+[a-zA-Z]?$/.test(parts[0]) ? 2 : 1
  const street = parts.slice(0, streetEnd).join(' ')
  const rest = parts.slice(streetEnd)

  // Find the postcode to anchor the city/state line
  const zipIdx = rest.findIndex(p => POSTCODE_RE.test(p))

  if (zipIdx !== -1) {
    const zip = rest[zipIdx]
    const state = zipIdx > 0 ? rest[zipIdx - 1] : ''
    // Always take rest[0] as the suburb/locality. Nominatim puts the most
    // specific name first, then may insert council areas or city names before
    // the state (e.g. "Bundoora, Melbourne, Victoria, 3083"). Using rest[0]
    // ensures "Bundoora" is preserved rather than the intermediate city.
    const suburb = zipIdx >= 2 ? rest[0] : ''
    const cityLine = [suburb, state, zip].filter(Boolean).join(', ')
    const country = rest.slice(zipIdx + 1).join(', ')
    return [street, cityLine, country].filter(Boolean).join('\n')
  }

  // No postcode found — street on line 1, everything else on line 2
  const remaining = rest.join(', ')
  return remaining ? `${street}\n${remaining}` : street
}

const BUSINESS_ID_LABELS = {
  AUD: 'ABN / ACN',
  NZD: 'NZBN',
  USD: 'EIN',
  GBP: 'Company No.',
  CAD: 'Business No.',
  INR: 'GSTIN',
  SGD: 'UEN',
  EUR: 'VAT No.',
  ZAR: 'Tax No.',
  MYR: 'SST No.',
}

export function getBusinessIdLabel(currency) {
  return BUSINESS_ID_LABELS[currency] || 'Tax ID'
}

export function invoiceFilename(form) {
  const sanitize = (s) => (s || '').trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')
  const parts = [sanitize(form.billToCompany), sanitize(form.billToContact)].filter(Boolean)
  return parts.length ? `invoice-${parts.join('-')}` : 'invoice-draft'
}

export function formatDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function calculateTotals(items, taxRate, discountRate) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)
  const discountAmount = subtotal * (discountRate / 100)
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (taxRate / 100)
  const total = afterDiscount + taxAmount
  return { subtotal, discountAmount, taxAmount, total }
}
