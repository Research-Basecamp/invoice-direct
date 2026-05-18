import { jsPDF } from 'jspdf'
import { formatCurrency, formatDate, displayAddress } from './utils'

// Generates a clean text-based PDF using jsPDF's drawing API.
// No html2canvas / DOM rendering — runs in milliseconds, safe to call
// right before navigator.share() on iOS without losing the gesture context.

async function logoSize(dataUrl, maxW = 120, maxH = 60) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1)
      resolve({ w: Math.round(img.naturalWidth * s), h: Math.round(img.naturalHeight * s) })
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

export async function generatePDFBlob(form, logo) {
  const doc   = new jsPDF({ unit: 'pt', format: 'letter' })
  const W     = 612
  const ML    = 50          // left margin
  const MR    = W - 50     // right edge
  const CW    = MR - ML    // content width (512)
  const MID   = ML + CW / 2

  const currency = form.currency || 'USD'
  const fmt = (n) => formatCurrency(n, currency)

  // ── helpers ─────────────────────────────────────────────────────────
  const font = (size, style = 'normal', rgb = [17, 17, 17]) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...rgb)
  }
  const w = (text, x, y, align = 'left') =>
    doc.text(String(text ?? ''), x, y, { align })
  const rule = (y, rgb = [229, 231, 235], lw = 0.5) => {
    doc.setDrawColor(...rgb)
    doc.setLineWidth(lw)
    doc.line(ML, y, MR, y)
  }

  let y = 50

  // ── logo ────────────────────────────────────────────────────────────
  let logoH = 0
  if (logo) {
    const ls = form.logoScale || 1
    const dims = await logoSize(logo, 120 * ls, 60 * ls)
    if (dims) {
      doc.addImage(logo, ML, y, dims.w, dims.h)
      logoH = dims.h + 10
    }
  }

  // ── INVOICE title ───────────────────────────────────────────────────
  font(28, 'bold')
  w('INVOICE', ML, y + logoH)

  // Invoice # / dates — top right
  let metaY = 50
  if (form.invoiceNumber) {
    font(13, 'bold')
    w(form.invoiceNumber, MR, metaY, 'right')
    metaY += 17
  }
  font(10, 'normal', [85, 85, 85])
  w(`Date: ${formatDate(form.date)}`, MR, metaY, 'right')
  if (form.dueDate) { metaY += 13; w(`Due: ${formatDate(form.dueDate)}`, MR, metaY, 'right') }

  y += logoH + 18
  rule(y, [17, 17, 17], 1.5)
  y += 18

  // ── From / Bill To ──────────────────────────────────────────────────
  const addrStartY = y
  let fromY = y
  let toY   = y

  // FROM column
  font(8, 'bold', [107, 114, 128])
  w('FROM', ML, fromY); fromY += 13
  if (form.fromCompany) { font(11, 'bold'); w(form.fromCompany, ML, fromY); fromY += 14 }
  if (form.fromName)    { font(10, 'normal', [51, 51, 51]); w(form.fromName, ML, fromY); fromY += 13 }
  displayAddress(form.fromAddress || '').split('\n').filter(Boolean)
    .forEach(l => { font(10, 'normal', [68, 68, 68]); w(l, ML, fromY); fromY += 13 })
  if (form.fromEmail) { font(10, 'normal', [68, 68, 68]); w(form.fromEmail, ML, fromY); fromY += 13 }
  if (form.fromPhone) { font(10, 'normal', [68, 68, 68]); w(form.fromPhone, ML, fromY); fromY += 13 }

  // BILL TO column (parallel)
  font(8, 'bold', [107, 114, 128])
  w('BILL TO', MID, toY); toY += 13
  if (form.billToCompany)  { font(11, 'bold'); w(form.billToCompany, MID, toY); toY += 14 }
  if (form.billToContact)  { font(10, 'normal', [51, 51, 51]); w(form.billToContact, MID, toY); toY += 13 }
  displayAddress(form.billToAddress || '').split('\n').filter(Boolean)
    .forEach(l => { font(10, 'normal', [68, 68, 68]); w(l, MID, toY); toY += 13 })
  if (form.billToEmail) { font(10, 'normal', [68, 68, 68]); w(form.billToEmail, MID, toY); toY += 13 }
  if (form.billToPhone) { font(10, 'normal', [68, 68, 68]); w(form.billToPhone, MID, toY); toY += 13 }

  y = Math.max(fromY, toY, addrStartY) + 14
  rule(y); y += 16

  // ── Items ───────────────────────────────────────────────────────────
  const items = (form.items || []).filter(i => i.description)

  if (items.length > 0) {
    const C = { d: ML, q: ML + CW * 0.56, r: ML + CW * 0.68, a: MR }

    font(8, 'bold', [17, 17, 17])
    w('DESCRIPTION', C.d, y); w('QTY', C.q, y); w('RATE', C.r, y); w('AMOUNT', C.a, y, 'right')
    y += 5; rule(y, [17, 17, 17], 1); y += 13

    items.forEach(item => {
      // Wrap long descriptions
      const descLines = doc.splitTextToSize(item.description, CW * 0.53)
      font(10, 'normal', [17, 17, 17])
      doc.text(descLines, C.d, y)
      font(10, 'normal', [51, 51, 51])
      w(String(item.quantity),             C.q, y)
      w(fmt(item.rate),                    C.r, y)
      w(fmt(item.quantity * item.rate),    C.a, y, 'right')
      y += Math.max(descLines.length, 1) * 14 + 2
      rule(y); y += 12
    })
    y += 6
  }

  // ── Totals ──────────────────────────────────────────────────────────
  const subtotal    = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const discountAmt = subtotal * (parseFloat(form.discountRate) || 0) / 100
  const afterDisc   = subtotal - discountAmt
  const taxAmt      = afterDisc * (parseFloat(form.taxRate) || 0) / 100
  const deliveryAmt = parseFloat(form.delivery) || 0
  const total       = afterDisc + taxAmt + deliveryAmt

  const labelX = MR - 180

  const totalsRow = (label, value, bold = false) => {
    font(bold ? 12 : 10, bold ? 'bold' : 'normal', bold ? [17, 17, 17] : [85, 85, 85])
    w(label, labelX, y); w(value, MR, y, 'right'); y += 15
  }

  totalsRow('Subtotal', fmt(subtotal))
  if (discountAmt > 0) totalsRow(`Discount (${parseFloat(form.discountRate) || 0}%)`, `-${fmt(discountAmt)}`)
  if (taxAmt > 0)      totalsRow(`Tax (${parseFloat(form.taxRate) || 0}%)`, fmt(taxAmt))
  if (deliveryAmt > 0) totalsRow('Delivery', fmt(deliveryAmt))
  y += 3; rule(y, [17, 17, 17], 1); y += 14
  totalsRow('Total', fmt(total), true)

  // ── Notes / Payment Terms ────────────────────────────────────────────
  if (form.notes || form.paymentTerms) {
    y += 20; rule(y); y += 14
    const colW = form.notes && form.paymentTerms ? CW / 2 - 8 : CW
    let notesEndY = y
    if (form.notes) {
      font(8, 'bold', [107, 114, 128]); w('NOTES', ML, y); y += 12
      font(10, 'normal', [68, 68, 68])
      const lines = doc.splitTextToSize(form.notes, colW)
      doc.text(lines, ML, y); notesEndY = y + lines.length * 13
    }
    if (form.paymentTerms) {
      const ptX = form.notes ? MID : ML
      let ptY = form.notes ? (notesEndY - (doc.splitTextToSize(form.notes, colW).length * 13)) : y
      font(8, 'bold', [107, 114, 128]); w('PAYMENT TERMS', ptX, ptY); ptY += 12
      font(10, 'normal', [68, 68, 68])
      const lines = doc.splitTextToSize(form.paymentTerms, colW)
      doc.text(lines, ptX, ptY)
    }
  }

  return doc.output('blob')
}
