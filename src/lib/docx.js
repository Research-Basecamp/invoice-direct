import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, BorderStyle, HeadingLevel,
  ShadingType,
} from 'docx'
import { formatCurrency, formatDate } from './utils'

const BORDER_NONE = {
  top: { style: BorderStyle.NONE, size: 0 },
  bottom: { style: BorderStyle.NONE, size: 0 },
  left: { style: BorderStyle.NONE, size: 0 },
  right: { style: BorderStyle.NONE, size: 0 },
}

const BORDER_BOTTOM_LIGHT = {
  ...BORDER_NONE,
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'EEEEEE' },
}

const BORDER_BOTTOM_DARK = {
  ...BORDER_NONE,
  bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
}

function cell(text, { bold = false, align = AlignmentType.LEFT, shade = false, header = false } = {}) {
  return new TableCell({
    borders: header ? BORDER_BOTTOM_DARK : BORDER_BOTTOM_LIGHT,
    shading: shade ? { type: ShadingType.CLEAR, fill: 'F8F8F8' } : undefined,
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: String(text ?? ''),
            bold,
            size: header ? 18 : 20,
            color: header ? '999999' : '111111',
            font: 'Calibri',
          }),
        ],
      }),
    ],
  })
}

function spacer() {
  return new Paragraph({ children: [new TextRun({ text: '' })] })
}

function label(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 18, color: '999999', font: 'Calibri', allCaps: true })],
  })
}

function body(text) {
  return new Paragraph({
    children: [new TextRun({ text: text || '—', size: 20, color: '333333', font: 'Calibri' })],
  })
}

export async function downloadDOCX(form, logo, invoiceNumber) {
  const currency = form.currency || 'USD'
  const fmt = (n) => formatCurrency(n, currency)

  const items = form.items.filter((i) => i.description)
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const discountAmount = subtotal * (parseFloat(form.discountRate) || 0) / 100
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (parseFloat(form.taxRate) || 0) / 100
  const total = afterDiscount + taxAmount

  // --- Header row ---
  const headerSection = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_NONE,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                heading: HeadingLevel.HEADING_1,
                children: [new TextRun({ text: 'INVOICE', bold: true, size: 48, color: '111111', font: 'Calibri' })],
              }),
            ],
          }),
          new TableCell({
            borders: BORDER_NONE,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              ...(invoiceNumber ? [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: invoiceNumber, bold: true, size: 26, font: 'Calibri' })],
              })] : []),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `Date: ${formatDate(form.date)}`, size: 20, color: '666666', font: 'Calibri' })],
              }),
              ...(form.dueDate ? [new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: `Due: ${formatDate(form.dueDate)}`, size: 20, color: '666666', font: 'Calibri' })],
              })] : []),
            ],
          }),
        ],
      }),
    ],
  })

  // --- From / Bill To ---
  const addressSection = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_NONE,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: BORDER_NONE,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              label('From'),
              ...(form.fromCompany ? [new Paragraph({ children: [new TextRun({ text: form.fromCompany, bold: true, size: 22, color: '111111', font: 'Calibri' })] })] : []),
              ...(form.fromName ? [body(form.fromName)] : []),
              ...(form.fromAddress ? [body(form.fromAddress)] : []),
              ...(form.fromEmail ? [body(form.fromEmail)] : []),
              ...(form.fromPhone ? [body(form.fromPhone)] : []),
            ],
          }),
          new TableCell({
            borders: BORDER_NONE,
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              label('Bill To'),
              ...(form.billToCompany ? [new Paragraph({ children: [new TextRun({ text: form.billToCompany, bold: true, size: 22, color: '111111', font: 'Calibri' })] })] : []),
              ...(form.billToContact ? [body(form.billToContact)] : []),
              ...(form.billToAddress ? [body(form.billToAddress)] : []),
              ...(form.billToEmail ? [body(form.billToEmail)] : []),
              ...(form.billToPhone ? [body(form.billToPhone)] : []),
            ],
          }),
        ],
      }),
    ],
  })

  // --- Items table ---
  const itemsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header
      new TableRow({
        children: [
          cell('Description', { bold: true, header: true }),
          cell('Qty', { bold: true, align: AlignmentType.RIGHT, header: true }),
          cell('Rate', { bold: true, align: AlignmentType.RIGHT, header: true }),
          cell('Amount', { bold: true, align: AlignmentType.RIGHT, header: true }),
        ],
      }),
      // Rows
      ...items.map((item) =>
        new TableRow({
          children: [
            cell(item.description),
            cell(item.quantity, { align: AlignmentType.RIGHT }),
            cell(fmt(item.rate), { align: AlignmentType.RIGHT }),
            cell(fmt(item.quantity * item.rate), { align: AlignmentType.RIGHT }),
          ],
        })
      ),
    ],
  })

  // --- Totals ---
  const totalsRows = [
    new TableRow({
      children: [
        new TableCell({ borders: BORDER_NONE, children: [new Paragraph('')] }),
        new TableCell({
          borders: BORDER_NONE,
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'Subtotal', size: 20, color: '555555', font: 'Calibri' })],
          })],
        }),
        new TableCell({
          borders: BORDER_NONE,
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: fmt(subtotal), size: 20, color: '555555', font: 'Calibri' })],
          })],
        }),
      ],
    }),
    ...(discountAmount > 0 ? [new TableRow({
      children: [
        new TableCell({ borders: BORDER_NONE, children: [new Paragraph('')] }),
        new TableCell({ borders: BORDER_NONE, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Discount (${parseFloat(form.discountRate) || 0}%)`, size: 20, color: '555555', font: 'Calibri' })] })] }),
        new TableCell({ borders: BORDER_NONE, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `-${fmt(discountAmount)}`, size: 20, color: '555555', font: 'Calibri' })] })] }),
      ],
    })] : []),
    ...(taxAmount > 0 ? [new TableRow({
      children: [
        new TableCell({ borders: BORDER_NONE, children: [new Paragraph('')] }),
        new TableCell({ borders: BORDER_NONE, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `Tax (${parseFloat(form.taxRate) || 0}%)`, size: 20, color: '555555', font: 'Calibri' })] })] }),
        new TableCell({ borders: BORDER_NONE, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(taxAmount), size: 20, color: '555555', font: 'Calibri' })] })] }),
      ],
    })] : []),
    new TableRow({
      children: [
        new TableCell({ borders: BORDER_NONE, children: [new Paragraph('')] }),
        new TableCell({
          borders: { ...BORDER_NONE, top: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Total', bold: true, size: 26, font: 'Calibri' })] })],
        }),
        new TableCell({
          borders: { ...BORDER_NONE, top: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: fmt(total), bold: true, size: 26, font: 'Calibri' })] })],
        }),
      ],
    }),
  ]

  const totalsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: BORDER_NONE,
    rows: totalsRows,
    columnWidths: [6000, 2000, 2000],
  })

  // --- Notes & Terms ---
  const footerRows = []
  if (form.notes || form.paymentTerms) {
    footerRows.push(spacer())
    const footerCells = []
    if (form.notes) {
      footerCells.push(new TableCell({
        borders: BORDER_NONE,
        children: [label('Notes'), body(form.notes)],
      }))
    }
    if (form.paymentTerms) {
      footerCells.push(new TableCell({
        borders: BORDER_NONE,
        children: [label('Payment Terms'), body(form.paymentTerms)],
      }))
    }
    footerRows.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: BORDER_NONE,
      rows: [new TableRow({ children: footerCells })],
    }))
  }

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 720, bottom: 720, left: 900, right: 900 } } },
      children: [
        headerSection,
        spacer(),
        spacer(),
        addressSection,
        spacer(),
        spacer(),
        ...(items.length > 0 ? [itemsTable, spacer()] : []),
        totalsTable,
        ...footerRows,
      ],
    }],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${invoiceNumber || 'draft'}.docx`
  link.click()
  URL.revokeObjectURL(url)
}
