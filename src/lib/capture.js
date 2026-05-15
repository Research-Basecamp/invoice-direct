import html2canvas from 'html2canvas'
import { generateInvoiceHTML } from './invoice-html'

export function captureInvoiceToCanvas(form, logo) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe')
    iframe.style.cssText =
      'position:absolute;left:-9999px;top:0;width:816px;height:1056px;border:none;'
    document.body.appendChild(iframe)

    const cleanup = () => {
      try { document.body.removeChild(iframe) } catch (_) {}
    }

    iframe.addEventListener('load', async () => {
      try {
        // Let fonts and layout settle
        await new Promise(r => setTimeout(r, 200))

        const canvas = await html2canvas(iframe.contentDocument.body, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          width: 816,
          height: 1056,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 816,
          windowHeight: 1056,
        })
        cleanup()
        resolve(canvas)
      } catch (err) {
        cleanup()
        reject(err)
      }
    })

    iframe.addEventListener('error', (err) => { cleanup(); reject(err) })
    iframe.srcdoc = generateInvoiceHTML(form, logo)
  })
}
