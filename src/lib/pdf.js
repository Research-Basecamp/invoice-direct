import { jsPDF } from 'jspdf'
import { captureInvoiceToCanvas } from './capture'

export async function downloadPDF(form, logo, invoiceNumber) {
  const canvas = await captureInvoiceToCanvas(form, logo)
  const imgData = canvas.toDataURL('image/jpeg', 0.95)
  // US Letter: 8.5" × 11" = 612pt × 792pt. Invoice page is 816×1056px (same ratio).
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
  pdf.addImage(imgData, 'JPEG', 0, 0, 612, 792)
  pdf.save(`invoice-${invoiceNumber || 'draft'}.pdf`)
}
