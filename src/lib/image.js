import html2canvas from 'html2canvas'
import { INVOICE_STYLES, renderInvoiceContent } from './invoice-html'

export async function downloadImage(form, logo, invoiceNumber) {
  // Render into an off-screen div so html2canvas sees real DOM with the same styles
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
    const link = document.createElement('a')
    link.download = `invoice-${invoiceNumber || 'draft'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } finally {
    document.head.removeChild(style)
    document.body.removeChild(wrapper)
  }
}
