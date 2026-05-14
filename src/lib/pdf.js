import { generateInvoiceHTML } from './invoice-html'

export function downloadPDF(form, logo) {
  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow popups to download the PDF.')
    return
  }
  win.document.write(generateInvoiceHTML(form, logo))
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 400)
}
