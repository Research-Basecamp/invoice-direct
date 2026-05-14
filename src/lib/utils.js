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
