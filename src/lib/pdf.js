import { jsPDF } from 'jspdf'
import { captureInvoiceToCanvas } from './capture'
import { generateInvoiceHTML } from './invoice-html'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadPDF(form, logo, invoiceNumber) {
  if (isMobile()) {
    // html2canvas + iframe is unreliable on mobile browsers.
    // Open the invoice HTML directly — the browser renders it perfectly and
    // the user can tap Share → Print → Save as PDF (iOS) or use the
    // browser menu to download/print (Android).
    const html = generateInvoiceHTML(form, logo)
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
    return
  }

  // Desktop: direct PDF download via html2canvas + jsPDF
  const canvas = await captureInvoiceToCanvas(form, logo)
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 612, 792)
  pdf.save(`invoice-${invoiceNumber || 'draft'}.pdf`)
}
