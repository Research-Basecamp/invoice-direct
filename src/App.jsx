import { useState, useRef, useEffect, useCallback } from 'react'
import InvoiceForm from '@/components/invoice/InvoiceForm'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'
import { downloadPDF } from '@/lib/pdf'

const initialForm = {
  fromName: '',
  fromAddress: '',
  fromEmail: '',
  fromPhone: '',
  billToName: '',
  billToAddress: '',
  billToEmail: '',
  billToPhone: '',
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  items: [{ description: '', quantity: 0, rate: 0 }],
  taxRate: '',
  discountRate: '',
  notes: '',
  paymentTerms: '',
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [logo, setLogo] = useState(null)
  const [formWidth, setFormWidth] = useState(460)
  const [resizing, setResizing] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const containerRef = useRef(null)

  const handlePrint = () => window.print()
  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => {
      downloadPDF(form, logo, form.invoiceNumber)
      setDownloading(false)
    }, 100)
  }

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setResizing(true)
  }, [])

  useEffect(() => {
    if (!resizing) return

    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      let width = e.clientX - rect.left
      width = Math.max(320, Math.min(width, rect.width * 0.6))
      setFormWidth(width)
    }

    const handleMouseUp = () => setResizing(false)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing])

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6 max-w-[1600px] mx-auto">
          <span className="font-semibold text-base">Invoice Direct</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
              <Download className="h-4 w-4 mr-1.5" /> {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" /> Print
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://buymeacoffee.com/yourusername" target="_blank" rel="noopener noreferrer">
                ♥ Support
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-14">
        <div
          ref={containerRef}
          className="flex max-w-[1600px] mx-auto"
          style={{ userSelect: resizing ? 'none' : undefined }}
        >
          <section
            className="overflow-y-auto p-4 sm:p-6 no-print shrink-0"
            style={{ width: formWidth }}
          >
            <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
            <InvoiceForm form={form} setForm={setForm} logo={logo} setLogo={setLogo} />
          </section>

          <div
            className="w-1.5 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors shrink-0 relative no-print"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4" />
          </div>

          <section className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
            <InvoicePreview form={form} logo={logo} />
          </section>
        </div>
      </main>
    </div>
  )
}
