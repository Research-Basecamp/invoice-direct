import { useState, useRef, useEffect, useCallback } from 'react'
import InvoiceForm from '@/components/invoice/InvoiceForm'
import InvoicePreview from '@/components/invoice/InvoicePreview'
import { Button } from '@/components/ui/button'
import { Printer, Download, FileText, Eye, ArrowLeft, X, ChevronDown, Image, ShieldCheck } from 'lucide-react'
import { downloadPDF } from '@/lib/pdf'
import { downloadDOCX } from '@/lib/docx'
import { downloadImage } from '@/lib/image'
import { cn } from '@/lib/utils'

const initialForm = {
  fromCompany: '',
  fromName: '',
  fromAddress: '',
  fromEmail: '',
  fromPhone: '',
  billToCompany: '',
  billToContact: '',
  billToAddress: '',
  billToEmail: '',
  billToPhone: '',
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  currency: 'USD',
  items: [{ description: '', quantity: 0, rate: 0 }],
  taxRate: '',
  discountRate: '',
  notes: '',
  paymentTerms: '',
}

const DOWNLOAD_OPTIONS = [
  { key: 'pdf',   label: 'PDF Document',     ext: '.pdf',  icon: FileText },
  { key: 'docx',  label: 'Word Document',    ext: '.docx', icon: FileText },
  { key: 'image', label: 'Image (PNG)',       ext: '.png',  icon: Image   },
]

function DownloadMenu({ form, logo, className }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handle = async (key) => {
    setOpen(false)
    setBusy(key)
    try {
      if (key === 'pdf')   downloadPDF(form, logo, form.invoiceNumber)
      if (key === 'docx')  await downloadDOCX(form, logo, form.invoiceNumber)
      if (key === 'image') await downloadImage(form, logo, form.invoiceNumber)
    } finally {
      setBusy(null)
    }
  }

  const isBusy = busy !== null

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        disabled={isBusy}
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 font-medium"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">{isBusy ? 'Saving…' : 'Download'}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform hidden sm:block', open && 'rotate-180')} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-background border rounded-xl shadow-xl overflow-hidden py-1">
          {DOWNLOAD_OPTIONS.map(({ key, label, ext, icon: Icon }) => (
            <button
              key={key}
              disabled={isBusy}
              onClick={() => handle(key)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors text-left"
            >
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{ext}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DownloadMenuFull({ form, logo }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handle = async (key) => {
    setOpen(false)
    setBusy(key)
    try {
      if (key === 'pdf')   downloadPDF(form, logo, form.invoiceNumber)
      if (key === 'docx')  await downloadDOCX(form, logo, form.invoiceNumber)
      if (key === 'image') await downloadImage(form, logo, form.invoiceNumber)
    } finally {
      setBusy(null)
    }
  }

  const isBusy = busy !== null

  return (
    <div ref={ref} className="relative">
      <Button
        className="w-full gap-2 font-semibold"
        disabled={isBusy}
        onClick={() => setOpen((v) => !v)}
      >
        <Download className="h-4 w-4" />
        {isBusy ? 'Saving…' : 'Download Invoice'}
        <ChevronDown className={cn('h-4 w-4 ml-auto transition-transform', open && 'rotate-180')} />
      </Button>

      {open && (
        <div className="absolute left-0 right-0 bottom-full mb-1.5 z-50 bg-background border rounded-xl shadow-xl overflow-hidden py-1">
          {DOWNLOAD_OPTIONS.map(({ key, label, ext, icon: Icon }) => (
            <button
              key={key}
              disabled={isBusy}
              onClick={() => handle(key)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
            >
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium">{label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{ext}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [logo, setLogo] = useState(null)
  const [formPct, setFormPct] = useState(0.4)   // 40% form / 60% preview
  const [resizing, setResizing] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024)
  const [privacyPhase, setPrivacyPhase] = useState('hidden') // hidden | enter | exit | gone
  const containerRef = useRef(null)

  const handlePrint = () => window.print()

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setResizing(true)
  }, [])

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)')
    const handler = (e) => setIsDesktop(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!resizing) return
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = (e.clientX - rect.left) / rect.width
      setFormPct(Math.max(0.25, Math.min(pct, 0.65)))
    }
    const handleMouseUp = () => setResizing(false)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizing])

  useEffect(() => {
    document.body.style.overflow = showMobilePreview ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showMobilePreview])

  useEffect(() => {
    const enterTimer = setTimeout(() => setPrivacyPhase('enter'), 800)
    const exitTimer  = setTimeout(() => setPrivacyPhase('exit'),  6500)
    const goneTimer  = setTimeout(() => setPrivacyPhase('gone'),  8000)
    return () => { clearTimeout(enterTimer); clearTimeout(exitTimer); clearTimeout(goneTimer) }
  }, [])

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 max-w-[1600px] mx-auto">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base tracking-tight">Invoice Direct</span>
              <p className="text-[10px] text-muted-foreground hidden sm:block">Free invoice generator &amp; template</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <DownloadMenu form={form} logo={logo} />

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 font-medium"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-medium border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <span>
                <span className="heart-beat text-sm">♥</span>
                <span className="hidden sm:inline">Support</span>
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-16 h-screen">
        <div
          ref={containerRef}
          className="flex max-w-[1600px] mx-auto h-[calc(100vh-4rem)]"
          style={{ userSelect: resizing ? 'none' : undefined }}
        >
          {/* Form */}
          <section
            className="overflow-y-auto p-4 sm:p-6 no-print bg-muted/20 lg:border-r h-full"
            style={isDesktop ? { width: `${formPct * 100}%`, flexShrink: 0 } : { width: '100%' }}
          >
            <div className="mb-5">
              <h1 className="text-lg font-semibold">Free Invoice Generator</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Create a free invoice or tax invoice template — download as PDF, Word or PNG</p>
            </div>
            <InvoiceForm form={form} setForm={setForm} logo={logo} setLogo={setLogo} />

            {/* Bottom actions */}
            <div className="mt-8 pt-6 border-t space-y-2">
              <DownloadMenuFull form={form} logo={logo} />
              <Button
                variant="outline"
                className="w-full gap-2 font-medium"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" />
                Print Invoice
              </Button>
            </div>
          </section>

          {/* Resizer — desktop only */}
          <div
            className="hidden lg:block w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors shrink-0 relative no-print"
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          >
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4" />
          </div>

          {/* Preview — desktop only */}
          <section className="hidden lg:flex lg:flex-col flex-1 overflow-auto p-4 sm:p-6 lg:p-8 min-w-0 bg-muted/10 h-full">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">Preview</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Live preview of your invoice</p>
            </div>
            <InvoicePreview form={form} logo={logo} />
          </section>
        </div>
      </main>

      {/* Mobile preview button */}
      <button
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden no-print fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg text-sm font-medium active:scale-95 transition-transform"
      >
        <Eye className="h-4 w-4" />
        Preview
      </button>

      {/* Privacy toast — fades in on load, then fades out */}
      {privacyPhase !== 'hidden' && privacyPhase !== 'gone' && (
        <div
          className={`no-print fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-max sm:max-w-sm z-50 flex items-start sm:items-center gap-2.5 px-5 py-3 rounded-2xl bg-background border shadow-lg text-sm text-muted-foreground ${privacyPhase === 'enter' ? 'privacy-toast-enter' : 'privacy-toast-exit'}`}
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" />
          <span>Your data never leaves your device — nothing is stored or sent to any server.</span>
        </div>
      )}

      {/* Privacy footer */}
      <footer className="no-print border-t bg-background/80 py-3 px-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-500" />
          <span>Your data never leaves your device — nothing is stored or sent to any server.</span>
        </div>
      </footer>

      {/* Mobile preview bottom sheet */}
      {showMobilePreview && (
        <div className="lg:hidden no-print fixed inset-0 z-[60] flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobilePreview(false)}
          />
          <div className="sheet-slide-up relative bg-background rounded-t-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-2xl">
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/25" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <button
                onClick={() => setShowMobilePreview(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm active:scale-95 transition-transform"
              >
                <ArrowLeft className="h-4 w-4" />
                Edit Invoice
              </button>
              <span className="text-sm font-semibold tracking-tight">Invoice Preview</span>
              <button
                onClick={() => setShowMobilePreview(false)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 active:scale-95 transition-transform"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 pb-10">
              <InvoicePreview form={form} logo={logo} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
