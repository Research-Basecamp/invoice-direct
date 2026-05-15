import { captureInvoiceToCanvas } from './capture'

export async function downloadImage(form, logo, invoiceNumber) {
  const canvas = await captureInvoiceToCanvas(form, logo)
  const link = document.createElement('a')
  link.download = `invoice-${invoiceNumber || 'draft'}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
