import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function InvoicePreview({ form, logo }) {
  const items = form.items.filter((i) => i.description)
  const subtotal = items.reduce((s, i) => s + i.quantity * i.rate, 0)
  const discountAmount = subtotal * (parseFloat(form.discountRate) || 0) / 100
  const afterDiscount = subtotal - discountAmount
  const taxAmount = afterDiscount * (parseFloat(form.taxRate) || 0) / 100
  const total = afterDiscount + taxAmount

  const hasContent = form.fromName || form.billToName || items.length > 0

  if (!hasContent) {
    return (
      <div id="invoice-preview" className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground text-sm border-2 border-dashed rounded-xl bg-white">
        Fill in the form to see a live preview
      </div>
    )
  }

  return (
    <div id="invoice-preview" className="bg-white text-black rounded-xl border shadow-lg p-6 sm:p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          {logo && (
            <img src={logo} alt="Logo" className="h-14 w-14 object-contain mb-2" />
          )}
          <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
        </div>
        <div className="text-right">
          {form.invoiceNumber && (
            <p className="text-base font-semibold text-gray-900">{form.invoiceNumber}</p>
          )}
          <p className="text-xs text-gray-500">Date: {formatDate(form.date)}</p>
          {form.dueDate && <p className="text-xs text-gray-500">Due: {formatDate(form.dueDate)}</p>}
        </div>
      </div>

      {/* From / Bill To */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">From</p>
          {form.fromName && <p className="font-medium text-gray-900 text-sm">{form.fromName}</p>}
          {form.fromAddress && <p className="text-xs text-gray-600">{form.fromAddress}</p>}
          {form.fromEmail && <p className="text-xs text-gray-600">{form.fromEmail}</p>}
          {form.fromPhone && <p className="text-xs text-gray-600">{form.fromPhone}</p>}
          {!form.fromName && <p className="text-xs text-gray-400 italic">Your details</p>}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Bill To</p>
          {form.billToName && <p className="font-medium text-gray-900 text-sm">{form.billToName}</p>}
          {form.billToAddress && <p className="text-xs text-gray-600">{form.billToAddress}</p>}
          {form.billToEmail && <p className="text-xs text-gray-600">{form.billToEmail}</p>}
          {form.billToPhone && <p className="text-xs text-gray-600">{form.billToPhone}</p>}
          {!form.billToName && <p className="text-xs text-gray-400 italic">Client details</p>}
        </div>
      </div>

      {/* Items */}
      {items.length > 0 && (
        <table className="w-full mb-5">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Description</th>
              <th className="text-right py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Qty</th>
              <th className="text-right py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Rate</th>
              <th className="text-right py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 text-sm text-gray-900">{item.description}</td>
                <td className="py-2 text-sm text-right text-gray-900">{item.quantity}</td>
                <td className="py-2 text-sm text-right text-gray-900">{formatCurrency(item.rate)}</td>
                <td className="py-2 text-sm text-right text-gray-900">{formatCurrency(item.quantity * item.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-56 space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-gray-600">
              <span>Discount ({(parseFloat(form.discountRate) || 0)}%)</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-xs text-gray-600">
              <span>Tax ({(parseFloat(form.taxRate) || 0)}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <Separator className="bg-gray-300" />
          <div className="flex justify-between font-bold text-base text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(form.notes || form.paymentTerms) && (
        <div className="border-t border-gray-300 pt-3 grid grid-cols-2 gap-6">
          {form.notes && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Notes</p>
              <p className="text-xs text-gray-600 whitespace-pre-wrap">{form.notes}</p>
            </div>
          )}
          {form.paymentTerms && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Payment Terms</p>
              <p className="text-xs text-gray-600 whitespace-pre-wrap">{form.paymentTerms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
