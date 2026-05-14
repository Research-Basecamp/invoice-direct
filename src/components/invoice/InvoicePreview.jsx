import { useMemo } from 'react'
import { generateInvoiceHTML } from '@/lib/invoice-html'

const PAPER_W = 816   // 8.5" at 96 dpi
const PAPER_H = 1056  // 11"  at 96 dpi
const SCALE     = 1    // 1:1 — preview is true US Letter size
const DISPLAY_W = PAPER_W
const DISPLAY_H = PAPER_H

export default function InvoicePreview({ form, logo }) {
  const html = useMemo(() => generateInvoiceHTML(form, logo), [form, logo])

  const hasContent = form.fromName || form.billToName || form.items.some(i => i.description)

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl bg-white h-64">
        Fill in the form to see a live preview
      </div>
    )
  }

  return (
    <div
      style={{
        width: DISPLAY_W,
        height: DISPLAY_H,
        overflow: 'hidden',
        boxShadow: '0 2px 32px rgba(0,0,0,0.13)',
        borderRadius: 2,
        background: '#fff',
        flexShrink: 0,
      }}
    >
      <iframe
        id="invoice-preview"
        srcDoc={html}
        title="Invoice Preview"
        style={{
          width: PAPER_W,
          height: PAPER_H,
          border: 'none',
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
          display: 'block',
        }}
      />
    </div>
  )
}
