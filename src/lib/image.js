import { captureInvoiceToCanvas } from './capture'
import { generateInvoiceCanvas } from './canvas-invoice'

export async function generatePNGBlob(form, logo) {
  const canvas = await generateInvoiceCanvas(form, logo)
  return new Promise(r => canvas.toBlob(r, 'image/png'))
}

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadImage(form, logo, invoiceNumber) {
  const filename = `invoice-${invoiceNumber || 'draft'}.png`

  if (isMobile()) {
    // Canvas 2D API — no html2canvas, runs in ~10ms so the iOS gesture stays valid.
    // Sharing as PNG lets iOS show "Save Image" → Photos and Android save to Gallery.
    const canvas = await generateInvoiceCanvas(form, logo)
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'))
    const file = new File([blob], filename, { type: 'image/png' })
    await navigator.share({ files: [file], title: filename })
    return
  }

  // Desktop: direct PNG download
  const canvas = await captureInvoiceToCanvas(form, logo)
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
