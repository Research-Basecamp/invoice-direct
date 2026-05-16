import { captureInvoiceToCanvas } from './capture'
import { generateInvoiceHTML } from './invoice-html'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadImage(form, logo, invoiceNumber) {
  const filename = `invoice-${invoiceNumber || 'draft'}.png`

  if (isMobile()) {
    try {
      const canvas = await captureInvoiceToCanvas(form, logo)
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      const file = new File([blob], filename, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return
      }
      // Share API unavailable — open PNG blob in new tab (user can long-press save)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      // canvas capture failed — open invoice HTML as fallback
      const blob = new Blob([generateInvoiceHTML(form, logo)], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    }
    return
  }

  // Desktop: direct PNG download
  const canvas = await captureInvoiceToCanvas(form, logo)
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
