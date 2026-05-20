import { formatCurrency, formatDate, displayAddress, getBusinessIdLabel } from './utils'

function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function addrHtml(addr) {
  return displayAddress(addr || '').replace(/\n/g, '<br>')
}

export const INVOICE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 816px;
    height: 1056px;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 13px;
    line-height: 1.5;
    color: #111;
    background: #fff;
  }
  .page {
    width: 816px;
    height: 1056px;
    padding: 60px 64px;
    overflow: hidden;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
  }
  .logo { width: auto; object-fit: contain; margin-bottom: 10px; display: block; }
  h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; color: #111; }
  .meta { text-align: right; }
  .invoice-num { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .meta-row { font-size: 12px; color: #555; margin-bottom: 2px; }
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    margin-bottom: 36px;
    padding-bottom: 24px;
    border-bottom: 2px solid #e5e7eb;
  }
  .party-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: #111; margin-bottom: 6px;
  }
  .party-name { font-size: 14px; font-weight: 600; color: #111; margin-bottom: 3px; }
  .party-detail { font-size: 12px; color: #444; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  thead tr { border-bottom: 2px solid #111; }
  th {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: #111;
    padding: 0 0 8px 0; text-align: left;
  }
  th:not(:first-child) { text-align: right; }
  tbody tr { border-bottom: 1px solid #e5e7eb; }
  td { padding: 10px 0; font-size: 13px; color: #111; vertical-align: top; }
  td:not(:first-child) { text-align: right; }
  .totals { display: flex; justify-content: flex-end; margin: 16px 0 36px; }
  .totals-inner { width: 240px; }
  .totals-row { display: flex; justify-content: space-between; font-size: 12px; color: #555; padding: 3px 0; }
  .totals-row.total {
    border-top: 2px solid #111; margin-top: 6px; padding-top: 8px;
    font-size: 16px; font-weight: 700; color: #111;
  }
  .footer {
    border-top: 1px solid #e5e7eb; padding-top: 20px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 32px;
  }
  .footer-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: #111; margin-bottom: 5px;
  }
  .footer-text { font-size: 12px; color: #444; white-space: pre-wrap; }
  @media print {
    @page { size: 8.5in 11in; margin: 0; }
    html, body {
      width: 8.5in;
      height: 11in;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page { width: 8.5in; height: 11in; }
  }
`

export function renderInvoiceContent(form, logo) {
  const currency = form.currency || 'USD'
  const fmt = (n) => formatCurrency(n, currency)

  const items = (form.items || []).filter(i => i.description)
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const dv = parseFloat(form.discountRate) || 0
  const discountAmt = form.discountType === '$' ? dv : subtotal * dv / 100
  const afterDiscount = subtotal - discountAmt
  const tv = parseFloat(form.taxRate) || 0
  const taxAmt = form.taxType === '$' ? tv : afterDiscount * tv / 100
  const gv = parseFloat(form.gstRate) || 0
  const gstAmt = form.gstType === '$' ? gv : afterDiscount * gv / 100
  const deliveryAmt = parseFloat(form.delivery) || 0
  const total = afterDiscount + taxAmt + gstAmt + deliveryAmt

  return `
  <div class="page">
    <div class="header">
      <div>
        ${logo ? `<img src="${logo}" class="logo" alt="Logo" style="height:${Math.round(52 * (form.logoScale || 1))}px;max-width:${Math.round(160 * (form.logoScale || 1))}px">` : ''}
        <h1>INVOICE</h1>
      </div>
      <div class="meta">
        ${form.invoiceNumber ? `<div class="invoice-num">${esc(form.invoiceNumber)}</div>` : ''}
        <div class="meta-row">Date: ${formatDate(form.date)}</div>
        ${form.dueDate ? `<div class="meta-row">Due: ${formatDate(form.dueDate)}</div>` : ''}
      </div>
    </div>

    <div class="parties">
      <div>
        <div class="party-label">From</div>
        ${form.fromCompany ? `<div class="party-name">${esc(form.fromCompany)}</div>` : ''}
        ${form.fromName ? `<div class="party-detail" style="font-weight:500;color:#333">${esc(form.fromName)}</div>` : ''}
        ${form.fromAddress ? `<div class="party-detail">${addrHtml(form.fromAddress)}</div>` : ''}
        ${form.fromEmail ? `<div class="party-detail">${esc(form.fromEmail)}</div>` : ''}
        ${form.fromPhone ? `<div class="party-detail">${esc(form.fromPhone)}</div>` : ''}
        ${form.fromBusinessId ? `<div class="party-detail" style="margin-top:4px">${esc(getBusinessIdLabel(currency))}: ${esc(form.fromBusinessId)}</div>` : ''}
      </div>
      <div>
        <div class="party-label">Bill To</div>
        ${form.billToCompany ? `<div class="party-name">${esc(form.billToCompany)}</div>` : ''}
        ${form.billToContact ? `<div class="party-detail" style="font-weight:500;color:#333">${esc(form.billToContact)}</div>` : ''}
        ${form.billToAddress ? `<div class="party-detail">${addrHtml(form.billToAddress)}</div>` : ''}
        ${form.billToEmail ? `<div class="party-detail">${esc(form.billToEmail)}</div>` : ''}
        ${form.billToPhone ? `<div class="party-detail">${esc(form.billToPhone)}</div>` : ''}
      </div>
    </div>

    ${items.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th style="width:50%">Description</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
        <tr>
          <td>${esc(item.description)}</td>
          <td>${item.quantity}</td>
          <td>${fmt(item.rate)}</td>
          <td>${fmt(item.quantity * item.rate)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    ` : ''}

    <div class="totals">
      <div class="totals-inner">
        <div class="totals-row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
        ${discountAmt > 0 ? `<div class="totals-row"><span>${form.discountType === '$' ? 'Discount' : `Discount (${parseFloat(form.discountRate) || 0}%)`}</span><span>-${fmt(discountAmt)}</span></div>` : ''}
        ${taxAmt > 0 ? `<div class="totals-row"><span>${form.taxType === '$' ? 'Tax' : `Tax (${parseFloat(form.taxRate) || 0}%)`}</span><span>${fmt(taxAmt)}</span></div>` : ''}
        ${gstAmt > 0 ? `<div class="totals-row"><span>${form.gstType === '$' ? 'GST' : `GST (${parseFloat(form.gstRate) || 0}%)`}</span><span>${fmt(gstAmt)}</span></div>` : ''}
        ${deliveryAmt > 0 ? `<div class="totals-row"><span>Delivery</span><span>${fmt(deliveryAmt)}</span></div>` : ''}
        <div class="totals-row total"><span>Total</span><span>${fmt(total)}</span></div>
      </div>
    </div>

    ${(form.notes || form.paymentTerms) ? `
    <div class="footer">
      ${form.notes ? `<div><div class="footer-label">Notes</div><div class="footer-text">${esc(form.notes)}</div></div>` : ''}
      ${form.paymentTerms ? `<div><div class="footer-label">Payment Terms</div><div class="footer-text">${esc(form.paymentTerms)}</div></div>` : ''}
    </div>` : ''}
  </div>`
}

export function generateInvoiceHTML(form, logo) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${INVOICE_STYLES}</style>
</head>
<body>${renderInvoiceContent(form, logo)}</body>
</html>`
}
