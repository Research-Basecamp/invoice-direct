import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { Button } from '@/components/ui/button'

const FAQS = [
  {
    q: 'Is Invoice In Minute really free?',
    a: 'Yes, completely free. No account required, no subscription, no hidden fees — ever. Create, preview and download as many invoices as you like at no cost.',
  },
  {
    q: 'Is my invoice data secure?',
    a: 'Your data never leaves your browser. Nothing is uploaded or stored on any server. All invoice generation happens locally on your device — full privacy guaranteed.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes. It works on iOS and Android. You can save the invoice as a PDF to your Files app, or save it as a PNG image directly to your phone\'s photo gallery.',
  },
  {
    q: 'What file formats can I download?',
    a: 'PDF document, Word file (.docx), and PNG image. All formats are generated in your browser — no server involved.',
  },
  {
    q: 'Does it support my currency?',
    a: '30+ currencies are supported including USD, EUR, GBP, AUD, CAD, INR, JPY, AED, NPR and more. All amounts are automatically formatted for your selected currency.',
  },
  {
    q: 'Can I add my company logo?',
    a: 'Yes. Upload your logo and adjust its size with the slider. It appears on all downloaded formats — PDF, Word, and PNG.',
  },
  {
    q: 'Will my details be remembered?',
    a: 'Yes. Your business name, contact details, currency, and logo are saved in your browser and pre-filled next time you visit.',
  },
  {
    q: 'Can I add tax and discounts?',
    a: 'Yes. You can set a percentage tax rate, a percentage discount, and a flat delivery / shipping fee. All totals are calculated automatically.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No account needed. Invoice In Minute works entirely in your browser with no login required.',
  },
]

export default function FaqPage() {
  return (
    <PageLayout
      title="Frequently asked questions"
      description="Common questions about Invoice In Minute."
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="space-y-6 mb-16">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="border-b pb-6 last:border-0">
              <h2 className="font-semibold mb-1.5">{q}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        <div className="border rounded-2xl bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Still have questions?</h2>
          <p className="text-muted-foreground text-sm mb-6">Just try it — it takes under a minute and it's completely free.</p>
          <Button asChild size="lg">
            <Link to="/">Create Invoice Free</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
