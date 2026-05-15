import { captureInvoiceToCanvas } from './capture'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadImage(form, logo, invoiceNumber) {
  const filename = `invoice-${invoiceNumber || 'draft'}.png`

  // Pre-open window synchronously while we still have the user gesture (iOS).
  const preWin = isMobile() ? window.open('', '_blank') : null

  try {
    const canvas = await captureInvoiceToCanvas(form, logo)

    if (preWin) {
      // Use a blob URL — data URLs can be too large for mobile window navigation
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        preWin.location.href = url
        setTimeout(() => URL.revokeObjectURL(url), 60000)
      }, 'image/png')
    } else {
      const link = document.createElement('a')
      link.download = filename
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  } catch (err) {
    if (preWin) preWin.close()
    throw err
  }
}
