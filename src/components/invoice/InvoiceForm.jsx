import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Upload, Plus, Trash2 } from 'lucide-react'

const emptyItem = { description: '', quantity: 0, rate: 0 }

export default function InvoiceForm({ form, setForm, logo, setLogo }) {
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

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="space-y-1.5">
        <Label>Company Logo</Label>
        {logo ? (
          <div className="relative inline-block">
            <img src={logo} alt="Logo" className="h-20 w-20 object-contain rounded-lg border" />
            <button
              type="button"
              onClick={() => setLogo(null)}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs leading-none flex items-center justify-center"
            >
              ×
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <div className="flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm text-muted-foreground hover:bg-muted">
              <Upload className="h-4 w-4" />
              Upload Logo
            </div>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* From */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Your Name / Company</Label>
          <Input value={form.fromName} onChange={(e) => updateField('fromName', e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-1">
          <Label>Email</Label>
          <Input value={form.fromEmail} onChange={(e) => updateField('fromEmail', e.target.value)} placeholder="your@email.com" />
        </div>
        <div className="space-y-1">
          <Label>Address</Label>
          <Input value={form.fromAddress} onChange={(e) => updateField('fromAddress', e.target.value)} placeholder="Your address" />
        </div>
        <div className="space-y-1">
          <Label>Phone</Label>
          <Input value={form.fromPhone} onChange={(e) => updateField('fromPhone', e.target.value)} placeholder="Your phone" />
        </div>
      </div>

      <Separator />

      {/* Bill To */}
      <div>
        <h3 className="text-sm font-medium mb-2">Bill To</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Client Name</Label>
            <Input value={form.billToName} onChange={(e) => updateField('billToName', e.target.value)} placeholder="Client name" />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={form.billToEmail} onChange={(e) => updateField('billToEmail', e.target.value)} placeholder="client@email.com" />
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Input value={form.billToAddress} onChange={(e) => updateField('billToAddress', e.target.value)} placeholder="Client address" />
          </div>
          <div className="space-y-1">
            <Label>Phone</Label>
            <Input value={form.billToPhone} onChange={(e) => updateField('billToPhone', e.target.value)} placeholder="Client phone" />
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
        <div className="grid grid-cols-12 gap-2 mb-1.5 text-xs font-medium text-muted-foreground">
          <div className="col-span-5">Description</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-2">Rate</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-1" />
        </div>
        <div className="space-y-2">
          {form.items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(i, { ...item, description: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number" min="0" placeholder="0"
                  value={item.quantity || ''}
                  onChange={(e) => handleItemChange(i, { ...item, quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number" min="0" step="0.01" placeholder="0.00"
                  value={item.rate || ''}
                  onChange={(e) => handleItemChange(i, { ...item, rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="col-span-2">
                <Input type="number" value={(item.quantity * item.rate).toFixed(2)} readOnly className="bg-muted" />
              </div>
              <div className="col-span-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="h-10 w-10 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-2">
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      <Separator />

      {/* Tax & Discount */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Discount (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={form.discountRate} onChange={(e) => updateField('discountRate', e.target.value)} placeholder="0" />
        </div>
        <div className="space-y-1">
          <Label>Tax (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={form.taxRate} onChange={(e) => updateField('taxRate', e.target.value)} placeholder="0" />
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
