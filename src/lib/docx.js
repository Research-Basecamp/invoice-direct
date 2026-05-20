import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, BorderStyle, ImageRun,
} from 'docx'
import { formatCurrency, formatDate, displayAddress, invoiceFilename, getBusinessIdLabel } from './utils'

// Letter paper: 12240 DXA wide. Margins left+right = 900+900 = 1800.
// Content width = 12240 - 1800 = 10440 DXA
const W = 10440
const HALF = W / 2  // 5220

// ─── Border helpers ───────────────────────────────────────────────────────────
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const NONE = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }
const ROW_BORDER = { ...NONE, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' } }
const HEAD_BORDER = { ...NONE, bottom: { style: BorderStyle.SINGLE, size: 12, color: '111111' } }
const TOTAL_BORDER = { ...NONE, top: { style: BorderStyle.SINGLE, size: 12, color: '111111' } }

// ─── Run / paragraph helpers ──────────────────────────────────────────────────
function r(text, { size = 20, bold = false, color = '111111', caps = false } = {}) {
  return new TextRun({ text: String(text ?? ''), font: 'Calibri', size, bold, color, allCaps: caps })
}

function p(children, align = AlignmentType.LEFT, spacingAfter = 0) {
  return new Paragraph({
    alignment: align,
    spacing: { after: spacingAfter },
    children: Array.isArray(children) ? children : [children],
  })
}

const gap = () => new Paragraph({ children: [r('')], spacing: { after: 120 } })

// ─── Table cell helper ────────────────────────────────────────────────────────
function cell(paragraphs, { w: width, borders = NONE, vAlign } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    borders,
    verticalAlign: vAlign,
    children: Array.isArray(paragraphs) ? paragraphs : [paragraphs],
  })
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function getLogoType(dataUrl) {
  const m = dataUrl.match(/data:image\/(\w+)/)
  const t = m?.[1]?.toLowerCase()
  return t === 'jpeg' ? 'jpg' : (t || 'png')
}

function loadLogo(dataUrl, maxW = 130, maxH = 65) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1)
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      const base64 = dataUrl.split(',')[1]
      try {
        resolve(new ImageRun({ data: base64, transformation: { width: w, height: h }, type: getLogoType(dataUrl) }))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

// ─── Address lines ────────────────────────────────────────────────────────────
function addrParagraphs(addrString) {
  const lines = displayAddress(addrString || '').split('\n').filter(Boolean)
  return lines.map(l => p(r(l, { size: 20, color: '444444' })))
}

// ─── Blob generator (used by App.jsx mobile path and downloadDOCX) ───────────
export async function generateDocxBlob(form, logo) {
  const currency = form.currency || 'USD'
  const fmt = (n) => formatCurrency(n, currency)

  const items = (form.items || []).filter(i => i.description)
  const subtotal   = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const dv = parseFloat(form.discountRate) || 0
  const discountAmt = form.discountType === '$' ? dv : subtotal * dv / 100
  const afterDisc   = subtotal - discountAmt
  const tv = parseFloat(form.taxRate) || 0
  const taxAmt      = form.taxType === '$' ? tv : afterDisc * tv / 100
  const gv = parseFloat(form.gstRate) || 0
  const gstAmt      = form.gstType === '$' ? gv : afterDisc * gv / 100
  const deliveryAmt = parseFloat(form.delivery) || 0
  const total       = afterDisc + taxAmt + gstAmt + deliveryAmt

  const ls = form.logoScale || 1
  const logoRun = logo ? await loadLogo(logo, 130 * ls, 65 * ls) : null

  // ── 1. Header ──────────────────────────────────────────────────────────────
  const headerTable = new Table({
    width: { size: W, type: WidthType.DXA },
    borders: NONE,
    columnWidths: [HALF, HALF],
    rows: [new TableRow({ children: [
      cell([
        ...(logoRun ? [p(logoRun, AlignmentType.LEFT, 60)] : []),
        p(r('INVOICE', { size: 56, bold: true })),
      ], { w: HALF }),
      cell([
        ...(form.invoiceNumber ? [p(r(form.invoiceNumber, { size: 26, bold: true }), AlignmentType.RIGHT)] : []),
        p(r(`Date: ${formatDate(form.date)}`, { size: 20, color: '555555' }), AlignmentType.RIGHT),
        ...(form.dueDate
          ? [p(r(`Due: ${formatDate(form.dueDate)}`, { size: 20, color: '555555' }), AlignmentType.RIGHT)]
          : []),
      ], { w: HALF }),
    ]})],
  })

  // ── 2. Rule ────────────────────────────────────────────────────────────────
  const rule = new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '111111', space: 1 } },
    spacing: { before: 120, after: 200 },
    children: [],
  })

  // ── 3. From / Bill To ──────────────────────────────────────────────────────
  const addrTable = new Table({
    width: { size: W, type: WidthType.DXA },
    borders: NONE,
    columnWidths: [HALF, HALF],
    rows: [new TableRow({ children: [
      cell([
        p(r('From', { size: 16, bold: true, color: '6B7280', caps: true }), AlignmentType.LEFT, 40),
        ...(form.fromCompany ? [p(r(form.fromCompany, { size: 22, bold: true }))] : []),
        ...(form.fromName    ? [p(r(form.fromName,    { size: 20, color: '333333' }))] : []),
        ...addrParagraphs(form.fromAddress),
        ...(form.fromEmail      ? [p(r(form.fromEmail,      { size: 20, color: '444444' }))] : []),
        ...(form.fromPhone      ? [p(r(form.fromPhone,      { size: 20, color: '444444' }))] : []),
        ...(form.fromBusinessId ? [p(r(`${getBusinessIdLabel(form.currency || 'USD')}: ${form.fromBusinessId}`, { size: 20, color: '444444' }))] : []),
      ], { w: HALF }),
      cell([
        p(r('Bill To', { size: 16, bold: true, color: '6B7280', caps: true }), AlignmentType.LEFT, 40),
        ...(form.billToCompany  ? [p(r(form.billToCompany,  { size: 22, bold: true }))] : []),
        ...(form.billToContact  ? [p(r(form.billToContact,  { size: 20, color: '333333' }))] : []),
        ...addrParagraphs(form.billToAddress),
        ...(form.billToEmail    ? [p(r(form.billToEmail,    { size: 20, color: '444444' }))] : []),
        ...(form.billToPhone    ? [p(r(form.billToPhone,    { size: 20, color: '444444' }))] : []),
      ], { w: HALF }),
    ]})],
  })

  // ── 4. Items table ─────────────────────────────────────────────────────────
  // Column widths: desc 5400, qty 1320, rate 1860, amount 1860 → total 10440 ✓
  const C = { d: 5400, q: 1320, ra: 1860, am: 1860 }

  const itemsTable = items.length > 0 ? new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [C.d, C.q, C.ra, C.am],
    rows: [
      // Header row
      new TableRow({ tableHeader: true, children: [
        cell(p(r('Description', { size: 18, bold: true, caps: true })),                             { w: C.d,  borders: HEAD_BORDER }),
        cell(p(r('Qty',         { size: 18, bold: true, caps: true }), AlignmentType.RIGHT),       { w: C.q,  borders: HEAD_BORDER }),
        cell(p(r('Rate',        { size: 18, bold: true, caps: true }), AlignmentType.RIGHT),       { w: C.ra, borders: HEAD_BORDER }),
        cell(p(r('Amount',      { size: 18, bold: true, caps: true }), AlignmentType.RIGHT),       { w: C.am, borders: HEAD_BORDER }),
      ]}),
      // Data rows
      ...items.map(item => new TableRow({ children: [
        cell(p(r(item.description,              { size: 20 })),                                         { w: C.d,  borders: ROW_BORDER }),
        cell(p(r(String(item.quantity),         { size: 20, color: '333333' }), AlignmentType.RIGHT),  { w: C.q,  borders: ROW_BORDER }),
        cell(p(r(fmt(item.rate),                { size: 20, color: '333333' }), AlignmentType.RIGHT),  { w: C.ra, borders: ROW_BORDER }),
        cell(p(r(fmt(item.quantity * item.rate),{ size: 20 }),                  AlignmentType.RIGHT),  { w: C.am, borders: ROW_BORDER }),
      ]})),
    ],
  }) : null

  // ── 5. Totals ──────────────────────────────────────────────────────────────
  // blank 6540, label 1950, value 1950 → total 10440 ✓
  const T = { blank: 6540, lbl: 1950, val: 1950 }

  const totalsRows = []
  const addRow = (label, value, isTotal = false) => {
    totalsRows.push(new TableRow({ children: [
      cell(p(r('')), { w: T.blank, borders: NONE }),
      cell(
        p(r(label, { size: isTotal ? 24 : 20, bold: isTotal, color: isTotal ? '111111' : '555555' }), AlignmentType.RIGHT),
        { w: T.lbl, borders: isTotal ? TOTAL_BORDER : NONE },
      ),
      cell(
        p(r(value, { size: isTotal ? 24 : 20, bold: isTotal, color: isTotal ? '111111' : '555555' }), AlignmentType.RIGHT),
        { w: T.val, borders: isTotal ? TOTAL_BORDER : NONE },
      ),
    ]}))
  }

  addRow('Subtotal', fmt(subtotal))
  if (discountAmt > 0) addRow(form.discountType === '$' ? 'Discount' : `Discount (${parseFloat(form.discountRate) || 0}%)`, `-${fmt(discountAmt)}`)
  if (taxAmt > 0)      addRow(form.taxType === '$' ? 'Tax' : `Tax (${parseFloat(form.taxRate) || 0}%)`,           fmt(taxAmt))
  if (gstAmt > 0)      addRow(form.gstType === '$' ? 'GST' : `GST (${parseFloat(form.gstRate) || 0}%)`,           fmt(gstAmt))
  if (deliveryAmt > 0) addRow('Delivery', fmt(deliveryAmt))
  addRow('Total', fmt(total), true)

  const totalsTable = new Table({
    width: { size: W, type: WidthType.DXA },
    borders: NONE,
    columnWidths: [T.blank, T.lbl, T.val],
    rows: totalsRows,
  })

  // ── 6. Footer (notes / payment terms) ─────────────────────────────────────
  const footerChildren = []
  if (form.notes || form.paymentTerms) {
    const hasBoth = form.notes && form.paymentTerms
    const cols = hasBoth ? [HALF, HALF] : [W]
    const cells = []
    if (form.notes) {
      cells.push(cell([
        p(r('Notes', { size: 16, bold: true, color: '6B7280', caps: true }), AlignmentType.LEFT, 40),
        p(r(form.notes, { size: 20, color: '444444' })),
      ], { w: hasBoth ? HALF : W }))
    }
    if (form.paymentTerms) {
      cells.push(cell([
        p(r('Payment Terms', { size: 16, bold: true, color: '6B7280', caps: true }), AlignmentType.LEFT, 40),
        p(r(form.paymentTerms, { size: 20, color: '444444' })),
      ], { w: hasBoth ? HALF : W }))
    }
    footerChildren.push(
      gap(),
      gap(),
      new Table({
        width: { size: W, type: WidthType.DXA },
        borders: NONE,
        columnWidths: cols,
        rows: [new TableRow({ children: cells })],
      }),
    )
  }

  // ── Assemble document ──────────────────────────────────────────────────────
  const doc = new Document({
    sections: [{
      properties: {
        page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } },
      },
      children: [
        headerTable,
        rule,
        addrTable,
        gap(),
        gap(),
        ...(itemsTable ? [itemsTable, gap()] : []),
        totalsTable,
        ...footerChildren,
      ],
    }],
  })

  return Packer.toBlob(doc)
}

export async function downloadDOCX(form, logo) {
  const blob = await generateDocxBlob(form, logo)
  const filename = `${invoiceFilename(form)}.docx`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
