import html2canvas from 'html2canvas'

export async function downloadImage(invoiceNumber) {
  const el = document.getElementById('invoice-preview')
  if (!el) return

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
  })

  const link = document.createElement('a')
  link.download = `invoice-${invoiceNumber || 'draft'}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
