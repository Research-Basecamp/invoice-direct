import { jsPDF } from 'jspdf'
import { captureInvoiceToCanvas } from './capture'

function isMobile() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && navigator.maxTouchPoints > 0)
}

export async function downloadPDF(form, logo, invoiceNumber) {
  const filename = `invoice-${invoiceNumber || 'draft'}.pdf`

  // iOS Safari loses the user-gesture context after any await, so we must
  // open the window NOW (synchronously) and navigate it to the file later.
  const preWin = isMobile() ? window.open('', '_blank') : null

  try {
    const canvas = await captureInvoiceToCanvas(form, logo)
    const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 612, 792)

    if (preWin) {
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      preWin.location.href = url
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } else {
      pdf.save(filename)
    }
  } catch (err) {
    if (preWin) preWin.close()
    throw err
  }
}
