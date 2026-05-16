import { captureInvoiceToCanvas } from './capture'
import { generateInvoiceHTML } from './invoice-html'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadImage(form, logo, invoiceNumber) {
  if (isMobile()) {
    // html2canvas is unreliable on mobile. Open the invoice as an HTML page —
    // on iOS the user can long-press the page and "Add to Photos" after using
    // the browser's built-in screenshot, or use Share → Save to Files.
    const html = generateInvoiceHTML(form, logo)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
    return
  }

  // Desktop: direct PNG download
  const canvas = await captureInvoiceToCanvas(form, logo)
  const link = document.createElement('a')
  link.download = `invoice-${invoiceNumber || 'draft'}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
