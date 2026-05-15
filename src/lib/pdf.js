import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { INVOICE_STYLES, renderInvoiceContent } from './invoice-html'

export async function downloadPDF(form, logo, invoiceNumber) {
  const style = document.createElement('style')
  style.textContent = INVOICE_STYLES
  document.head.appendChild(style)

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;width:816px;background:#fff;'
  wrapper.innerHTML = renderInvoiceContent(form, logo)
  document.body.appendChild(wrapper)

  try {
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 816,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    // US Letter: 8.5" x 11" = 612pt x 792pt (at 72pt/inch)
    // Invoice page is 816x1056px — same 8.5:11 ratio, maps exactly
    const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
    pdf.addImage(imgData, 'JPEG', 0, 0, 612, 792)
    pdf.save(`invoice-${invoiceNumber || 'draft'}.pdf`)
  } finally {
    document.head.removeChild(style)
    document.body.removeChild(wrapper)
  }
}
