import { jsPDF } from 'jspdf'
import { INVOICE_STYLES, renderInvoiceContent } from './invoice-html'

export async function downloadPDF(form, logo, invoiceNumber) {
  // Render invoice into a hidden off-screen div
  const style = document.createElement('style')
  style.textContent = INVOICE_STYLES
  document.head.appendChild(style)

  const wrapper = document.createElement('div')
  wrapper.style.cssText = 'position:absolute;left:-9999px;top:0;width:816px;background:#fff;'
  wrapper.innerHTML = renderInvoiceContent(form, logo)
  document.body.appendChild(wrapper)

  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 816,
      height: 1056,
    })

    // US Letter: 8.5" x 11" at 72 dpi = 612 x 792 pt
    const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
    const imgData = canvas.toDataURL('image/jpeg', 0.97)
    pdf.addImage(imgData, 'JPEG', 0, 0, 612, 792)
    pdf.save(`invoice-${invoiceNumber || 'draft'}.pdf`)
  } finally {
    document.head.removeChild(style)
    document.body.removeChild(wrapper)
  }
}
