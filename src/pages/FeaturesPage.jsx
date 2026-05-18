import { Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { Button } from '@/components/ui/button'

const FEATURES = [
  { title: 'Completely free',             body: 'No sign-up, no subscription, no hidden fees — ever.' },
  { title: 'Works on any device',         body: 'Mobile, tablet, and desktop. Optimised for iOS and Android.' },
  { title: 'Three download formats',      body: 'Save as PDF document, Word file (.docx), or PNG image.' },
  { title: 'Private by design',           body: 'Your data never leaves your browser. Nothing is stored on any server.' },
  { title: 'Company logo with size control', body: 'Upload your logo and resize it with a slider — appears on all formats.' },
  { title: '30+ currencies',              body: 'USD, EUR, GBP, AUD, CAD, INR, JPY, AED, NPR and many more.' },
  { title: 'Tax, discount & delivery',    body: 'Set percentage tax and discount rates plus a flat delivery fee.' },
  { title: 'Auto-saves your details',     body: 'Business name, contact info, currency and logo are remembered for next time.' },
  { title: 'Live invoice preview',        body: 'See exactly what will be downloaded as you type — no page reloads.' },
  { title: 'Print from the browser',      body: 'Print directly without downloading — formatted to fit a single page.' },
  { title: 'Save to Gallery on mobile',   body: 'On iOS, tap "Save Image" to add the PNG directly to your Photos.' },
  { title: 'Address autocomplete',        body: 'Start typing an address and select from suggestions powered by OpenStreetMap.' },
]

export default function FeaturesPage() {
  return (
    <PageLayout
      title="Features"
      description="Everything you need to create and send professional invoices — all free."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {FEATURES.map(({ title, body }) => (
            <div key={title} className="flex gap-3">
              <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
              <div>
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border rounded-2xl bg-muted/30 p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Try it now — it's free</h2>
          <p className="text-muted-foreground text-sm mb-6">No account needed. Create your first invoice in seconds.</p>
          <Button asChild size="lg">
            <Link to="/">Create Invoice</Link>
          </Button>
        </div>
      </div>
    </PageLayout>
  )
}
