import { jsPDF } from 'jspdf'
import { captureInvoiceToCanvas } from './capture'
import { generateInvoiceHTML } from './invoice-html'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadPDF(form, logo, invoiceNumber) {
  const filename = `invoice-${invoiceNumber || 'draft'}.pdf`

  if (isMobile()) {
    try {
      const canvas = await captureInvoiceToCanvas(form, logo)
      const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 612, 792)
      const blob = pdf.output('blob')
      const file = new File([blob], filename, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename })
        return
      }
      // Share API unavailable (older Android) — try direct blob download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = filename
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch {
      // canvas capture failed — open invoice HTML so user can print to PDF
      const blob = new Blob([generateInvoiceHTML(form, logo)], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    }
    return
  }

  // Desktop: direct PDF download
  const canvas = await captureInvoiceToCanvas(form, logo)
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 612, 792)
  pdf.save(filename)
}
