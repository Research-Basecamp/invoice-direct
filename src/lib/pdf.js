import { jsPDF } from 'jspdf'
import { captureInvoiceToCanvas } from './capture'
import { generatePDFBlob } from './pdf-text'
import { invoiceFilename } from './utils'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadPDF(form, logo) {
  const filename = `${invoiceFilename(form)}.pdf`

  if (isMobile()) {
    // Use text-based jsPDF — no html2canvas, runs in milliseconds so the
    // iOS user-gesture window stays valid when navigator.share() is called.
    const blob = await generatePDFBlob(form, logo)
    const file = new File([blob], filename, { type: 'application/pdf' })
    await navigator.share({ files: [file], title: filename })
    return
  }

  // Desktop: html2canvas → jsPDF direct download
  const canvas = await captureInvoiceToCanvas(form, logo)
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 612, 792)
  pdf.save(filename)
}
