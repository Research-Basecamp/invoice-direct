import { formatCurrency, formatDate, displayAddress } from './utils'

// Draws the invoice onto a 2× canvas using the Canvas 2D API.
// Pure JS — no DOM rendering, no html2canvas. Runs in ~10 ms so
// navigator.share() can be called immediately on mobile.

function loadImg(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function generateInvoiceCanvas(form, logo) {
  const SCALE = 2
  const PW = 816, PH = 1056
  const canvas  = document.createElement('canvas')
  canvas.width  = PW * SCALE
  canvas.height = PH * SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(SCALE, SCALE)

  // Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PW, PH)

  const ML = 60, MR = PW - 60, CW = MR - ML, MID = ML + CW / 2
  const currency = form.currency || 'USD'
  const fmt = (n) => formatCurrency(n, currency)

  // ── helpers ──────────────────────────────────────────────────────────
  const fnt = (size, bold = false) => {
    ctx.font = `${bold ? '700' : '400'} ${size}px -apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif`
  }
  const clr = (hex) => { ctx.fillStyle = hex }
  const txt = (str, x, y, align = 'left') => {
    const prev = ctx.textAlign; ctx.textAlign = align
    ctx.fillText(String(str ?? ''), x, y)
    ctx.textAlign = prev
  }
  const hline = (y, hex = '#e5e7eb', lw = 0.5) => {
    ctx.strokeStyle = hex; ctx.lineWidth = lw
    ctx.beginPath(); ctx.moveTo(ML, y); ctx.lineTo(MR, y); ctx.stroke()
  }
  const wrap = (str, maxW) => {
    const words = String(str || '').split(' ')
    const lines = []; let cur = ''
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = word }
      else { cur = test }
    }
    if (cur) lines.push(cur)
    return lines.length ? lines : ['']
  }

  let y = 60

  // ── logo ─────────────────────────────────────────────────────────────
  let logoH = 0
  if (logo) {
    const img = await loadImg(logo)
    if (img) {
      const ls = form.logoScale || 1
      const s  = Math.min(140 / img.naturalWidth, 70 / img.naturalHeight, 1) * ls
      const lw = img.naturalWidth * s, lh = img.naturalHeight * s
      ctx.drawImage(img, ML, y, lw, lh)
      logoH = lh + 14
    }
  }

  // ── INVOICE title ────────────────────────────────────────────────────
  fnt(32, true); clr('#111111')
  txt('INVOICE', ML, y + logoH + 28)

  // meta – top right
  let metaY = 72
  if (form.invoiceNumber) {
    fnt(14, true); clr('#111111')
    txt(form.invoiceNumber, MR, metaY, 'right'); metaY += 19
  }
  fnt(11, false); clr('#555555')
  txt(`Date: ${formatDate(form.date)}`, MR, metaY, 'right')
  if (form.dueDate) { metaY += 15; txt(`Due: ${formatDate(form.dueDate)}`, MR, metaY, 'right') }

  y += logoH + 46
  hline(y, '#111111', 1.5); y += 24

  // ── From / Bill To ────────────────────────────────────────────────────
  const party = (label, company, contact, address, email, phone, x, startY) => {
    let py = startY
    fnt(9, true);  clr('#9CA3AF'); txt(label.toUpperCase(), x, py); py += 15
    if (company) { fnt(12, true);  clr('#111111'); txt(company, x, py); py += 16 }
    if (contact) { fnt(11, false); clr('#333333'); txt(contact, x, py); py += 14 }
    displayAddress(address || '').split('\n').filter(Boolean)
      .forEach(l => { fnt(11, false); clr('#555555'); txt(l, x, py); py += 13 })
    if (email) { fnt(11, false); clr('#555555'); txt(email, x, py); py += 13 }
    if (phone) { fnt(11, false); clr('#555555'); txt(phone, x, py); py += 13 }
    return py
  }

  const addrY0 = y
  const fromEnd = party('From', form.fromCompany, form.fromName, form.fromAddress, form.fromEmail, form.fromPhone, ML,  addrY0)
  const toEnd   = party('Bill To', form.billToCompany, form.billToContact, form.billToAddress, form.billToEmail, form.billToPhone, MID, addrY0)

  y = Math.max(fromEnd, toEnd) + 18
  hline(y); y += 20

  // ── Items ─────────────────────────────────────────────────────────────
  const items = (form.items || []).filter(i => i.description)

  if (items.length > 0) {
    const C = { d: ML, q: ML + CW * 0.57, r: ML + CW * 0.70, a: MR }

    fnt(9, true); clr('#111111')
    txt('DESCRIPTION', C.d, y); txt('QTY', C.q, y); txt('RATE', C.r, y); txt('AMOUNT', C.a, y, 'right')
    y += 7; hline(y, '#111111', 1); y += 15

    items.forEach(item => {
      fnt(11, false)
      const dlines = wrap(item.description, CW * 0.53)
      clr('#111111'); dlines.forEach((l, i) => txt(l, C.d, y + i * 14))
      clr('#333333')
      txt(String(item.quantity),          C.q, y)
      txt(fmt(item.rate),                 C.r, y)
      txt(fmt(item.quantity * item.rate), C.a, y, 'right')
      y += Math.max(dlines.length, 1) * 14 + 5
      hline(y); y += 13
    })
    y += 8
  }

  // ── Totals ────────────────────────────────────────────────────────────
  const subtotal    = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const discountAmt = subtotal * (parseFloat(form.discountRate) || 0) / 100
  const afterDisc   = subtotal - discountAmt
  const taxAmt      = afterDisc * (parseFloat(form.taxRate) || 0) / 100
  const deliveryAmt = parseFloat(form.delivery) || 0
  const total       = afterDisc + taxAmt + deliveryAmt

  const lx = MR - 180
  const totRow = (label, value, bold = false) => {
    fnt(bold ? 13 : 11, bold); clr(bold ? '#111111' : '#666666')
    txt(label, lx, y); txt(value, MR, y, 'right'); y += 17
  }

  totRow('Subtotal', fmt(subtotal))
  if (discountAmt > 0) totRow(`Discount (${parseFloat(form.discountRate) || 0}%)`, `-${fmt(discountAmt)}`)
  if (taxAmt > 0)      totRow(`Tax (${parseFloat(form.taxRate) || 0}%)`, fmt(taxAmt))
  if (deliveryAmt > 0) totRow('Delivery', fmt(deliveryAmt))
  y += 4; hline(y, '#111111', 1); y += 17
  totRow('Total', fmt(total), true)

  // ── Notes / Payment Terms ─────────────────────────────────────────────
  if (form.notes || form.paymentTerms) {
    y += 26; hline(y); y += 16
    const colW = form.notes && form.paymentTerms ? CW / 2 - 12 : CW

    if (form.notes) {
      fnt(9, true); clr('#9CA3AF'); txt('NOTES', ML, y)
      let ny = y + 13
      fnt(11, false); clr('#555555')
      wrap(form.notes, colW).forEach(l => { txt(l, ML, ny); ny += 14 })
    }
    if (form.paymentTerms) {
      const ptX = form.notes ? MID : ML
      let py = form.notes ? y : y  // same row start
      fnt(9, true); clr('#9CA3AF'); txt('PAYMENT TERMS', ptX, py)
      py += 13
      fnt(11, false); clr('#555555')
      wrap(form.paymentTerms, colW).forEach(l => { txt(l, ptX, py); py += 14 })
    }
  }

  return canvas
}
