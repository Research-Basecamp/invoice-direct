import { captureInvoiceToCanvas } from './capture'
import { generatePDFBlob } from './pdf-text'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadImage(form, logo, invoiceNumber) {
  const filename = `invoice-${invoiceNumber || 'draft'}.png`

  if (isMobile()) {
    // html2canvas is too slow on mobile — iOS gesture expires before share.
    // Share as PDF instead (same content, native Save to Files experience).
    const pdfFilename = `invoice-${invoiceNumber || 'draft'}.pdf`
    const blob = await generatePDFBlob(form, logo)
    const file = new File([blob], pdfFilename, { type: 'application/pdf' })
    await navigator.share({ files: [file], title: pdfFilename })
    return
  }

  // Desktop: direct PNG download
  const canvas = await captureInvoiceToCanvas(form, logo)
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
