import { formatCurrency, formatDate, displayAddress } from './utils'

export function downloadPDF(invoice, logo, invoiceNumber) {
  const items = invoice.items.filter((i) => i.description)
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const discountAmount = subtotal * (parseFloat(invoice.discountRate) || 0) / 100
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (parseFloat(invoice.taxRate) || 0) / 100
  const total = afterDiscount + taxAmount

  const win = window.open('', '_blank')
  if (!win) {
    alert('Please allow popups to download the PDF.')
    return
  }

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${invoiceNumber || 'Invoice'}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .header h1 { font-size: 28px; font-weight: 800; color: #111; }
        .header-right { text-align: right; }
        .header-right .num { font-size: 16px; font-weight: 600; }
        .header-right .date { font-size: 12px; color: #111; }
        .logo { height: 56px; width: 56px; object-fit: contain; margin-bottom: 8px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111; margin-bottom: 2px; }
        .name { font-weight: 600; font-size: 14px; }
        .detail { font-size: 12px; color: #555; white-space: pre-line; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { text-align: left; padding: 6px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #111; border-bottom: 1px solid #ccc; }
        th:not(:first-child) { text-align: right; }
        td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #eee; }
        td:not(:first-child) { text-align: right; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
        .totals-inner { width: 220px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 12px; color: #555; padding: 2px 0; }
        .totals-row.bold { font-weight: 700; font-size: 16px; color: #111; padding-top: 4px; }
        .totals-row.sep { border-top: 1px solid #ccc; margin-top: 2px; }
        .footer { border-top: 1px solid #ccc; padding-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .footer .label { margin-bottom: 2px; }
        .footer p { font-size: 12px; color: #555; white-space: pre-wrap; }
        .no-content { text-align: center; padding: 80px 0; color: #111; font-size: 14px; }
        @media print { body { padding: 40px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          ${logo ? `<img src="${logo}" class="logo" alt="Logo" />` : ''}
          <h1>INVOICE</h1>
        </div>
        <div class="header-right">
          ${invoiceNumber ? `<div class="num">${invoiceNumber}</div>` : ''}
          <div class="date">Date: ${formatDate(invoice.date)}</div>
          ${invoice.dueDate ? `<div class="date">Due: ${formatDate(invoice.dueDate)}</div>` : ''}
        </div>
      </div>

      <div class="grid">
        <div>
          <div class="label">From</div>
          <div class="name">${invoice.fromName || '—'}</div>
          ${invoice.fromAddress ? `<div class="detail">${displayAddress(invoice.fromAddress).replace(/\n/g, '<br>')}</div>` : ''}
          ${invoice.fromEmail ? `<div class="detail">${invoice.fromEmail}</div>` : ''}
          ${invoice.fromPhone ? `<div class="detail">${invoice.fromPhone}</div>` : ''}
        </div>
        <div>
          <div class="label">Bill To</div>
          <div class="name">${invoice.billToName || '—'}</div>
          ${invoice.billToAddress ? `<div class="detail">${displayAddress(invoice.billToAddress).replace(/\n/g, '<br>')}</div>` : ''}
          ${invoice.billToEmail ? `<div class="detail">${invoice.billToEmail}</div>` : ''}
          ${invoice.billToPhone ? `<div class="detail">${invoice.billToPhone}</div>` : ''}
        </div>
      </div>

      ${items.length > 0 ? `
      <table>
        <thead>
          <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.rate)}</td>
              <td>${formatCurrency(item.quantity * item.rate)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : `<div class="no-content">No items added</div>`}

      <div class="totals">
        <div class="totals-inner">
          <div class="totals-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
          ${discountAmount > 0 ? `<div class="totals-row"><span>Discount (${parseFloat(invoice.discountRate) || 0}%)</span><span>-${formatCurrency(discountAmount)}</span></div>` : ''}
          ${taxAmount > 0 ? `<div class="totals-row"><span>Tax (${parseFloat(invoice.taxRate) || 0}%)</span><span>${formatCurrency(taxAmount)}</span></div>` : ''}
          <div class="totals-row sep bold"><span>Total</span><span>${formatCurrency(total)}</span></div>
        </div>
      </div>

      ${(invoice.notes || invoice.paymentTerms) ? `
      <div class="footer">
        ${invoice.notes ? `<div><div class="label">Notes</div><p>${invoice.notes}</p></div>` : ''}
        ${invoice.paymentTerms ? `<div><div class="label">Payment Terms</div><p>${invoice.paymentTerms}</p></div>` : ''}
      </div>
      ` : ''}
    </body>
    </html>
  `)

  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 300)
}
