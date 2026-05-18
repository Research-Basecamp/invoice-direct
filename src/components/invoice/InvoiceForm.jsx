import { useState, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Select, SelectItem, SelectGroup } from '@/components/ui/select'
import { AddressInput } from '@/components/ui/address-input'
import { cn } from '@/lib/utils'
import { Upload, Plus, Trash2, ImagePlus, ChevronDown, Check } from 'lucide-react'

const CURRENCIES = [
  { group: 'Common', items: [
    { code: 'USD', label: 'USD — US Dollar ($)' },
    { code: 'EUR', label: 'EUR — Euro (€)' },
    { code: 'GBP', label: 'GBP — British Pound (£)' },
    { code: 'JPY', label: 'JPY — Japanese Yen (¥)' },
    { code: 'AUD', label: 'AUD — Australian Dollar (A$)' },
    { code: 'CAD', label: 'CAD — Canadian Dollar (C$)' },
    { code: 'CHF', label: 'CHF — Swiss Franc (CHF)' },
    { code: 'CNY', label: 'CNY — Chinese Yuan (¥)' },
    { code: 'INR', label: 'INR — Indian Rupee (₹)' },
    { code: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
  ]},
  { group: 'More', items: [
    { code: 'HKD', label: 'HKD — Hong Kong Dollar (HK$)' },
    { code: 'NZD', label: 'NZD — New Zealand Dollar (NZ$)' },
    { code: 'SEK', label: 'SEK — Swedish Krona (kr)' },
    { code: 'NOK', label: 'NOK — Norwegian Krone (kr)' },
    { code: 'DKK', label: 'DKK — Danish Krone (kr)' },
    { code: 'MXN', label: 'MXN — Mexican Peso (MX$)' },
    { code: 'BRL', label: 'BRL — Brazilian Real (R$)' },
    { code: 'KRW', label: 'KRW — South Korean Won (₩)' },
    { code: 'AED', label: 'AED — UAE Dirham (د.إ)' },
    { code: 'SAR', label: 'SAR — Saudi Riyal (﷼)' },
    { code: 'ZAR', label: 'ZAR — South African Rand (R)' },
    { code: 'PHP', label: 'PHP — Philippine Peso (₱)' },
    { code: 'MYR', label: 'MYR — Malaysian Ringgit (RM)' },
    { code: 'THB', label: 'THB — Thai Baht (฿)' },
    { code: 'IDR', label: 'IDR — Indonesian Rupiah (Rp)' },
    { code: 'PKR', label: 'PKR — Pakistani Rupee (₨)' },
    { code: 'NPR', label: 'NPR — Nepalese Rupee (₨)' },
  ]},
]

const emptyItem = { description: '', quantity: 0, rate: 0 }

export default function InvoiceForm({ form, setForm, logo, setLogo }) {
  const hasSaved = !!(logo || form.fromCompany || form.fromName || form.fromEmail || form.fromPhone || form.fromAddress)
  const [senderOpen, setSenderOpen] = useState(!hasSaved)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index, updated) => {
    const items = [...form.items]
    items[index] = updated
    setForm((prev) => ({ ...prev, items }))
  }

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, { ...emptyItem }] }))
  }

  const removeItem = (index) => {
    if (form.items.length === 1) return
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogo(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogo(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Your Details (logo / currency / from) — collapsible when saved ── */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setSenderOpen(v => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Your Details</span>
            {hasSaved && !senderOpen && (
              <span className="inline-flex items-center gap-1 text-[11px] text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 leading-none">
                <Check className="h-3 w-3" /> Saved
              </span>
            )}
          </div>
          <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', senderOpen && 'rotate-180')} />
        </button>

        {/* Collapsed summary card */}
        {!senderOpen && hasSaved && (
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
            {logo
              ? <img src={logo} alt="" className="h-10 w-10 object-contain rounded border bg-white shrink-0" />
              : <div className="h-10 w-10 rounded border bg-muted shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {[form.fromCompany, form.fromName].filter(Boolean).join(' · ') || 'Your business'}
              </p>
              {(form.fromEmail || form.fromPhone) && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {[form.fromEmail, form.fromPhone].filter(Boolean).join(' · ')}
                </p>
              )}
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <Check className="h-3 w-3" /> Stored from your previous entry
              </p>
            </div>
          </div>
        )}

        {/* Expanded fields */}
        {senderOpen && (
          <div className="space-y-6">
            {/* Logo */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label>Company Logo</Label>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Optional</span>
              </div>
              {logo ? (
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img src={logo} alt="Logo" className="h-20 w-20 object-contain rounded-lg border" />
                    <button
                      type="button"
                      onClick={() => setLogo(null)}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs leading-none flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-1 pt-1">
                    <Label className="text-xs text-muted-foreground">Logo Size</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="50" max="200" step="5"
                        value={Math.round((form.logoScale || 1) * 100)}
                        onChange={(e) => updateField('logoScale', parseInt(e.target.value) / 100)}
                        className="w-24 accent-primary"
                      />
                      <span className="text-xs text-muted-foreground tabular-nums w-9">
                        {Math.round((form.logoScale || 1) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Desktop: drag-and-drop zone */}
                  <div
                    className={cn(
                      'hidden sm:flex flex-col items-center justify-center gap-1.5 w-48 h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                      isDragging
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/60 hover:bg-muted/50'
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus className="h-6 w-6" />
                    <p className="text-xs text-center leading-tight">
                      Drag & drop or<br />click to upload
                    </p>
                  </div>

                  {/* Mobile: simple button */}
                  <label className="sm:hidden flex items-center gap-2 cursor-pointer w-fit">
                    <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm text-muted-foreground hover:bg-muted">
                      <Upload className="h-4 w-4" />
                      Upload Logo
                    </div>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>

                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-1">
              <Label>Currency</Label>
              <Select
                value={form.currency}
                onValueChange={(val) => updateField('currency', val)}
                placeholder="Select currency"
              >
                {CURRENCIES.map((group) => (
                  <SelectGroup key={group.group} label={group.group}>
                    {group.items.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </Select>
            </div>

            {/* From */}
            <div>
              <h3 className="text-sm font-medium mb-2">From</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Company Name <span className="text-[10px] text-muted-foreground">(optional)</span></Label>
                  <Input value={form.fromCompany} onChange={(e) => updateField('fromCompany', e.target.value)} placeholder="Your company" />
                </div>
                <div className="space-y-1">
                  <Label>Your Name <span className="text-[10px] text-muted-foreground">(optional)</span></Label>
                  <Input value={form.fromName} onChange={(e) => updateField('fromName', e.target.value)} placeholder="Your name" />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={form.fromEmail} onChange={(e) => updateField('fromEmail', e.target.value)} placeholder="your@email.com" />
                </div>
                <div className="space-y-1">
                  <Label>Phone</Label>
                  <Input value={form.fromPhone} onChange={(e) => updateField('fromPhone', e.target.value)} placeholder="Your phone" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Address</Label>
                  <AddressInput value={form.fromAddress} onChange={(val) => updateField('fromAddress', val)} placeholder="Your address" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Bill To */}
      <div>
        <h3 className="text-sm font-medium mb-2">Bill To</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Company Name <span className="text-[10px] text-muted-foreground">(optional)</span></Label>
            <Input value={form.billToCompany} onChange={(e) => updateField('billToCompany', e.target.value)} placeholder="Client company" />
          </div>
          <div className="space-y-1">
            <Label>Contact Person <span className="text-[10px] text-muted-foreground">(optional)</span></Label>
            <Input value={form.billToContact} onChange={(e) => updateField('billToContact', e.target.value)} placeholder="Name or dept." />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={form.billToEmail} onChange={(e) => updateField('billToEmail', e.target.value)} placeholder="client@email.com" />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={form.billToPhone} onChange={(e) => updateField('billToPhone', e.target.value)} placeholder="Client phone" />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Address</Label>
            <AddressInput value={form.billToAddress} onChange={(val) => updateField('billToAddress', val)} placeholder="Client address" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Dates */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Invoice Date</Label>
          <Input type="date" value={form.date} onChange={(e) => updateField('date', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Due Date</Label>
          <Input type="date" value={form.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>Invoice # <span className="text-muted-foreground">(optional)</span></Label>
          <Input value={form.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} placeholder="INV-001" />
        </div>
      </div>

      <Separator />

      {/* Line Items */}
      <div>
        {/* Desktop header */}
        <div className="hidden sm:grid grid-cols-12 gap-2 mb-1.5 text-xs font-medium text-muted-foreground">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-2">Rate</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1" />
        </div>

        <div className="space-y-2">
          {form.items.map((item, i) => (
            <div key={i}>
              {/* Desktop row */}
              <div className="hidden sm:grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input placeholder="Description" value={item.description}
                    onChange={(e) => handleItemChange(i, { ...item, description: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <Input type="number" min="0" placeholder="0" value={item.quantity || ''}
                    onChange={(e) => handleItemChange(i, { ...item, quantity: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2">
                  <Input type="number" min="0" step="0.01" placeholder="0.00" value={item.rate || ''}
                    onChange={(e) => handleItemChange(i, { ...item, rate: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="col-span-2">
                  <Input type="number" value={(item.quantity * item.rate).toFixed(2)} readOnly className="bg-muted" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="h-9 w-9 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Mobile card */}
              <div className="sm:hidden border rounded-lg p-2.5 space-y-2">
                <Input placeholder="Description" value={item.description}
                  onChange={(e) => handleItemChange(i, { ...item, description: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">Qty</p>
                    <Input type="number" min="0" placeholder="0" value={item.quantity || ''}
                      onChange={(e) => handleItemChange(i, { ...item, quantity: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">Rate</p>
                    <Input type="number" min="0" step="0.01" placeholder="0.00" value={item.rate || ''}
                      onChange={(e) => handleItemChange(i, { ...item, rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">Amount</p>
                    <Input type="number" value={(item.quantity * item.rate).toFixed(2)} readOnly className="bg-muted" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}
                    className="h-7 px-2 text-xs text-destructive gap-1">
                    <Trash2 className="h-3 w-3" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2">
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      <Separator />

      {/* Tax, Discount & Delivery */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Discount (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={form.discountRate} onChange={(e) => updateField('discountRate', e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1">
          <Label>Tax (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={form.taxRate} onChange={(e) => updateField('taxRate', e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1">
          <Label>Delivery / Shipping</Label>
          <Input type="number" min="0" step="0.01" value={form.delivery} onChange={(e) => updateField('delivery', e.target.value)} placeholder="0.00" />
        </div>
      </div>

      <Separator />

      {/* Notes & Payment Terms */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Notes</Label>
          <Textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Additional notes..." rows={3} />
        </div>
        <div className="space-y-1">
          <Label>Payment Terms</Label>
          <Textarea value={form.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)} placeholder="Payment terms..." rows={3} />
        </div>
      </div>
    </div>
  )
}
